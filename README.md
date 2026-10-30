# 💰 Financial Tracker V2

Aplikasi pencatat dan manajemen keuangan pribadi berbasis **React 19, TypeScript, Vite 8, Tailwind CSS v4**, terintegrasi dengan **Supabase**, **LocalStorage Offline Outbox**, serta **PWA (Progressive Web App)** dengan pembaruan otomatis (*Auto-Update*).

---

## ✨ Fitur Utama

### 1. 📊 Dashboard Ringkas & Mode Privasi
- **Kartu Hero Berdampingan (Mobile & Desktop)**: Menampilkan **Total Saldo Tersedia** (beserta *Kekayaan Bersih / Net Worth*) dan **Total Tagihan & Hutang** secara berdampingan dalam tata letak 2 kolom yang proporsional di layar ponsel maupun desktop.
- **Mode Privasi Saldo (`Eye` / `EyeOff`)**: Sembunyikan seluruh nominal saldo dan tagihan menjadi `Rp •••••••` dengan satu ketukan saat membuka aplikasi di tempat umum. Status privasi tersimpan otomatis di `localStorage` dan tersinkronisasi di halaman Dashboard, Saldo, serta Tagihan.
- **Transaksi Cepat & Template Favorit (1-Klik)**: Simpan transaksi rutin sebagai template dan catat langsung dari Dashboard hanya dalam satu ketukan.
- **Pengeluaran Terbesar & Transaksi Terakhir**: Pantau kategori dengan pengeluaran tertinggi bulan berjalan beserta 5 mutasi terbaru.

### 2. ⚡ Pencatatan Transaksi & Input Suara (*Smart Voice Input*)
- **Zero Layout Shift Form**: Komponen `TransactionForm` dirancang dengan dimensi vertikal terkunci sehingga tidak terjadi loncatan tata letak saat berpindah tab **Pengeluaran**, **Pemasukan**, maupun **Transfer**.
- **Dropdown Berikon & Bersaldo**: Pilihan **Akun** menampilkan logo bank/e-wallet (`AccountAvatar`) beserta saldo terkini, sedangkan pilihan **Kategori** menampilkan ikon warna-warni (`CategoryIcon`) baik di form utama maupun seluruh modal edit.
- **Input Transaksi via Suara**: Rekam transaksi menggunakan suara bahasa Indonesia (Web Speech API) dengan pengenalan otomatis untuk nominal, jenis transaksi, kategori, rekening, serta tanggal relatif.

### 3. 📈 Laporan & Analisis Keuangan (*Report View*)
- **Tab Periode Bergaya Grafik (`1M`, `3M`, `6M`, `1Y`, `ALL`, `Custom`)**: Pilihan rentang waktu ringkas yang muat utuh dalam satu baris layar ponsel, dilengkapi preset cepat (`7 Hari`, `30 Hari`, `Bulan Lalu`) pada mode tanggal kustom.
- **Kartu KPI Pemasukan & Pengeluaran Berdampingan**: Ringkasan total pemasukan dan pengeluaran ditampilkan sejajar kiri-kanan di layar mobile.
- **Tab Analisis dengan Geser Sentuh (*Touch Swipe & Drag*)**: Navigasi antartab grafik (**Kategori Pengeluaran**, **Tren Arus Kas**, **Sumber Pemasukan**, dan **Pengeluaran per Akun**) mendukung geser jari maupun *mouse drag* berbasis Pointer Events.
- **Rincian Transaksi Interaktif**: Klik irisan grafik *donut* atau daftar kategori untuk membuka rincian transaksi di dalamnya dan mengedit transaksi secara langsung.

### 4. 💳 Saldo, Rekening & Tagihan
- **Multi-Rekening & Dompet Digital**: Mendukung rekening bank (BCA, Mandiri, Jago, Krom, Sampoerna, Seabank), e-wallet (GoPay, ShopeePay, DANA), dan Uang Tunai (CASH) dengan resolusi logo otomatis.
- **Klik Kartu Rekening untuk Melihat Mutasi**: Ketuk kartu rekening mana pun di halaman **Saldo & Rekening** untuk langsung membuka halaman **Riwayat Transaksi** yang terfilter khusus pada mutasi rekening tersebut.
- **Kartu Kredit, Paylater & Pinjaman**: Pemisahan khusus untuk akun kewajiban/kredit dengan indikator status *Ada Tagihan* vs *Lunas*.

### 5. 📝 Riwayat Transaksi & Filter Multi-Dimensi
- **Filter Dropdown Berikon**: Saring riwayat transaksi berdasarkan jenis (*Semua*, *Keluar*, *Masuk*, *Transfer*), **Rekening** (termasuk mutasi sebagai rekening sumber maupun tujuan transfer), **Kategori**, serta pencarian kata kunci catatan.
- **Banner Mutasi Rekening & Reset Cepat**: Menampilkan indikator rekening yang sedang difilter beserta tombol satu klik untuk mereset seluruh filter.

### 6. 🎨 5 Varian Multi-Theme Design System
Beralih tema secara instan melalui pemilih tema di Sidebar (desktop) atau Header (mobile), lengkap dengan mode **Terang (Light)** dan **Gelap (Dark)**:
1. **Kraken Classic Edition**: Aksen Kraken Purple (`#7132f5`), tipografi *IBM Plex Sans*, dan bayangan *whisper* yang bersih.
2. **Coinbase Edition**: Aksen Coinbase Blue (`#0052ff`), kartu bersudut `24px`, tombol *pill*, font *Inter*, dan angka tabular *JetBrains Mono*.
3. **The Verge Edition**: Kanvas editorial kontras tinggi (`#131313`), aksen *Jelly Mint* (`#3cffd0`) & *Ultraviolet* (`#5200ff`), judul *Anton*, dan label *Space Mono*.
4. **Autumn Edition**: Palet hangat *Warm Oat & Sand* (`#f4efea`) / *Warm Stone* (`#1c1917`) dengan aksen *Autumn Orange* (`#ea580c`) dan font *Plus Jakarta Sans*.
5. **MongoDB Edition**: Kanvas *Brand Teal Deep Dark* (`#001e2b`) dengan aksen *MongoDB Green* (`#00ed64`), tipografi *Euclid Circular A*, dan angka *Source Code Pro*.

### 7. 🔄 Sinkronisasi Offline (*Offline Sync Outbox*) & PWA
- **Offline Sync Outbox (`ft_pending_sync`)**: Saat perangkat tidak terhubung ke internet, setiap penambahan, perubahan, atau penghapusan transaksi, akun, dan kategori disimpan ke antrean lokal dan otomatis dikirim ke Supabase saat koneksi kembali tersedia.
- **Indikator Visual Antrean & Offline**: Badge jumlah antrean sinkronisasi dan status Offline tampil secara *real-time* di Header dan Sidebar.
- **Code Splitting & Lazy Loading**: Tampilan utama, modal, serta pustaka grafik (`recharts`, `supabase`, `lucide-react`) dipisahkan ke dalam *chunk* terpisah agar waktu muat awal tetap ringan.
- **PWA Auto-Update**: Dapat diinstal di Android, iOS, Windows, dan macOS dengan pembaruan Service Worker otomatis.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts 3](https://recharts.org/)
- **Database & Sync**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`) + LocalStorage Fallback & Outbox
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) & Workbox
- **Linter**: [Oxlint](https://oxc.rs/) (`npm run lint`)

---

## 🚀 Memulai Proyek (Getting Started)

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)
- [npm](https://www.npmjs.com/)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Buat file `.env` di direktori utama proyek (opsional jika hanya ingin menggunakan penyimpanan lokal `localStorage`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi dapat diakses di `http://localhost:5173/`.

### 4. Pemeriksaan Linter & Build Produksi
```bash
npm run lint
npm run build
```

---

## 📁 Struktur Direktori Proyek

```text
FinancialTrackerV2/
├── public/
│   ├── icons/banks/             # Logo bank, e-wallet, kartu kredit & kas tunai (.webp / .svg)
│   ├── favicon.svg              # Favicon aplikasi
│   ├── icon-192.png             # Ikon PWA (192x192)
│   └── icon-512.png             # Ikon PWA (512x512)
├── src/
│   ├── components/
│   │   ├── forms/               # TransactionForm (Zero Layout Shift & Icon Dropdowns)
│   │   ├── layout/              # Header, Sidebar, BottomNav, ThemeMenuDropdown, ReloadPrompt
│   │   ├── modals/              # EditTransaction, EditAccount, EditCategory, EditTemplate, Voice, Settings
│   │   └── ui/                  # AccountAvatar, CategoryIcon, Toast
│   ├── contexts/
│   │   ├── ThemeContext.tsx     # Provider 5 tema desain & mode terang/gelap
│   │   └── themeStore.ts        # State & konstanta konfigurasi tema
│   ├── features/
│   │   ├── accounts/            # AccountsView & BillsView (Saldo, Rekening & Tagihan)
│   │   ├── dashboard/           # DashboardView (Kartu Hero, Template Cepat, Ringkasan)
│   │   ├── history/             # HistoryView (Riwayat Transaksi & Filter Multi-Dimensi)
│   │   └── report/              # ReportView (Laporan & Grafik Recharts Interaktif)
│   ├── hooks/
│   │   └── useSpeechRecognition.ts # Hook Web Speech API untuk input transaksi suara
│   ├── lib/                     # Formatters, categoryIcons, konstanta awal, Supabase client
│   ├── services/                # financialService, templateService, logoService, voiceTransactionParser
│   ├── types/                   # Definisi tipe TypeScript (index.ts)
│   ├── App.tsx                  # Root layout, lazy routing, state sinkronisasi & privasi saldo
│   ├── index.css                # Design tokens & variabel CSS untuk 5 tema
│   └── main.tsx                 # Entrypoint aplikasi
├── AGENTS.md                    # Panduan cepat konteks proyek untuk agen AI
├── PROJECT_CONTEXT.md           # Dokumentasi arsitektur & skema data lengkap
├── seed_data.sql                # Skema tabel & data awal PostgreSQL (Supabase)
├── index.html                   # Template HTML & meta tags PWA
├── package.json
├── vercel.json                  # Konfigurasi deployment SPA
└── vite.config.ts               # Konfigurasi Vite, code splitting, & VitePWA
```

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT.
