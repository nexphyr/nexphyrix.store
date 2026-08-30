CREATE OR REPLACE FUNCTION public.update_order_receipt(
  p_order_id uuid,
  p_receipt_url text
)
RETURNS void AS $$
BEGIN
  -- Verify ownership or admin status
  IF NOT (
    EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND user_id = auth.uid()) OR
    public.is_admin()
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this order';
  END IF;

  UPDATE orders
  SET payment_receipt_url = p_receipt_url
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
