import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_PUBLISHABLE_KEY']);

async function test() {
  const cart = [{ id: '0ac110d4-561f-428e-a625-b358cdfc8998', quantity: 1 }];
  const { data, error } = await supabase.rpc('create_checkout_order', {
    p_cart_items: cart,
    p_checkout_method: 'pending'
  });
  console.log('RPC Result Data:', JSON.stringify(data, null, 2));
  console.log('RPC Result Error:', error);
}
test();
