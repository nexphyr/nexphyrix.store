-- 1. Tambah kolom payment_receipt_url di tabel orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- 2. Buat bucket baru bernama 'payment_receipts' jika belum ada
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment_receipts', 'payment_receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Hapus policy lama jika ada untuk menghindari error "policy already exists"
DROP POLICY IF EXISTS "Public View Payment Receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Payment Receipts" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Payment Receipts" ON storage.objects;

-- 4. Buat Policy agar siapa pun bisa melihat bukti TF (Publik)
CREATE POLICY "Public View Payment Receipts"
ON storage.objects FOR SELECT
USING ( bucket_id = 'payment_receipts' );

-- 5. Buat Policy agar pengguna bisa mengunggah bukti TF 
-- (Memberikan akses INSERT ke semua anonim / user login)
CREATE POLICY "Public Upload Payment Receipts"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'payment_receipts' );
