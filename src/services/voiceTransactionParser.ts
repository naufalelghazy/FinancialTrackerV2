import type { Account, Category, QuickTemplate, Transaction, TransactionType } from '../types';

export interface ParsedVoiceTransaction {
  rawTranscript: string;
  type: TransactionType;
  amount: number | null;
  sourceAccountId?: string;
  destinationAccountId?: string;
  categoryId?: string;
  date: string;
  notes: string;
  matchedTemplate?: {
    id: string;
    name: string;
    emoji?: string;
  };
  predictedFromHistory?: {
    account?: boolean;
    category?: boolean;
    reason?: string;
  };
  confidence: {
    amount: boolean;
    account: boolean;
    category: boolean;
    type: boolean;
  };
}

/**
 * Algoritma Levenshtein Distance untuk menghitung jarak perbedaan dua string
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Menghitung tingkat kemiripan (0.0 sampai 1.0) antara dua string
 */
export function stringSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;
  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLen;
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
      return null;
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

  // 7. Pola kata-kata bilangan ejaan (contoh: "tiga puluh lima ribu", "seratus ribu")
  const wordTokens = clean.split(/\s+/);
  const numberWordKeys = new Set([
    'nol', 'kosong', 'se', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh',
    'delapan', 'sembilan', 'sepuluh', 'sebelas', 'belas', 'puluh', 'seratus', 'ratus',
    'seribu', 'ribu', 'rebu', 'sejuta', 'juta', 'miliar', 'milyar',
  ]);

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

  // 8. Pola angka polos lebih dari 3 digit (contoh: "50000", "15000")
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
  makan: ['makan', 'minum', 'sarapan', 'lunch', 'dinner', 'soto', 'bakso', 'kopi', 'coffee', 'mie', 'nasi', 'ayam', 'snack', 'jajan', 'cemilan', 'resto', 'kafe', 'kfc', 'mcd', 'gofood', 'grabfood', 'shopeefood', 'es teh', 'boba'],
  transport: ['transport', 'bensin', 'pertalite', 'pertamax', 'solar', 'spbu', 'parkir', 'ojol', 'grab', 'gojek', 'maxim', 'angkot', 'bus', 'busway', 'krl', 'mrt', 'kereta', 'tol', 'tiket', 'kendaraan', 'motor', 'mobil', 'tambal ban', 'cuci motor', 'cuci mobil'],
  belanja: ['belanja', 'alfa', 'alfamart', 'indomaret', 'supermarket', 'pasar', 'mall', 'shopee', 'tokopedia', 'lazada', 'baju', 'kaos', 'sepatu', 'celana', 'tas', 'skincare'],
  tagihan: ['tagihan', 'listrik', 'pln', 'air', 'pdam', 'wifi', 'indihome', 'biznet', 'pulsa', 'kuota', 'telkomsel', 'indosat', 'xl', 'iuran', 'bpjs', 'sewa', 'kontrakan', 'kos'],
  kesehatan: ['kesehatan', 'obat', 'dokter', 'apotek', 'klinik', 'rs', 'rumah sakit', 'vitamin', 'masker', 'medis'],
  hiburan: ['hiburan', 'nonton', 'bioskop', 'cinema', 'game', 'steam', 'topup game', 'spotify', 'netflix', 'youtube', 'jalan-jalan', 'liburan', 'wisata'],
  pendidikan: ['pendidikan', 'kuliah', 'spp', 'sekolah', 'kursus', 'buku', 'alat tulis', 'les'],
  keluarga: ['keluarga', 'ortu', 'orang tua', 'ibu', 'ayah', 'anak', 'adik', 'kakak', 'susu', 'pampers'],
  gaji: ['gaji', 'salary', 'upah', 'honor', 'bonus', 'thr', 'uang saku', 'dividen', 'proyek', 'freelance'],
  investasi: ['investasi', 'saham', 'reksadana', 'crypto', 'emas', 'bibit', 'ajaib', 'bareksa'],
};

/**
 * Alias pengucapan populer bank / e-wallet di Indonesia
 */
const ACCOUNT_PHONETIC_ALIASES: Record<string, string[]> = {
  bca: ['bca', 'beca', 'bece a', 'b c a', 'blu', 'mybca'],
  mandiri: ['mandiri', 'mandri', 'mandili', 'manderi', 'livin', 'bank mandiri'],
  bri: ['bri', 'beri', 'be er i', 'brimo', 'bank bri'],
  bni: ['bni', 'beni', 'be en i', 'wondr', 'bank bni'],
  jago: ['jago', 'bank jago', 'jako'],
  seabank: ['seabank', 'sea bank', 'sibank', 'shopee bank'],
  gopay: ['gopay', 'go pay', 'go-pay', 'kopay'],
  ovo: ['ovo', 'o vo', 'ofoo', 'ovoo'],
  dana: ['dana', 'da na'],
  shopeepay: ['shopeepay', 'shopee pay', 'spay', 'shope pay'],
  cash: ['cash', 'kesh', 'tunai', 'kontan', 'uang fisik', 'dompet', 'kas'],
};

/**
 * Mencocokkan nama akun dengan daftar akun pengguna menggunakan exact, alias, dan fuzzy matching
 */
function findMatchingAccount(
  text: string,
  accounts: Account[],
  excludeId?: string
): { account: Account; matchedKeyword: string; isFuzzy?: boolean } | null {
  const clean = text.toLowerCase();
  const sortedAccounts = [...accounts].filter((a) => a.id !== excludeId).sort((a, b) => b.name.length - a.name.length);

  // 1. Exact match atau Substring match nama akun
  for (const acc of sortedAccounts) {
    const accName = acc.name.toLowerCase();
    if (clean.includes(accName)) {
      return { account: acc, matchedKeyword: accName };
    }
  }

  // 2. Pencocokan via Phonetic / Slang Alias
  for (const acc of sortedAccounts) {
    const accName = acc.name.toLowerCase();
    for (const [key, aliases] of Object.entries(ACCOUNT_PHONETIC_ALIASES)) {
      if (accName.includes(key)) {
        for (const alias of aliases) {
          if (clean.includes(alias) || new RegExp(`\\b${alias}\\b`, 'i').test(clean)) {
            return { account: acc, matchedKeyword: alias };
          }
        }
      }
    }
  }

  // 3. Fuzzy matching per kata (toleransi salah dengar/typo artikulasi mikrofon)
  const words = clean.split(/\s+/).filter((w) => w.length >= 3);
  let bestMatch: { account: Account; score: number; word: string } | null = null;

  for (const acc of sortedAccounts) {
    const accName = acc.name.toLowerCase();
    for (const word of words) {
      const score = stringSimilarity(word, accName);
      if (score >= 0.72 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { account: acc, score, word };
      }
    }
  }

  if (bestMatch) {
    return { account: bestMatch.account, matchedKeyword: bestMatch.word, isFuzzy: true };
  }

  return null;
}

/**
 * Mencocokkan kategori dengan teks ucapan menggunakan sinonim dan fuzzy matching
 */
function findMatchingCategory(
  text: string,
  categories: Category[],
  type: TransactionType
): { category: Category; matchedKeyword: string; isFuzzy?: boolean } | null {
  const clean = text.toLowerCase();
  const filteredCategories = categories.filter((c) => c.type === (type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'));

  // 1. Cek nama kategori langsung
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

  // 3. Fuzzy matching jika ada kata dengan kemiripan > 0.75
  const words = clean.split(/\s+/).filter((w) => w.length >= 3);
  for (const cat of filteredCategories) {
    const catName = cat.name.toLowerCase();
    for (const word of words) {
      if (stringSimilarity(word, catName) >= 0.75) {
        return { category: cat, matchedKeyword: word, isFuzzy: true };
      }
    }
  }

  return null;
}

/**
 * Mencocokkan teks ucapan dengan Template Transaksi yang sudah tersimpan
 */
function findMatchingTemplate(
  text: string,
  templates: QuickTemplate[]
): { template: QuickTemplate; matchedKeyword: string } | null {
  if (!templates || templates.length === 0) return null;
  const clean = text.toLowerCase();

  // 1. Exact match / substring nama template (contoh: "Kopi Kenangan", "Bensin")
  for (const tpl of templates) {
    const tplName = tpl.name.toLowerCase().trim();
    if (tplName.length >= 3 && clean.includes(tplName)) {
      return { template: tpl, matchedKeyword: tplName };
    }
  }

  // 2. Fuzzy match nama template
  const words = clean.split(/\s+/).filter((w) => w.length >= 3);
  for (const tpl of templates) {
    const tplName = tpl.name.toLowerCase().trim();
    for (const word of words) {
      if (stringSimilarity(word, tplName) >= 0.8) {
        return { template: tpl, matchedKeyword: word };
      }
    }
  }

  return null;
}

/**
 * Memprediksi Akun atau Kategori dari riwayat transaksi pengguna berdasarkan kata kunci di ucapan
 */
function predictFromHistory(
  transcript: string,
  history: Transaction[],
  accounts: Account[]
): { sourceAccountId?: string; categoryId?: string; reason?: string } {
  if (!history || history.length === 0) return {};

  const clean = transcript.toLowerCase();
  const words = clean.split(/\s+/).filter((w) => w.length >= 3);

  // Ambil hingga 100 transaksi terakhir untuk analisa kebiasaan
  const recentTxs = history.slice(0, 100);
  const accountFrequency: Record<string, number> = {};
  const categoryFrequency: Record<string, number> = {};
  let matchedKeyword = '';

  for (const tx of recentTxs) {
    const txNotes = (tx.notes || '').toLowerCase();
    for (const word of words) {
      // Abaikan kata umum non-spesifik
      if (['beli', 'bayar', 'pakai', 'buat', 'untuk', 'ribu', 'rupiah'].includes(word)) continue;

      if (txNotes.includes(word)) {
        matchedKeyword = word;
        accountFrequency[tx.sourceAccountId] = (accountFrequency[tx.sourceAccountId] || 0) + 1;
        if (tx.categoryId) {
          categoryFrequency[tx.categoryId] = (categoryFrequency[tx.categoryId] || 0) + 1;
        }
      }
    }
  }

  let predictedAccountId: string | undefined;
  let maxAccCount = 0;
  for (const [accId, count] of Object.entries(accountFrequency)) {
    if (count > maxAccCount && accounts.some((a) => a.id === accId)) {
      maxAccCount = count;
      predictedAccountId = accId;
    }
  }

  let predictedCategoryId: string | undefined;
  let maxCatCount = 0;
  for (const [catId, count] of Object.entries(categoryFrequency)) {
    if (count > maxCatCount) {
      maxCatCount = count;
      predictedCategoryId = catId;
    }
  }

  if (predictedAccountId || predictedCategoryId) {
    return {
      sourceAccountId: predictedAccountId,
      categoryId: predictedCategoryId,
      reason: matchedKeyword ? `Sering digunakan saat "${matchedKeyword}" di riwayat Anda` : undefined,
    };
  }

  return {};
}

/**
 * Parser utama ucapan suara menjadi objek transaksi
 * Mendukung template transaksi dan riwayat kebiasaan pengguna
 */
export function parseVoiceTransaction(
  transcript: string,
  accounts: Account[],
  categories: Category[],
  templates?: QuickTemplate[],
  history?: Transaction[]
): ParsedVoiceTransaction {
  const dedupedTranscript = deduplicateRepeatingPhrases(transcript);
  const clean = dedupedTranscript.toLowerCase().trim();

  // A. Cek kecocokan dengan Template Transaksi terlebih dahulu
  const templateMatch = templates ? findMatchingTemplate(clean, templates) : null;
  const matchedTemplate = templateMatch?.template;

  // 1. Deteksi Tipe Transaksi
  let type: TransactionType = matchedTemplate ? matchedTemplate.type : 'pengeluaran';
  const transferKeywords = ['transfer', 'kirim', 'pindah', 'oper', 'tf', 'top up', 'topup', 'isi saldo'];
  const incomeKeywords = ['gaji', 'masuk', 'terima', 'dapat', 'cair', 'bonus', 'thr', 'pemasukan', 'dikasih', 'diberi', 'jual'];

  const hasTransferKeyword = transferKeywords.some((k) => clean.includes(k));
  const hasIncomeKeyword = incomeKeywords.some((k) => clean.includes(k));

  if (hasTransferKeyword) {
    type = 'transfer';
  } else if (hasIncomeKeyword) {
    type = 'pemasukan';
  } else if (!matchedTemplate) {
    type = 'pengeluaran';
  }

  // 2. Ekstraksi Nominal (Gunakan ucapan eksplisit, fallback ke nominal template jika ada)
  const amountResult = extractAmountFromVoiceText(clean);
  const amount = amountResult ? amountResult.amount : matchedTemplate ? matchedTemplate.amount : null;

  // 3. Ekstraksi Akun
  let sourceAccountId: string | undefined;
  let destinationAccountId: string | undefined;
  let isPredictedAccount = false;

  if (type === 'transfer') {
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

    if (matchedTemplate) {
      if (!sourceAccountId) sourceAccountId = matchedTemplate.sourceAccountId;
      if (!destinationAccountId) destinationAccountId = matchedTemplate.destinationAccountId;
    }
  } else {
    // Pengeluaran / Pemasukan: Cari satu akun
    const matched = findMatchingAccount(clean, accounts);
    if (matched) {
      sourceAccountId = matched.account.id;
    } else if (matchedTemplate?.sourceAccountId) {
      sourceAccountId = matchedTemplate.sourceAccountId;
    } else {
      // B. Pembelajaran cerdas: Prediksi akun dari riwayat transaksi
      const historyPrediction = history ? predictFromHistory(clean, history, accounts) : {};
      if (historyPrediction.sourceAccountId) {
        sourceAccountId = historyPrediction.sourceAccountId;
        isPredictedAccount = true;
      } else {
        const defaultCash = accounts.find((a) => a.type === 'cash' || a.name.toLowerCase().includes('cash'));
        sourceAccountId = defaultCash ? defaultCash.id : accounts[0]?.id;
      }
    }
  }

  // 4. Ekstraksi Kategori
  let categoryId: string | undefined;
  let isPredictedCategory = false;
  if (type !== 'transfer') {
    const catMatch = findMatchingCategory(clean, categories, type);
    if (catMatch) {
      categoryId = catMatch.category.id;
    } else if (matchedTemplate?.categoryId) {
      categoryId = matchedTemplate.categoryId;
    } else {
      // B. Pembelajaran cerdas: Prediksi kategori dari riwayat
      const historyPrediction = history ? predictFromHistory(clean, history, accounts) : {};
      if (historyPrediction.categoryId) {
        categoryId = historyPrediction.categoryId;
        isPredictedCategory = true;
      } else {
        const defaultCat = categories.find((c) => c.type === (type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'));
        categoryId = defaultCat?.id;
      }
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

  const accountWordsToRemove = accounts.map((a) => a.name.toLowerCase());
  accountWordsToRemove.push('pakai', 'pake', 'dengan', 'lewat', 'dari', 'ke', 'cash', 'tunai', 'rupiah', 'sebesar', 'seharga');
  for (const w of accountWordsToRemove) {
    notes = notes.replace(new RegExp(`\\b${w}\\b`, 'gi'), '');
  }

  notes = deduplicateRepeatingPhrases(notes);
  notes = notes.replace(/\s+/g, ' ').replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();

  if (!notes) {
    if (matchedTemplate?.notes) {
      notes = matchedTemplate.notes;
    } else {
      const catObj = categories.find((c) => c.id === categoryId);
      notes = catObj ? catObj.name : type === 'transfer' ? 'Transfer Saldo' : 'Transaksi Suara';
    }
  } else {
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
    matchedTemplate: matchedTemplate
      ? {
          id: matchedTemplate.id,
          name: matchedTemplate.name,
          emoji: matchedTemplate.emoji,
        }
      : undefined,
    predictedFromHistory: (isPredictedAccount || isPredictedCategory)
      ? {
          account: isPredictedAccount,
          category: isPredictedCategory,
          reason: 'Diprediksi dari kebiasaan transaksi Anda',
        }
      : undefined,
    confidence: {
      amount: amount !== null && amount > 0,
      account: !!sourceAccountId,
      category: type === 'transfer' ? true : !!categoryId,
      type: true,
    },
  };
}
