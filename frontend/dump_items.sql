CREATE OR REPLACE FUNCTION public.get_last_order_items()
RETURNS jsonb AS $$
DECLARE
  v_res jsonb;
BEGIN
  SELECT jsonb_agg(order_items.*) INTO v_res
  FROM order_items
  JOIN orders ON orders.id = order_items.order_id
  ORDER BY orders.created_at DESC
  LIMIT 5;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
