import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const CATEGORY_ID = '5efbbc2f-0173-4425-b31f-5b859d517283';
const data = JSON.parse(fs.readFileSync('/tmp/produtos_aro13.json', 'utf8'));

const { data: products } = await sb
  .from('products').select('id, name, specs, description')
  .eq('category_id', CATEGORY_ID);

const byName = new Map(products.map((p) => [p.name, p]));

let upd = 0, miss = 0;
for (const j of data) {
  const p = byName.get(j.nome);
  if (!p) { miss++; continue; }
  const newSpecs = {
    ...(p.specs || {}),
    informacoesTecnicas: j.informacoesTecnicas || [],
    informacaoAdicional: j.informacaoAdicional || '',
    garantia: j.garantia || (p.specs || {}).garantia || null,
    veiculos: j.veiculosUtilizadosPorMarca || (p.specs || {}).veiculos || [],
    inmetro: j.inmetro || (p.specs || {}).inmetro || null,
  };
  const patch = { specs: newSpecs };
  if ((!p.description || p.description.length < 20) && j.descricao) {
    patch.description = j.descricao;
  }
  const { error } = await sb.from('products').update(patch).eq('id', p.id);
  if (error) { console.error('ERR', j.nome, error.message); }
  else upd++;
}
console.log(`Updated: ${upd}, Missing: ${miss}`);
