-- 0. Buat tabel referral_claims jika belum ada
CREATE TABLE IF NOT EXISTS public.referral_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- 1. Tambahkan kolom is_free_claim ke tabel links
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_free_claim BOOLEAN DEFAULT false;

-- 2. Fungsi untuk mengklaim game gratis
CREATE OR REPLACE FUNCTION public.claim_free_game(p_game_id uuid)
RETURNS TEXT AS $$
DECLARE
  v_tickets INT;
  v_is_free BOOLEAN;
BEGIN
  -- Periksa apakah tiket cukup
  SELECT available_free_claims INTO v_tickets FROM profiles WHERE id = auth.uid();
  IF v_tickets < 1 THEN
    RAISE EXCEPTION 'Tiket tidak cukup untuk mengklaim game ini.';
  END IF;

  -- Periksa apakah game tersedia untuk klaim gratis
  SELECT is_free_claim INTO v_is_free FROM links WHERE id = p_game_id;
  IF NOT v_is_free THEN
    RAISE EXCEPTION 'Game ini tidak tersedia untuk diklaim secara gratis.';
  END IF;
  
  -- Periksa apakah sudah pernah klaim
  IF EXISTS (SELECT 1 FROM referral_claims WHERE user_id = auth.uid() AND game_id = p_game_id) THEN
    RAISE EXCEPTION 'Anda sudah mengklaim game ini sebelumnya.';
  END IF;

  -- Potong tiket
  UPDATE profiles SET available_free_claims = available_free_claims - 1 WHERE id = auth.uid();
  
  -- Catat klaim
  INSERT INTO referral_claims (user_id, game_id) VALUES (auth.uid(), p_game_id);

  RETURN 'Klaim berhasil!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fungsi untuk mengambil link yang diklaim (beserta url rahasia)
CREATE OR REPLACE FUNCTION public.get_claimed_links()
RETURNS TABLE (
  product_title TEXT,
  urls TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.title AS product_title,
    (
      SELECT ls.url 
      FROM link_secrets ls 
      WHERE ls.link_id = l.id 
      LIMIT 1
    ) AS urls
  FROM referral_claims rc
  JOIN links l ON rc.game_id = l.id
  WHERE rc.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
