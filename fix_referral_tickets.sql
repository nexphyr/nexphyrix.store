-- 1. Perbarui semua tiket user berdasarkan rumus:
-- Tiket = (Jumlah Undang / 5) - Jumlah Game Yang Sudah Diklaim
UPDATE public.profiles p
SET available_free_claims = GREATEST(0, FLOOR(COALESCE(p.referral_count, 0) / 5.0) - (
  SELECT count(*) FROM public.referral_claims rc WHERE rc.user_id = p.id
));

-- 2. Perbaiki fungsi set_referred_by agar otomatis menghitung dengan benar
CREATE OR REPLACE FUNCTION public.set_referred_by(p_referral_code TEXT)
RETURNS void AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_count INT;
  v_claimed_count INT;
BEGIN
  -- 1. Cari user yang memiliki kode referral tersebut
  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = p_referral_code
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Kode referral tidak valid';
  END IF;

  IF v_referrer_id = auth.uid() THEN
    RAISE EXCEPTION 'Tidak bisa menggunakan kode referral sendiri';
  END IF;

  -- 2. Update user yang memasukkan kode
  UPDATE public.profiles
  SET referred_by = p_referral_code
  WHERE id = auth.uid() AND referred_by IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gagal menggunakan kode. Anda mungkin sudah pernah menggunakan kode referral sebelumnya.';
  END IF;

  -- 3. Tambah hitungan referral_count untuk pemilik kode
  UPDATE public.profiles
  SET referral_count = COALESCE(referral_count, 0) + 1
  WHERE id = v_referrer_id
  RETURNING referral_count INTO v_referrer_count;

  -- 4. Hitung ulang tiket untuk pemilik kode berdasarkan hitungan absolut
  SELECT count(*) INTO v_claimed_count
  FROM public.referral_claims
  WHERE user_id = v_referrer_id;

  UPDATE public.profiles
  SET available_free_claims = GREATEST(0, FLOOR(v_referrer_count / 5.0) - v_claimed_count)
  WHERE id = v_referrer_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
