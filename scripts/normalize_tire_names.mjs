import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 200);
}

// Get tire categories
const { data: cats } = await sb.from('categories').select('id,slug').like('slug', 'tipo-%');
const catIds = cats.map((c) => c.id);

const { data: products } = await sb
  .from('products').select('id,name,slug,specs')
  .in('category_id', catIds);

let upd = 0, skip = 0;
const usedSlugs = new Set();

for (const p of products) {
  const s = p.specs || {};
  const oldName = p.name;

  // Skip câmaras (não são pneus)
  if (/^c[âa]mara/i.test(oldName)) { skip++; continue; }

  // medida: tenta vários formatos
  // 1) 175/70R13  2) 185R14C  3) 6.45-13 / 5.90-14
  let medida = s.medida;
  if (!medida) {
    const m1 = oldName.match(/(\d{3}\/\d{2,3}R\d{2}(?:\.5)?)/i);
    const m2 = oldName.match(/(\d{3}R\d{2}C?)/i);
    const m3 = oldName.match(/(\d\.\d{2}-\d{2})/);
    medida = (m1?.[1] || m2?.[1] || m3?.[1] || '').toUpperCase();
  }
  // aro
  let aro = s.aro;
  if (!aro && medida) {
    const m = medida.match(/R(\d{2}(?:\.5)?)C?/i) || medida.match(/-(\d{2})$/);
    aro = m ? m[1] : null;
  }
  // marca: strip parenthetical
  let marca = (s.marca || '').replace(/\s*\(.*?\)\s*/g, '').trim();
  // modelo: strip leading "TL " e contagem de lonas
  let modelo = (s.modelo || '').replace(/^TL\s+/i, '').replace(/^\d+\s+lonas?\s+/i, '').trim();

  // ic + iv: aceita "82T", "102/100R", "102/100Q"
  const icIvDual = oldName.match(/\b(\d{2,3}\/\d{2,3}[A-Z])\b/);
  const icIvMatch = oldName.match(/\b(\d{2,3})([A-Z])\b/);
  const icIv = icIvDual ? icIvDual[1] : (icIvMatch ? `${icIvMatch[1]}${icIvMatch[2]}` : '');

  if (!medida || !aro || !marca || !modelo) {
    skip++;
    console.log('SKIP:', oldName);
    continue;
  }

  let newName = `Pneu ${medida} ${marca} ${modelo} Aro ${aro}`;
  if (icIv) newName += ` ${icIv}`;

  if (newName === oldName) { skip++; continue; }


  // unique slug
  let base = slugify(newName);
  let slug = base, n = 2;
  while (usedSlugs.has(slug)) { slug = `${base}-${n++}`; }
  usedSlugs.add(slug);

  // ensure not colliding with another product's slug
  const { data: clash } = await sb.from('products').select('id').eq('slug', slug).neq('id', p.id).maybeSingle();
  if (clash) { slug = `${base}-${p.id.slice(0, 6)}`; }

  const { error } = await sb.from('products').update({ name: newName, slug }).eq('id', p.id);
  if (error) { console.error('ERR', oldName, error.message); }
  else { upd++; console.log(`✓ ${oldName}\n  → ${newName}`); }
}
console.log({ upd, skip, total: products.length });
