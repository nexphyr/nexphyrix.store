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
  const { data: order, error: orderErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  const { data: link, error: linkErr } = await supabase.from('links').select('*').limit(1);
  console.log('Order:', JSON.stringify(order, null, 2));
  console.log('Link:', JSON.stringify(link, null, 2));
}
test();
