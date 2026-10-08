-- ========================================================
-- FINANCIAL TRACKER V2 - SEED DATA MIGRATION
-- Total Transaksi: 1458 baris
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL AKUN
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bank', 'ewallet', 'credit', 'cash')),
  account_number text,
  icon_url text,
  color text DEFAULT '#7132f5',
  initial_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. TABEL KATEGORI
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('pengeluaran', 'pemasukan')),
  emoji text DEFAULT '🏷️',
  monthly_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. TABEL TRANSAKSI
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date date NOT NULL DEFAULT current_date,
  type text NOT NULL CHECK (type IN ('pengeluaran', 'pemasukan', 'transfer')),
  amount numeric NOT NULL CHECK (amount > 0),
  source_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  destination_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- 4. KEAMANAN RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Allow all read accounts') THEN
    CREATE POLICY "Allow all read accounts" ON public.accounts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Allow all write accounts') THEN
    CREATE POLICY "Allow all write accounts" ON public.accounts FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow all read categories') THEN
    CREATE POLICY "Allow all read categories" ON public.categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow all write categories') THEN
    CREATE POLICY "Allow all write categories" ON public.categories FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Allow all read transactions') THEN
    CREATE POLICY "Allow all read transactions" ON public.transactions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Allow all write transactions') THEN
    CREATE POLICY "Allow all write transactions" ON public.transactions FOR ALL USING (true);
  END IF;
END $$;

-- 5. EKSEKUSI DATA SEED
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  RAISE NOTICE 'Target User ID: %', COALESCE(v_user_id::text, 'NULL (Global Demo)');

  -- Insert Accounts
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'BCA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'BCA', 'bank', '/icons/banks/bca.svg', '#005caa', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'CASH', 'cash', '/icons/banks/cash.svg', '#10b981', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'DANA', 'ewallet', '/icons/banks/dana.svg', '#118eea', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'GOPAY', 'ewallet', '/icons/banks/gopay.svg', '#00aed6', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'Honest Card', 'credit', '/icons/banks/honest.svg', '#ec4899', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'JAGO', 'bank', '/icons/banks/jago.svg', '#f59e0b', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'Jago Loan', 'credit', '/icons/banks/jago.svg', '#ef4444', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'Kredivo' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'Kredivo', 'credit', '/icons/banks/kredivo.svg', '#f97316', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'KROM', 'bank', '/icons/banks/krom.svg', '#8b5cf6', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'MANDIRI', 'bank', '/icons/banks/mandiri.svg', '#003d79', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'SAMPOERNA', 'bank', '/icons/banks/sampoerna.svg', '#14b8a6', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'SEABANK', 'bank', '/icons/banks/seabank.svg', '#f97316', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'SHOPEEPAY', 'ewallet', '/icons/banks/shopeepay.svg', '#ee4d2d', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'Spaylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'Spaylatter', 'credit', '/icons/banks/shopeepay.svg', '#e11d48', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE name = 'SUPERBANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.accounts (user_id, name, type, icon_url, color, initial_balance)
    VALUES (v_user_id, 'SUPERBANK', 'bank', '/icons/banks/superbank.svg', '#3b82f6', 0);
  END IF;

  -- Insert Categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Pindah Akun', 'pengeluaran', '🔄', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Biaya Tak Terduga', 'pengeluaran', '⚠️', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Kondangan/Kado' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Kondangan/Kado', 'pengeluaran', '🎁', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Makan', 'pengeluaran', '🍽️', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Hobby/Entertainment', 'pengeluaran', '🎮', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Coffee/Snack', 'pengeluaran', '☕', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Bensin', 'pengeluaran', '⛽', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Parkir', 'pengeluaran', '🅿️', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Keluarga', 'pengeluaran', '👨‍👩‍👦', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Donate', 'pengeluaran', '🤲', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Makanan Pokok', 'pengeluaran', '🛒', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Kitchen Essential', 'pengeluaran', '🍳', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Kembalian Hutang', 'pemasukan', '💵', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Minuman Pokok', 'pengeluaran', '💧', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'WIFI', 'pengeluaran', '📶', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Interest', 'pemasukan', '📈', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Admin', 'pengeluaran', '💳', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Service Motor', 'pengeluaran', '🔧', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Toiletries', 'pengeluaran', '🧴', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Internet Package', 'pengeluaran', '📱', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Selfcare', 'pengeluaran', '✨', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Cashback', 'pemasukan', '🎁', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Listrik', 'pengeluaran', '⚡', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Subscriptions', 'pengeluaran', '📺', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Laundry' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Laundry', 'pengeluaran', '👕', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Lain-lain', 'pengeluaran', '🏷️', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Loan', 'pengeluaran', '🏦', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Nabung/Invest', 'pengeluaran', '💰', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Bayar Paylatter', 'pengeluaran', '💳', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Kuliah', 'pengeluaran', '🎓', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Gaji', 'pemasukan', '💼', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Gift' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Gift', 'pemasukan', '🎁', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Kesehatan/Healthcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL)) THEN
    INSERT INTO public.categories (user_id, name, type, emoji, monthly_budget)
    VALUES (v_user_id, 'Kesehatan/Healthcare', 'pengeluaran', '💊', 0);
  END IF;

  -- Insert Transactions (1458 rows)
  -- Batch 1/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'BCA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: Tarik Tunai',
    '2025-12-29 14:00:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    36191,
    (SELECT id FROM public.accounts WHERE name = 'BCA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'duit hangus',
    '2026-02-10 15:50:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-25'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kondangan/Kado' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Kondangan Andriya',
    '2025-12-25 16:52:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-25'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli sarapan',
    '2025-12-25 16:51:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-25'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tarik Tunai',
    '2025-12-25 16:50:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-26'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Patungan Ngombe',
    '2025-12-26 17:12:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Cilok, sama darko',
    '2025-12-27 14:51:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari BCA: Tarik Tunai',
    '2025-12-29 14:01:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite di Pom Ekamas',
    '2025-12-29 14:01:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-31'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Batagor di TB2',
    '2025-12-31 2:35:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-01'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite, di purwasari',
    '2026-01-01 1:23:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-01'::date,
    'pengeluaran',
    3000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Parkir Gacoan',
    '2026-01-01 1:20:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'panji  yofi minjem 5rb',
    '2026-01-02 12:10:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli sarapan',
    '2026-01-02 12:10:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-01-02 12:08:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-03'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'mines',
    '2026-01-03 5:04:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-06'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite di Purwasari',
    '2026-01-06 9:34:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-10'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite di purwasari',
    '2026-01-10 16:03:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-10'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Mines',
    '2026-01-10 16:06:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-10'::date,
    'pemasukan',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: Ayah top up gojek, tuker cash',
    '2026-01-10 18:14:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-12'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: Ayah Top up Gopay',
    '2026-01-12 5:55:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-14'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite di Purwasari',
    '2026-01-15 13:01:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-14'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Ngopi di walahar',
    '2026-01-14 1:10:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-15'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta buat belanja',
    '2026-01-15 13:02:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-16'::date,
    'pemasukan',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik Tunai',
    '2026-01-16 7:53:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-19'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli Bensin di purwasari',
    '2026-01-19 20:18:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-19'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli sarapan nasi uduk',
    '2026-01-19 20:18:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-21'::date,
    'pengeluaran',
    4500,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli mie + saos',
    '2026-01-21 13:57:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-22'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'patungan ngombe',
    '2026-01-24 16:45:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-24'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-01-24 16:46:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-24'::date,
    'pengeluaran',
    500,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'simpen koin',
    '2026-01-24 16:47:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-24'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bumbu tempe',
    '2026-01-24 16:46:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-31'::date,
    'pengeluaran',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngopi',
    '2026-01-31 14:08:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-31'::date,
    'pengeluaran',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Sarapan di warteg depan statsiun krw',
    '2026-01-31 14:07:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-31'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-01-31 14:06:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-02'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli Pertalite di spbu samping horizon',
    '2026-02-02 17:06:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-02'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi luwak di kantin lt6 horizon',
    '2026-02-02 17:05:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-04'::date,
    'pengeluaran',
    3000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli vit(air mineral)',
    '2026-02-04 5:08:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-04'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli uduk di tuparev',
    '2026-02-04 5:07:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-05'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin indomobil',
    '2026-02-05 14:51:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-05'::date,
    'pengeluaran',
    4000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di warkop horizon',
    '2026-02-05 7:03:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-05'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di angkringan tuparev',
    '2026-02-05 7:04:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-05'::date,
    'pengeluaran',
    1000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngasih ke yg minta',
    '2026-02-05 14:50:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-05'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir 3 tempat',
    '2026-02-05 7:03:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite',
    '2026-02-06 0:03:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: Tarik Tunai',
    '2026-02-06 0:02:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-08'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensi indomobil',
    '2026-02-08 8:29:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-08'::date,
    'pengeluaran',
    1000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pisahin coin',
    '2026-02-08 8:30:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-08'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di lt6 horizon',
    '2026-02-08 8:28:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-08'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta buat belanja',
    '2026-02-08 8:31:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-09'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli kopi + gorengan di warkop horizon',
    '2026-02-10 15:37:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertamax',
    '2026-02-10 15:38:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di kantin lt.6 horizon',
    '2026-02-10 15:38:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-11'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli sarapan',
    '2026-02-14 13:09:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin indomobil',
    '2026-02-14 13:05:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-02-14 13:05:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    7000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minusan',
    '2026-02-14 13:11:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-02-14 13:05:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli kopi di walahar + minesan (lupa)',
    '2026-02-20 4:48:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pengeluaran',
    9000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli mie 2,',
    '2026-02-20 4:48:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-21'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta buat belanja',
    '2026-02-21 13:46:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-24'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli Pertalite',
    '2026-02-24 10:02:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-24'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar thr ustad',
    '2026-02-24 10:03:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-24'::date,
    'pengeluaran',
    25000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan (lupa)',
    '2026-02-24 10:06:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-24'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar jembatan',
    '2026-02-24 10:03:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-25'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli Pertalite',
    '2026-02-26 10:15:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-25'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: Tarik Tunai',
    '2026-02-26 10:15:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ayah minta 10rb',
    '2026-02-26 10:16:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda belanja, bikin lotek',
    '2026-02-26 10:16:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'nambahin bunda beli gas',
    '2026-02-28 13:10:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin',
    '2026-03-01 12:26:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pemasukan',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-03-01 12:24:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-02'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli angkringan bareng galih & subur',
    '2026-03-02 14:21:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-02'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta buat bayar thr rt',
    '2026-03-02 14:21:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pemasukan',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-03-08 17:46:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-07'::date,
    'pengeluaran',
    12000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli timun suri',
    '2026-03-08 17:47:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-07'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Maranggi',
    '2026-03-08 17:46:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-08'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite',
    '2026-03-08 17:47:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-08'::date,
    'pengeluaran',
    11000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minus',
    '2026-03-08 17:57:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-08'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli timun suri',
    '2026-03-08 17:48:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-08'::date,
    'pemasukan',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'nemu cash di kantong baju',
    '2026-03-09 5:31:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-09'::date,
    'pemasukan',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: ayah tuker saldo gojek',
    '2026-03-09 5:26:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pengeluaran',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta buat bayar iuran sampah',
    '2026-03-11 17:42:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pengeluaran',
    12000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli mie ayam di ciampel',
    '2026-03-11 17:41:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli Pertalite',
    '2026-03-13 21:15:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'lupa',
    '2026-03-13 21:18:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli timun suri 1,5kg',
    '2026-03-13 21:16:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar zakat fitrah + infaq',
    '2026-03-13 21:15:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telor 1kg',
    '2026-03-13 21:16:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    1000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir atm mandiri',
    '2026-03-13 21:18:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pemasukan',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-03-13 21:14:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pemasukan',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: ayah tuker saldo gojek',
    '2026-03-14 9:23:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari GOPAY',
    '2026-03-17 11:04:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-19'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY: bewok tuker cash',
    '2026-03-23 22:23:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin di indomobil',
    '2026-03-23 20:52:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli timun suri',
    '2026-03-23 21:27:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan',
    '2026-03-23 22:12:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telur 1kg',
    '2026-03-23 21:28:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-03-23 21:38:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-24'::date,
    'pengeluaran',
    7000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan',
    '2026-03-25 5:36:47'::timestamptz
  );
  -- Batch 2/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar jembatan',
    '2026-03-27 17:48:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di tempat billiard(hangar)',
    '2026-03-27 17:47:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'patungan main billiard di hangar',
    '2026-03-27 17:47:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar parkir hangar',
    '2026-03-27 17:48:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-28'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-03-30 13:53:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sarapan(lupa)',
    '2026-03-30 13:56:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir mandiri',
    '2026-03-30 13:53:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-31'::date,
    'pengeluaran',
    3000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli aqua di indomaret',
    '2026-03-31 18:23:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-31'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bewok, balikin minjem 200rb',
    '2026-03-31 18:21:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-31'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli siomay di galuh',
    '2026-03-31 18:22:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-31'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir indomaret',
    '2026-03-31 18:23:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-02'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin',
    '2026-04-05 15:48:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-03'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kondangan/Kado' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'kondangan sunatan anak darko',
    '2026-04-05 15:48:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-04'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin',
    '2026-04-05 15:48:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-04'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di kantin horizon',
    '2026-04-05 15:49:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-04'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: muaz tuker cash',
    '2026-04-05 15:42:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    22000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'lupa',
    '2026-04-05 15:50:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: Tarik Tunai',
    '2026-04-15 21:05:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-15 23:01:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-15 23:04:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi + basreng di walahar',
    '2026-04-15 23:02:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di kantin horizon lt6 2kali',
    '2026-04-15 23:07:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    37000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli angkringan',
    '2026-04-15 23:11:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan',
    '2026-04-15 23:10:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: saldo gopay ayah',
    '2026-04-15 21:26:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-16'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-16 16:44:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-16'::date,
    'pengeluaran',
    28500,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telur 1kg',
    '2026-04-16 16:44:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-17'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Sarapan',
    '2026-04-18 7:38:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-20'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SAMPOERNA: tarik tunai',
    '2026-04-29 12:04:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-25'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-04-29 12:18:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-27'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan bubur',
    '2026-04-29 13:05:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-04-29 12:18:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    18000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bubur sarapan',
    '2026-04-29 12:17:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    25000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon aqua',
    '2026-04-29 12:21:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar parkir di ultima',
    '2026-04-29 12:19:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'zidan balikin duit main bl',
    '2026-05-02 9:41:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli baso depan gacoan galuh',
    '2026-05-02 9:39:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertamax',
    '2026-05-05 11:06:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    102500,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-05-05 11:08:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bumbu racik',
    '2026-05-05 11:06:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'nambah dambel drosting',
    '2026-05-05 19:03:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sarapan',
    '2026-05-18 4:39:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-05-05 19:02:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-05-05 11:05:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-10'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-05-18 4:38:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-11'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-05-18 4:37:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-05-18 4:37:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-18'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-05-18 4:31:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-18'::date,
    'pengeluaran',
    171000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'mines',
    '2026-05-18 4:47:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-05-20 8:40:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli angkringan galuh',
    '2026-05-20 8:42:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pemasukan',
    42000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'balikan gacoan',
    '2026-05-20 8:55:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Parkir Gacoan Galuh',
    '2026-05-20 8:40:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir angkrigan galuh',
    '2026-05-20 8:42:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-05-20 8:38:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-20'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Ganti rugi nyengol motor orang',
    '2026-05-23 16:00:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-20'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta buat belanja masak',
    '2026-05-23 16:07:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-21'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'patungan beli kopi dan gorengan',
    '2026-05-23 16:01:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-22'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: tf buat haikal, tuker cash',
    '2026-05-23 16:09:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: tf buat haikal, tuker cash',
    '2026-05-23 16:10:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-25'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'isi bensin',
    '2026-05-25 23:27:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-25'::date,
    'pengeluaran',
    4000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di warkop horizon',
    '2026-05-25 23:27:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-06-01 6:13:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-02'::date,
    'pemasukan',
    400000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'BEWOK BALIKIN SINGSONG',
    '2026-06-05 4:42:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-06-05 4:42:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-05'::date,
    'pengeluaran',
    216000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan  lupa',
    '2026-06-05 4:43:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-06'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin',
    '2026-06-07 17:08:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-06'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi + kentang + otak2 di walahar',
    '2026-06-07 17:09:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-06'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI: fanny tuker cash',
    '2026-06-07 17:09:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-12'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli cilok',
    '2026-06-13 8:39:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-12'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di walahar',
    '2026-06-13 8:45:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-12'::date,
    'pengeluaran',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli api',
    '2026-06-13 8:43:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-12'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan',
    '2026-06-13 8:39:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-12'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-06-13 8:38:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-13'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan',
    '2026-06-13 8:53:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-14'::date,
    'pengeluaran',
    45000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-06-14 8:02:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-23'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-06-29 4:25:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-27'::date,
    'pemasukan',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-06-29 4:25:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-30'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-07-22 4:59:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-08'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-07-22 5:13:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-20'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-07-22 5:13:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-22'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli donat',
    '2026-07-23 4:15:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    180000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-07-23 4:34:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertamax',
    '2026-07-23 6:14:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-07-24 2:34:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-07-23 4:35:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-07-23 4:36:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-07-23 4:35:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-07-23 4:34:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    12000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan uduk',
    '2026-07-25 14:23:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    75000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-07-23 4:36:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-07-23 6:13:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli snack dari sales di the round',
    '2026-07-25 14:24:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sarapan uduk',
    '2026-07-25 14:19:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir mie ayam mas aji',
    '2026-07-25 14:18:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir the round',
    '2026-07-25 14:19:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-26'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-07-27 0:34:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-27'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar penyebrangan',
    '2026-07-28 18:29:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari Krom: bunda tuker cash',
    '2026-07-28 19:24:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-29'::date,
    'pengeluaran',
    12000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sarapan',
    '2026-07-29 6:20:28'::timestamptz
  );
  -- Batch 3/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jatuh',
    '2026-07-30 20:44:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'angkringan',
    '2026-07-30 22:01:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir warkop',
    '2026-07-30 22:02:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertamax',
    '2026-08-02 1:32:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-08-02 9:26:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta 20rb',
    '2026-08-02 10:15:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan bubur',
    '2026-08-02 9:26:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SAMPOERNA',
    '2026-08-02 9:26:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir be-on',
    '2026-08-04 1:34:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-04'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan kupat tahu',
    '2026-08-06 12:00:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-05'::date,
    'pengeluaran',
    17000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli martabak',
    '2026-08-05 2:48:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-05'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli cilok',
    '2026-08-06 11:57:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-05'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir kaleyo',
    '2026-08-06 11:58:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-06'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir indomaret',
    '2026-08-09 3:54:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-06'::date,
    'pemasukan',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: ayah tuker cash ke saldo gojek',
    '2026-08-06 12:01:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-07'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin di bic',
    '2026-08-09 3:53:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-07'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-08-09 3:50:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-09'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: ayah tuker saldo gopay',
    '2026-08-09 17:47:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pengeluaran',
    27000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli martabak manis',
    '2026-08-12 11:25:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pengeluaran',
    4000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir rumah sakit izza',
    '2026-08-12 11:28:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-11'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-08-12 11:27:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-11'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kue samir',
    '2026-08-12 11:27:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-11'::date,
    'pengeluaran',
    12000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bubur ayam kuningan pangulah',
    '2026-08-12 11:28:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-12'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta buat belanja',
    '2026-08-12 11:32:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-13'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarapan bubur',
    '2026-08-13 9:53:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-14'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar jalan',
    '2026-08-14 12:43:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    3000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-08-17 5:14:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-16'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli roti bakar',
    '2026-08-17 5:04:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-25'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bewok ngasih 50rb',
    '2026-08-27 6:13:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-25'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-08-27 5:01:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-26'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite 40rb',
    '2026-08-28 2:27:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-27'::date,
    'pengeluaran',
    51000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-08-28 2:29:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-27'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta 20rb',
    '2026-08-28 2:27:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-27'::date,
    'pengeluaran',
    26000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon aqua',
    '2026-08-28 2:28:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SAMPOERNA: tarik tunai',
    '2026-09-01 13:46:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-09-03 5:18:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir kopken',
    '2026-09-03 5:19:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-02'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir fore',
    '2026-09-03 5:19:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-03'::date,
    'pengeluaran',
    25000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan',
    '2026-09-03 5:28:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-07'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SAMPOERNA',
    '2026-09-28 4:53:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-12'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai',
    '2026-09-20 9:57:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SAMPOERNA',
    '2026-09-28 4:52:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    140000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertalite selama September(lupa catat)',
    '2026-09-28 5:15:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    70000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Sarapan selama september(lupa catat)',
    '2026-09-28 5:16:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan september(lupa catat)',
    '2026-09-28 5:16:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'titip belanja(lupa catat)',
    '2026-09-28 5:17:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    26000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Isi ulang galon Aqua rumah(lupa catat)',
    '2026-09-28 5:18:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    26000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir september(lupa catat)',
    '2026-09-28 5:18:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-10-03 3:30:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-01'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir alfa tuparev',
    '2026-10-03 3:16:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-01'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir pertemuan cell',
    '2026-10-03 3:16:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-01'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bensin pertalite',
    '2026-10-03 3:39:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-05'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI: tarik tunai di bic',
    '2026-10-08 17:15:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-06'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SAMPOERNA: tarik tunai di atm bni tuparev',
    '2026-10-08 17:20:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-06'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sarapan ketoprak',
    '2026-10-08 17:21:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-06'::date,
    'pengeluaran',
    3000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir kopken',
    '2026-10-08 17:25:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-05'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'isi bensin di BIC',
    '2026-10-08 17:28:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'isi bensin di pom samping horizon',
    '2026-10-08 17:29:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-07'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sarapan soto sama fanny di depan primaya',
    '2026-10-08 17:29:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-07'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parkir pertemuan cell',
    '2026-10-08 17:31:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'lupa bayar parkir dan jembatan',
    '2026-10-08 17:37:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bensin(lupa)',
    '2026-10-08 17:38:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'CASH' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Parkir' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'duit parkir, (lupa)',
    '2026-10-08 17:50:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-30'::date,
    'pengeluaran',
    17100,
    (SELECT id FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Roti di indomaret depan masjid peruri',
    '2026-01-30 8:08:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pemasukan',
    117000,
    (SELECT id FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'balikan wihar yoi, ngombe bagi dua',
    '2026-02-20 4:44:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pemasukan',
    18000,
    (SELECT id FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Kembali hutang, darko beli kuota',
    '2026-03-01 8:10:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'haikal minta duit',
    '2026-03-05 10:22:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-08'::date,
    'pengeluaran',
    30500,
    (SELECT id FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Telor 1kg',
    '2026-03-08 17:49:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    54310,
    (SELECT id FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-04-05 16:07:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    27000,
    (SELECT id FROM public.accounts WHERE name = 'DANA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'muaz ballikin beli kopi gala goda',
    '2026-04-29 12:11:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pemasukan',
    330000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2025-12-29 10:47:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    329670,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Tagihan Myrepublic',
    '2025-12-29 10:48:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'lebihan',
    '2026-01-29 10:56:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    329500,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: buat bayar wifi',
    '2026-01-29 10:53:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    329670,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Tagihan Wifi',
    '2026-01-29 10:54:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    129300,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bahan bikin nastar',
    '2026-03-13 14:43:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pemasukan',
    129300,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-13 14:43:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-16'::date,
    'pemasukan',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-23 22:24:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-03-17 11:04:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-03-17 11:04:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-19'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari CASH: bewok tuker cash',
    '2026-03-23 22:23:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon 2, klik indomaret',
    '2026-03-25 6:33:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pengeluaran',
    39800,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon',
    '2026-03-25 8:31:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pemasukan',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-25 6:34:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-28'::date,
    'pengeluaran',
    3,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-03-29 21:05:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-28'::date,
    'pemasukan',
    17,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-29 21:05:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    46486,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli oli enduro matic v 10w40',
    '2026-04-05 16:05:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    84200,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon + sarden',
    '2026-04-05 16:06:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pemasukan',
    84000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-04-05 15:43:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-16'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon aqua 2pcs',
    '2026-04-16 6:51:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-16'::date,
    'pemasukan',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-04-16 6:50:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    7,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-29 12:10:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-04'::date,
    'pengeluaran',
    60400,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon aqua',
    '2026-05-05 11:29:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pemasukan',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-05 11:28:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-08'::date,
    'pemasukan',
    400000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-18 0:02:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pengeluaran',
    42900,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli detergent daia 2kg',
    '2026-05-18 4:09:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pengeluaran',
    51900,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli detergent k1000 di alfagift',
    '2026-05-18 4:09:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-05-20 9:08:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    76500,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gacoan',
    '2026-05-20 9:06:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    152149,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-05-23 16:09:41'::timestamptz
  );
  -- Batch 4/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    36,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pajak atas bunga',
    '2026-07-23 3:31:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pemasukan',
    180,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-23 3:31:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pemasukan',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund',
    '2026-07-23 3:30:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-12'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bewok balikin',
    '2026-07-23 3:29:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-21'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon',
    '2026-07-23 3:29:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-27'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli paket telkomsel 3hari',
    '2026-07-23 3:28:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-28'::date,
    'pengeluaran',
    15,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pajak atas bunga',
    '2026-07-23 3:26:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-28'::date,
    'pemasukan',
    78,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-23 3:26:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    42000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon',
    '2026-07-23 3:34:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 16:21:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-13'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon 2',
    '2026-07-23 3:25:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-13'::date,
    'pemasukan',
    37973,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 17:16:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-25'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon aqua 2',
    '2026-07-25 14:21:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-25'::date,
    'pemasukan',
    45820,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-25 14:21:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    40800,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli crackers di klikindomaret',
    '2026-07-31 5:49:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pemasukan',
    8,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-31 5:48:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pemasukan',
    40792,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-31 5:49:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-06'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon 2pcs',
    '2026-08-09 3:52:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-06'::date,
    'pemasukan',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-09 3:52:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pengeluaran',
    95700,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon 2pcs + snack',
    '2026-08-17 5:10:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    95700,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-17 5:09:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pengeluaran',
    42900,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon 2pcs',
    '2026-08-28 2:33:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pemasukan',
    42900,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-28 2:32:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pemasukan',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'dari bewok',
    '2026-10-03 3:24:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'dari bewok',
    '2026-10-03 3:24:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-13'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli 2 galon , kilik indomaret',
    '2026-10-03 3:25:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-16'::date,
    'pengeluaran',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-10-03 3:25:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pemasukan',
    22,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-10-03 3:26:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    4,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pajak',
    '2026-10-03 3:27:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    77482,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-10-03 4:11:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    81500,
    (SELECT id FROM public.accounts WHERE name = 'GOPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon, minyak, sabun cuci piring',
    '2026-10-03 4:12:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    528985,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tagihan Awal',
    '2026-02-10 17:48:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-13'::date,
    'pengeluaran',
    42900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli moist facetologyb5 di shoopee',
    '2026-02-13 3:20:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    28537,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Admin Honest Card',
    '2026-02-26 10:27:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    47920,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Aksesoris Hp di Shopee',
    '2026-02-26 13:17:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    146643,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Perdana Paket Indosat 3 bulan',
    '2026-02-26 10:22:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    56905,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Sambel Kacang di Shopee',
    '2026-02-26 10:25:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    220625,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli cetaphil 1000ml di shopee',
    '2026-02-26 10:21:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    62817,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli moist Cerave 50g di TTShop',
    '2026-02-26 10:21:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    20899,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Listerine Travel Package 100mlx2 di Tokped',
    '2026-02-26 10:25:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    48000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Oli Enduro Matic V 10w-40 di Tokped',
    '2026-02-26 10:24:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    31500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Listerine Multi Zero 500ml di Shopee',
    '2026-02-26 10:23:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    600422,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar bulanan',
    '2026-02-28 13:19:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pemasukan',
    28537,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback biaya admin',
    '2026-03-01 8:12:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pengeluaran',
    39928,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli skin poco f6 + sisir rambut',
    '2026-03-04 20:48:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pengeluaran',
    320535,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Tagihan Listrik February 2026',
    '2026-03-04 20:47:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Spotify student bulanan',
    '2026-03-04 20:48:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pengeluaran',
    155340,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli sabun biore 800mlx4, pasta gigi systema 190gx4',
    '2026-03-04 20:46:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pengeluaran',
    333000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Wifi Tagihan February 2026',
    '2026-03-04 20:46:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertamax',
    '2026-03-05 15:49:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pengeluaran',
    26400,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sirup + nata de coco',
    '2026-03-11 17:25:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pengeluaran',
    47000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli makanan kucing',
    '2026-03-11 17:28:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pengeluaran',
    47800,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Laundry' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli detergent attack jazz1 1,4kgx2',
    '2026-03-11 17:24:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pengeluaran',
    74200,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-30 6:01:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-07'::date,
    'pengeluaran',
    32022,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli bedak tabur marcks + tempat bedak tabur di shopee',
    '2026-03-11 17:32:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-10'::date,
    'pemasukan',
    38993,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund shopee',
    '2026-03-30 5:46:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-10'::date,
    'pemasukan',
    116347,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund shopee',
    '2026-03-30 5:47:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-10'::date,
    'pengeluaran',
    49500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pasta gigi systema 190grx6pcs',
    '2026-03-11 17:33:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pengeluaran',
    85925,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli butter royal krone + beli isian nanas',
    '2026-03-11 17:36:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pengeluaran',
    34719,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tempat bedak tabur + makarizo hair energy',
    '2026-03-11 17:35:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    250480,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli parfum mykonos utopia',
    '2026-03-12 18:43:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pemasukan',
    12367,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pengembalian dana shopee',
    '2026-03-24 0:12:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pemasukan',
    96886,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pengembalian biaya admin',
    '2026-03-23 23:59:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pemasukan',
    2038500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan honest',
    '2026-03-23 22:31:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-19'::date,
    'pengeluaran',
    398630,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'belanja di superindo, buat masak lebaran',
    '2026-03-24 0:01:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-19'::date,
    'pengeluaran',
    99999,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli voucher tiktok',
    '2026-03-24 0:00:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-22'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi 2 di tempat makan majalengka',
    '2026-03-24 0:06:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-22'::date,
    'pengeluaran',
    52432,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli makan kucing lifecat 800grx2',
    '2026-03-24 0:04:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-22'::date,
    'pengeluaran',
    32606,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli you acne spot',
    '2026-03-24 0:04:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    36793,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli linggis',
    '2026-03-24 0:10:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    68540,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pasi kucing tofu 7Lx2',
    '2026-03-24 0:08:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    32638,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarung jok',
    '2026-03-24 0:09:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    11432,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli oli gardan',
    '2026-03-30 5:39:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pengeluaran',
    227910,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli speaker edifiear mp85',
    '2026-03-30 5:40:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pengeluaran',
    125699,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli perdana indosat buat haikal',
    '2026-03-30 5:42:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pengeluaran',
    23564,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli hydrocolloid patch + gunting',
    '2026-03-30 5:43:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-28'::date,
    'pengeluaran',
    500000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar dp biaya berobat kucing',
    '2026-03-30 5:43:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    22596,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minesan(lupa)',
    '2026-03-30 6:03:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    334100,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar tagihan myrepublic',
    '2026-03-30 15:37:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-01'::date,
    'pengeluaran',
    395000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tambahan biaya berobat kucing',
    '2026-04-01 17:39:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    6166620,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli HP poco x8 pro max 12/512',
    '2026-04-05 16:10:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pemasukan',
    2249727,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-04-05 16:39:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spotify',
    '2026-04-05 16:11:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-07'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback honest point 10rb=Rp. 10.000',
    '2026-04-15 22:57:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-07'::date,
    'pemasukan',
    6066620,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: Bayar Tagihan honest',
    '2026-04-15 21:09:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-08'::date,
    'pengeluaran',
    10236,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli cover charger xiaomi',
    '2026-04-15 22:53:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-10'::date,
    'pengeluaran',
    67000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli case syndee poco x8pm',
    '2026-04-15 22:54:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-10'::date,
    'pengeluaran',
    37500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kaos kaki 12pasang',
    '2026-04-15 22:54:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-12'::date,
    'pengeluaran',
    94063,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tempered glass smardevil poco x8pm',
    '2026-04-15 22:55:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    102000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kabel sakti(onprime 140w)',
    '2026-04-15 22:56:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-17'::date,
    'pengeluaran',
    103104,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sabun biore 800mlx4pcs',
    '2026-04-18 8:04:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pemasukan',
    10419,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin honest',
    '2026-04-18 7:58:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pengeluaran',
    306508,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan listrik april 2026',
    '2026-04-18 8:05:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pemasukan',
    219218,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar statement  april',
    '2026-04-18 8:25:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-19'::date,
    'pemasukan',
    103140,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund',
    '2026-05-18 4:55:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-19'::date,
    'pengeluaran',
    45672,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli hair cream + kaos polos putih',
    '2026-05-18 4:52:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-19'::date,
    'pengeluaran',
    102904,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sabun lifboy 4x800ml',
    '2026-05-18 4:54:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-20'::date,
    'pengeluaran',
    79679,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli makan kucing mr.vet',
    '2026-05-18 4:57:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-20'::date,
    'pengeluaran',
    49000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli makan kucing mr.vet',
    '2026-05-18 4:57:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-21'::date,
    'pengeluaran',
    27000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di galagoda',
    '2026-05-18 5:00:46'::timestamptz
  );
  -- Batch 5/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-23'::date,
    'pengeluaran',
    42318,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli polo GD navy',
    '2026-05-18 5:01:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-23'::date,
    'pengeluaran',
    135345,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kaos polo + flannel',
    '2026-05-20 11:35:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-25'::date,
    'pengeluaran',
    145000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-05-20 11:35:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-26'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli angkringan',
    '2026-05-20 11:38:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-26'::date,
    'pengeluaran',
    49500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gacoan',
    '2026-05-20 11:37:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-26'::date,
    'pengeluaran',
    28753,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tawas + botol',
    '2026-05-20 11:37:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di warmindo horizon',
    '2026-05-20 11:41:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    21404,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli hydrogel poco x8 pro max',
    '2026-05-20 11:39:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    86000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di ultima',
    '2026-05-20 11:40:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    28000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli geprek horizon',
    '2026-05-20 11:40:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pengeluaran',
    72176,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kaos di shopee',
    '2026-05-20 11:44:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    320030,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan listrik mei 2026',
    '2026-05-20 11:45:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    334100,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar tagihan wifi myrepublic',
    '2026-05-20 11:45:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-04'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spotify',
    '2026-05-20 13:07:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-10'::date,
    'pengeluaran',
    110000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli domino pizza',
    '2026-05-20 13:08:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-11'::date,
    'pengeluaran',
    213111,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli makan kucing mrvet 2kg + lifecat 2pcs',
    '2026-05-20 13:10:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    286400,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli moizturizer cerave',
    '2026-05-20 13:11:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pengeluaran',
    131904,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin honest',
    '2026-05-20 13:11:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-17'::date,
    'pengeluaran',
    453999,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kartu indosat 1 tahun',
    '2026-05-20 13:12:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-21'::date,
    'pengeluaran',
    29840,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tg ravguard poco x8pm',
    '2026-05-23 16:13:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-22'::date,
    'pengeluaran',
    29840,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarung tangan motor',
    '2026-05-23 16:14:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    41690,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarung tangan bl 2pcs',
    '2026-05-23 16:15:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    41108,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli glovejoy pro, sarung tangan bl',
    '2026-05-23 16:16:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    58449,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli celana baggy di tiktok',
    '2026-05-23 16:16:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-24'::date,
    'pengeluaran',
    54606,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli celana baggy',
    '2026-05-24 4:41:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-26'::date,
    'pengeluaran',
    74000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl',
    '2026-05-26 16:21:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-27'::date,
    'pengeluaran',
    47465,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli hairmask makarizo',
    '2026-06-01 13:21:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-27'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli oli (ke refund ke gopay)',
    '2026-06-01 13:20:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    1299000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli coverse b1g1',
    '2026-06-01 14:59:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    1299000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli coverse b1g1(kelebihan order)',
    '2026-06-01 14:59:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    1299000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli coverse b1g1(kelebihan order)',
    '2026-06-01 15:00:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    164350,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli oli enduro matic v 3pcs',
    '2026-06-01 15:01:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    728080,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli casio aq230 blue grey',
    '2026-06-01 15:01:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pemasukan',
    131904,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pengembalian biaya admin',
    '2026-07-22 13:57:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    303000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar listrik mei',
    '2026-06-01 15:29:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pemasukan',
    2775285,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan mei',
    '2026-06-01 15:06:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    331100,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar tagihan wifi',
    '2026-06-01 15:30:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    128100,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli celana dalam afish, tiktokshop',
    '2026-07-22 14:01:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spotify',
    '2026-07-22 14:02:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-11'::date,
    'pemasukan',
    1299000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan',
    '2026-06-29 4:54:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-16'::date,
    'pengeluaran',
    251874,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin honest',
    '2026-07-22 14:04:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pemasukan',
    650000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan honest',
    '2026-07-20 16:03:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-22'::date,
    'pengeluaran',
    48473,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli hair oli + hair cream mezuca',
    '2026-07-22 14:07:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-22'::date,
    'pengeluaran',
    79093,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sunscreen azarine',
    '2026-07-22 14:07:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-22'::date,
    'pengeluaran',
    57802,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli salep aza20',
    '2026-07-22 14:08:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-23'::date,
    'pengeluaran',
    49960,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli peeling acid brighty',
    '2026-07-22 14:10:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-25'::date,
    'pengeluaran',
    56725,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli celana dalam afish, tiktokshop',
    '2026-07-22 14:10:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    251874,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback admin honest',
    '2026-07-22 14:11:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    4649460,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan honest',
    '2026-07-20 16:23:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-03'::date,
    'pengeluaran',
    307508,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan listrik bulan juli',
    '2026-07-22 14:13:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-03'::date,
    'pengeluaran',
    331600,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan my republic',
    '2026-07-22 14:13:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-05'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spotify',
    '2026-07-22 14:14:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-14'::date,
    'pengeluaran',
    62600,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli stripper fiber optic',
    '2026-07-22 14:15:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pengeluaran',
    38525,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin honest',
    '2026-07-22 14:15:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'stamp duty',
    '2026-07-22 14:16:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pengembalian stamp duty',
    '2026-07-22 14:17:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-19'::date,
    'pengeluaran',
    110000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bir di district',
    '2026-07-22 14:18:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-21'::date,
    'pengeluaran',
    128737,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli makanan kucing, mr.vet',
    '2026-07-22 14:19:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-22'::date,
    'pengeluaran',
    42300,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lampu tempel',
    '2026-07-22 14:19:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-22'::date,
    'pengeluaran',
    53666,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lifecat 800grx2pcs',
    '2026-07-22 14:21:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-22'::date,
    'pengeluaran',
    55000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sabun lifebuoy 800mlx2pcs',
    '2026-07-22 14:20:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-22'::date,
    'pengeluaran',
    22900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pasta gigi systema 190grx2pcs',
    '2026-07-22 14:20:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-22'::date,
    'pengeluaran',
    95475,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sabun lifebuoy 800mlx4pcs',
    '2026-07-22 14:22:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    75840,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli indocafe OG + saus delmonte 1kg',
    '2026-07-23 4:51:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    41054,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli dove shampoo 400ml',
    '2026-07-23 3:57:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    52950,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli hydrocolloid patch',
    '2026-07-24 3:59:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-26'::date,
    'pengeluaran',
    43200,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bulb Philips 8w tuneable white',
    '2026-07-27 0:37:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    44606,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli glove billiard',
    '2026-07-28 8:30:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    810582,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan',
    '2026-07-28 19:20:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    51363,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli aza20',
    '2026-07-28 7:16:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    36431,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli minosep kumur',
    '2026-07-28 4:04:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pengeluaran',
    102597,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sunscreen nivea 90mlx2pcs',
    '2026-07-30 2:31:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    304502,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan listrik',
    '2026-08-03 4:09:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    334100,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan wifi',
    '2026-08-03 4:09:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-04'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spotify',
    '2026-08-09 4:00:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-12'::date,
    'pengeluaran',
    101592,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli oli gulf 20w-40, 800ml x 2pcs',
    '2026-08-12 11:24:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-16'::date,
    'pengeluaran',
    93089,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin honest',
    '2026-08-27 5:02:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pemasukan',
    93089,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pengembalian biaya admin',
    '2026-08-27 5:06:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pengeluaran',
    31000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi tanker shopee',
    '2026-08-27 5:03:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pemasukan',
    1958609,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan honest',
    '2026-08-27 5:01:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pengeluaran',
    65600,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli semprotan nyamuk fumakilla',
    '2026-08-27 5:11:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-21'::date,
    'pengeluaran',
    43900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli strap jam tangan aq230',
    '2026-08-27 5:12:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-21'::date,
    'pengeluaran',
    66000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli dinamo kipas angin',
    '2026-08-27 5:05:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-21'::date,
    'pengeluaran',
    63334,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Laundry' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli 6pcs celana dalam',
    '2026-08-27 5:13:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-22'::date,
    'pengeluaran',
    45500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli case poco x8pm',
    '2026-08-27 5:13:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-23'::date,
    'pengeluaran',
    55736,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli dinamo kipas angin',
    '2026-08-27 5:14:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-23'::date,
    'pengeluaran',
    27248,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli shrink tube kabel',
    '2026-08-27 5:14:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-24'::date,
    'pengeluaran',
    22800,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli plastik sampah',
    '2026-08-27 5:15:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-25'::date,
    'pengeluaran',
    136450,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli 2 pafrum refill sotb & ostara',
    '2026-08-27 5:16:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-27'::date,
    'pengeluaran',
    2960590,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bigme b6 monochrome + case',
    '2026-08-27 5:19:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    2600000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-09-01 13:59:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    333100,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'WIFI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan myrepublic',
    '2026-09-01 14:30:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    290980,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan pln',
    '2026-09-01 14:32:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    107900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli mr vet kucing',
    '2026-09-01 15:10:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    1994869,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan honest',
    '2026-10-03 4:13:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-31'::date,
    'pengeluaran',
    278704,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tas messenger eiger',
    '2026-10-08 18:20:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    47398,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pouch & bantalan tas',
    '2026-10-08 18:22:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-04'::date,
    'pengeluaran',
    128450,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lifecat lolipop 800gr 5pcs di shopee',
    '2026-10-08 18:23:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-04'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spotify student bulanan',
    '2026-10-08 18:24:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-04'::date,
    'pengeluaran',
    21000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'makan / jajan di warmindo the round',
    '2026-10-08 18:24:55'::timestamptz
  );
  -- Batch 6/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-05'::date,
    'pemasukan',
    38734,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund shopee: pembatalan bantalan bahu morve',
    '2026-10-08 18:25:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pengeluaran',
    164575,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli shinon all body trimmer shaver di shopee',
    '2026-10-08 18:26:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pengeluaran',
    128865,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli rompi vinland hunter vest army s di shopee',
    '2026-10-08 18:26:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pengeluaran',
    44362,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli baut oli gardan vario + baut ring + oli motul di shopee',
    '2026-10-08 18:27:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pengeluaran',
    71044,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli set extractor baut rusak (62.036) + baut saxsena (9.008) di shopee',
    '2026-10-08 18:27:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pemasukan',
    9008,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund shopee: pembatalan baut saxsena',
    '2026-10-08 18:28:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pengeluaran',
    46500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli saos sambal indofood 1kg + saus delmonte 1kg di shopee',
    '2026-10-08 18:30:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-14'::date,
    'pemasukan',
    62036,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund shopee: pengembalian dana set extractor baut rusak',
    '2026-10-08 18:31:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-15'::date,
    'pengeluaran',
    45837,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tuxedo penghitam body + autogard sampo motor di shopee',
    '2026-10-08 18:31:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-16'::date,
    'pengeluaran',
    122449,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin fee honest card',
    '2026-10-08 18:31:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-16'::date,
    'pengeluaran',
    135242,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli acefast a134 adaptor gan 67w di shopee',
    '2026-10-08 18:31:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-16'::date,
    'pengeluaran',
    24960,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli anti gores hydrogel casio a178 di shopee',
    '2026-10-08 18:32:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-16'::date,
    'pengeluaran',
    24000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'makan di kedai zacky food',
    '2026-10-08 18:32:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-16'::date,
    'pengeluaran',
    104560,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kabel cuktech 240w (94.456) + penjepit kabel gyro 3d (10.104) di shopee',
    '2026-10-08 18:33:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pengeluaran',
    49500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan di cafe oneten',
    '2026-10-08 18:33:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pengeluaran',
    19000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi kenangan (via honest card)',
    '2026-10-08 18:34:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-20'::date,
    'pengeluaran',
    156150,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli baterai verka aaa 4pcs (119.838) + jam desktop  (36.312) di shopee',
    '2026-10-08 18:35:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-20'::date,
    'pengeluaran',
    219525,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli cetaphil gentle skin cleanser 1000ml di shopee',
    '2026-10-08 18:35:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-20'::date,
    'pengeluaran',
    26500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli case silicone cuktech 15 pb200p di shopee',
    '2026-10-08 18:35:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-20'::date,
    'pengeluaran',
    345400,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar pajak motor(via sambara)',
    '2026-10-08 18:37:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-20'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cukur di omni barbershop',
    '2026-10-08 18:37:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-21'::date,
    'pengeluaran',
    79950,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli baterai rechargeable size d hland lito 2pcs di shopee',
    '2026-10-08 18:37:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-21'::date,
    'pengeluaran',
    75950,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'transaksi shopee (indikasi double charge / mutasi ganda)',
    '2026-10-08 18:38:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-23'::date,
    'pengeluaran',
    411080,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli case pb10 cuktech (32.295) + pb cuktech 10000mah (378.785) di shopee',
    '2026-10-08 18:40:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-23'::date,
    'pengeluaran',
    85041,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kabel cuktech type-c 240w 2m hitam di shopee',
    '2026-10-08 18:41:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-24'::date,
    'pemasukan',
    94456,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund shopee: retur kabel cuktech 240w (order 19 sep)',
    '2026-10-08 18:41:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-24'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'isi bensin di spbu pertamina',
    '2026-10-08 18:42:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-24'::date,
    'pengeluaran',
    14000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan di toko teh ressa(kantin horizon)',
    '2026-10-08 18:42:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-25'::date,
    'pengeluaran',
    85470,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'gemini pro',
    '2026-10-08 18:43:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-25'::date,
    'pengeluaran',
    51000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telur 2kg  di toko telor alesha',
    '2026-10-08 18:43:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-26'::date,
    'pengeluaran',
    218680,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli focat pasir kucing 7l isi 6 di shopee',
    '2026-10-08 18:45:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-26'::date,
    'pengeluaran',
    38828,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli focat pasir kucing tofu 7l green tea di shopee',
    '2026-10-08 18:46:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-27'::date,
    'pengeluaran',
    42800,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'po jasa 3d print petg blez crafts di shopee (case cuktech 25 se)',
    '2026-10-08 18:46:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-27'::date,
    'pengeluaran',
    658720,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli cuktech powerbank 120w max 25000mah di shopee',
    '2026-10-08 18:46:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    33999,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli waterskin oralab sikat lidah di shopee',
    '2026-10-08 18:47:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    86334,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli softcase f6 (12.776) + tg x8 (32.822) + tg f6 (28.203) + sikat apen (12.533)',
    '2026-10-08 18:47:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Naik ojek, ke alfalah(motor mogok)',
    '2025-12-27 14:03:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pengeluaran',
    2000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tip gojek',
    '2025-12-27 9:56:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayarin gojek bunda',
    '2025-12-27 9:45:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pemasukan',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2025-12-27 9:45:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pemasukan',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2025-12-27 14:02:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pengeluaran',
    23,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tax on interest',
    '2025-12-28 23:24:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pemasukan',
    116,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Interest',
    '2025-12-28 23:23:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pemasukan',
    3500000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-01-02 12:06:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    3472333,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: Bayar Jago loan',
    '2026-01-02 12:09:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    6,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tax',
    '2026-01-29 0:46:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    33,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Interest',
    '2026-01-29 0:46:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    4182000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-01-29 7:46:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    3472333,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan:',
    '2026-01-29 10:48:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    709730,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan:',
    '2026-01-29 10:48:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-30'::date,
    'pemasukan',
    51048,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SUPERBANK',
    '2026-01-30 20:44:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pemasukan',
    1500000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'buat bayar cicilan semester',
    '2026-02-06 6:26:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-02-06 0:02:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: Tarik Tunai',
    '2026-02-06 0:02:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    1500000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-02-06 6:26:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    1478485,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-03-01 7:56:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    1400000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minjem 1,4jt tenor 1bulan',
    '2026-02-28 13:24:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    4240000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-02-28 13:16:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    3472330,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar jago loan cicilan ke-3 yang 10jt(lunas)',
    '2026-02-28 13:17:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    770848,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: cicilan ke 1 yang  minjem 1,4jt',
    '2026-02-28 13:18:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    19,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-03-01 7:57:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pemasukan',
    98,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-01 7:57:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    13900,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bungan jago loan',
    '2026-03-12 19:21:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pemasukan',
    1013900,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-12 19:19:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar jago loan',
    '2026-03-12 19:20:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-17 11:04:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-03-17 11:04:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pemasukan',
    800000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-27 17:50:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    800000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up RDN',
    '2026-03-27 17:50:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pemasukan',
    2190308,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-30 10:52:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    770847,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar jago loan',
    '2026-03-30 12:05:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    1419460,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar jago loan',
    '2026-03-30 12:08:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pemasukan',
    6000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari Jago Loan',
    '2026-04-05 16:16:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    6000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-04-05 16:37:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-04-15 21:19:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-21'::date,
    'pengeluaran',
    27000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi gala goda',
    '2026-04-29 11:04:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    5,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-04-29 11:05:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pemasukan',
    27,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-29 11:05:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    9500,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar gojek bunda',
    '2026-05-18 4:05:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    3097300,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-02 12:35:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    1013900,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar tagihan',
    '2026-05-02 12:36:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    2083400,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan',
    '2026-05-02 12:36:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-20'::date,
    'pengeluaran',
    10000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up rdn',
    '2026-06-01 17:12:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-20'::date,
    'pemasukan',
    10000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari Jago Loan: pinjem jago loan buat top up stockbit',
    '2026-06-01 15:11:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pemasukan',
    4208889,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-01 15:09:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    4222411,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar tagihan jago loan',
    '2026-06-01 15:09:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    3000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up rdn',
    '2026-06-04 15:52:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pemasukan',
    3000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-04 15:39:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pemasukan',
    650000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'yang beli convers 70 hi',
    '2026-07-20 15:53:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pengeluaran',
    650000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM: yang beli convers 70 hi',
    '2026-07-20 15:53:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-28'::date,
    'pemasukan',
    2,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'interest',
    '2026-07-22 8:11:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    4222409,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 16:22:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    2083397,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: jago loan',
    '2026-07-22 8:13:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    2139011,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: jago loan',
    '2026-07-22 8:13:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pemasukan',
    2500000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari Jago Loan',
    '2026-07-22 11:10:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pengeluaran',
    2500003,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-22 11:16:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    3007095,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-28 19:31:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    2139011,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar jago loan',
    '2026-07-28 19:42:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    868084,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar jago loan',
    '2026-07-28 19:42:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-29'::date,
    'pengeluaran',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up rdn',
    '2026-07-31 14:09:41'::timestamptz
  );
  -- Batch 7/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-29'::date,
    'pemasukan',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-31 14:08:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pemasukan',
    26100,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: refund tiktok voucher',
    '2026-08-31 13:04:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pengeluaran',
    4,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-09-01 14:02:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pemasukan',
    20,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-09-01 14:02:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    73,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-09-01 14:18:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    2980906,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-09-01 14:21:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    2139011,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan',
    '2026-09-01 14:21:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    868084,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan',
    '2026-09-01 14:22:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    3007085,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-10-03 4:13:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    2139005,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar tagihan jago loan',
    '2026-10-08 18:18:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    868080,
    (SELECT id FROM public.accounts WHERE name = 'JAGO' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Jago Loan: bayar tagihan jago loan',
    '2026-10-08 18:18:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    3472331,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tagihan Awal',
    '2026-02-10 18:00:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    1541696,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tagihan Awal',
    '2026-02-10 18:36:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    1400000,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minjem jago loan 1,4jt',
    '2026-02-28 13:25:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    3472330,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar jago loan cicilan ke-3 yang 10jt(lunas)',
    '2026-02-28 13:17:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    770848,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: cicilan ke 1 yang  minjem 1,4jt',
    '2026-02-28 13:18:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-10'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minjem 1jt buat ngasih ke bunda',
    '2026-03-11 18:06:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pemasukan',
    1013900,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar tagihan',
    '2026-05-02 12:36:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    19458,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunga jago loan',
    '2026-03-30 12:08:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pemasukan',
    770847,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar jago loan',
    '2026-03-30 12:05:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pemasukan',
    1419460,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar jago loan',
    '2026-03-30 12:08:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    13900,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunga',
    '2026-04-05 16:15:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    250198,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunga',
    '2026-04-05 16:18:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minjem jago loan , buat ngasih ke bunda',
    '2026-04-05 16:14:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    6000000,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-04-05 16:16:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    1013900,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar tagihan',
    '2026-05-02 12:36:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    2083400,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-05-02 12:36:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    681528,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin jago loan',
    '2026-06-01 15:13:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pemasukan',
    4222411,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar tagihan jago loan',
    '2026-06-01 15:09:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    10000000,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO: pinjem jago loan buat top up stockbit',
    '2026-06-01 15:11:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    2083397,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: jago loan',
    '2026-07-22 8:13:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    2139011,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: jago loan',
    '2026-07-22 8:13:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pengeluaran',
    131670,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'loan interest(bunga)',
    '2026-07-22 11:33:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pengeluaran',
    2500000,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-07-22 11:10:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    2139011,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar jago loan',
    '2026-07-28 19:42:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    868084,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar jago loan',
    '2026-07-28 19:43:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    2139011,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-09-01 14:21:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    868084,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-09-01 14:22:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    2139005,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar tagihan jago loan',
    '2026-10-08 18:18:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    868080,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: bayar tagihan jago loan',
    '2026-10-08 18:18:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pemasukan',
    2,
    (SELECT id FROM public.accounts WHERE name = 'Jago Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'lebihan',
    '2026-10-08 18:19:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-12'::date,
    'pengeluaran',
    97600,
    (SELECT id FROM public.accounts WHERE name = 'Kredivo' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pulsa',
    '2026-02-12 12:45:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    313510,
    (SELECT id FROM public.accounts WHERE name = 'Kredivo' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Listrik' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Listrik',
    '2026-02-26 10:40:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    17350,
    (SELECT id FROM public.accounts WHERE name = 'Kredivo' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Darko minta beliin kuota (diganti)',
    '2026-03-01 8:09:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    42800,
    (SELECT id FROM public.accounts WHERE name = 'Kredivo' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'belanja terigu, sabun cuci piring, gula pasir di klik indomaret',
    '2026-03-01 8:08:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pemasukan',
    411110,
    (SELECT id FROM public.accounts WHERE name = 'Kredivo' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: Bayar tagihan Kredivo',
    '2026-03-01 8:01:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pemasukan',
    60150,
    (SELECT id FROM public.accounts WHERE name = 'Kredivo' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: bayar tagihan',
    '2026-03-12 19:14:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2025-12-27 9:45:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-27'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2025-12-27 14:02:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pengeluaran',
    1417,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tax',
    '2025-12-28 23:20:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pemasukan',
    7085,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Interest Main saving',
    '2025-12-28 23:21:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sync',
    '2025-12-28 23:22:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    7169576,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Tagihan Honest',
    '2025-12-29 10:38:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    1642236,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar shoopeepaylatter',
    '2025-12-29 11:26:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    431610,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Kredivo',
    '2025-12-29 11:43:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Kopi Luwak di Kantin Horizon',
    '2025-12-29 10:43:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pemasukan',
    10000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2025-12-29 10:31:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pemasukan',
    4400000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2025-12-29 18:07:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    330000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2025-12-29 10:47:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-01'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Top Up gopay ayah',
    '2026-01-01 1:27:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-01'::date,
    'pengeluaran',
    25000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Rek Jago Haikal,(minta jajan)',
    '2026-01-01 1:43:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-01'::date,
    'pengeluaran',
    60498,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bunda minta bayarin paket',
    '2026-01-01 9:45:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-01'::date,
    'pengeluaran',
    47500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Gacoan, sama haikal',
    '2026-01-01 1:21:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    3500000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-01-02 12:06:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-01-02 12:08:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-01-02 12:08:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-03'::date,
    'pengeluaran',
    950000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bulanan ke Bunda',
    '2026-01-03 5:04:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-10'::date,
    'pengeluaran',
    21000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli in haikal kuota',
    '2026-01-10 16:02:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-10'::date,
    'pengeluaran',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar Laundry karpet bunda',
    '2026-01-10 16:03:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-10'::date,
    'pemasukan',
    700000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Minjem Duit ke teteh sheillq',
    '2026-01-10 16:01:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-10'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: Ayah top up gojek, tuker cash',
    '2026-01-10 18:14:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-12'::date,
    'pengeluaran',
    14000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Lazatto walahar (sarapan)',
    '2026-01-12 5:54:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-12'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: Ayah Top up Gopay',
    '2026-01-12 5:55:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-15'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'patungan ngombe',
    '2026-01-15 13:03:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-15'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ayah minta duit tambal ban',
    '2026-01-15 13:03:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-15'::date,
    'pengeluaran',
    114000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli beras bulog 10kg(2karung)',
    '2026-01-15 13:04:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-16'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-01-17 12:53:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-17'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Bolu Kunafe,(Oleh2 dari bandung)',
    '2026-01-29 0:33:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-23'::date,
    'pengeluaran',
    28000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli telur 1 kg',
    '2026-01-29 0:35:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-23'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-01-29 0:35:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    871,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tax',
    '2026-01-29 0:36:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    700000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar hutang ke teh sheilla',
    '2026-01-29 7:45:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    830900,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tagihan Kredivo',
    '2026-01-29 7:54:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Pertamax',
    '2026-01-30 8:51:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    4357,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Interest',
    '2026-01-29 0:37:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    9500000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-01-29 7:38:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    4182000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-01-29 7:46:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    329500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY: buat bayar wifi',
    '2026-01-29 10:53:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-30'::date,
    'pengeluaran',
    1500000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Top Up RDN',
    '2026-01-30 8:51:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-31'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'motor mogok, service kelistrikan',
    '2026-01-31 14:06:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-02'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi dan gorengan di warmindo horizon',
    '2026-02-02 17:05:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-02'::date,
    'pengeluaran',
    24000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-02-02 8:58:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-05'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ngombe',
    '2026-02-05 7:04:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-05'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke bca bunda',
    '2026-02-05 7:05:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    3000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Aqua botol',
    '2026-02-10 15:42:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    4000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Kopi di warkop horizon',
    '2026-02-10 15:43:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Geprek horizon',
    '2026-02-10 15:42:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-02-06 0:02:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    19000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-02-06 6:32:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    114000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Beras bulog di purwasari',
    '2026-02-10 15:40:25'::timestamptz
  );
  -- Batch 8/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-02-10 21:06:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-11'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ayah minta saldo gopay',
    '2026-02-11 20:35:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-13'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli geprek horizon',
    '2026-02-13 13:45:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli geprek horizon',
    '2026-02-14 13:06:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-02-14 13:15:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-15'::date,
    'pengeluaran',
    235000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ngombe',
    '2026-02-20 4:43:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pengeluaran',
    4000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di warkop horizon',
    '2026-02-20 4:42:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pemasukan',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-02-20 5:18:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pengeluaran',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SAMPOERNA',
    '2026-02-20 5:17:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-21'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ayah minta saldo gopay',
    '2026-02-21 13:46:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ayah minta saldo gojek',
    '2026-02-26 10:16:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-26'::date,
    'pemasukan',
    1478485,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-03-01 7:56:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-02-28 13:09:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    4240000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-02-28 13:15:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    600422,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar bulanan',
    '2026-02-28 13:19:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    1198353,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Spaylatter: Bayar  Tagihan Spaylatter',
    '2026-03-01 8:00:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    411110,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Kredivo: Bayar tagihan Kredivo',
    '2026-03-01 8:01:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pengeluaran',
    559,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-04 21:31:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pemasukan',
    2797,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-04 21:30:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-09'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'nambahin ayah beli maranggi',
    '2026-03-09 5:26:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-09'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: ayah tuker saldo gojek',
    '2026-03-09 5:26:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pemasukan',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-03-11 19:44:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pemasukan',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-03-12 10:20:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    300000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-03-12 10:20:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    60150,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Kredivo: bayar tagihan',
    '2026-03-12 19:14:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    1013900,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-03-12 19:19:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    129300,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-03-13 14:43:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pengeluaran',
    300000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta thr',
    '2026-03-23 22:21:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: ayah tuker saldo gojek',
    '2026-03-14 9:23:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-03-14 15:44:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-16'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-03-23 22:24:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pemasukan',
    1316,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'lebihan',
    '2026-03-23 23:22:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-03-17 11:04:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pengeluaran',
    2038500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan honest',
    '2026-03-23 22:31:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-19'::date,
    'pengeluaran',
    240000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli daging lebaran',
    '2026-03-23 22:32:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-19'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cukur rambut',
    '2026-03-23 22:32:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-20'::date,
    'pemasukan',
    280000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'parfum mykonos utopia dibeli teteh sheilla',
    '2026-03-23 22:34:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-22'::date,
    'pengeluaran',
    400000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayarin makan resto di majalengka bareng keluarga aki eman',
    '2026-03-23 23:19:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar kuliah (salah transfer sebenernya)',
    '2026-03-23 20:51:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-03-23 20:50:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-03-25 6:33:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-25'::date,
    'pengeluaran',
    800000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-03-27 17:50:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-26'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-03-27 17:51:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    72000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-03-27 17:51:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-03-29 20:53:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-28'::date,
    'pengeluaran',
    1032,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-03-29 20:55:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bewok minjem 200rb(tf ke gopay)',
    '2026-03-29 21:00:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pemasukan',
    5160,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-29 20:55:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pemasukan',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-03-29 20:50:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pengeluaran',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-03-29 20:55:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-03-29 20:58:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    1237500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar kuliah',
    '2026-03-30 10:56:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pemasukan',
    2000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-03-30 10:38:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    2190308,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-03-30 10:52:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-31'::date,
    'pengeluaran',
    22000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tomoro coffee',
    '2026-03-31 18:24:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-03'::date,
    'pengeluaran',
    25000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ameriicano di genz',
    '2026-04-05 15:41:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-03'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main billiard di gen z',
    '2026-04-05 15:42:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-04'::date,
    'pengeluaran',
    75000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main billiard di ultima',
    '2026-04-05 15:43:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-04'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: muaz tuker cash',
    '2026-04-05 15:42:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pemasukan',
    54310,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari DANA',
    '2026-04-05 16:07:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pemasukan',
    6000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-04-05 16:37:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    84000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-04-05 15:43:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    2249727,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card',
    '2026-04-05 16:39:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-06'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Main billiard di ultima',
    '2026-04-15 21:07:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-07'::date,
    'pemasukan',
    211429,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pindahin kas grup b',
    '2026-04-15 21:08:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-07'::date,
    'pengeluaran',
    49000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli baso petir',
    '2026-04-15 21:09:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-07'::date,
    'pengeluaran',
    6066620,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: Bayar Tagihan honest',
    '2026-04-15 21:09:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-08'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli pecel ayam deket horizon',
    '2026-04-15 21:11:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-09'::date,
    'pengeluaran',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar biaya kontrol kucing(alex)',
    '2026-04-15 21:12:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi + kacang di warmindo horizon',
    '2026-04-15 21:14:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pengeluaran',
    36000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli janji jiwa',
    '2026-04-15 21:25:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pengeluaran',
    185000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ngombe',
    '2026-04-15 21:25:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli geprek horizon',
    '2026-04-15 21:13:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-04-15 21:19:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-13'::date,
    'pengeluaran',
    24599,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-04-15 21:26:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertalite',
    '2026-04-15 21:14:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: saldo gopay ayah',
    '2026-04-15 21:26:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-16'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-04-16 6:50:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'patungan makan makan, tf ke dana selvi',
    '2026-04-19 10:30:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up gopay ayah',
    '2026-04-29 9:16:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up gopay ayah',
    '2026-04-29 9:17:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Loan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'minjem teteh',
    '2026-04-18 8:24:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-18'::date,
    'pengeluaran',
    219218,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar statement  april',
    '2026-04-18 8:25:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-20'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tf ke gopay bewok, ngombe',
    '2026-04-28 10:48:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-20'::date,
    'pengeluaran',
    7200,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi jumpstart di horizon',
    '2026-04-28 10:49:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-21'::date,
    'pengeluaran',
    7200,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi jumpstart di horizon',
    '2026-04-28 10:54:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pengeluaran',
    949,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-04-29 9:14:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-28'::date,
    'pemasukan',
    4748,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-29 9:15:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    1578,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-29 9:22:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    279,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-29 9:22:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pengeluaran',
    56041,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-02 9:36:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-01'::date,
    'pemasukan',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-05-01 9:21:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    248062,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar tiktok Paylatter, beli tws',
    '2026-05-02 16:41:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ayah minta buat ganti oli(TF ke BCA)',
    '2026-05-02 9:38:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke bunda',
    '2026-05-02 12:38:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    1600000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-05-02 12:32:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-02 9:36:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-02 9:37:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    58280,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-02 9:37:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    3097300,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-05-02 12:35:37'::timestamptz
  );
  -- Batch 9/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    30462,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-02 16:32:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    38240,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-02 17:07:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-03'::date,
    'pengeluaran',
    90000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main Billard',
    '2026-05-05 11:30:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    55000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli brownies di elud',
    '2026-05-18 0:00:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    2000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'duit bunda , ke si teteh',
    '2026-05-05 11:27:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    50696,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli d''roasting 1 ekor ayam',
    '2026-05-17 23:59:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pemasukan',
    1800000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-05-05 11:04:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-05-05 11:28:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    125000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'service shock depan vario',
    '2026-05-17 23:57:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-07'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli api(ngombe)',
    '2026-05-18 0:01:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-07'::date,
    'pengeluaran',
    11000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'nambah nasi di bebek carok',
    '2026-05-18 0:00:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-08'::date,
    'pengeluaran',
    400000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-05-18 0:02:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-08'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pasang shock belakang',
    '2026-05-18 0:03:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-10'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'isi bensin di indomobil',
    '2026-05-18 0:04:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-10'::date,
    'pengeluaran',
    34000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngopi di warkop 78 sukaseuri',
    '2026-05-18 0:06:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-10'::date,
    'pengeluaran',
    84000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di be-on',
    '2026-05-18 0:05:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-10'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'nambah main bl di be-on',
    '2026-05-18 0:05:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-12'::date,
    'pengeluaran',
    18000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sayap 2pcs di lazato',
    '2026-05-18 0:06:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke va Horizon(salah transfer)',
    '2026-05-18 0:08:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    51196,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli d''roasting 1 ekor ayam(voucher tiktok)',
    '2026-05-18 0:08:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    57888,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-18 0:07:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-05-18 0:09:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-15'::date,
    'pengeluaran',
    84940,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-18 0:09:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan haikal(tf dana)',
    '2026-05-18 0:10:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pengeluaran',
    26000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telur 1kg',
    '2026-05-18 0:10:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-18 0:11:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-17'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cukur di omni baber cikampek',
    '2026-05-18 0:12:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-18'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi di warkop horizon',
    '2026-05-18 23:05:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke MANDIRI',
    '2026-05-20 8:37:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-22'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tf buat haikal, tuker cash',
    '2026-05-23 16:09:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pemasukan',
    152149,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari GOPAY',
    '2026-05-23 16:09:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    19212,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-23 16:08:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-05-23 16:09:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tf buat haikal, tuker cash',
    '2026-05-23 16:10:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    705,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-06-01 11:17:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pemasukan',
    3529,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-06-01 11:17:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazato dada',
    '2026-06-01 11:17:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    67000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon',
    '2026-06-01 12:20:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    48815,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda minta bayarin beli tisu',
    '2026-06-01 12:21:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pemasukan',
    15000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-06-01 8:27:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    2775285,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan mei',
    '2026-06-01 15:06:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    4208889,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-06-01 15:09:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    74487,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-06-01 17:07:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-02'::date,
    'pengeluaran',
    52912,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli droasting',
    '2026-06-02 8:00:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-03'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke rek bunda',
    '2026-06-03 14:27:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-03'::date,
    'pengeluaran',
    52912,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ayam droasting',
    '2026-06-03 14:27:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-03'::date,
    'pengeluaran',
    62814,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-03 14:25:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    59000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli cheesecuit',
    '2026-06-04 16:11:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli geprek horizon',
    '2026-06-05 4:22:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    26000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telor 1kg',
    '2026-06-05 4:21:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    31124,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-04 4:37:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    23249,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-04 9:48:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    3000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-06-04 15:39:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    114667,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cicilan ke-1, shock k factory',
    '2026-06-04 16:38:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    335000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ganti as shock depan, dan service shock depan',
    '2026-06-05 4:20:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-06'::date,
    'pengeluaran',
    12000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'social lab',
    '2026-06-29 4:29:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-06'::date,
    'pengeluaran',
    125000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ngombe',
    '2026-06-29 4:29:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-07'::date,
    'pengeluaran',
    134850,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-29 4:31:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-09'::date,
    'pengeluaran',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ngombe buat ke parang gombong',
    '2026-06-29 4:35:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-09'::date,
    'pengeluaran',
    79500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayarin cod bunda',
    '2026-06-29 4:34:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-10'::date,
    'pemasukan',
    100,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback',
    '2026-06-29 4:37:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-10'::date,
    'pengeluaran',
    104000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di be-on',
    '2026-06-29 4:37:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-10'::date,
    'pengeluaran',
    27410,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-29 4:35:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-10'::date,
    'pengeluaran',
    71000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-29 4:37:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-11'::date,
    'pengeluaran',
    1299000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan',
    '2026-06-29 4:54:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-13'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'transfer ke jago haikal',
    '2026-06-29 4:55:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-14'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up gopay ayah',
    '2026-06-29 4:56:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-14'::date,
    'pengeluaran',
    11640,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-06-29 4:57:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pemasukan',
    178,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 15:45:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pengeluaran',
    178700,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di spacepool',
    '2026-07-20 15:45:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pengeluaran',
    140129,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-29 5:08:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pengeluaran',
    49800,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK: beli life cat 800grx2',
    '2026-07-20 15:44:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-16'::date,
    'pemasukan',
    32,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 15:51:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-16'::date,
    'pengeluaran',
    32600,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopken',
    '2026-07-20 15:47:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-16'::date,
    'pengeluaran',
    32000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kue di pertigaan pucung buat bunda',
    '2026-07-20 15:50:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-16'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up gopay ayah',
    '2026-07-20 15:51:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-17'::date,
    'pemasukan',
    13,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 15:52:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-17'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazato',
    '2026-07-20 15:52:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up gopay bewok',
    '2026-07-20 16:05:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke kris horizon, dp camp di capolaga',
    '2026-07-20 16:07:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pemasukan',
    650000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO: yang beli convers 70 hi',
    '2026-07-20 15:53:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pengeluaran',
    58581,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK: beli kalung',
    '2026-07-20 16:04:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pengeluaran',
    650000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan honest',
    '2026-07-20 16:03:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-21'::date,
    'pemasukan',
    13,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 16:08:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-21'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazato',
    '2026-07-20 16:07:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-21'::date,
    'pengeluaran',
    25400,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK: beli saus delmonte 1kg',
    '2026-07-20 16:11:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-23'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up gopay ayah',
    '2026-07-20 16:12:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-24'::date,
    'pengeluaran',
    75000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf dana, ngombe',
    '2026-07-20 16:18:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-28'::date,
    'pengeluaran',
    1595,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-07-20 16:18:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-28'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf kris, lunasin camp capolaga,',
    '2026-07-20 16:20:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-28'::date,
    'pemasukan',
    7979,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'interest',
    '2026-07-20 16:19:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-29'::date,
    'pemasukan',
    11,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 16:21:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-29'::date,
    'pengeluaran',
    11000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli baso mas suhar',
    '2026-07-20 16:20:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    4,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 16:23:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    4500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli snack pimart yofi',
    '2026-07-20 16:23:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pemasukan',
    12000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-07-20 16:22:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-07-20 16:21:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    4222409,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-07-20 16:22:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    4649460,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan honest',
    '2026-07-20 16:23:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-04'::date,
    'pengeluaran',
    468757,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Spaylatter: bayar tagihan spaylatter',
    '2026-07-20 16:24:40'::timestamptz
  );
  -- Batch 10/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-05'::date,
    'pengeluaran',
    1400000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke bca bunda + ngasih ke anak teh elis sunatan',
    '2026-07-20 16:26:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-07'::date,
    'pemasukan',
    4,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 16:30:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-07'::date,
    'pengeluaran',
    4200,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli snack pimart yofi',
    '2026-07-20 16:30:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-07'::date,
    'pengeluaran',
    77000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-20 16:27:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-08'::date,
    'pengeluaran',
    20016,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-20 16:32:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-10'::date,
    'pengeluaran',
    35437,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-20 16:33:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-11'::date,
    'pemasukan',
    56,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 16:53:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-11'::date,
    'pengeluaran',
    56000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bakmi khas jaksel krajan',
    '2026-07-20 16:53:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-12'::date,
    'pemasukan',
    64,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 17:05:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-12'::date,
    'pengeluaran',
    64600,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli abg coffee',
    '2026-07-20 17:05:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-12'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-07-20 16:53:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-13'::date,
    'pengeluaran',
    37973,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-07-20 17:16:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pengeluaran',
    380000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-20 17:16:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-17'::date,
    'pemasukan',
    60,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 17:17:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-17'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cukur di omnibarber',
    '2026-07-20 17:17:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-19'::date,
    'pemasukan',
    44,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-20 17:23:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-19'::date,
    'pengeluaran',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'rimpang bar',
    '2026-07-20 17:21:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-19'::date,
    'pengeluaran',
    70000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-07-20 17:28:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-19'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'masuk district',
    '2026-07-20 17:29:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-22'::date,
    'pengeluaran',
    1,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pembulatan',
    '2026-07-22 5:48:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pemasukan',
    29,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-23 3:13:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    31445,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-23 12:55:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'langganan shopee vip',
    '2026-07-23 3:13:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pemasukan',
    28,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-25 14:20:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pemasukan',
    20,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-25 14:21:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'kuota haikal',
    '2026-07-25 14:20:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    28000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli mie ayam baso telor mas aji',
    '2026-07-24 21:25:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-25'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'isi pulsa telkomsel',
    '2026-07-25 14:53:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-25'::date,
    'pengeluaran',
    45820,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-07-25 14:21:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-26'::date,
    'pemasukan',
    52,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-27 0:35:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-26'::date,
    'pengeluaran',
    52000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telur 2kg',
    '2026-07-27 0:35:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    782,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-07-28 19:15:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    3912,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'interest',
    '2026-07-28 19:15:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    12500000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-07-28 19:13:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    810582,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan',
    '2026-07-28 19:20:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: bunda tuker cash',
    '2026-07-28 19:24:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    3007095,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-07-28 19:31:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    110440,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-28 20:07:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pemasukan',
    27,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-07-31 14:10:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pengeluaran',
    27000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli angkringan',
    '2026-07-30 20:45:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pengeluaran',
    34605,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-30 1:12:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    35970,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-31 3:09:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    40792,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-07-31 5:49:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-07-31 14:08:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    33500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-31 15:08:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf bulanan bunda',
    '2026-08-02 10:39:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SAMPOERNA',
    '2026-08-02 9:25:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    128700,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ulang reg gas w800',
    '2026-08-03 12:45:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pemasukan',
    128,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-03 12:47:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pemasukan',
    74,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-09 3:52:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    74000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'mail bl di be-on',
    '2026-08-04 1:32:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pemasukan',
    132426,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SEABANK',
    '2026-08-03 12:44:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    114250,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-03 4:10:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    44450,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-03 7:27:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-03 12:41:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    148166,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar tagihan shorbreker motor',
    '2026-08-03 5:22:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-04'::date,
    'pengeluaran',
    495000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-04 1:32:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-06'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: ayah tuker cash ke saldo gojek',
    '2026-08-06 12:01:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-06'::date,
    'pengeluaran',
    46000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-08-09 3:52:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-09'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: ayah tuker saldo gopay',
    '2026-08-09 17:47:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-09'::date,
    'pengeluaran',
    43800,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-09 18:09:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pengeluaran',
    50609,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-10 2:30:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pengeluaran',
    26460,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-12 11:14:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-11'::date,
    'pengeluaran',
    249049,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'biaya ke igd, sakit dispepsia',
    '2026-08-12 11:17:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-11'::date,
    'pemasukan',
    249,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-12 11:17:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-12'::date,
    'pengeluaran',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-12 11:17:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-13'::date,
    'pemasukan',
    48,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-17 5:05:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-13'::date,
    'pengeluaran',
    48000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telor 2kg',
    '2026-08-13 9:53:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pemasukan',
    100,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-17 4:58:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pemasukan',
    26,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-17 5:02:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pemasukan',
    3,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-17 5:03:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    110000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kolesom',
    '2026-08-17 4:58:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan di sagara',
    '2026-08-17 4:59:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    60000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan di sagara',
    '2026-08-17 4:59:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    3499,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli air mineral di pimart yofi',
    '2026-08-17 5:03:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    66000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gacoan',
    '2026-08-17 5:02:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    26000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazatto dada 2pcs',
    '2026-08-17 5:02:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-17 4:59:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    10,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-18 12:31:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pengeluaran',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan cheese roll di the round',
    '2026-08-18 12:30:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pengeluaran',
    95700,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-08-17 5:09:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-18'::date,
    'pengeluaran',
    17654,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-08-18 14:48:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pemasukan',
    3000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-08-27 4:59:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pengeluaran',
    1958609,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan honest',
    '2026-08-27 5:01:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-23'::date,
    'pemasukan',
    38,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-27 6:08:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-23'::date,
    'pemasukan',
    35,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-27 6:09:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-23'::date,
    'pengeluaran',
    38000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli intisari blacurrant',
    '2026-08-27 6:07:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-23'::date,
    'pengeluaran',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli di the round',
    '2026-08-27 6:08:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-24'::date,
    'pemasukan',
    36,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-27 6:12:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-24'::date,
    'pengeluaran',
    550000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'open table districk',
    '2026-08-27 6:09:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-24'::date,
    'pengeluaran',
    36000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazatto',
    '2026-08-27 6:12:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-25'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SAMPOERNA',
    '2026-08-27 6:45:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-26'::date,
    'pemasukan',
    52,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-27 6:46:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-26'::date,
    'pengeluaran',
    52000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli telur 2kg',
    '2026-08-27 6:46:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pengeluaran',
    1596,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-08-29 5:05:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pengeluaran',
    110000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke luis, bayar di abg coffee',
    '2026-08-29 5:04:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pemasukan',
    7984,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'interest krom bank',
    '2026-08-29 5:05:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pengeluaran',
    42900,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-08-28 2:32:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pemasukan',
    49,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-31 13:03:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pemasukan',
    26,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-31 13:04:33'::timestamptz
  );
  -- Batch 11/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pemasukan',
    36,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-31 13:05:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pemasukan',
    19,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-31 13:06:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pengeluaran',
    36000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli fore',
    '2026-08-31 13:05:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pengeluaran',
    19200,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'nalangin fanny kopi',
    '2026-08-31 13:06:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pengeluaran',
    49000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli baso mas aji sama nalangin fanny',
    '2026-08-31 13:02:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pengeluaran',
    26100,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO: refund tiktok voucher',
    '2026-08-31 13:04:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pemasukan',
    230,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-08-31 13:07:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pengeluaran',
    230250,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl',
    '2026-08-31 13:07:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SAMPOERNA',
    '2026-08-31 13:31:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    13,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-01 13:41:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli makan geprek di horizon',
    '2026-09-01 13:40:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    13000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-09-01 13:50:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    1412500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar kuliah cicilan ke-1 sem3',
    '2026-09-01 13:57:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    2600000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card',
    '2026-09-01 13:59:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    2980906,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-09-01 14:20:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke bunda',
    '2026-09-01 14:23:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    117296,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spaylatter',
    '2026-09-01 14:26:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    4000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up rdn',
    '2026-09-01 14:34:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-03'::date,
    'pengeluaran',
    25500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Laundry' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli timer mesin cuci di shopee',
    '2026-09-03 5:31:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-03'::date,
    'pengeluaran',
    23498,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli binder b5',
    '2026-09-03 5:32:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-03'::date,
    'pengeluaran',
    34710,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gantungan tas',
    '2026-09-03 5:32:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-03'::date,
    'pengeluaran',
    18258,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gantungan jiwoo',
    '2026-09-03 5:33:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-03'::date,
    'pengeluaran',
    81500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pocket watch swatch x ap kw',
    '2026-09-03 5:33:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-05'::date,
    'pengeluaran',
    52000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli di  warkop pancong',
    '2026-09-20 10:07:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-05'::date,
    'pemasukan',
    52,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-20 10:07:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-06'::date,
    'pengeluaran',
    46060,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ayam droasting',
    '2026-09-20 10:09:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-06'::date,
    'pemasukan',
    46,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-20 10:09:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-06'::date,
    'pengeluaran',
    73500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-09-20 10:10:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli geprek kantin horizon',
    '2026-09-20 10:12:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pemasukan',
    13,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-20 10:13:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pengeluaran',
    27000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopken',
    '2026-09-20 10:13:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pemasukan',
    27,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-20 10:14:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pengeluaran',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-09-26 10:10:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli batagor ciampel',
    '2026-09-26 10:14:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pemasukan',
    6,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-26 10:18:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-09'::date,
    'pengeluaran',
    385000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli beras(tf ke bca bunda)',
    '2026-09-26 10:19:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-10'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli nasgor depan horizon (via dana)',
    '2026-09-26 10:21:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-17'::date,
    'pengeluaran',
    4000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli golda coffe',
    '2026-09-26 10:28:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-17'::date,
    'pemasukan',
    4,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-28 2:01:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-09-20 9:58:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazatto',
    '2026-09-28 2:02:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pemasukan',
    13,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-28 2:02:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SAMPOERNA',
    '2026-09-28 4:36:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-22'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke gopay bewok(ngombe)',
    '2026-09-28 2:04:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-25'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazatto',
    '2026-09-28 4:32:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-25'::date,
    'pemasukan',
    13,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-09-28 4:32:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    239,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tax',
    '2026-09-28 4:33:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pemasukan',
    1194,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-09-28 4:33:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-29'::date,
    'pemasukan',
    11000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-10-03 3:35:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-29'::date,
    'pengeluaran',
    3000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Nabung/Invest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up stockbit',
    '2026-10-03 4:01:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-30'::date,
    'pengeluaran',
    93000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar kredivo , beli pulsa',
    '2026-10-03 4:05:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-01'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli geprek horizon',
    '2026-10-03 4:05:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-01'::date,
    'pemasukan',
    13,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'cashback qris',
    '2026-10-03 4:06:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari MANDIRI',
    '2026-10-03 3:38:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    15490,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-10-03 4:10:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    77482,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke GOPAY',
    '2026-10-03 4:11:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    1994869,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Honest Card: bayar tagihan honest',
    '2026-10-03 4:13:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    3007085,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-10-03 4:13:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    29320,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-10-03 4:13:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf ke bca bunda',
    '2026-10-03 4:15:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    1412500,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar kuliah',
    '2026-10-03 4:15:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-05'::date,
    'pengeluaran',
    241981,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar spaylatter',
    '2026-10-08 17:18:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-06'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'KROM' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SAMPOERNA',
    '2026-10-08 17:19:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-25'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Bensin Pertamax',
    '2025-12-25 16:49:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-25'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tarik Tunai',
    '2025-12-25 16:50:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pemasukan',
    8026629,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji Desember 2025 Yofi',
    '2025-12-28 19:00:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sync',
    '2025-12-28 19:02:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pengeluaran',
    24700,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Laundry' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Bayclin(pemutih)',
    '2025-12-28 12:13:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pengeluaran',
    18000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Lazatto',
    '2025-12-28 12:13:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    2361,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Admin Flip',
    '2025-12-29 10:37:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    2350,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Admin Flip',
    '2025-12-29 18:08:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pemasukan',
    6152544,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Wd Tokocryprto',
    '2025-12-29 10:28:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    10000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2025-12-29 10:31:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-29'::date,
    'pengeluaran',
    4400000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2025-12-29 18:07:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-01'::date,
    'pengeluaran',
    25000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli Point Coffee',
    '2026-01-01 1:20:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin rekening',
    '2026-01-02 12:12:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'salah transfer 100rb, nnti potong iuran bulan depan',
    '2026-01-02 12:09:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-01-02 12:08:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-01-02 12:08:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-02'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-01-02 12:08:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-15'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin rekening',
    '2026-01-15 13:04:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-16'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-01-17 12:53:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-16'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik Tunai',
    '2026-01-16 7:53:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    2326,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Admin Flip',
    '2026-01-29 7:38:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    1628493,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Shoopeepaylatter',
    '2026-01-29 0:50:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    682311,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bayar Paylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tagihan Honest Card',
    '2026-01-29 0:53:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    13337021,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji Yofi Januari 2026',
    '2026-01-29 0:38:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tagihan 1 (Semester 2)',
    '2026-01-29 0:45:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    9500000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-01-29 7:38:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-31'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin',
    '2026-02-08 8:32:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-31'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-01-31 14:06:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    1337500,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-02-06 6:27:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pemasukan',
    1500000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-02-06 6:26:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin',
    '2026-02-14 13:22:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-02-14 13:05:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pengeluaran',
    345,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-02-20 5:19:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pengeluaran',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-02-20 5:18:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-25'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: Tarik Tunai',
    '2026-02-26 10:14:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    400,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-02-28 13:09:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    7006865,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji bulan February 2026',
    '2026-02-28 13:05:22'::timestamptz
  );
  -- Batch 12/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'selisih',
    '2026-02-28 13:05:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    1437500,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Bayar kuliah',
    '2026-02-28 13:07:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-28'::date,
    'pengeluaran',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-02-28 13:09:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin',
    '2026-03-01 12:24:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-03-01 12:24:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-05'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-03-08 17:45:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pengeluaran',
    354,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-03-11 19:44:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pemasukan',
    6099788,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'THR YOFI 2026',
    '2026-03-11 17:50:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pengeluaran',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-03-11 19:44:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    431,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-03-12 10:21:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-03-12 10:20:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin',
    '2026-03-23 20:49:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-03-13 21:14:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-21'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Keluarga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayarin e-toll teteh',
    '2026-03-23 20:49:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pemasukan',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-23 20:51:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-23'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-03-23 21:38:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-28'::date,
    'pemasukan',
    7175342,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji Yofi Maret 2026',
    '2026-03-29 20:49:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pengeluaran',
    349,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-03-29 20:50:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pengeluaran',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-03-29 20:49:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    343,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-03-30 10:39:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-30'::date,
    'pengeluaran',
    2000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-03-30 10:38:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-31'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin',
    '2026-04-05 15:52:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Biaya ganti kartu atm',
    '2026-04-15 21:04:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-11'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: Tarik Tunai',
    '2026-04-15 21:05:05'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-15 21:06:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-20'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gorengan, bayar ke dimas yofi',
    '2026-04-29 10:56:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    8290153,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji Yofi Mei 2026',
    '2026-04-29 10:57:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pengeluaran',
    185000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di be-on cikampek',
    '2026-05-02 9:41:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-01'::date,
    'pengeluaran',
    596,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-05-01 9:22:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-01'::date,
    'pengeluaran',
    5000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-05-01 9:21:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'biaya admin rekening',
    '2026-05-02 9:42:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    327,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-05-02 12:32:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    5000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin bayar ke horizon',
    '2026-05-02 12:41:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    1800000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gift' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bunda nitip',
    '2026-05-05 11:03:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    1437500,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-05-02 12:30:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    1600000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-05-02 12:32:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    347,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-05-05 11:04:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin kartu',
    '2026-05-18 4:36:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    1800000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-05-05 11:04:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-05-05 11:05:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-11'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-05-18 4:36:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-18 0:09:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-05-18 4:37:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-20 8:37:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-19'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-05-20 8:38:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    6500,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin tf',
    '2026-06-01 6:13:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    17900,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli air mineral + kopi bean alfmart',
    '2026-06-01 6:11:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pemasukan',
    19756700,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji Yofi bulan Mei 2026 + Bonus',
    '2026-06-01 6:10:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-06-01 6:11:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-28'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-06-01 6:11:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Bensin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pertamax',
    '2026-06-01 6:13:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    26000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi lawson di dufan',
    '2026-06-01 8:18:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    8000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli air mineral di dufan',
    '2026-06-01 8:20:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi item di kopte dufan',
    '2026-06-01 8:21:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    2525000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'sing song',
    '2026-06-01 6:12:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    90000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli topi di dufan',
    '2026-06-01 8:18:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pemasukan',
    500000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'fanny balikin sing song',
    '2026-06-01 8:19:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    86000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli yellow dock di dufan',
    '2026-06-01 8:17:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli burger bangor di dufan',
    '2026-06-01 8:20:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    55000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gacoan johar',
    '2026-06-01 8:21:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-06-01 6:13:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-31'::date,
    'pengeluaran',
    5999,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin rekening',
    '2026-06-01 8:22:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    2326,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-06-01 8:27:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'donate bonus yofi ke serikat',
    '2026-06-01 8:22:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    15000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-06-01 8:27:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-05'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin',
    '2026-06-13 8:36:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-06'::date,
    'pemasukan',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari CASH: fanny tuker cash',
    '2026-06-07 17:09:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-09'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar patungan ke parang gombong',
    '2026-06-13 8:36:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-09'::date,
    'pengeluaran',
    70000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'patungan mansion (tf  ke fanny)',
    '2026-06-13 8:37:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-12'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-06-13 8:38:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-17'::date,
    'pemasukan',
    1299000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund convers',
    '2026-06-29 4:25:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-23'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-06-29 4:25:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-27'::date,
    'pengeluaran',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-06-29 4:25:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-28'::date,
    'pemasukan',
    11431324,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji Yofi Juni 2026',
    '2026-06-29 4:26:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-29'::date,
    'pengeluaran',
    58000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di dadpool',
    '2026-07-22 4:59:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-30'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin rekening',
    '2026-07-22 5:02:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-30'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli beans coffe',
    '2026-07-22 5:00:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-30'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan di warmindo the round',
    '2026-07-22 5:02:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-30'::date,
    'pengeluaran',
    155000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-07-22 5:01:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-30'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-07-22 4:59:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-01'::date,
    'pengeluaran',
    1000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'biaya va',
    '2026-07-22 5:06:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-01'::date,
    'pengeluaran',
    81000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di karawang billiard club, kertabumi',
    '2026-07-22 5:04:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-01'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf dari fanny',
    '2026-07-22 5:03:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-01'::date,
    'pengeluaran',
    87100,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli 2 galon + obat antasida',
    '2026-07-22 5:06:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    325,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-07-22 5:07:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-02'::date,
    'pengeluaran',
    12000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-07-20 16:22:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-05'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin kartu debit',
    '2026-07-22 5:07:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-07'::date,
    'pengeluaran',
    1000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kuliah' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'daftar ulang horizon',
    '2026-07-22 5:09:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-08'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-07-22 5:13:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-20'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-07-22 5:13:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-07-23 6:13:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-24'::date,
    'pengeluaran',
    140000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngombe',
    '2026-07-25 14:24:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    328,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-07-28 19:14:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    13349415,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'gaji Yofi Juli 2026',
    '2026-07-28 18:30:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pembulatan',
    '2026-07-28 19:14:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'fanny tf 100',
    '2026-07-28 19:08:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    12500000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-07-28 19:13:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin rekening',
    '2026-08-03 4:14:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-05'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin kartu',
    '2026-08-09 3:48:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-06'::date,
    'pengeluaran',
    68600,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beliin eva kiranti +coklat',
    '2026-08-09 3:49:29'::timestamptz
  );
  -- Batch 13/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-07'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-08-09 3:50:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-11'::date,
    'pengeluaran',
    30500,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kesehatan/Healthcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli polysilane cair100ml',
    '2026-08-12 11:31:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pengeluaran',
    145000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli api + mcdonald whisky',
    '2026-08-18 12:36:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    3262941,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bonus pertengahan tahun 2026',
    '2026-08-18 12:34:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'andi bayar',
    '2026-08-18 12:35:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    70000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tugi bayar',
    '2026-08-18 12:35:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    67000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'luis bayar',
    '2026-08-18 12:36:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'balikan fanny',
    '2026-08-18 12:36:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pengeluaran',
    406500,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Lain-lain' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'total bocah grup b jajan di abg coffee',
    '2026-08-18 12:35:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pengeluaran',
    357,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-08-27 5:00:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-20'::date,
    'pengeluaran',
    3000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-08-27 4:59:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-24'::date,
    'pemasukan',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf eko',
    '2026-08-27 5:00:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-25'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-08-27 5:01:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-27'::date,
    'pengeluaran',
    12500,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kapal api super',
    '2026-08-28 2:29:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pemasukan',
    10673626,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'gaji yofi agustus 2026',
    '2026-08-29 5:09:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-28'::date,
    'pemasukan',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'kembalian fanny',
    '2026-08-29 5:09:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pengeluaran',
    500000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ngasih ke teh rini buat muludan',
    '2026-08-29 11:53:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-29'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-08-29 5:10:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pengeluaran',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lazatto',
    '2026-08-31 13:01:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-31'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin rekening',
    '2026-09-01 13:43:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-31'::date,
    'pemasukan',
    2600000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gift' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'hasil penjualan bigme b6',
    '2026-09-01 13:42:38'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    2325,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-09-01 13:50:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    19000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopken kenangan',
    '2026-09-01 13:44:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pemasukan',
    120000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'fanny bayar makan mie ayam mas aji + main bl',
    '2026-09-01 13:43:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-01'::date,
    'pengeluaran',
    13000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-09-01 13:50:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-02'::date,
    'pengeluaran',
    13000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli geprek kantin horizon',
    '2026-09-03 5:29:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-02'::date,
    'pengeluaran',
    25600,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kopi fore',
    '2026-09-03 5:30:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-04'::date,
    'pengeluaran',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli di lawson surcip',
    '2026-09-20 9:49:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-04'::date,
    'pemasukan',
    43000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'balikan fanny nitip beli lawson',
    '2026-09-20 9:49:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-05'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin kartu debit',
    '2026-09-20 9:50:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-05'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bayar gocar si dilla',
    '2026-09-20 9:51:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pengeluaran',
    51620,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli aza20',
    '2026-09-20 9:53:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pengeluaran',
    317000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'main bl di hanggar ruang vip(dibagi be-40',
    '2026-09-20 9:54:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pengeluaran',
    1200,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin gopay',
    '2026-09-20 9:54:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pengeluaran',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Donate' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'top up gopay bewok',
    '2026-09-20 9:55:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pemasukan',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf chian(patungan bl)',
    '2026-09-20 9:56:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pemasukan',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf fanny(patungan bl)',
    '2026-09-20 9:56:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-11'::date,
    'pengeluaran',
    70000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ganti oli di bengkel',
    '2026-09-20 9:56:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-12'::date,
    'pemasukan',
    85000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'tf fadhil(patungan bl)',
    '2026-09-20 9:57:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-12'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-09-20 9:57:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-09-20 9:57:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pengeluaran',
    405,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-09-20 9:58:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-22'::date,
    'pengeluaran',
    14000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan di walahar',
    '2026-09-28 4:48:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-22'::date,
    'pengeluaran',
    29000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'jajan di walahar',
    '2026-09-28 4:50:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pemasukan',
    11854634,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Gaji' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Gaji Yofi September 2026',
    '2026-10-03 3:30:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-10-03 3:30:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-29'::date,
    'pengeluaran',
    14000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli caramel machiato, gold coffe indomaret',
    '2026-10-03 3:34:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-29'::date,
    'pengeluaran',
    11000000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-10-03 3:35:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-29'::date,
    'pengeluaran',
    2350,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-10-03 3:36:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-30'::date,
    'pengeluaran',
    29600,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makan' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli ayam yummy choice, + americano gold coffe indomaret',
    '2026-10-03 3:36:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-30'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin rekening',
    '2026-10-03 3:37:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-01'::date,
    'pengeluaran',
    15000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli americano beans coffee alfamart',
    '2026-10-03 3:37:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-10-03 3:38:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    436,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin flip',
    '2026-10-03 3:38:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-05'::date,
    'pengeluaran',
    6000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Admin' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'admin kartu debit',
    '2026-10-08 17:14:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-05'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai di bic',
    '2026-10-08 17:15:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-07'::date,
    'pengeluaran',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gorengan + gooday di kantin horizon',
    '2026-10-08 17:16:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pengeluaran',
    12000,
    (SELECT id FROM public.accounts WHERE name = 'MANDIRI' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli americano di coffee gold indomaret',
    '2026-10-08 17:17:12'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-20'::date,
    'pemasukan',
    250000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-02-20 5:17:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pemasukan',
    25000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'promo new user 25rb',
    '2026-03-11 17:52:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pemasukan',
    61,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'interest',
    '2026-03-11 17:52:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pemasukan',
    227,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-05 15:54:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-20'::date,
    'pengeluaran',
    200000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-04-29 12:03:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-30'::date,
    'pemasukan',
    166,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-05-18 4:07:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-26'::date,
    'pengeluaran',
    30000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'ganti kartu atm',
    '2026-05-26 0:13:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-31'::date,
    'pemasukan',
    58,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-06-01 12:30:16'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-25'::date,
    'pemasukan',
    38,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-25 14:58:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pemasukan',
    38,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-09-28 4:56:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-02 9:25:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-02'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-08-02 9:26:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-25'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-27 6:45:59'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pemasukan',
    80000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-31 13:31:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-30'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai',
    '2026-09-01 13:46:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-31'::date,
    'pemasukan',
    38,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-09-28 4:55:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-07'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-09-28 4:53:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-09-28 4:36:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-19'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH',
    '2026-09-28 4:52:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-06'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-10-08 17:19:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-06'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SAMPOERNA' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke CASH: tarik tunai di atm bni tuparev',
    '2026-10-08 17:20:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    19990,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli saus delmonte 1kg',
    '2026-02-06 6:33:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pemasukan',
    3,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-02-06 6:34:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pemasukan',
    20123,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SHOPEEPAY',
    '2026-02-06 6:33:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pemasukan',
    44000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-02-10 21:06:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    44691,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli deodorant di shopee',
    '2026-02-10 21:07:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '1',
    '2026-02-14 13:23:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pemasukan',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-02-14 13:15:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-14'::date,
    'pengeluaran',
    34136,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli folower tiktok di shopee',
    '2026-02-14 13:16:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pemasukan',
    4,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-04 21:34:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-04'::date,
    'pengeluaran',
    3500,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli capcut di shopee',
    '2026-03-04 21:33:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-10'::date,
    'pengeluaran',
    266195,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli parfum mykonos satin blanc',
    '2026-03-12 18:42:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-11'::date,
    'pemasukan',
    2,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-11 18:04:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-12'::date,
    'pemasukan',
    300000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-12 10:20:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-13'::date,
    'pengeluaran',
    12600,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli puff bedak',
    '2026-03-23 23:35:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pemasukan',
    2,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-23 23:35:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pemasukan',
    20000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-23 23:38:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-14'::date,
    'pengeluaran',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli decant 4 parfum mykonos',
    '2026-03-23 23:39:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-17'::date,
    'pemasukan',
    4,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-23 23:40:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-26'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-27 17:51:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pemasukan',
    2,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-03-27 17:53:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pemasukan',
    72000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-27 17:51:52'::timestamptz
  );
  -- Batch 14/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pemasukan',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-29 20:54:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    79251,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli vitamin (maxzing + b6)',
    '2026-03-27 17:53:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    5600,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli akun canva',
    '2026-03-27 17:52:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-27'::date,
    'pengeluaran',
    36000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli akun alldebrid',
    '2026-03-29 20:54:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-28'::date,
    'pengeluaran',
    15400,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sarung tangan billiard',
    '2026-03-29 20:58:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pemasukan',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-29 20:55:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pemasukan',
    150000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-03-29 20:58:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-05'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-05 15:55:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-12'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-15 22:49:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-13'::date,
    'pengeluaran',
    35400,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kabel essager',
    '2026-04-15 22:50:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-13'::date,
    'pemasukan',
    35400,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SHOPEEPAY',
    '2026-04-15 22:48:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pengeluaran',
    149040,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SHOPEEPAY',
    '2026-04-15 22:46:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    2,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-04-29 12:04:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-29'::date,
    'pemasukan',
    56041,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-02 9:36:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-01'::date,
    'pengeluaran',
    58839,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli jersey',
    '2026-05-18 4:03:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-01'::date,
    'pengeluaran',
    14512,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli botol sabun + tumbler',
    '2026-05-02 9:44:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    34950,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli permen kopi',
    '2026-05-02 16:32:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    38240,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli permen kopi',
    '2026-05-02 17:07:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pengeluaran',
    58280,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli jersey vintage',
    '2026-05-02 9:44:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-02 9:36:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-02 9:37:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    58280,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-02 9:37:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    30462,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-02 16:32:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-02'::date,
    'pemasukan',
    38240,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-02 17:07:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    43100,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Makanan Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli saus delmonte 1kg + indofood 1kg',
    '2026-05-18 0:36:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pemasukan',
    58839,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke Shopeepay',
    '2026-05-05 11:34:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    9000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli puff',
    '2026-05-18 0:37:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pemasukan',
    57888,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-18 0:07:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    64631,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli nivea lip balm + ice pack gel 2pcs',
    '2026-05-18 0:16:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-15'::date,
    'pemasukan',
    84940,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-18 0:09:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-15'::date,
    'pengeluaran',
    81940,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli parfum di sk parfum(monroe+rebel)',
    '2026-05-18 0:17:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-05-18 0:17:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-18 0:11:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-16'::date,
    'pengeluaran',
    4517,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli capcut',
    '2026-05-18 0:18:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-18'::date,
    'pemasukan',
    5,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-05-18 4:03:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-20'::date,
    'pemasukan',
    19212,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-23 16:08:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-20'::date,
    'pengeluaran',
    26698,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli bedak marcks 2pcsx40g',
    '2026-05-23 16:11:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-29'::date,
    'pemasukan',
    2,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-06-01 12:30:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-03'::date,
    'pemasukan',
    62814,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-03 14:25:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-03'::date,
    'pengeluaran',
    63815,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Service Motor' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli filter vario',
    '2026-06-03 14:26:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    23249,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli colokan saklar + kardus sepatu',
    '2026-06-04 9:49:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pemasukan',
    31124,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-04 4:37:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pemasukan',
    23249,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-04 9:48:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-04'::date,
    'pengeluaran',
    31124,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli you acne spot',
    '2026-06-04 4:38:37'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-07'::date,
    'pengeluaran',
    134850,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kaos boxy 3pcs',
    '2026-06-29 4:31:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-07'::date,
    'pemasukan',
    134850,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-29 4:31:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-10'::date,
    'pengeluaran',
    27410,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tempered glass poco x8 pro max',
    '2026-06-29 4:36:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-10'::date,
    'pemasukan',
    27410,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-29 4:35:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-10'::date,
    'pemasukan',
    71000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-29 4:37:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-13'::date,
    'pengeluaran',
    67500,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Internet Package' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli case poco x8 pro max',
    '2026-06-29 4:52:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-14'::date,
    'pengeluaran',
    15640,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lanyard hp+ pembersih suede',
    '2026-06-29 5:05:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-14'::date,
    'pemasukan',
    12140,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SHOPEEPAY',
    '2026-06-29 5:02:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pengeluaran',
    140129,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli makan kucing mrvet',
    '2026-06-29 5:08:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pengeluaran',
    49800,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli life cat 800grx2',
    '2026-07-20 15:44:52'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pemasukan',
    140129,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-29 5:08:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-15'::date,
    'pemasukan',
    49800,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: beli life cat 800grx2',
    '2026-07-20 15:44:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pengeluaran',
    58581,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kalung',
    '2026-07-20 16:04:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-18'::date,
    'pemasukan',
    58581,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: beli kalung',
    '2026-07-20 16:04:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-21'::date,
    'pengeluaran',
    25400,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli saus delmonte 1kg',
    '2026-07-20 16:12:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-21'::date,
    'pemasukan',
    25400,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: beli saus delmonte 1kg',
    '2026-07-20 16:11:30'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-07'::date,
    'pemasukan',
    5,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'penyesuaian',
    '2026-07-23 3:01:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-07'::date,
    'pemasukan',
    77000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 16:27:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-07'::date,
    'pengeluaran',
    77000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli maxzing',
    '2026-07-20 16:28:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-08'::date,
    'pengeluaran',
    20016,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Coffee/Snack' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli permen kopi maricafe',
    '2026-07-20 16:32:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-08'::date,
    'pemasukan',
    20016,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 16:32:27'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-10'::date,
    'pengeluaran',
    35442,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tumbler',
    '2026-07-20 16:52:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-10'::date,
    'pemasukan',
    35437,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 16:33:29'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-12'::date,
    'pengeluaran',
    45255,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kabel data haikal(onprime xiaomi)',
    '2026-07-23 3:03:07'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-12'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SHOPEEPAY',
    '2026-07-20 16:54:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-13'::date,
    'pemasukan',
    4,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-23 3:03:39'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-14'::date,
    'pemasukan',
    3,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-23 3:03:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-14'::date,
    'pengeluaran',
    52666,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli life cat 800grx2pcs',
    '2026-07-23 3:04:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-15'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-23 3:04:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pengeluaran',
    2877586,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli e-reader bigme b6',
    '2026-07-23 3:05:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pemasukan',
    380000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 17:16:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-16'::date,
    'pemasukan',
    2500003,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari JAGO',
    '2026-07-22 11:16:24'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-19'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-07-23 3:05:31'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pemasukan',
    31445,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-23 12:55:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-23'::date,
    'pengeluaran',
    35950,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli masker 50pcsx5',
    '2026-07-24 2:34:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pemasukan',
    110440,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-28 20:07:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-28'::date,
    'pengeluaran',
    110440,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli micelar nivea 400mlx3pcs',
    '2026-07-28 20:25:08'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pemasukan',
    34605,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-30 1:13:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-30'::date,
    'pengeluaran',
    34605,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli deodorant nivea 50mlx3pcs',
    '2026-07-30 1:14:46'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    35970,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tempat lampu baca + lampu sorot',
    '2026-07-31 3:09:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pemasukan',
    35970,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-31 3:09:23'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pemasukan',
    33500,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-31 15:08:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-31'::date,
    'pengeluaran',
    33500,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kardus bekas',
    '2026-07-31 15:25:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pemasukan',
    122426,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund',
    '2026-08-03 12:43:44'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    158700,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli regular wingas w111+selang',
    '2026-08-03 4:13:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pemasukan',
    114250,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-03 4:10:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pemasukan',
    44450,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-03 7:27:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-03 12:41:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-03'::date,
    'pengeluaran',
    132426,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke KROM',
    '2026-08-03 12:44:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-04'::date,
    'pengeluaran',
    495000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kompor rinnai  ri 602bgx',
    '2026-08-09 3:57:42'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-04'::date,
    'pemasukan',
    495000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-04 1:32:40'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-09'::date,
    'pengeluaran',
    43800,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli saos delmonte 2kg',
    '2026-08-09 18:09:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-09'::date,
    'pemasukan',
    43800,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-09 18:09:21'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pengeluaran',
    27000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kesehatan/Healthcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli vit c 100mg 100tablet x 2pcs',
    '2026-08-12 11:16:20'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pemasukan',
    50609,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-10 2:30:06'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pemasukan',
    26460,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-12 11:14:55'::timestamptz
  );
  -- Batch 15/15
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-10'::date,
    'pengeluaran',
    50069,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli hair tonic putri',
    '2026-08-10 2:30:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-12'::date,
    'pemasukan',
    35000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-12 11:18:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-12'::date,
    'pengeluaran',
    34476,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kapas wajah',
    '2026-08-12 11:19:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-17 4:59:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-15'::date,
    'pengeluaran',
    6100,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli canva sharing',
    '2026-08-17 5:00:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-17'::date,
    'pemasukan',
    1,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    '',
    '2026-08-17 5:00:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-18'::date,
    'pengeluaran',
    22079,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli gelas',
    '2026-08-18 14:49:25'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-08-18'::date,
    'pemasukan',
    17654,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-08-18 14:48:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-06'::date,
    'pemasukan',
    73500,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-09-20 10:10:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-06'::date,
    'pengeluaran',
    73500,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Laundry' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli timer mesin cuci',
    '2026-09-20 10:11:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pemasukan',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-09-26 10:10:02'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-08'::date,
    'pengeluaran',
    16000,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli canva 1 tahun',
    '2026-09-26 10:13:11'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    15490,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-10-03 4:10:58'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    29320,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-10-03 4:14:00'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    29320,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'bikin case 3dprint cuktech 15 air',
    '2026-10-03 4:14:28'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    15490,
    (SELECT id FROM public.accounts WHERE name = 'SEABANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pouch',
    '2026-10-03 4:11:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-23'::date,
    'pemasukan',
    40000,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-01-29 0:36:03'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pemasukan',
    100,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Cashback' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'selisih refund powerbank dari Kredivo',
    '2026-01-29 0:43:33'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-29'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Shopee VIP',
    '2026-01-29 0:40:34'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-02'::date,
    'pemasukan',
    24000,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-02-02 8:58:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pemasukan',
    19000,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-02-06 6:32:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    20123,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-02-06 6:33:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-06'::date,
    'pengeluaran',
    39020,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Beli moisturiser facetology',
    '2026-02-06 6:36:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-29'::date,
    'pengeluaran',
    112099,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli pasir tofu 7lx3pcs',
    '2026-04-15 22:46:54'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-31'::date,
    'pengeluaran',
    26140,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Toiletries' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli keran + alas kucing',
    '2026-04-15 22:48:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-13'::date,
    'pemasukan',
    24599,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-04-15 21:26:43'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-13'::date,
    'pengeluaran',
    35400,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-04-15 22:48:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-04-15'::date,
    'pemasukan',
    149040,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari SEABANK',
    '2026-04-15 22:46:04'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pemasukan',
    58839,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Refund',
    '2026-05-05 11:34:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-05'::date,
    'pengeluaran',
    58839,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-05-05 11:34:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pemasukan',
    26948,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Refund',
    '2026-05-06 11:34:35'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-14'::date,
    'pengeluaran',
    23735,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli lip balm nivea',
    '2026-05-18 4:15:10'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pemasukan',
    10000,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-05-23 16:10:01'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-05-23'::date,
    'pengeluaran',
    6100,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli canva',
    '2026-05-23 16:12:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pengeluaran',
    81100,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli tempered glass hp + aq230',
    '2026-06-01 17:09:45'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-01'::date,
    'pemasukan',
    74487,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-01 17:07:50'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-14'::date,
    'pemasukan',
    11640,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-06-29 4:57:18'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-06-14'::date,
    'pengeluaran',
    12140,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-06-29 5:02:09'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-12'::date,
    'pemasukan',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM',
    '2026-07-20 16:53:41'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-07-12'::date,
    'pengeluaran',
    100000,
    (SELECT id FROM public.accounts WHERE name = 'SHOPEEPAY' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke SEABANK',
    '2026-07-20 16:53:57'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    1021384,
    (SELECT id FROM public.accounts WHERE name = 'Spaylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Biaya Tak Terduga' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Tagihan Awal',
    '2026-02-10 17:49:56'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-02-10'::date,
    'pengeluaran',
    176969,
    (SELECT id FROM public.accounts WHERE name = 'Spaylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli sepatu northstar di shopee',
    '2026-03-01 8:04:48'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-03-01'::date,
    'pemasukan',
    1198353,
    (SELECT id FROM public.accounts WHERE name = 'Spaylatter' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer dari KROM: Bayar  Tagihan Spaylatter',
    '2026-03-01 8:00:13'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2025-12-28'::date,
    'pemasukan',
    1029,
    (SELECT id FROM public.accounts WHERE name = 'SUPERBANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Interest' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Interest',
    '2025-12-28 23:25:17'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-01-30'::date,
    'pengeluaran',
    51048,
    (SELECT id FROM public.accounts WHERE name = 'SUPERBANK' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Pindah Akun' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'Transfer ke JAGO',
    '2026-01-30 20:44:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pemasukan',
    32295,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund case cuktech 10',
    '2026-10-08 20:17:49'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pemasukan',
    378785,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund cuktech 10 second',
    '2026-10-08 20:18:14'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-28'::date,
    'pemasukan',
    75950,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'refund double order shopee',
    '2026-10-08 20:19:19'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-09-29'::date,
    'pengeluaran',
    486000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli cuktech 15 air di toco',
    '2026-10-08 20:19:36'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    43500,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli aza20',
    '2026-10-08 20:20:26'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pengeluaran',
    37580,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Selfcare' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli vitacid',
    '2026-10-08 20:20:32'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-02'::date,
    'pemasukan',
    122449,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kembalian Hutang' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'pengembalian biaya admin',
    '2026-10-08 20:20:47'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-03'::date,
    'pengeluaran',
    90345,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli kaos polo burgundy',
    '2026-10-08 20:21:15'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pengeluaran',
    29900,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Subscriptions' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'spotify',
    '2026-10-08 20:23:22'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-05'::date,
    'pengeluaran',
    64744,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli mini grinder',
    '2026-10-08 20:26:51'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-05'::date,
    'pengeluaran',
    328634,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Hobby/Entertainment' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli  keyboard gamen titan 6',
    '2026-10-08 20:26:53'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-07'::date,
    'pengeluaran',
    57846,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Kitchen Essential' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli colokan + botol sabun tangan foaming',
    '2026-10-08 20:26:55'::timestamptz
  );
  INSERT INTO public.transactions (user_id, date, type, amount, source_account_id, category_id, notes, created_at)
  VALUES (
    v_user_id,
    '2026-10-08'::date,
    'pengeluaran',
    50000,
    (SELECT id FROM public.accounts WHERE name = 'Honest Card' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    (SELECT id FROM public.categories WHERE name = 'Minuman Pokok' AND (user_id IS NOT DISTINCT FROM v_user_id OR user_id IS NULL) LIMIT 1),
    'beli galon aqua 2 di alfagift',
    '2026-10-08 20:27:02'::timestamptz
  );

  RAISE NOTICE 'Migrasi berhasil! Total 1458 transaksi telah masuk.';
END $$;
