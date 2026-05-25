import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const PID = '11f83b7f-0ce3-497f-a0a2-18658e61b435';
const urls = [];
for (let i = 1; i <= 4; i++) {
  const buf = fs.readFileSync(`/tmp/jk/clean${i}.jpg`);
  const path = `products-rehost/${PID}-jk-${i}.jpg`;
  const { error } = await sb.storage.from('comprovantes').upload(path, buf, { contentType: 'image/jpeg', upsert: true });
  if (error) { console.error(error); process.exit(1); }
  const { data } = sb.storage.from('comprovantes').getPublicUrl(path);
  urls.push(data.publicUrl);
}
console.log(JSON.stringify(urls));
