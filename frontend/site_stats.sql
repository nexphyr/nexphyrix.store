-- Buat tabel untuk menyimpan statistik website
CREATE TABLE IF NOT EXISTS site_stats (
  id INT PRIMARY KEY,
  visits BIGINT DEFAULT 0
);

-- Masukkan baris awal jika belum ada
INSERT INTO site_stats (id, visits)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Berikan akses baca untuk publik (anon)
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site stats" ON site_stats;
CREATE POLICY "Public can read site stats" ON site_stats FOR SELECT TO anon, authenticated USING (true);

-- Buat fungsi (RPC) untuk menambah jumlah kunjungan secara aman tanpa memberikan akses UPDATE tabel secara langsung ke publik
CREATE OR REPLACE FUNCTION increment_site_visits()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_visits BIGINT;
BEGIN
  UPDATE site_stats
  SET visits = visits + 1
  WHERE id = 1
  RETURNING visits INTO new_visits;
  
  RETURN new_visits;
END;
$$;

-- Izinkan publik memanggil fungsi increment ini
GRANT EXECUTE ON FUNCTION increment_site_visits() TO anon, authenticated;
