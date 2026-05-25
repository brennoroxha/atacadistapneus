import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'comprovantes';

const MAP = {
  "Chuveiro Elétrico Eletrônico 5500w Branco Quadrado Loren Shower Lorenzetti - 110V": [
    "https://cdn.ferramentaskennedy.com.br/storage/kennedy/1000/chuveiro-loren-shower-ultra-eletronico-5500w-127v-lorenzetti17691186369509961.jpeg",
    "https://cdn.ferramentaskennedy.com.br/storage/kennedy/1000/chuveiro-loren-shower-ultra-eletronico-5500w-127v-lorenzetti17691186376309962.jpeg",
    "https://cdn.ferramentaskennedy.com.br/storage/kennedy/1000/chuveiro-loren-shower-ultra-eletronico-5500w-127v-lorenzetti17691186383367183.jpeg",
  ],
  "Aspirador de Pó Vertical STK12 1100W Electrolux - 127V(110V)": [
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_vertical_stk12_1100w_127v__110v__electrolux_91016135_31ba_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_vertical_stk12_1100w_127v__110v__electrolux_91016135_7427_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_vertical_stk12_1100w_127v__110v__electrolux_91016135_7a54_600x600.jpg",
  ],
  "Chuveiro Elétrico Eletrônico 7500w Branco Redondo Moment Zagonel - 220V": [
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_eletronico_220v_branco_moment_zagonel_92235605_3d91_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_eletronico_220v_branco_moment_zagonel_92235605_a21d_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_eletronico_220v_branco_moment_zagonel_92235605_374d_600x600.jpg",
  ],
  "Chuveiro Elétrico Eletrônico 7500w Branco Quadrado Loren Shower Lorenzetti - 220V": [
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletronico_220v_7500w_branco_loren_shower_lorenzetti_91063406_0289_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletronico_220v_7500w_branco_loren_shower_lorenzetti_91063406_1df2_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletronico_220v_7500w_branco_loren_shower_lorenzetti_91063406_ca00_600x600.jpg",
  ],
  "Chuveiro Elétrico Eletrônico 5500w Branco Redondo Moment Zagonel - 110V": [
    "https://cdn.leroymerlin.com.br/products/chuveiro_127v__110v__5500w_moment_eletronica_zagonel_92242241_e70b_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/ducha_zagonel_moment_eletronica_branco_127v_5500w_1571634656_72fd_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_eletronico_110v_branco_moment_zagonel_92242241_7438_600x600.jpg",
  ],
  "Moto Esmeril 6'' 150W TC-BG 150 Bivolt Einhell - BIVOLT": [
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_150w_bivolt_einhell_90203414_0001_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_150w_tc_bg_150_bivolt_einhell_90203414_00011_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_150w_tc_bg_150_bivolt_einhell_90203414_0002_600x600.jpg",
  ],
  "Chuveiro Elétrico Multitemperatura 6800W Branco Duo Shower Quadra Lorenzetti - 220V": [
    "https://cdn.leroymerlin.com.br/products/chuveiro_de_parede_duo_quadra_multitemperatura_6800w_250v__220v__lorenzetti_89067020_79e2_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_duo_shower_quadra_6800w_220v_89067020_e49a_600x600.jpg",
  ],
  "Chuveiro Elétrico Eletrônico 6800w Branco Quadrado Loren Shower Lorenzetti - 220V": [
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletronico_220v_6800w_branco_loren_shower_lorenzetti_91697823_b384_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletronico_220v_6800w_branco_loren_shower_lorenzetti_91697823_6684_600x600.jpg",
  ],
  "Lavadora de Alta Pressão Electrolux 1650PSI 1400W EasyWash - 127V": [
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_electrolux_1650psi_1400w_easywash_co_1572230851_3ef3_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_electrolux_1650psi_1400w_easywash_co_1572230851_492e_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_electrolux_1650psi_1400w_easywash_co_1572230851_232e_600x600.jpg",
  ],
  "Aspirador de Pó 2 em 1 Mondial 1100W Turbo Cycle - AP-36 Vermelho e Preto - 220V": [
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_mondial_turbo_cycle_vermelho_e_preto_ap_36___1547145603_df54_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_mondial_turbo_cycle_vermelho_e_preto_ap_36___1547145603_7ffe_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_mondial_turbo_cycle_vermelho_e_preto_ap_36___1547145603_f3d6_600x600.jpg",
  ],
  "Chuveiro Elétrico Multitemperatura Branco Redondo Bella Ducha Lorenzetti - 220V": [
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_220v_bella_ducha_lorenzetti_87905706_bc61_600x600.JPG",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_220v_bella_ducha_lorenzetti_87905706_c6d2_600x600.JPG",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_220v_bella_ducha_lorenzetti_87905706_7138_600x600.jpg",
  ],
  "Moto Esmeril 6'' 250W WS7800U Bivolt Wesco - BIVOLT": [
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_250w_ws7800u_127v__110v___wesco_90163773_0001_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_250w_ws7800u_127v__110v___wesco_90163773_0002_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_250w_ws7800u_127v__110v___wesco_90163773_0003_600x600.jpg",
  ],
  "Chuveiro Elétrico Multitemperatura Branco Redondo Bella Ducha Lorenzetti - 110V": [
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_110v_bella_ducha_lorenzetti_87905671_02be_600x600.JPG",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_110v_bella_ducha_lorenzetti_87905671_cea7_600x600.JPG",
    "https://cdn.leroymerlin.com.br/products/chuveiro_eletrico_110v_bella_ducha_lorenzetti_87905671_c5ad_600x600.jpg",
  ],
  "Lavadora De Alta Pressão Lk1305 1200w C/ Regulagem Kala Cor Amarelo - 127V": [
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_lk_1200w_220v_1568940851_4cce_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_lk_1200w_220v_1568940851_0e85_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_lk_1200w_220v_1568940851_37fe_600x600.jpg",
  ],
  "Moto Esmeril 6\" 360W MMI-50 Bivolt Motomil - BIVOLT": [
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_360w_mmi_50_220v_motomil_87127166_0001_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_360w_mmi_50_220v_motomil_87127166_0002_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/moto_esmeril_6_360w_mmi_50_220v_motomil_87127166_0004_600x600.jpg",
  ],
  "Lavadora De Alta Pressão Lk1305 1200w C/ Regulagem Kala Cor Amarelo - 220V": [
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_lk_1200w_220v_1568940851_4cce_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_lk_1200w_220v_1568940851_4aea_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_lk_1200w_220v_1568940851_60b0_600x600.jpg",
  ],
  "Parafusadeira/Furadeira a Bateria 20V MAX Lítio 3/8 Pol. com Carregador Bivolt - BIVOLT": [
    "https://img.lojadomecanico.com.br/IMAGENS/21/223/152265/1717422348128.JPG",
    "https://img.lojadomecanico.com.br/IMAGENS/21/223/152265/1756289109410.JPG",
    "https://img.lojadomecanico.com.br/IMAGENS/21/223/152265/1756289109374.JPG",
  ],
  "Aspirador de Pó e Água Acqua Power com Conjunto de Acessórios e Rodas 360° AQP20 1400W 10L Electrolux - 220V": [
    "https://cdn.leroymerlin.com.br/products/aspirador_acqua_power_aqp20_220v_electrolux_89132183_0004_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_acqua_power_aqp20_220v_electrolux_89132183_0006_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_acqua_power_aqp20_220v_electrolux_89132183_0001_600x600.jpg",
  ],
  "WAP Lavadora de Alta Pressão OUSADA PLUS 2200, com Jato Leque e Concentrado, 342L/h, 1750psi 1500W - 220V": [
    "https://m.media-amazon.com/images/I/711W3v-nNpL._AC_SY300_SX300_QL70_ML2_.jpg",
    "https://m.media-amazon.com/images/I/71KJ6qAYdjL._AC_SX679_.jpg",
    "https://m.media-amazon.com/images/I/81-ojH1wIgL._AC_SX679_.jpg",
  ],
  "Lavadora de Alta Pressão Electrolux 1650PSI 1400W EasyWash - 220V": [
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_electrolux_1650psi_1400w_easywash_co_1572230855_a464_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_electrolux_1650psi_1400w_easywash_co_1572230855_eac8_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/lavadora_de_alta_pressao_electrolux_1650psi_1400w_easywash_co_1572230855_06d1_600x600.jpg",
  ],
  "Parafusadeira Furadeira 3/8 Pol. a Bateria 12V com Maleta e Acessórios - BIVOLT": [
    "https://m.media-amazon.com/images/I/61FT94WfQeL._AC_SY300_SX300_QL70_ML2_.jpg",
    "https://m.media-amazon.com/images/I/7132IKbMxjL._AC_SX679_.jpg",
  ],
  "Aspirador de Pó Vertical STK12 1100W Electrolux - 220V": [
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_vertical_stk12_1100w_220v_electrolux_91016142_f0a0_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_vertical_stk12_1100w_220v_electrolux_91016142_338c_600x600.jpg",
    "https://cdn.leroymerlin.com.br/products/aspirador_de_po_vertical_stk12_1100w_220v_electrolux_91016142_92de_600x600.jpg",
  ],
  "Aspirador de Pó 2 em 1 Mondial 1100W Turbo Cycle - AP-36 Vermelho e Preto - 127V(110V)": [
    "https://m.media-amazon.com/images/I/510P6tjT3ZL._AC_SX679_.jpg",
    "https://m.media-amazon.com/images/I/61adicV7Q5L._AC_SX679_.jpg",
  ],
};

const extOf = (url, ct) => {
  if (ct?.includes('webp')) return 'webp';
  if (ct?.includes('png')) return 'png';
  if (ct?.includes('jpeg') || ct?.includes('jpg')) return 'jpg';
  const m = url.split('?')[0].match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
};

async function tryFetch(url) {
  const referer = url.includes('leroymerlin') ? 'https://www.leroymerlin.com.br/'
    : url.includes('ferramentaskennedy') ? 'https://www.ferramentaskennedy.com.br/'
    : url.includes('lojadomecanico') ? 'https://www.lojadomecanico.com.br/'
    : url.includes('kabum') ? 'https://www.kabum.com.br/'
    : url.includes('amazon') ? 'https://www.amazon.com.br/'
    : 'https://www.google.com/';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Referer': referer,
  };
  // try direct
  let res = await fetch(url, { headers });
  if (res.ok) return res;
  // try via wsrv proxy
  const proxied = `https://wsrv.nl/?url=${encodeURIComponent(url)}&n=-1`;
  res = await fetch(proxied);
  if (res.ok) return res;
  // try via images.weserv with no protocol
  const p2 = `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}`;
  res = await fetch(p2);
  return res;
}

async function rehost(url, productId, idx) {
  const res = await tryFetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error(`tiny ${buf.length}`);
  const ct = res.headers.get('content-type') || '';
  const ext = extOf(url, ct);
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
  const path = `products-rehost/${productId}-${idx}-${hash}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: ct || `image/${ext}`,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function main() {
  const names = Object.keys(MAP);
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name')
    .in('name', names);
  if (error) throw error;

  console.log(`Encontrados ${products.length}/${names.length} produtos`);
  const byName = new Map(products.map(p => [p.name, p.id]));

  for (const name of names) {
    const id = byName.get(name);
    if (!id) { console.log(`! Não encontrado: ${name}`); continue; }
    const urls = MAP[name];
    const newUrls = [];
    for (let i = 0; i < urls.length; i++) {
      try {
        const u = await rehost(urls[i], id, i);
        newUrls.push(u);
      } catch (e) {
        console.error(`  ✗ ${name} [${i}]: ${e.message}`);
      }
    }
    if (newUrls.length === 0) { console.log(`✗ ${name}: nenhuma imagem ok`); continue; }
    const { error: upErr } = await supabase.from('products').update({ images: newUrls }).eq('id', id);
    if (upErr) console.error(`  update err: ${upErr.message}`);
    else console.log(`✓ ${name}: ${newUrls.length} imgs`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
