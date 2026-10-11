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
├── .agents/                    # Aturan AI agent & skills (antislop, token-saver, dll.)
├── public/                     # Asset publik, manifest PWA, logo bank lokal SVG
│   └── icons/banks/            # Icon fallback bank (bca, mandiri, gopay, cash, dll.)
├── src/
│   ├── assets/                 # Asset statis internal
│   ├── components/             # Komponen UI bersama (Shared Components)
│   │   ├── forms/
│   │   │   └── TransactionForm.tsx      # Form input transaksi (Krusial: Zero layout shift)
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Header aplikasi & toggle tema
│   │   │   ├── Sidebar.tsx              # Navigasi samping desktop
│   │   │   ├── BottomNav.tsx            # Navigasi bawah mobile
│   │   │   ├── ThemeMenuDropdown.tsx    # Modal/dropdown pemilih tema desain
│   │   │   └── ReloadPrompt.tsx         # PWA update notification
│   │   ├── modals/
│   │   │   ├── EditTransactionModal.tsx # Modal edit data transaksi
│   │   │   ├── EditAccountModal.tsx     # Modal edit / tambah akun rekening
│   │   │   └── SettingsModal.tsx        # Modal konfigurasi & integrasi
│   │   └── ui/
│   │       └── CategoryIcon.tsx         # Renderer icon & emoji kategori
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Context provider multi-tema (Coinbase, The Verge, Kraken, Autumn, MongoDB)
│   ├── features/               # Halaman & fitur utama (Feature-based structure)
│   │   ├── accounts/
│   │   │   ├── AccountsView.tsx         # Tampilan manajemen saldo & rekening
│   │   │   └── BillsView.tsx            # Tampilan tagihan kartu kredit (saldo negatif)
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx        # Halaman ringkasan finansial utama
│   │   ├── history/
│   │   │   └── HistoryView.tsx          # Halaman tabel riwayat transaksi & filter
│   │   └── report/
│   │       └── ReportView.tsx           # Halaman laporan analitik & grafik Recharts
│   ├── lib/
│   │   ├── constants.ts        # Akun & kategori default awal (fallback)
│   │   └── supabase.ts         # Inisialisasi Supabase client & environment checks
│   ├── services/
│   │   ├── financialService.ts # Service utama data (CRUD, kalkulasi saldo, Supabase + LocalStorage)
│   │   └── logoService.ts      # Service resolver logo bank/ewallet (Logo.dev + SVG lokal)
│   ├── types/
│   │   └── index.ts            # Definisi tipe TypeScript (Account, Transaction, Category, dll.)
│   ├── App.tsx                 # Root layout, routing tab aktif, state sinkronisasi
│   ├── index.css               # Design tokens, CSS custom variables per tema, font styling
│   └── main.tsx                # Entry point React
├── AGENTS.md                   # Instruksi agent & referensi context
├── PROJECT_CONTEXT.md          # Dokumen ini
├── DEVELOPMENT_WALKTHROUGH.md  # Roadmap & perbandingan V1 vs V2
└── vite.config.ts              # Konfigurasi Vite, Tailwind v4, dan PWA
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

Aplikasi memiliki 4 tema desain terintegrasi:
1. **Coinbase Edition** (`coinbase`):
   * Estetika institusional modern: Biru `#0052ff`, tombol pill rounded, font Inter & JetBrains Mono, canvas clean.
2. **The Verge Edition** (`theverge`):
   * Estetika editorial cyber-dark: Latar `#131313`, aksen neon Jelly Mint `#3cffd0`, headline Anton, body Space Grotesk.
3. **Kraken Edition** (`kraken`):
   * Estetika crypto rounded: Ungu Kraken `#7132f5`, sudut 12px, font IBM Plex Sans, kartu kontras.
4. **Autumn Edition** (`autumn`):
   * Estetika earth-warm: Amber `#d97706` / Oranye musim gugur `#ea580c`, kanvas hangat (krem pada light mode, cokelat gelap `#1c1917` pada dark mode).

### Konvensi Penerapan Gaya:
* Selalu gunakan CSS variables yang terdefinisi di `src/index.css` (`--brand-primary`, `--canvas-bg`, `--surface-card`, dll.) daripada hardcode warna agar tampilan otomatis konsisten di semua tema dan dark mode.

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

# Build production bundle (TypeScript + Vite)
npm run build

# Menjalankan preview hasil build
npm run preview
```
