import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const data = JSON.parse(fs.readFileSync('/tmp/produtos_aro13.json','utf8'));
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,200);
const pat = /etiqueta[_-].*?([a-g])([a-g])(\d{2,3})\./i;
let ok=0, clr=0, miss=0;
for (const p of data) {
  const slug = slugify(p.nome);
  const u = p.inmetro || '';
  const m = u.match(pat);
  const { data: row } = await sb.from('products').select('id,specs').eq('slug',slug).maybeSingle();
  if (!row) { miss++; continue; }
  const specs = { ...(row.specs || {}) };
  if (m) {
    specs.consumo = m[1].toUpperCase();
    specs.aderencia = m[2].toUpperCase();
    specs.ruido_db = parseInt(m[3],10);
    specs.inmetro = u;
    ok++;
  } else {
    delete specs.consumo; delete specs.aderencia; delete specs.ruido_db;
    clr++;
  }
  const { error } = await sb.from('products').update({ specs }).eq('id', row.id);
  if (error) console.error('FAIL', slug, error.message);
}
console.log({ ok, clr, miss });
