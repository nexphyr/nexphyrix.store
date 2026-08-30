-- ============================================================
-- RPC to Cancel Member Order securely
-- ============================================================

CREATE OR REPLACE FUNCTION public.cancel_member_order(
  p_order_id uuid
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_order_status text;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Cek pesanan dan pastikan pesanan tersebut milik user ini dan masih pending
  SELECT status INTO v_order_status FROM orders WHERE id = p_order_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or unauthorized';
  END IF;

  IF v_order_status != 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can be cancelled';
  END IF;

  -- Lakukan update
  UPDATE orders
  SET status = 'cancelled'
  WHERE id = p_order_id AND user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
