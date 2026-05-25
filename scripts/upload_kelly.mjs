import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const PID = 'a55b7ee2-142e-4cb0-aff6-91262861302e';
const urls = [];

const buf1 = fs.readFileSync(`/tmp/kelly/orig01.jpg`);
const path1 = `products-rehost/${PID}-kelly-v4-1.jpg`;
await sb.storage.from('comprovantes').upload(path1, buf1, { contentType: 'image/jpeg', upsert: true });
urls.push(sb.storage.from('comprovantes').getPublicUrl(path1).data.publicUrl);

for (let i = 2; i <= 4; i++) {
  const buf = fs.readFileSync(`/tmp/kelly/clean0${i}.jpg`);
  const path = `products-rehost/${PID}-kelly-v4-${i}.jpg`;
  const { error } = await sb.storage.from('comprovantes').upload(path, buf, { contentType: 'image/jpeg', upsert: true });
  if (error) { console.error(error); process.exit(1); }
  urls.push(sb.storage.from('comprovantes').getPublicUrl(path).data.publicUrl);
}

const { error } = await sb.from('products').update({ images: urls }).eq('id', PID);
if (error) { console.error(error); process.exit(1); }
console.log('OK', urls);
