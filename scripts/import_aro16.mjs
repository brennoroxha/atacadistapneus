// Imports new Aro 16 products following the full standard pattern:
// - Normalized name (Pneu MEDIDA Marca Modelo Aro 16 IC+IV)
// - Full specs incl. selos (consumo/aderencia/ruido_db) parsed from inmetro URL
// - Raw informacoesTecnicas array (SVG icons) + informacaoAdicional, so the
//   product page renders the same rich layout as the Kelly Edge Touring Aro 13.
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const CATEGORY_ID = '2edb52ee-f0df-414b-b522-4d5abe3f739c'; // tipo-carros-camionete-aro-16
const SRC = process.env.SRC || '/tmp/aro16_new.json';
const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 200);
}
function parseTec(arr) {
  const out = {};
  for (const it of arr || []) {
    const t = it.texto || ''; const i = t.indexOf(':');
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}
function parseSelos(url) {
  if (!url) return {};
  const m = url.match(/etiqueta[_-].*?([a-g])([a-g])(\d{2,3})\./i);
  if (!m) return {};
  return { consumo: m[1].toUpperCase(), aderencia: m[2].toUpperCase(), ruido_db: parseInt(m[3], 10) };
}
function intFrom(s) { const m = String(s || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : null; }

function buildSpecs(p) {
  const t = parseTec(p.informacoesTecnicas);
  const mm = p.nome.match(/(\d{3})\/(\d{2,3})R(\d{2})/i);
  const medida = mm ? `${mm[1]}/${mm[2]}R${mm[3]}` : '';
  const aro = mm ? mm[3] : '16';
  const palavras = p.nome.replace(/^Pneu\s+Aro\s+\d+\s+/i, '').split(/\s+/);
  const marca = palavras[0];
  const modeloMatch = p.nome.match(/\d{2}[A-Z]\s+(?:TL\s+)?(.+)$/);
  const modelo = modeloMatch ? modeloMatch[1].trim() : '';
  const selos = parseSelos(p.inmetro);
  return {
    aro, medida, marca, modelo, letra: 'Preta',
    consumo: selos.consumo || null,
    aderencia: selos.aderencia || t['Aderência (Traction)'] || null,
    traction: t['Aderência (Traction)'] || null,
    ruido_db: selos.ruido_db || null,
    runflat: /sim/i.test(t['Runflat'] || ''),
    extra_load: /sim/i.test(t['Extra Load'] || ''),
    terreno: t['Terreno'] || null,
    montagem: t['Montagem'] || 'Sem Câmara',
    garantia: p.garantia || null,
    indice_carga: t['Índice de carga (por pneu)'] || null,
    indice_velocidade: t['Índice de velocidade'] || null,
    largura: t['Largura'] || null,
    diametro: t['Diâmetro'] || null,
    largura_mm: intFrom(t['Largura']),
    diametro_mm: intFrom(t['Diâmetro']),
    talas_compativeis: t['Talas compatíveis'] || null,
    treadwear: t['Durabilidade (Treadwear)'] || null,
    temperature: t['Resistência ao aquecimento (Temperature)'] || null,
    protetor_borda: /sim/i.test(t['Protetor de borda'] || ''),
    quantidade_lonas: t['Quantidade de lonas'] || null,
    categoria: t['Categoria'] || null,
    inmetro: p.inmetro || null,
    informacoesTecnicas: p.informacoesTecnicas || [],
    informacaoAdicional: p.informacaoAdicional || null,
    veiculos: p.veiculosUtilizadosPorMarca || [],
  };
}

function buildName(p, specs) {
  const marca = (specs.marca || '').replace(/\s*\(.*?\)\s*/g, '').trim();
  const modelo = (specs.modelo || '').replace(/^TL\s+/i, '').replace(/^\d+\s+lonas?\s+/i, '').trim();
  const icIvDual = p.nome.match(/\b(\d{2,3}\/\d{2,3}[A-Z])\b/);
  const icIvMatch = p.nome.match(/\b(\d{2,3})([A-Z])\b/);
  const icIv = icIvDual ? icIvDual[1] : (icIvMatch ? `${icIvMatch[1]}${icIvMatch[2]}` : '');
  if (!specs.medida || !specs.aro || !marca || !modelo) return p.nome;
  return `Pneu ${specs.medida} ${marca} ${modelo} Aro ${specs.aro}${icIv ? ' ' + icIv : ''}`;
}

let ok = 0, skip = 0, fail = 0, filtered = 0, updated = 0;
for (const p of data) {
  const m = p.nome.match(/Aro\s+(\d+)/i);
  if (!m || m[1] !== '16') { filtered++; continue; }
  if (!p.imagens || p.imagens.length === 0) { skip++; continue; }
  const specs = buildSpecs(p);
  const name = buildName(p, specs);
  const slug = slugify(name);
  const { data: exist } = await sb.from('products').select('id, specs').eq('slug', slug).maybeSingle();
  if (exist) {
    // Update specs to the standard pattern (merge), don't touch price/images
    const merged = { ...(exist.specs || {}), ...specs };
    const { error } = await sb.from('products').update({ specs: merged }).eq('id', exist.id);
    if (error) { fail++; console.error('UPD FAIL', name, error.message); } else updated++;
    continue;
  }
  const row = {
    category_id: CATEGORY_ID,
    name, slug,
    description: p.descricao || p.informacaoAdicional || '',
    price: Number(p.preco),
    stock: 100,
    images: p.imagens || [],
    specs,
    featured: false,
  };
  const { error } = await sb.from('products').insert(row);
  if (error) { fail++; console.error('INS FAIL', name, error.message); } else ok++;
}
console.log({ inserted: ok, updated, skipped: skip, failed: fail, filtered });
