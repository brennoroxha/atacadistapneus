const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  fs.writeFileSync('/tmp/db_products.json', JSON.stringify(data, null, 2));
  console.log(`Exported ${data.length} products to /tmp/db_products.json`);
}

exportProducts();
