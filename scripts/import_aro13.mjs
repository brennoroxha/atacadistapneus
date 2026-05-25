import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const CATEGORY_ID = '5efbbc2f-0173-4425-b31f-5b859d517283'; // tipo-carros-camionete-aro-13
const data = JSON.parse(fs.readFileSync('/tmp/produtos_aro13.json', 'utf8'));

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
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    out[key] = val;
  }
  return out;
}

function buildSpecs(p) {
  const t = parseTec(p.informacoesTecnicas);
  const medidaMatch = p.nome.match(/(\d{3})\/(\d{2,3})R(\d{2})/i);
  const medida = medidaMatch ? `${medidaMatch[1]}/${medidaMatch[2]}R${medidaMatch[3]}` : '';
  const aro = medidaMatch ? medidaMatch[3] : '13';
  // marca = second word usually
  const palavras = p.nome.replace(/^Pneu\s+Aro\s+\d+\s+/i, '').split(/\s+/);
  const marca = palavras[0];
  const modeloMatch = p.nome.match(/\d{2}[A-Z]\s+(?:TL\s+)?(.+)$/);
  const modelo = modeloMatch ? modeloMatch[1].trim() : '';
  return {
    aro,
    medida,
    marca,
    modelo,
    letra: 'Preta',
    consumo: null,
    aderencia: t['Aderência (Traction)'] || null,
    traction: t['Aderência (Traction)'] || null,
    ruido_db: null,
    runflat: /sim/i.test(t['Runflat'] || ''),
    extra_load: /sim/i.test(t['Extra Load'] || ''),
    terreno: t['Terreno'] || null,
    montagem: t['Montagem'] || 'Sem Câmara',
    garantia: p.garantia || null,
    indice_carga: t['Índice de carga (por pneu)'] || null,
    indice_velocidade: t['Índice de velocidade'] || null,
    largura: t['Largura'] || null,
    diametro: t['Diâmetro'] || null,
    treadwear: t['Durabilidade (Treadwear)'] || null,
    temperature: t['Resistência ao aquecimento (Temperature)'] || null,
    inmetro: p.inmetro || null,
    veiculos: p.veiculosUtilizadosPorMarca || [],
  };
}

function buildName(p, specs) {
  const marca = (specs.marca || '').replace(/\s*\(.*?\)\s*/g, '').trim();
  const modelo = (specs.modelo || '').replace(/^TL\s+/i, '').trim();
  const icIv = p.nome.match(/\b(\d{2,3})([A-Z])\b/);
  const sufixo = icIv ? ` ${icIv[1]}${icIv[2]}` : '';
  if (!specs.medida || !specs.aro || !marca || !modelo) return p.nome;
  return `Pneu ${specs.medida} ${marca} ${modelo} Aro ${specs.aro}${sufixo}`;
}

let ok = 0, skip = 0, fail = 0;
for (const p of data) {
  const specs = buildSpecs(p);
  const name = buildName(p, specs);
  const slug = slugify(name);
  const { data: exist } = await sb.from('products').select('id').eq('slug', slug).maybeSingle();
  if (exist) { skip++; continue; }
  const row = {
    category_id: CATEGORY_ID,
    name,
    slug,
    description: p.descricao || p.informacaoAdicional || '',
    price: Number(p.preco),
    stock: 100,
    images: p.imagens || [],
    specs,
    featured: false,
  };
  const { error } = await sb.from('products').insert(row);
  if (error) { fail++; console.error('FAIL', p.nome, error.message); }
  else ok++;
}
console.log(`Inserted: ${ok}, Skipped: ${skip}, Failed: ${fail}`);
