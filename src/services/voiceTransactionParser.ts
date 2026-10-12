import type { Account, Category, TransactionType } from '../types';

export interface ParsedVoiceTransaction {
  rawTranscript: string;
  type: TransactionType;
  amount: number | null;
  sourceAccountId?: string;
  destinationAccountId?: string;
  categoryId?: string;
  date: string;
  notes: string;
  confidence: {
    amount: boolean;
    account: boolean;
    category: boolean;
    type: boolean;
  };
}

/**
 * Peta kata angka bahasa Indonesia ke nilai numerik
 */
const INDO_NUMBER_WORDS: Record<string, number> = {
  nol: 0,
  kosong: 0,
  se: 1,
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
  sepuluh: 10,
  sebelas: 11,
  seratus: 100,
  seribu: 1000,
  sejuta: 1000000,
};

/**
 * Mengonversi teks deretan kata bilangan Indonesia menjadi angka
 * Contoh: "tiga puluh lima ribu" -> 35000
 * Contoh: "seratus dua puluh ribu" -> 120000
 * Contoh: "satu juta lima ratus ribu" -> 1500000
 */
function parseSpokenIndoWords(words: string[]): number | null {
  if (words.length === 0) return null;

  let total = 0;
  let current = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase();

    if (w === 'juta' || w === 'sejuta') {
      current = (current === 0 ? 1 : current) * 1000000;
      total += current;
      current = 0;
    } else if (w === 'miliar' || w === 'milyar') {
      current = (current === 0 ? 1 : current) * 1000000000;
      total += current;
      current = 0;
    } else if (w === 'ribu' || w === 'seribu') {
      current = (current === 0 ? 1 : current) * 1000;
      total += current;
      current = 0;
    } else if (w === 'ratus' || w === 'seratus') {
      current = (current === 0 ? 1 : current) * 100;
    } else if (w === 'puluh' || w === 'sepuluh') {
      current = (current === 0 ? 1 : current) * 10;
    } else if (w === 'belas' || w === 'sebelas') {
      current = (current === 0 ? 1 : current) + 10;
    } else if (INDO_NUMBER_WORDS[w] !== undefined) {
      current += INDO_NUMBER_WORDS[w];
    } else {
      return null; // Ada kata yang bukan angka
    }
  }

  total += current;
  return total > 0 ? total : null;
}

/**
 * Bersihkan frasa atau kata yang terulang berturut-turut khas speech engine Android
 */
export function deduplicateRepeatingPhrases(text: string): string {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return text.trim();

  for (let phraseLen = Math.min(6, Math.floor(words.length / 2)); phraseLen >= 1; phraseLen--) {
    let i = 0;
    while (i + 2 * phraseLen <= words.length) {
      const first = words.slice(i, i + phraseLen).join(' ').toLowerCase();
      const second = words.slice(i + phraseLen, i + 2 * phraseLen).join(' ').toLowerCase();
      if (first === second) {
        words.splice(i + phraseLen, phraseLen);
      } else {
        i++;
      }
    }
  }

  return words.join(' ');
}

/**
 * Ekstraksi angka nominal dari teks ucapan bahasa Indonesia
 */
export function extractAmountFromVoiceText(text: string): { amount: number; matchedText: string } | null {
  const clean = text.toLowerCase().trim();

  // 0. Pola dengan awalan Rupiah / IDR: "Rp35.000", "Rp 35.000", "rp50000", "idr 25.000"
  const rupiahPrefixRegex = /(?:rp\.?|idr)\s*(\d{1,3}(?:\.\d{3})+|\d+)/i;
  const rupiahPrefixMatch = clean.match(rupiahPrefixRegex);
  if (rupiahPrefixMatch) {
    const rawVal = rupiahPrefixMatch[1].replace(/\./g, '');
    const val = parseInt(rawVal, 10);
    if (!isNaN(val) && val > 0) {
      return { amount: val, matchedText: rupiahPrefixMatch[0] };
    }
  }

  // 1. Pola dengan singkatan juta: "1.5jt", "1,5 juta", "2 juta"
  const jutaRegex = /\b(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i;
  const jutaMatch = clean.match(jutaRegex);
  if (jutaMatch) {
    const val = parseFloat(jutaMatch[1].replace(',', '.'));
    if (!isNaN(val)) {
      return { amount: Math.round(val * 1000000), matchedText: jutaMatch[0] };
    }
  }

  // 2. Pola dengan singkatan miliar: "1.5m", "2 miliar"
  const miliarRegex = /\b(\d+(?:[.,]\d+)?)\s*(?:m|miliar|milyar)\b/i;
  const miliarMatch = clean.match(miliarRegex);
  if (miliarMatch) {
    const val = parseFloat(miliarMatch[1].replace(',', '.'));
    if (!isNaN(val)) {
      return { amount: Math.round(val * 1000000000), matchedText: miliarMatch[0] };
    }
  }

  // 3. Pola dengan singkatan ribu: "25rb", "25 rb", "50k", "50 k", "35 ribu", "10 rebu"
  const ribuRegex = /\b(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|rebu|k)\b/i;
  const ribuMatch = clean.match(ribuRegex);
  if (ribuMatch) {
    const val = parseFloat(ribuMatch[1].replace(',', '.'));
    if (!isNaN(val)) {
      return { amount: Math.round(val * 1000), matchedText: ribuMatch[0] };
    }
  }

  // 4. Pola slang Indonesia: ceban (10k), goceng (5k), gocap (50k), noban (20k), cepek (100k), seceng (1k), gopek (500)
  const indoSlang: Record<string, number> = {
    goceng: 5000,
    ceban: 10000,
    noban: 20000,
    gocap: 50000,
    cepek: 100000,
    seceng: 1000,
    gopek: 500,
  };
  for (const [slangWord, slangVal] of Object.entries(indoSlang)) {
    const slangRegex = new RegExp(`\\b${slangWord}\\b`, 'i');
    const slangMatch = clean.match(slangRegex);
    if (slangMatch) {
      return { amount: slangVal, matchedText: slangMatch[0] };
    }
  }

  // 5. Pola angka ribuan standar berformat titik: "50.000", "1.500.000", "35.000"
  const dotNumberRegex = /(?:^|\s|[^\d])(\d{1,3}(?:\.\d{3})+)(?:\s|[^\d]|$)/;
  const dotMatch = clean.match(dotNumberRegex);
  if (dotMatch) {
    const val = parseInt(dotMatch[1].replace(/\./g, ''), 10);
    if (!isNaN(val)) {
      return { amount: val, matchedText: dotMatch[1] };
    }
  }

  // 6. Pola angka polos diikuti "rupiah" atau "perak": "50000 rupiah", "2000 perak"
  const rupiahSuffixRegex = /\b(\d+)\s*(?:rupiah|perak)\b/i;
  const rupiahMatch = clean.match(rupiahSuffixRegex);
  if (rupiahMatch) {
    const val = parseInt(rupiahMatch[1], 10);
    if (!isNaN(val)) {
      return { amount: val, matchedText: rupiahMatch[0] };
    }
  }

  // 6. Pola kata-kata bilangan ejaan (contoh: "tiga puluh lima ribu", "seratus ribu")
  const wordTokens = clean.split(/\s+/);
  const numberWordKeys = new Set([
    'nol', 'kosong', 'se', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh',
    'delapan', 'sembilan', 'sepuluh', 'sebelas', 'belas', 'puluh', 'seratus', 'ratus',
    'seribu', 'ribu', 'rebu', 'sejuta', 'juta', 'miliar', 'milyar',
  ]);

  // Cari substring terpanjang yang berisi kata-kata angka
  for (let start = 0; start < wordTokens.length; start++) {
    if (numberWordKeys.has(wordTokens[start])) {
      let end = start;
      while (end < wordTokens.length && numberWordKeys.has(wordTokens[end])) {
        end++;
      }
      const candidateTokens = wordTokens.slice(start, end);
      const parsedNumber = parseSpokenIndoWords(candidateTokens);
      if (parsedNumber !== null && parsedNumber > 0) {
        return {
          amount: parsedNumber,
          matchedText: candidateTokens.join(' '),
        };
      }
    }
  }

  // 7. Pola angka polos lebih dari 3 digit (contoh: "50000", "15000")
  const plainNumberRegex = /\b(\d{4,})\b/;
  const plainMatch = clean.match(plainNumberRegex);
  if (plainMatch) {
    const val = parseInt(plainMatch[1], 10);
    if (!isNaN(val)) {
      return { amount: val, matchedText: plainMatch[0] };
    }
  }

  return null;
}

/**
 * Sinonim cerdas kategori pengeluaran dan pemasukan untuk Bahasa Indonesia
 */
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  makan: ['makan', 'minum', 'sarapan', 'lunch', 'dinner', 'soto', 'bakso', 'kopi', 'mie', 'nasi', 'ayam', 'snack', 'jajan', 'cemilan', 'resto', 'kafe', 'kfc', 'mcd', 'gofood', 'grabfood', 'shopeefood'],
  transport: ['transport', 'bensin', 'pertalite', 'pertamax', 'solar', 'spbu', 'parkir', 'ojol', 'grab', 'gojek', 'maxim', 'angkot', 'bus', 'busway', 'krl', 'mrt', 'kereta', 'tol', 'tiket', 'kendaraan', 'motor', 'mobil', 'tambal ban', 'cuci motor', 'cuci mobil'],
  belanja: ['belanja', 'alfa', 'alfamart', 'indomaret', 'supermarket', 'pasar', 'mall', 'shopee', 'tokopedia', 'lazada', 'baju', 'kaos', 'sepatu', 'celana', 'tas'],
  tagihan: ['tagihan', 'listrik', 'pln', 'air', 'pdam', 'wifi', 'indihome', 'biznet', 'pulsa', 'kuota', 'telkomsel', 'indosat', 'xl', 'iuran', 'bpjs', 'sewa', 'kontrakan', 'kos'],
  kesehatan: ['kesehatan', 'obat', 'dokter', 'apotek', 'klinik', 'rs', 'rumah sakit', 'vitamin', 'masker', 'medis'],
  hiburan: ['hiburan', 'nonton', 'bioskop', 'cinema', 'game', 'steam', 'topup game', 'spotify', 'netflix', 'youtube', 'jalan-jalan', 'liburan', 'wisata'],
  pendidikan: ['pendidikan', 'kuliah', 'spp', 'sekolah', 'kursus', 'buku', 'alat tulis', 'les'],
  keluarga: ['keluarga', 'ortu', 'orang tua', 'ibu', 'ayah', 'anak', 'adik', 'kakak', 'susu', 'pampers'],
  gaji: ['gaji', 'salary', 'upah', 'honor', 'bonus', 'thr', 'uang saku', 'dividen', 'proyek', 'freelance'],
  investasi: ['investasi', 'saham', 'reksadana', 'crypto', 'emas', 'bibit', 'ajaib', 'bareksa'],
};

/**
 * Mencocokkan nama akun dengan daftar akun pengguna
 */
function findMatchingAccount(
  text: string,
  accounts: Account[],
  excludeId?: string
): { account: Account; matchedKeyword: string } | null {
  const clean = text.toLowerCase();

  // Prioritaskan akun berdasarkan panjang nama (terpanjang dulu) agar "BCA Digital" cocok sebelum "BCA"
  const sortedAccounts = [...accounts].filter((a) => a.id !== excludeId).sort((a, b) => b.name.length - a.name.length);

  for (const acc of sortedAccounts) {
    const accName = acc.name.toLowerCase();

    // 1. Cek nama akun langsung
    if (clean.includes(accName)) {
      return { account: acc, matchedKeyword: accName };
    }

    // 2. Cek alias cash/tunai
    if ((acc.type === 'cash' || accName.includes('cash') || accName.includes('tunai')) && (clean.includes('cash') || clean.includes('tunai') || clean.includes('kontan'))) {
      const match = clean.includes('cash') ? 'cash' : clean.includes('tunai') ? 'tunai' : 'kontan';
      return { account: acc, matchedKeyword: match };
    }

    // 3. Cek nama bank umum (misal: "bca", "mandiri", "bri", "bni", "jago", "dana", "gopay", "shopeepay", "ovo")
    const cleanWord = accName.replace(/[^a-z0-9]/g, '');
    if (cleanWord.length >= 3 && clean.includes(cleanWord)) {
      return { account: acc, matchedKeyword: cleanWord };
    }
  }

  return null;
}

/**
 * Mencocokkan kategori dengan teks ucapan
 */
function findMatchingCategory(
  text: string,
  categories: Category[],
  type: TransactionType
): { category: Category; matchedKeyword: string } | null {
  const clean = text.toLowerCase();
  const filteredCategories = categories.filter((c) => c.type === (type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'));

  // 1. Cek pencocokan nama kategori langsung (misal "Bensin", "Kuliah", "Makanan")
  for (const cat of filteredCategories) {
    const catName = cat.name.toLowerCase();
    if (clean.includes(catName)) {
      return { category: cat, matchedKeyword: catName };
    }
  }

  // 2. Cek melalui kamus sinonim
  for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const syn of synonyms) {
      if (clean.includes(syn)) {
        // Cari kategori pengguna yang namanya mengandung kata kunci atau sinonim ini
        const matched = filteredCategories.find((c) => {
          const name = c.name.toLowerCase();
          return name.includes(key) || name.includes(syn) || synonyms.some((s) => name.includes(s));
        });

        if (matched) {
          return { category: matched, matchedKeyword: syn };
        }
      }
    }
  }

  return null;
}

/**
 * Parser utama ucapan suara menjadi objek transaksi
 */
export function parseVoiceTransaction(
  transcript: string,
  accounts: Account[],
  categories: Category[]
): ParsedVoiceTransaction {
  const dedupedTranscript = deduplicateRepeatingPhrases(transcript);
  const clean = dedupedTranscript.toLowerCase().trim();

  // 1. Deteksi Tipe Transaksi
  let type: TransactionType = 'pengeluaran';
  const transferKeywords = ['transfer', 'kirim', 'pindah', 'oper', 'tf', 'top up', 'topup', 'isi saldo'];
  const incomeKeywords = ['gaji', 'masuk', 'terima', 'dapat', 'cair', 'bonus', 'thr', 'pemasukan', 'dikasih', 'diberi', 'jual'];

  const hasTransferKeyword = transferKeywords.some((k) => clean.includes(k));
  const hasIncomeKeyword = incomeKeywords.some((k) => clean.includes(k));

  if (hasTransferKeyword) {
    type = 'transfer';
  } else if (hasIncomeKeyword) {
    type = 'pemasukan';
  } else {
    type = 'pengeluaran';
  }

  // 2. Ekstraksi Nominal
  const amountResult = extractAmountFromVoiceText(clean);
  const amount = amountResult ? amountResult.amount : null;

  // 3. Ekstraksi Akun
  let sourceAccountId: string | undefined;
  let destinationAccountId: string | undefined;

  if (type === 'transfer') {
    // Cari akun asal ("dari [Akun]") dan akun tujuan ("ke [Akun]")
    const dariMatch = clean.match(/dari\s+([a-z0-9\s]+?)(?=\s+ke|\s+sebesar|\s+\d|$)/i);
    const keMatch = clean.match(/ke\s+([a-z0-9\s]+?)(?=\s+sebesar|\s+dari|\s+\d|$)/i);

    if (dariMatch) {
      const src = findMatchingAccount(dariMatch[1], accounts);
      if (src) sourceAccountId = src.account.id;
    }

    if (keMatch) {
      const dst = findMatchingAccount(keMatch[1], accounts, sourceAccountId);
      if (dst) destinationAccountId = dst.account.id;
    }

    // Fallback jika tidak memakai kata "dari/ke": cari 2 akun pertama yang cocok dalam kalimat
    if (!sourceAccountId || !destinationAccountId) {
      const firstAcc = findMatchingAccount(clean, accounts);
      if (firstAcc) {
        if (!sourceAccountId) sourceAccountId = firstAcc.account.id;
        const secondAcc = findMatchingAccount(clean, accounts, firstAcc.account.id);
        if (secondAcc && !destinationAccountId) {
          destinationAccountId = secondAcc.account.id;
        }
      }
    }
  } else {
    // Pengeluaran / Pemasukan: Cari satu akun
    const matched = findMatchingAccount(clean, accounts);
    if (matched) {
      sourceAccountId = matched.account.id;
    } else {
      // Default ke akun Cash / akun pertama jika ada
      const defaultCash = accounts.find((a) => a.type === 'cash' || a.name.toLowerCase().includes('cash'));
      sourceAccountId = defaultCash ? defaultCash.id : accounts[0]?.id;
    }
  }

  // 4. Ekstraksi Kategori
  let categoryId: string | undefined;
  if (type !== 'transfer') {
    const catMatch = findMatchingCategory(clean, categories, type);
    if (catMatch) {
      categoryId = catMatch.category.id;
    } else {
      // Default kategori pertama yang sesuai tipe jika ada
      const defaultCat = categories.find((c) => c.type === (type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'));
      categoryId = defaultCat?.id;
    }
  }

  // 5. Ekstraksi Tanggal
  let date = new Date().toISOString().slice(0, 10);
  if (clean.includes('kemarin')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().slice(0, 10);
  }

  // 6. Ekstraksi Catatan (Bersihkan kata-kata akun, nominal, dan kata hubung)
  let notes = dedupedTranscript.trim();
  if (amountResult) {
    const escaped = amountResult.matchedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    notes = notes.replace(new RegExp(escaped, 'gi'), '');
  }

  // Hapus kata-kata keterangan akun ("pakai bca", "lewat mandiri", dll)
  const accountWordsToRemove = accounts.map((a) => a.name.toLowerCase());
  accountWordsToRemove.push('pakai', 'pake', 'dengan', 'lewat', 'dari', 'ke', 'cash', 'tunai', 'rupiah', 'sebesar', 'seharga');
  for (const w of accountWordsToRemove) {
    notes = notes.replace(new RegExp(`\\b${w}\\b`, 'gi'), '');
  }

  // Bersihkan spasi berlebih dan sisa frasa berulang
  notes = deduplicateRepeatingPhrases(notes);
  notes = notes.replace(/\s+/g, ' ').replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();

  // Jika setelah dibersihkan catatan kosong, gunakan deskripsi dari kategori
  if (!notes) {
    const catObj = categories.find((c) => c.id === categoryId);
    notes = catObj ? catObj.name : type === 'transfer' ? 'Transfer Saldo' : 'Transaksi Suara';
  } else {
    // Huruf kapital awal
    notes = notes.charAt(0).toUpperCase() + notes.slice(1);
  }

  return {
    rawTranscript: transcript,
    type,
    amount,
    sourceAccountId,
    destinationAccountId,
    categoryId,
    date,
    notes,
    confidence: {
      amount: amount !== null && amount > 0,
      account: !!sourceAccountId,
      category: type === 'transfer' ? true : !!categoryId,
      type: true,
    },
  };
}
