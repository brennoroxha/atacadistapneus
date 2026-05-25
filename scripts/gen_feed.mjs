import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BASE = 'https://comercialferragens.site';

const esc = (s='') => String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&apos;');

const stripHtml = (s='') => String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

async function main() {
  let all = [];
  let from = 0;
  const size = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, description, price, stock, sku, gtin, images, categories(name)')
      .range(from, from + size - 1);
    if (error) throw error;
    all = all.concat(data);
    if (data.length < size) break;
    from += size;
  }
  console.log(`Produtos: ${all.length}`);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Comercial Ferragens</title>
    <link>${BASE}</link>
    <description>Materiais de construção, ferramentas e utilidades.</description>`;

  for (const p of all) {
    const desc = stripHtml(p.description || p.name).slice(0, 4900) || p.name;
    const img = p.images?.[0] || '';
    const avail = (p.stock ?? 0) > 0 ? 'in_stock' : 'out_of_stock';
    const price = Number(p.price).toFixed(2);
    xml += `
    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name.slice(0,150))}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${BASE}/products/${p.id}</g:link>
      <g:image_link>${esc(img)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${avail}</g:availability>
      <g:price>${price} BRL</g:price>
      <g:brand>Comercial Ferragens</g:brand>
      <g:product_type>${esc(p.categories?.name || 'Geral')}</g:product_type>
      <g:google_product_category>Hardware</g:google_product_category>
      ${p.sku ? `<g:mpn>${esc(p.sku)}</g:mpn>` : '<g:identifier_exists>no</g:identifier_exists>'}
      ${p.gtin ? `<g:gtin>${esc(p.gtin)}</g:gtin>` : ''}
      <g:shipping>
        <g:country>BR</g:country>
        <g:service>Padrão</g:service>
        <g:price>0.00 BRL</g:price>
      </g:shipping>
    </item>`;
  }
  xml += `
  </channel>
</rss>`;

  fs.writeFileSync('/mnt/documents/google-shopping-feed.xml', xml);
  console.log('OK', xml.length, 'bytes');
}
main().catch(e => { console.error(e); process.exit(1); });
