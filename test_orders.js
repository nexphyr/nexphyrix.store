import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'frontend/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(2);
  console.log('Recent Orders:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

test();
