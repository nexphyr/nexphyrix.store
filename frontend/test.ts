import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking app_settings table...');
  const { data, error } = await supabase.from('app_settings').select('*');
  if (error) {
    console.error('Error selecting:', error.message, error.details, error.hint);
  } else {
    console.log('Data:', data);
  }
  
  console.log('Attempting update...');
  const { data: uData, error: uError } = await supabase.from('app_settings').update({ setting_value: '10' }).eq('setting_key', 'order_expiry_minutes');
  if (uError) {
    console.error('Error updating:', uError.message, uError.details, uError.hint);
  } else {
    console.log('Update success');
  }
}
check();
