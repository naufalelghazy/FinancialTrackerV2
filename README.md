# 💰 Financial Tracker V2

Aplikasi pencatat dan manajemen keuangan pribadi berbasis **React 19, TypeScript, Vite 8, Tailwind CSS v4**, terintegrasi dengan **Supabase**, **LocalStorage Offline Outbox**, serta **PWA (Progressive Web App)** dengan pembaruan otomatis (*Auto-Update*).

Dirancang **offline-first**: layar pertama dirender sepenuhnya dari snapshot `localStorage`, tanpa menunggu jaringan dan tanpa memuat Supabase SDK.

---

## ✨ Fitur Utama

### 1. 📊 Dashboard Ringkas & Mode Privasi
- **Kartu Hero Berdampingan (Mobile & Desktop)**: Menampilkan **Total Saldo Tersedia** (beserta *Kekayaan Bersih / Net Worth*) dan **Total Tagihan & Hutang** secara berdampingan dalam tata letak 2 kolom yang proporsional di layar ponsel maupun desktop.
- **Mode Privasi Saldo (`Eye` / `EyeOff`)**: Sembunyikan seluruh nominal saldo dan tagihan menjadi `Rp •••••••` dengan satu ketukan saat membuka aplikasi di tempat umum. Status privasi tersimpan otomatis di `localStorage` dan tersinkronisasi di halaman Dashboard, Saldo, serta Tagihan.
- **Transaksi Cepat & Template Favorit (1-Klik)**: Simpan transaksi rutin sebagai template dan catat langsung dari Dashboard hanya dalam satu ketukan, lengkap dengan tombol **Urungkan** pada toast hasilnya.
- **Pengeluaran Terbesar & Transaksi Terakhir**: Pantau kategori dengan pengeluaran tertinggi bulan berjalan beserta 5 mutasi terbaru.

### 2. ⚡ Pencatatan Transaksi & Input Suara (*Smart Voice Input*)
- **Zero Layout Shift Form**: Komponen `TransactionForm` dirancang dengan dimensi vertikal terkunci sehingga tidak terjadi loncatan tata letak saat berpindah tab **Pengeluaran**, **Pemasukan**, maupun **Transfer**.
- **Dropdown Berikon & Bersaldo**: Pilihan **Akun** menampilkan logo bank/e-wallet (`AccountAvatar`) beserta saldo terkini, sedangkan pilihan **Kategori** menampilkan ikon warna-warni (`CategoryIcon`) baik di form utama maupun seluruh modal edit.
- **Input Transaksi via Suara**: Rekam transaksi menggunakan suara bahasa Indonesia (Web Speech API) dengan pengenalan otomatis untuk nominal, jenis transaksi, kategori, rekening, serta tanggal relatif.
- **Konfirmasi Sebelum Tersimpan**: Toast "berhasil" hanya muncul setelah penyimpanan benar-benar selesai — bukan saat tombol ditekan.

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

Setiap tema didefinisikan sebagai **set token yang sama** (`--brand-primary`, `--bg-canvas`, `--text-primary`, `--border-default`, `--on-brand`, radius, dan font) lewat `@theme inline`, sehingga utility seperti `bg-brand` atau `text-ink` otomatis mengikuti tema aktif. Skrip inline di `index.html` menerapkan tema tersimpan **sebelum paint pertama**, jadi tidak ada kedipan warna saat memuat. Kontrak token ini dijaga oleh `tests/themeContract.test.ts`.

### 7. 🔄 Sinkronisasi Offline (*Offline Sync Outbox*) & PWA
- **Offline Sync Outbox (`ft_pending_sync`)**: Saat perangkat tidak terhubung ke internet, setiap penambahan, perubahan, atau penghapusan transaksi, akun, dan kategori disimpan ke antrean lokal dan otomatis dikirim ke Supabase saat koneksi kembali tersedia.
- **Idempoten & Aman Multi-Tab**: Setiap mutasi dikunci pada id baris final (di-*generate* klien), sehingga flush bersifat idempoten. Flush memegang *lock* eksklusif, jadi dua tab tidak bisa mengirim mutasi yang sama dua kali.
- **Indikator Visual Antrean & Offline**: Badge jumlah antrean sinkronisasi dan status Offline tampil secara *real-time* di Header dan Sidebar (satu komponen `SyncBadge` untuk keduanya).
- **Anti-Duplikasi**: Id baris dibuat sekali lalu dipakai bersama oleh baris optimistis dan mutasi antrean. Fallback yang membuat UUID baru saat gagal — penyebab utama transaksi ganda — sudah dihapus.
- **Rollback Selektif**: Kegagalan sementara menyimpan baris lokal (antrean akan mencoba lagi); kegagalan permanen (uuid tidak valid, ditolak RLS) membatalkan perubahan agar tidak meninggalkan baris yang tidak akan pernah diterima server.
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
- **Testing**: [Vitest 5](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + coverage V8
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

### 4. Perintah yang Tersedia

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan dengan HMR |
| `npm run build` | Typecheck (`tsc -b`) lalu build produksi |
| `npm run preview` | Menyajikan hasil build untuk dicek lokal |
| `npm run lint` | Oxlint (aturan ketat: 20+ *rule*) |
| `npm test` | Menjalankan seluruh test sekali |
| `npm run test:watch` | Test dalam mode *watch* |
| `npm run test:coverage` | Test + laporan coverage V8 |
| `npm run check` | **Gerbang wajib**: lint → typecheck → test → build |

---

## 🧪 Pengujian

Test berjalan dalam dua *project* Vitest agar cepat sekaligus realistis:

- **`node`** — logika murni (`src/lib`, `src/services`, `tests/`) tanpa biaya jsdom.
- **`dom`** — hook React (`src/hooks`) di jsdom via `@testing-library/react`.

```bash
npm test          # 396 test, 18 file
npm run check     # gerbang lengkap sebelum commit
```

Beberapa test bukan menguji logika, melainkan **bentuk hasil deploy** — ini yang menjaga regresi performa tidak kembali diam-diam:

| Berkas | Menjaga |
|---|---|
| `tests/bundle.test.ts` | Budget ukuran chunk, header `Cache-Control` di `vercel.json`, Recharts tidak di-*precache* |
| `tests/criticalPath.test.ts` | Supabase SDK & Recharts tidak boleh kembali ke import statis di chunk entry |
| `tests/themeContract.test.ts` | Kontrak token CSS tiap tema |
| `tests/uuid.test.ts` | Baris seed (id non-UUID) tidak pernah dianggap bisa disinkronkan |
| `src/features/dashboard/DashboardView.test.tsx` | Bulan aktif dashboard, empty state, dan daftar rekening yang terpotong |
| `src/hooks/*.test.tsx` | Kebijakan tulis optimistis, rollback, komposisi penulisan bersamaan |

Test bundle/critical-path membaca folder `dist/`, jadi jalankan `npm run build` lebih dulu. Tanpa `dist/` test tersebut otomatis di-*skip* (bukan gagal).

---

## ⚡ Catatan Performa

| Metrik | Nilai |
|---|---|
| Precached PWA | ~870 KiB (sebelumnya 1.355 KiB) |
| Chunk entry | ~134 kB (34 kB gzip) |
| React (chunk terpisah, cache panjang) | ~211 kB (66 kB gzip) |
| Supabase SDK | dimuat *on demand*, tidak di jalur kritis |
| Recharts | hanya dimuat saat halaman Laporan dibuka |
| Aset ber-hash | `Cache-Control: immutable, max-age=31536000` |

Tiga keputusan yang menghasilkan angka di atas:

1. **Supabase di-*lazy load*** (`lib/supabase.ts` → `loadSupabase()`). Layar pertama tidak butuh SDK; promise-nya di-*memoise* agar dua pemanggil bersamaan berbagi satu unduhan dan satu instance.
2. **Hanya shell yang di-*precache***. Setiap view sudah berupa chunk terpisah di balik `React.lazy`; meng-*precache* semuanya membuat pengguna mengunduh pustaka grafik di kunjungan pertama meski tidak pernah membuka Laporan. Chunk lain di-cache saat pertama kali diminta (*StaleWhileRevalidate*).
3. **Font tidak *render-blocking***. Hanya keluarga font tema default yang dimuat saat awal; sisanya *on demand* dari theme provider.

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
│   │   ├── layout/              # Header, Sidebar, BottomNav, SyncBadge, ThemeMenuDropdown, ReloadPrompt
│   │   ├── modals/              # EditTransaction, EditAccount, EditCategory, EditTemplate, Voice, Settings
│   │   └── ui/                  # AccountAvatar, CategoryIcon, Toast
│   ├── contexts/
│   │   ├── ThemeContext.tsx     # Provider 5 tema desain & mode terang/gelap
│   │   └── themeStore.ts        # State & konstanta konfigurasi tema (single source of truth)
│   ├── features/
│   │   ├── accounts/            # AccountsView & BillsView (Saldo, Rekening & Tagihan)
│   │   ├── dashboard/           # DashboardView (Kartu Hero, Template Cepat, Ringkasan)
│   │   ├── history/             # HistoryView (Riwayat Transaksi & Filter Multi-Dimensi)
│   │   └── report/              # ReportView (Laporan & Grafik Recharts Interaktif)
│   ├── hooks/
│   │   ├── useAppState.ts       # Composition root: merangkai seluruh hook state
│   │   ├── useLedger.ts         # Pemilik accounts/categories/transactions + derivasi saldo
│   │   ├── useTransactionActions.ts  # Tulis transaksi: optimistis, rollback, antrean
│   │   ├── useAccountActions.ts      # Tulis akun
│   │   ├── useCategoryActions.ts     # Tulis kategori
│   │   ├── useTemplates.ts      # CRUD template + pencatatan 1-klik
│   │   ├── useNetworkStatus.ts  # Online/offline, jumlah antrean, auto-flush
│   │   ├── useUiState.ts        # Modal, navigasi, mode privasi, prefill suara
│   │   ├── useToast.ts          # Pemilik tunggal slot toast
│   │   └── useSpeechRecognition.ts # Hook Web Speech API untuk input suara
│   ├── lib/
│   │   ├── supabase.ts          # Klien Supabase (lazy) + timeout per-request
│   │   ├── date.ts              # Helper tanggal berbasis zona waktu LOKAL
│   │   ├── errors.ts            # Klasifikasi error sementara vs permanen
│   │   ├── transactions.ts      # Aturan transfer tunggal untuk semua view
│   │   ├── formatters.ts        # Intl ter-cache: currency, percent, compact
│   │   ├── labels.ts            # Label tipe akun & transaksi
│   │   ├── uuid.ts              # Validasi id (baris seed bukan uuid)
│   │   ├── categoryIcons.ts     # Pemetaan ikon kategori
│   │   └── constants.ts         # Data seed akun, kategori, template
│   ├── services/
│   │   ├── financialService.ts  # Muat/tulis data, derivasi saldo, snapshot lokal
│   │   ├── outbox.ts            # Antrean mutasi offline (idempoten, terkunci)
│   │   ├── templateService.ts   # CRUD quick template + cache
│   │   ├── logoService.ts       # Resolusi logo bank/e-wallet
│   │   └── voiceTransactionParser.ts # Parser ucapan → transaksi
│   ├── types/                   # Definisi tipe TypeScript (index.ts)
│   ├── App.tsx                  # Shell: layout, routing antar view, mounting modal (~310 baris)
│   ├── index.css                # Token CSS @theme (satu set token × 5 tema)
│   └── main.tsx                 # Entrypoint aplikasi
├── tests/                       # Test lintas-modul, tema, formatter, budget bundle
├── AGENTS.md                    # Panduan cepat konteks proyek untuk agen AI
├── PROJECT_CONTEXT.md           # Dokumentasi arsitektur & skema data lengkap
├── seed_data.sql                # Skema tabel, RLS per-user, & data awal (Supabase)
├── index.html                   # Template HTML, script anti-flash tema, meta PWA
├── package.json
├── vercel.json                  # Rewrite SPA + header cache & keamanan
├── vite.config.ts               # Konfigurasi Vite, manualChunks, & VitePWA
└── vitest.config.ts             # Dua project: node (logika) & dom (hook)
```

---

## 🏗️ Arsitektur Singkat

### Aliran Data

```text
localStorage snapshot
        │  (hidrasi instan saat mount)
        ▼
    useLedger ──────────────► satu-satunya pemilik data
        │                     (saldo selalu diturunkan dari transaksi)
        ▼
 useTransactionActions / useAccountActions / useCategoryActions
        │
        │  tulis optimistis → server
        ▼
  berhasil  ──► rekonsiliasi baris
  gagal sementara ──► tetap lokal + masuk outbox ──► flush saat online
  gagal permanen  ──► rollback + toast error
```

### Prinsip yang Dijaga

- **Satu sumber kebenaran per data.** `useLedger` satu-satunya pemilik tiga slice data; `commit` menerima *updater function* sehingga dua penulisan bersamaan saling melengkapi, bukan saling menimpa.
- **Saldo tidak pernah disimpan sebagai fakta.** Selalu diturunkan dari daftar transaksi pada setiap commit, jadi tidak bisa melenceng dari riwayatnya.
- **Satu aturan transfer.** `lib/transactions.ts` menggantikan tiga definisi berbeda yang sebelumnya ada di tiga view.
- **Waktu selalu lokal.** `new Date().toISOString().slice(0, 10)` menghasilkan tanggal UTC — satu hari mundur bagi pengguna WIB antara 00:00–06:59. Selalu gunakan `todayLocalISO()`.
- **Baris seed bersifat lokal-only.** Id seperti `cash` atau `makan` bukan UUID, jadi `lib/uuid.ts` memastikan baris tersebut tidak pernah dikirim ke kolom `uuid` (penyebab error `22P02`).

---

## 🔐 Catatan Keamanan

- **RLS per pengguna**: kebijakan pada `seed_data.sql` memakai `auth.uid()`, bukan `USING (true)`.
- **Timeout per-request**: setiap permintaan Supabase dibatalkan setelah 15 detik agar UI tidak menggantung.
- **Header keamanan** (`vercel.json`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy` ketat, dan `Permissions-Policy` yang hanya mengizinkan mikrofon (untuk input suara).

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT.
