import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPA_URL, SUPA_KEY);
const BUCKET = 'comprovantes';
const SELF_HOST = 'ytcvviisvasthiqflkid.supabase.co';
const CONCURRENCY = 8;

const extFromUrl = (url, ct) => {
  if (ct?.includes('webp')) return 'webp';
  if (ct?.includes('png')) return 'png';
  if (ct?.includes('jpeg') || ct?.includes('jpg')) return 'jpg';
  if (ct?.includes('gif')) return 'gif';
  const m = url.split('?')[0].match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
};

async function rehostOne(url, productId, idx) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error(`tiny ${buf.length}`);
  const ct = res.headers.get('content-type') || '';
  const ext = extFromUrl(url, ct);
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
  const path = `products-rehost/${productId}-${idx}-${hash}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: ct || `image/${ext}`,
    upsert: true,
  });
  if (error) throw new Error(`upload ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function processProduct(p) {
  const newImgs = [];
  let changed = false;
  for (let i = 0; i < p.images.length; i++) {
    const u = p.images[i];
    if (!u) continue;
    if (u.includes(SELF_HOST)) { newImgs.push(u); continue; }
    try {
      const newUrl = await rehostOne(u, p.id, i);
      newImgs.push(newUrl);
      changed = true;
    } catch (e) {
      console.error(`  ! ${p.id}[${i}] ${u.slice(0, 80)} → ${e.message}`);
      newImgs.push(u);
    }
  }
  if (changed) {
    const { error } = await supabase.from('products').update({ images: newImgs }).eq('id', p.id);
    if (error) throw new Error(`update ${error.message}`);
  }
  return changed;
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, images')
    .not('images', 'is', null);
  if (error) throw error;

  const queue = products.filter(p =>
    Array.isArray(p.images) && p.images.some(u => u && !u.includes(SELF_HOST))
  );
  console.log(`Produtos a processar: ${queue.length}`);

  let done = 0, fail = 0;
  async function worker() {
    while (queue.length) {
      const p = queue.shift();
      try {
        await processProduct(p);
        done++;
      } catch (e) {
        fail++;
        console.error(`✗ ${p.id} ${p.name?.slice(0, 50)}: ${e.message}`);
      }
      if ((done + fail) % 10 === 0) console.log(`  ${done} ok, ${fail} fail, ${queue.length} restantes`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nFinalizado: ${done} atualizados, ${fail} falhas`);
}
main().catch(e => { console.error(e); process.exit(1); });
