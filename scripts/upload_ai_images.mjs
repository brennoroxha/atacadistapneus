import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'comprovantes';
const DIR = '/dev-server/tmp/aiimg';

const { data: missing } = await supabase
  .from('products')
  .select('id, images')
  .or('images.is.null,images.eq.{}');
const byPrefix = new Map((missing || []).map(p => [p.id.slice(0, 8), p.id]));
console.log(`${byPrefix.size} produtos sem imagem`);

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jpg'));
for (const file of files) {
  const prefix = file.replace('.jpg', '');
  const fullId = byPrefix.get(prefix);
  if (!fullId) { console.error(`! sem match: ${prefix}`); continue; }
  const buf = fs.readFileSync(`${DIR}/${file}`);
  const hash = crypto.createHash('md5').update(buf).digest('hex').slice(0, 10);
  const path = `products-rehost/${fullId}-ai-${hash}.jpg`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: 'image/jpeg', upsert: true,
  });
  if (upErr) { console.error(`upload ${prefix}: ${upErr.message}`); continue; }
  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error: updErr } = await supabase.from('products').update({ images: [url] }).eq('id', fullId);
  if (updErr) console.error(`update ${prefix}: ${updErr.message}`);
  else console.log(`✓ ${prefix}`);
}
