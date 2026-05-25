import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const esc = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) {
    const inner = v.map(x => '"' + String(x).replace(/\\/g,'\\\\').replace(/"/g,'\\"') + '"').join(',');
    return "'{" + inner.replace(/'/g,"''") + "}'";
  }
  if (typeof v === 'object') return "'" + JSON.stringify(v).replace(/'/g,"''") + "'::jsonb";
  return "'" + String(v).replace(/'/g,"''") + "'";
};

const dumpTable = async (table, cols) => {
  let all = [], from = 0, size = 1000;
  while (true) {
    const { data, error } = await sb.from(table).select(cols.join(',')).range(from, from + size - 1);
    if (error) throw error;
    all.push(...data);
    if (data.length < size) break;
    from += size;
  }
  let sql = `-- ${table}: ${all.length} rows\nTRUNCATE public.${table} CASCADE;\n`;
  for (const row of all) {
    const vals = cols.map(c => esc(row[c])).join(', ');
    sql += `INSERT INTO public.${table} (${cols.join(', ')}) VALUES (${vals});\n`;
  }
  return sql;
};

let out = `-- Backup gerado em ${new Date().toISOString()}\n-- Restaure em outro projeto Lovable Cloud (mesmo schema)\nBEGIN;\n\n`;
out += await dumpTable('categories', ['id','name','slug','image_url','parent_id','created_at']);
out += '\n';
out += await dumpTable('products', ['id','slug','name','description','price','stock','images','sku','gtin','specs','featured','category_id','created_at','updated_at']);
out += '\nCOMMIT;\n';
fs.writeFileSync('/mnt/documents/backup-produtos-categorias.sql', out);
console.log('OK', out.length, 'bytes');
