# 💰 Financial Tracker V2

Aplikasi pencatat dan manajemen keuangan pribadi modern (*crypto-grade personal finance tracker*) berbasis **React 19, TypeScript, Vite, Tailwind CSS v4**, dan terintegrasi dengan **Supabase** serta **PWA (Progressive Web App)** dengan arsitektur pembaruan otomatis (*Auto-Update*).

---

## ✨ Fitur Utama

### 1. 📊 Dashboard Overview
- **Total Saldo Tersedia**: Ringkasan kekayaan bersih (*Net Worth*) dari seluruh rekening bank, e-wallet, dan uang tunai.
- **Arus Kas Bulanan**: Pantau total pemasukan, pengeluaran, dan selisih bersih (*surplus / defisit*) secara *real-time*.
- **Kartu Total Tagihan & Hutang**: Didesain dengan aksen **Merah Berkontras Tinggi** agar kewajiban hutang, kartu kredit, dan paylater selalu terlihat jelas dan membedakannya dari kartu aset di semua mode tema.
- **Aksi Cepat (*Quick Actions*)**: Catat transaksi, kelola saldo, dan akses laporan dengan satu klik.
- **Pengeluaran Terbesar & Transaksi Terkini**: Daftar belanja tertinggi berdasarkan kategori dan riwayat transaksi terbaru.

### 2. 📈 Laporan & Grafik Interaktif (*Report View*)
- Visualisasi data keuangan menggunakan **Recharts**.
- Analisis perbandingan arus kas bulanan (*Cashflow Trends*).
- Komposisi pengeluaran dan pemasukan per kategori dengan visualisasi ikon modern.
- Statistik rasio tabungan (*Savings Rate*) dan rata-rata pengeluaran harian.

### 3. 💳 Saldo, Rekening & Tagihan
- **Rekening Bank & E-Wallet**: Dukungan untuk BCA, Mandiri, Jago, Krom, Sampoerna, Seabank, GoPay, ShopeePay, DANA, dan Uang Tunai (CASH).
- **Kartu Kredit & Paylater**: Kelola Honest Card, Nex Card, Kredivo, SPayLater, dan Jago Loan.
- **Pencatatan Hutang Terpisah**: Saldo negatif dihitung otomatis sebagai kewajiban yang wajib dibayar (*Belum Dibayar vs Lunas*).
- **Edit Akun Aman**: Ubah nama, tipe, dan saldo rekening langsung melalui ikon pensil tanpa memicu klik kartu yang tidak disengaja.

### 4. 📝 Riwayat Transaksi Lengkap
- Pencarian dan filter berdasarkan tipe (*Pengeluaran, Pemasukan, Transfer*), rentang tanggal, akun, dan kategori.
- Edit mutasi transaksi langsung melalui tombol pensil aksi.

### 5. 🎨 Multi-Theme Design System
Beralih tema dengan mudah melalui panel di bagian bawah navigasi:
- **Kraken Classic Edition**: Aksen Kraken Purple (`#7132f5`), font *IBM Plex Sans*, dan bayangan *whisper* yang elegan.
- **Coinbase Edition**: Aksen Coinbase Blue (`#0052ff`), sudut kartu 24px, chip berbentuk *pill*, font *Inter*, dan angka tabular *JetBrains Mono*.
- **The Verge Edition**: Kanvas gelap berita editorial (`#131313`), aksen neon *Jelly Mint* (`#3cffd0`) & *Ultraviolet* (`#5200ff`), font display *Anton*, dan label mono uppercase *Space Mono*.
- **Mode Tampilan**: Dukungan penuh untuk mode **Terang (Light)** dan **Gelap (Dark)**.

### 6. 📱 Progressive Web App (PWA) & Auto-Update
- **Installable**: Dapat diinstal di Android, iOS, Windows, dan macOS seperti aplikasi native.
- **Auto-Update Tanpa Hapus Cache**: Menggunakan Workbox dengan strategi `NetworkFirst` untuk file navigasi HTML dan `skipWaiting: true` serta `clientsClaim: true`. Setiap ada pembaruan kode, aplikasi otomatis menyegarkan diri tanpa pengguna harus menghapus *site settings* di Chrome.
- **Offline Capability**: Aplikasi tetap dapat dibuka saat tidak ada koneksi internet.

---

## 🛠️ Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) & [Workbox](https://developer.chrome.com/docs/workbox)
- **Backend / Database**: [Supabase](https://supabase.com/) & LocalStorage Cache

---

## 🚀 Memulai Proyek (Getting Started)

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)
- [npm](https://www.npmjs.com/) atau [pnpm](https://pnpm.io/)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` atau buat file `.env` di root proyek:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173/`.

### 4. Build Produksi
```bash
npm run build
```
Hasil build beserta Service Worker PWA akan dihasilkan di folder `dist/`.

### 5. Preview Hasil Build
```bash
npm run preview
```

---

## 📁 Struktur Folder Proyek

```text
FinancialTrackerV2/
├── .agents/                     # Konfigurasi agen AI (skills, hooks, rules, plugins)
├── public/                      # Asset statis, ikon PWA (192x192, 512x512), favicon
├── src/
│   ├── components/
│   │   ├── layout/              # Header, Sidebar, BottomNav, ThemeMenuDropdown, ReloadPrompt
│   │   └── modals/              # EditTransactionModal, EditAccountModal, SettingsModal
│   ├── contexts/
│   │   └── ThemeContext.tsx     # Provider multi-theme & dark mode
│   ├── features/
│   │   ├── accounts/            # AccountsView, BillsView (Saldo & Tagihan)
│   │   ├── dashboard/           # DashboardView (Overview & Ringkasan)
│   │   ├── history/             # HistoryView (Riwayat transaksi)
│   │   └── report/              # ReportView (Laporan & Grafik keuangan)
│   ├── lib/                     # Formatters, Supabase client, utilitas
│   ├── types/                   # Definisi tipe TypeScript
│   ├── App.tsx                  # Root component & routing state
│   ├── index.css                # Design tokens & styling multi-tema
│   └── main.tsx                 # Entrypoint aplikasi
├── token-saver/                 # Ekstensi kompresi token untuk agen AI
├── index.html                   # HTML template & PWA meta tags
├── package.json
├── tsconfig.app.json
└── vite.config.ts               # Konfigurasi Vite & VitePWA
```

---

## 📄 Lisensi

Distributed under the MIT License.
