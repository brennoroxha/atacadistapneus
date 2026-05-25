// Adds `informacoesTecnicas` (raw supplier array w/ SVG icon URLs) and
// `informacaoAdicional` to specs of products imported from Aro 14 + Aro 15
// JSON sources, so the product detail page renders the rich supplier-icon
// "Informações Técnicas" section (matching the Aro 13 Kelly pattern).
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SOURCES = [
  { file: '/tmp/produtos_aro14.json', categoryId: '8aace05b-8340-4dee-ba8e-3c56e13003c3' },
  { file: '/tmp/produtos_aro15.json', categoryId: '4b700874-4901-42a3-b07c-1a4a56ce4ebe' },
];

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 200);
}

function parseTec(arr) {
  const out = {};
  for (const it of arr || []) {
    const t = it.texto || '';
    const i = t.indexOf(':');
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

function intFrom(s) { const m = String(s || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : null; }

let total = 0, updated = 0, missed = 0;

for (const { file, categoryId } of SOURCES) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { data: products } = await sb.from('products').select('id, name, specs').eq('category_id', categoryId);
  // index DB products by a normalized fingerprint (medida + marca-words + tail)
  const dbBySlug = new Map(products.map((p) => [slugify(p.name), p]));

  for (const src of json) {
    if (!src.informacoesTecnicas) continue;
    // Reconstruct expected DB name to find row
    // Match using parts: medida + marca + modelo (best-effort)
    const m = src.nome.match(/(\d{3}\/\d{2,3}R\d{2})/i);
    if (!m) continue;
    const medida = m[1];
    // Try to locate by checking if any DB product slug contains the source name's signature parts
    let target = null;
    for (const p of products) {
      if (!p.name.includes(medida)) continue;
      // compare modelo text
      const srcModelo = src.nome.match(/\d{2}[A-Z]\s+(?:TL\s+)?(.+)$/);
      if (srcModelo && p.name.includes(srcModelo[1].trim())) { target = p; break; }
    }
    if (!target) { missed++; continue; }

    total++;
    const t = parseTec(src.informacoesTecnicas);
    const newSpecs = {
      ...(target.specs || {}),
      informacoesTecnicas: src.informacoesTecnicas,
      informacaoAdicional: src.informacaoAdicional || target.specs?.informacaoAdicional,
      categoria: t['Categoria'] || target.specs?.categoria,
      largura_mm: intFrom(t['Largura']) ?? target.specs?.largura_mm,
      diametro_mm: intFrom(t['Diâmetro']) ?? target.specs?.diametro_mm,
      talas_compativeis: t['Talas compatíveis'] || target.specs?.talas_compativeis,
      treadwear: t['Durabilidade (Treadwear)'] || target.specs?.treadwear,
      temperature: t['Resistência ao aquecimento (Temperature)'] || target.specs?.temperature,
      protetor_borda: /sim/i.test(t['Protetor de borda'] || ''),
      quantidade_lonas: t['Quantidade de lonas'] || target.specs?.quantidade_lonas,
    };
    const { error } = await sb.from('products').update({ specs: newSpecs }).eq('id', target.id);
    if (error) console.error('FAIL', target.name, error.message);
    else updated++;
  }
}

console.log({ total, updated, missed });
