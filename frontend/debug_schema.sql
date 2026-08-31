CREATE OR REPLACE FUNCTION public.get_debug_info()
RETURNS jsonb AS $$
DECLARE
  v_res jsonb;
BEGIN
  SELECT jsonb_agg(jsonb_build_object('name', column_name, 'type', data_type)) INTO v_res
  FROM information_schema.columns 
  WHERE table_name = 'orders';
  
  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
