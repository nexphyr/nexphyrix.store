-- ============================================================
-- FIX CHECKOUT RPC AND CONSTRAINTS
-- ============================================================

-- Drop the old constraint and add a new one that allows 'pending'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_checkout_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_checkout_method_check CHECK (checkout_method IN ('messenger', 'telegram', 'pending'));

-- Perbarui fungsi checkout agar membaca id sebagai text (untuk mendukung UUID frontend)
CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_cart_items jsonb,
  p_checkout_method text
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_is_member boolean := false;
  v_subtotal bigint := 0;
  v_total_items integer := 0;
  v_discount_tier integer := 0;
  v_discount_amount bigint := 0;
  v_final_total bigint := 0;
  v_order_number text;
  v_order_id uuid;
  v_customer_name text := NULL;
  v_customer_email text := NULL;
  v_has_used_promo boolean := false;
  v_item record;
  v_db_link record;
  v_price_numeric bigint;
BEGIN
  -- 1. Identify User
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    v_is_member := true;
    -- Try to get customer snapshot
    SELECT full_name, email, has_used_new_user_promo INTO v_customer_name, v_customer_email, v_has_used_promo FROM profiles WHERE id = v_user_id;
  END IF;

  -- 2. Process cart items (PERHATIKAN x(id text))
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id text, quantity int)
  LOOP
    -- Validasi produk ada di tabel links
    SELECT * INTO v_db_link FROM links WHERE id::text = v_item.id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found', v_item.id;
    END IF;

    -- Ekstrak angka dari teks harga (contoh: "Rp 10.000" -> 10000)
    IF v_db_link.price IS NULL OR v_db_link.price = '' THEN
      v_price_numeric := 0;
    ELSE
      v_price_numeric := COALESCE(NULLIF(regexp_replace(v_db_link.price, '[^0-9]', '', 'g'), ''), '0')::bigint;
    END IF;

    v_total_items := v_total_items + v_item.quantity;
    v_subtotal := v_subtotal + (v_price_numeric * v_item.quantity);
  END LOOP;

  IF v_total_items < 1 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- 3. Calculate Discount (Secure Server-Side Logic)
  IF v_is_member THEN
    -- NEW USER PROMO: Beli 5 Gratis 1 (Diskon Rp10.000)
    IF v_has_used_promo = false THEN
      IF v_total_items >= 6 THEN
        v_discount_amount := 10000;
        -- Tandai bahwa pengguna telah memakai promo new user
        UPDATE profiles SET has_used_new_user_promo = true WHERE id = v_user_id;
      END IF;
    ELSE
      -- REGULAR PROMO: Beli 10 Gratis 1 (Diskon Rp10.000 per 11 item)
      v_discount_tier := floor(v_total_items / 11);
      v_discount_amount := v_discount_tier * 10000;
    END IF;
  ELSE
    v_discount_amount := 0;
  END IF;

  v_final_total := GREATEST(v_subtotal - v_discount_amount, 0);

  -- 4. Generate Unique Order Number
  v_order_number := 'NXP-' || floor(random() * 900000 + 100000)::text;

  -- 5. Insert Order
  INSERT INTO orders (
    order_number, user_id, customer_name, customer_email,
    total_items, subtotal_amount, discount_amount, total_amount,
    checkout_method, is_member_order
  ) VALUES (
    v_order_number, v_user_id, v_customer_name, v_customer_email,
    v_total_items, v_subtotal, v_discount_amount, v_final_total,
    p_checkout_method, v_is_member
  ) RETURNING id INTO v_order_id;

  -- 6. Insert Order Items (Snapshot)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id text, quantity int)
  LOOP
    SELECT * INTO v_db_link FROM links WHERE id::text = v_item.id;
    
    IF v_db_link.price IS NULL OR v_db_link.price = '' THEN
      v_price_numeric := 0;
    ELSE
      v_price_numeric := COALESCE(NULLIF(regexp_replace(v_db_link.price, '[^0-9]', '', 'g'), ''), '0')::bigint;
    END IF;

    INSERT INTO order_items (
      order_id, product_id, product_title, unit_price, quantity
    ) VALUES (
      v_order_id, v_item.id, v_db_link.title, v_price_numeric, v_item.quantity
    );
  END LOOP;

  -- 7. Return Verified Data ke Frontend
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_items', v_total_items,
    'subtotal', v_subtotal,
    'discount', v_discount_amount,
    'total', v_final_total,
    'is_member', v_is_member
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- RPC to Update Checkout Method
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_checkout_method(
  p_order_id uuid,
  p_method text
)
RETURNS void AS $$
BEGIN
  UPDATE orders
  SET checkout_method = p_method
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
