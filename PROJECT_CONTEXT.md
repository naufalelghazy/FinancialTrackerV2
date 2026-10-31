# ⚡ Financial Tracker V2 — Project Context & Architecture Guide

> **Catatan untuk AI Agent**: File ini adalah *single source of truth* untuk memahami arsitektur, struktur kode, model data, dan konvensi proyek **Financial Tracker V2**. Baca file ini untuk langsung memahami konteks proyek secara instan tanpa perlu menganalisis ulang keseluruhan file di repository.

---

## 1. Ikhtisar Proyek (Project Overview)

* **Nama Proyek**: Financial Tracker V2 (migrasi dari V1 Google Sheets ke Web App modern).
* **Tujuan**: Aplikasi pencatat dan pelacak keuangan pribadi (Personal Finance Tracker) berbasis web & PWA (mobile-first), mendukung multi-rekening (Bank, E-Wallet, Kartu Kredit, Cash), pencatatan transaksi instan, analitik/laporan keuangan, serta sistem multi-tema dinamis.
* **Fitur Utama**:
  1. **Dashboard**: Ringkasan total saldo, ringkasan pengeluaran/pemasukan bulanan, tren arus kas, dan pintasan input transaksi cepat.
  2. **Input Transaksi**: Form instan pengeluaran, pemasukan, dan transfer antar akun dengan layout stabil (*zero layout shift*).
  3. **Saldo & Rekening**: Daftar seluruh akun finansial, rincian saldo real-time, manajemen akun, dan daftar tagihan kartu kredit.
  4. **Riwayat Transaksi**: Filter pencarian, filter akun, kategori, rentang tanggal, pagination, serta aksi Edit & Hapus transaksi.
  5. **Laporan & Analitik**: Grafik pie kategori pengeluaran, bar chart perbandingan bulanan, dan breakdown pengeluaran.
  6. **Multi-Tema**: 5 varian tema desain (*Coinbase*, *The Verge*, *Kraken*, *Autumn*, *MongoDB*) dengan dukungan *Light*, *Dark*, dan *System* mode.

---

## 2. Tech Stack & Dependencies

* **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 8](https://vitejs.dev/) (`@vitejs/plugin-react`)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite` + CSS Variables dinamis di `src/index.css`
* **Icons**: [Lucide React](https://lucide.dev/) (`lucide-react`)
* **Visualisasi & Charts**: [Recharts 3](https://recharts.org/) (`recharts`)
* **Database & Backend**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`, PostgreSQL dengan Row-Level Security)
* **Fallback Storage**: `localStorage` (aplikasi tetap berfungsi 100% saat Supabase belum dikonfigurasi / offline)
* **PWA**: `vite-plugin-pwa` (dapat diinstal di Android/iOS/Desktop)
* **Linter**: `oxlint` (linter ultra-cepat berbasis Rust)

---

## 3. Peta Struktur Direktori (Directory Map)

```text
f:\project\FinancialTrackerV2\
├── public/                     # Asset publik, manifest PWA, logo bank lokal (.webp / .svg)
│   └── icons/banks/            # Icon fallback bank (bca, mandiri, gopay, cash, dll.)
├── src/
│   ├── components/             # Komponen UI bersama (Shared Components)
│   │   ├── forms/
│   │   │   └── TransactionForm.tsx      # Form input transaksi (Krusial: Zero layout shift)
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Header aplikasi, status sync & toggle tema
│   │   │   ├── Sidebar.tsx              # Navigasi samping desktop & status sync
│   │   │   ├── BottomNav.tsx            # Navigasi bawah mobile
│   │   │   ├── ThemeMenuDropdown.tsx    # Modal/dropdown pemilih tema desain
│   │   │   └── ReloadPrompt.tsx         # PWA update notification
│   │   ├── modals/
│   │   │   ├── EditTransactionModal.tsx # Modal edit data transaksi
│   │   │   ├── EditAccountModal.tsx     # Modal edit / tambah akun rekening
│   │   │   ├── EditCategoryModal.tsx    # Modal edit / tambah kategori
│   │   │   ├── EditTemplateModal.tsx    # Modal edit / tambah template cepat
│   │   │   ├── VoiceTransactionModal.tsx# Modal pencatatan transaksi via suara
│   │   │   └── SettingsModal.tsx        # Modal konfigurasi & integrasi
│   │   └── ui/
│   │       ├── AccountAvatar.tsx        # Renderer logo & avatar rekening
│   │       ├── CategoryIcon.tsx         # Renderer icon & emoji kategori
│   │       └── Toast.tsx                # Komponen notifikasi toast
│   ├── contexts/
│   │   ├── ThemeContext.tsx    # Context provider multi-tema (Coinbase, The Verge, Kraken, Autumn, MongoDB)
│   │   └── themeStore.ts       # Store & tipe tema
│   ├── features/               # Halaman & fitur utama (Feature-based structure)
│   │   ├── accounts/
│   │   │   ├── AccountsView.tsx         # Tampilan manajemen saldo, rekening & navigasi mutasi
│   │   │   └── BillsView.tsx            # Tampilan tagihan kartu kredit (saldo negatif)
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx        # Halaman ringkasan finansial utama & mode privasi
│   │   ├── history/
│   │   │   └── HistoryView.tsx          # Halaman riwayat transaksi & filter multi-dimensi
│   │   └── report/
│   │       └── ReportView.tsx           # Halaman laporan analitik & grafik Recharts
│   ├── hooks/
│   │   └── useSpeechRecognition.ts      # Hook Web Speech API bahasa Indonesia
│   ├── lib/
│   │   ├── categoryIcons.ts    # Mapping ikon kategori
│   │   ├── constants.ts        # Akun & kategori default awal (fallback)
│   │   ├── date.ts             # Helper tanggal lokal (hindari bug geser UTC)
│   │   ├── errors.ts           # Klasifikasi error offline vs permanen
│   │   ├── formatters.ts       # Formatter mata uang & angka
│   │   ├── supabase.ts         # Inisialisasi Supabase client & environment checks
│   │   └── transactions.ts     # Aturan tunggal transfer internal / pemasukan / pengeluaran
│   ├── services/
│   │   ├── financialService.ts # Service utama data (CRUD, kalkulasi saldo, Supabase + LocalStorage)
│   │   ├── logoService.ts      # Service resolver logo bank/ewallet
│   │   ├── outbox.ts           # Offline outbox: antrean mutasi, dedup, lock antar-tab
│   │   ├── templateService.ts  # Service CRUD template transaksi cepat
│   │   └── voiceTransactionParser.ts # Parser NLP transaksi suara bahasa Indonesia
│   ├── types/
│   │   └── index.ts            # Definisi tipe TypeScript (Account, Transaction, Category, dll.)
│   ├── test/
│   │   └── setup.ts            # Harness test (localStorage & navigator.onLine tiruan)
│   ├── App.tsx                 # Root layout, lazy routing, state sinkronisasi & mode privasi
│   ├── index.css               # Design tokens, CSS custom variables per tema, font styling
│   └── main.tsx                # Entry point React
├── tests/
│   └── themeContract.test.ts   # Guard kontrak token tema (berjalan di konteks Node)
├── AGENTS.md                   # Instruksi agent & referensi context
├── PROJECT_CONTEXT.md          # Dokumen ini
├── README.md                   # Dokumentasi publik repositori
├── vitest.config.ts            # Konfigurasi test runner
└── vite.config.ts              # Konfigurasi Vite, code splitting, Tailwind v4, dan PWA
```

---

## 4. Model Data & Tipe TypeScript (`src/types/index.ts`)

### `Account` (Akun Keuangan)
```typescript
export type AccountType = 'bank' | 'ewallet' | 'credit' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon?: string;
  emoji?: string;
  website?: string;
  initialBalance?: number;
  balance: number; // Dihitung dinamis dari initialBalance + transaksi
}
```

### `Category` (Kategori Transaksi)
```typescript
export interface Category {
  id: string;
  name: string;
  type: 'pengeluaran' | 'pemasukan';
  emoji: string;
}
```

### `Transaction` (Data Transaksi)
```typescript
export type TransactionType = 'pengeluaran' | 'pemasukan' | 'transfer';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  sourceAccountId: string;
  destinationAccountId?: string; // Khusus tipe 'transfer'
  categoryId?: string;           // Khusus 'pengeluaran' & 'pemasukan'
  notes?: string;
  createdAt: string;
}
```

---

## 5. Alur Data & Perhitungan Saldo (`financialService.ts`)

1. **Kalkulasi Saldo Real-Time (`calculateAccountBalances`)**:
   * Saldo tidak disimpan statis di tabel terpisah, melainkan dihitung dinamis dari `initialBalance` ditambah mutasi transaksi:
     * `pemasukan`: `balanceMap[sourceAccountId] += amount`
     * `pengeluaran`: `balanceMap[sourceAccountId] -= amount`
     * `transfer`: `balanceMap[sourceAccountId] -= amount` DAN `balanceMap[destinationAccountId] += amount`
2. **Koneksi Dual-Mode (Supabase vs LocalStorage)**:
   * Jika variabel `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` tersedia, data disinkronkan langsung ke PostgreSQL Supabase dengan *pagination batch* (1000 baris per query).
   * Jika Supabase tidak aktif/offline, data otomatis membaca & menyimpan ke `localStorage` (`ft_accounts` & `ft_transactions`) tanpa menimbulkan error.
3. **Resolusi Logo Bank (`logoService.ts`)**:
   * Mencoba mengambil icon resmi dari API Logo.dev berdasarkan domain bank.
   * Jika gagal atau offline, fallback ke SVG lokal di `/icons/banks/*.svg`.

---

## 6. Sistem Desain & Multi-Tema (`ThemeContext.tsx`)

Aplikasi memiliki 5 tema desain terintegrasi. Sumber kebenaran tunggalnya adalah
`DESIGN_SYSTEMS` di `src/contexts/themeStore.ts` — jangan menyalin data tema di
tempat lain.

1. **MongoDB Edition** (`mongodb`):
   * Aksen hijau MongoDB `#00ed64`, kanvas deep-teal `#001e2b`, tombol pill, Euclid Circular A.
2. **Coinbase Edition** (`coinbase`):
   * Estetika institusional modern: Biru `#0052ff`, tombol pill rounded, font Inter & JetBrains Mono, canvas clean.
3. **The Verge Edition** (`theverge`):
   * Estetika editorial cyber-dark: Latar `#131313`, aksen neon Jelly Mint `#3cffd0`, headline Anton, body Space Grotesk.
4. **Kraken Edition** (`kraken`):
   * Estetika crypto rounded: Ungu Kraken `#7132f5`, sudut 12px, font IBM Plex Sans, kartu kontras. **Ini baseline default.**
5. **Autumn Edition** (`autumn`):
   * Estetika earth-warm: Oranye musim gugur `#ea580c`, kanvas hangat (krem pada light mode, cokelat gelap `#1c1917` pada dark mode).

### Token Tema (`src/index.css`)

Setiap tema hanya mendefinisikan **satu set variabel CSS**. Tidak ada lagi blok
override `[data-theme=x] .bg-\[\#…\]  !important`.

| Token | Utility Tailwind | Kegunaan |
|---|---|---|
| `--brand-primary` | `bg-brand`, `border-brand` | Isi utama brand |
| `--brand-primary-hover` / `-active` | `hover:bg-brand-hover` | Status interaktif |
| `--brand-soft` | `bg-brand-soft` | Chip/badge berlatar brand |
| `--brand-text` | `text-brand-text` | Teks berwarna brand |
| `--on-brand` | `text-on-brand` | Teks **di atas** isi brand |
| `--bg-canvas` | `bg-canvas` | Latar halaman |
| `--bg-surface` | `bg-surface` | Kartu, modal |
| `--bg-surface-raised` / `-sunken` | `bg-surface-raised` | Panel bertingkat |
| `--text-primary` / `-secondary` / `-tertiary` | `text-ink`, `text-ink-muted`, `text-ink-subtle` | Hierarki teks |
| `--border-default` / `-strong` | `border-hairline` | Garis pemisah |
| `--card-radius` / `--control-radius` | `rounded-card`, `rounded-control` | Geometri tema |

> **Penting:** selalu pakai utility token di atas, **jangan** `bg-[#7132f5]` atau
> hex lain. Isi `--on-brand` berbeda per tema (mint & hijau MongoDB butuh teks
> gelap), jadi memakai `text-white` di atas `bg-brand` akan tidak terbaca.

### Konvensi Penerapan Gaya:
* Warna dan tipografi wajib berasal dari token di `src/index.css`, bukan hardcode.
* Menambah tema berarti: tambah entri di `DESIGN_SYSTEMS` (`themeStore.ts`) +
  blok `[data-theme=<id>]` dan `.dark[data-theme=<id>]` berisi **seluruh** token
  di atas. `tests/themeContract.test.ts` akan gagal jika ada token yang terlewat.
* Font tiap tema dimuat sesuai permintaan oleh `ThemeContext` (`THEME_FONTS`);
  hanya font Kraken yang render-blocking di `index.html`.

---

## 7. Aturan Penting Saat Mengedit Kode (Strict Guidelines)

1. **Zero Layout Shift pada `TransactionForm.tsx`**:
   * Header wadah kategori/akun tujuan dikunci tingginya (`h-5` / 20px) dan dropdown container memiliki `min-h-[66px]`.
   * **Jangan ubah tinggi ini sembarangan** karena akan menimbulkan getaran layar (*subpixel jitter*) saat pengguna berpindah antara tombol Masuk, Keluar, dan Transfer di perangkat mobile.
2. **Scrollbar Stabilization**:
   * File `src/index.css` menggunakan `scrollbar-gutter: stable;` pada tag `html` untuk mencegah layar melompat saat konten bertambah tinggi.
3. **Validasi Linting**:
   * Selalu jalankan `npm run lint` (`oxlint`) sebelum menyelesaikan pekerjaan untuk memastikan tidak ada syntax atau import error.

---

## 8. Perintah Pengembang (CLI Commands)

```bash
# Menjalankan server development lokal
npm run dev

# Memeriksa linting kode (Oxlint)
npm run lint

# Menjalankan seluruh unit test (Vitest)
npm run test

# Mode watch saat mengembangkan
npm run test:watch

# Laporan cakupan test (butuh vitest --coverage)
npm run test:coverage

# Build production bundle (TypeScript + Vite)
npm run build

# Menjalankan preview hasil build
npm run preview

# Gerbang lengkap sebelum commit: lint + typecheck + test + build
npm run check
```
