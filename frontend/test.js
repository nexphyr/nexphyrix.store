import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

async function run() {
  const res = await fetch(`${url}/rest/v1/app_settings?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  
  if (!res.ok) {
    const err = await res.text();
    console.log('Error:', res.status, err);
  } else {
    const data = await res.json();
    console.log('Success, data:', data);
  }
}
run();
