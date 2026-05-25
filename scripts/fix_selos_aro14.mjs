import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: rows } = await sb.from('products')
  .select('id, specs')
  .eq('category_id', '8aace05b-8340-4dee-ba8e-3c56e13003c3');

let upd = 0, skip = 0;
for (const r of rows) {
  const inmetro = r.specs?.inmetro;
  if (!inmetro) { skip++; continue; }
  const m = inmetro.match(/etiqueta_atacadao_([a-z])([a-z])(\d{2,3})\.jpg/i);
  if (!m) { skip++; continue; }
  const consumo = m[1].toUpperCase();
  const aderencia = m[2].toUpperCase();
  const ruido_db = m[3];
  const newSpecs = { ...r.specs, consumo, aderencia, ruido_db };
  const { error } = await sb.from('products').update({ specs: newSpecs }).eq('id', r.id);
  if (error) console.error(error.message);
  else upd++;
}
console.log(`Updated: ${upd}, Skipped: ${skip}`);
