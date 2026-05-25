import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function isValidEAN13(s) {
  if (!/^\d{13}$/.test(s)) return false;
  const d = s.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += d[i] * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10 === d[12];
}
function isValidEAN8(s) {
  if (!/^\d{8}$/.test(s)) return false;
  const d = s.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += d[i] * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === d[7];
}

const { data, error } = await supabase
  .from('products')
  .select('id, sku, gtin')
  .or('gtin.is.null,gtin.eq.');
if (error) throw error;

let valid = 0, invalid = 0, updated = 0, fail = 0;
for (const p of data) {
  if (!p.sku) continue;
  const sku = p.sku.trim();
  if (isValidEAN13(sku) || isValidEAN8(sku) || /^\d{12}$/.test(sku) || /^\d{14}$/.test(sku)) {
    valid++;
    const { error: e } = await supabase.from('products').update({ gtin: sku }).eq('id', p.id);
    if (e) { fail++; console.error(e.message); } else updated++;
  } else if (/^\d{8,14}$/.test(sku)) {
    invalid++;
  }
}
console.log(`Validados: ${valid}, atualizados: ${updated}, falhas: ${fail}, numeros invalidos (checksum): ${invalid}`);
