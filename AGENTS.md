<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

---

# 🤖 Financial Tracker V2 — Agent Quick Context & Guidelines

Untuk memahami keseluruhan arsitektur proyek, skema database, model data, dan alur kode tanpa perlu membaca semua file secara manual, baca dokumentasi lengkap di:
👉 **[PROJECT_CONTEXT.md](file:///f:/project/FinancialTrackerV2/PROJECT_CONTEXT.md)**

## Ringkasan Cepat Proyek:
- **Teknologi**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`) + Supabase (`@supabase/supabase-js`) + Recharts + Lucide Icons + Oxlint.
- **Tujuan**: Aplikasi web & PWA pencatat keuangan pribadi multi-rekening (Bank, E-Wallet, Kartu Kredit, Cash), riwayat transaksi, analitik pengeluaran/pemasukan, dan sistem multi-tema.
- **Dual Data Layer**: `src/services/financialService.ts` membaca dari Supabase (PostgreSQL), dengan fallback otomatis ke `localStorage` jika offline atau Supabase belum disetel.
- **Perhitungan Saldo**: Saldo dihitung dinamis (`calculateAccountBalances`) dari saldo awal akun + mutasi transaksi (pemasukan (+), pengeluaran (-), transfer (sumber (-), tujuan (+))).
- **Sistem Tema**: 5 varian tema terintegrasi di `src/contexts/ThemeContext.tsx` (`coinbase`, `theverge`, `kraken`, `autumn`, `mongodb`) dengan mode `light`, `dark`, dan `system`. Selalu gunakan CSS variables dari `src/index.css`.
- **Aturan Krusial Form**: Komponen `src/components/forms/TransactionForm.tsx` memiliki tinggi terkunci (`min-h-[66px]`, label header `h-5`) untuk menjaga **Zero Layout Shift** saat berpindah jenis transaksi di layar ponsel.
- **Validasi**: Selalu jalankan `npm run lint` (`oxlint`) sebelum menyelesaikan pekerjaan.
