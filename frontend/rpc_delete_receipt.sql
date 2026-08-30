-- Buat Policy agar pengguna (authenticated) bisa MENGHAPUS bukti TF lama mereka sendiri
CREATE POLICY "Auth Delete Payment Receipts"
ON storage.objects FOR DELETE
USING ( bucket_id = 'payment_receipts' AND auth.role() = 'authenticated' );
