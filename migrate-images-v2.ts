import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function migrateImages() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, gtin, images')
    .not('images', 'is', null);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  const pendingProducts = products.filter(p => p.images.some(img => img.includes('cdn.jsdelivr.net')));
  console.log(`Found ${pendingProducts.length} products still using CDN`);

  for (const product of pendingProducts) {
    const newImages = [];
    let updated = false;

    console.log(`Processing product ${product.gtin}...`);

    for (const imageUrl of product.images) {
      if (imageUrl.includes('cdn.jsdelivr.net')) {
        const fileName = imageUrl.split('/').pop();

        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.error(`Failed to download ${imageUrl}: ${response.statusText}`);
            newImages.push(imageUrl);
            continue;
          }
          const buffer = await response.arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, buffer, {
              upsert: true,
              contentType: response.headers.get('content-type') || 'image/jpeg'
            });

          if (uploadError) {
            console.error(`Error uploading ${fileName}:`, uploadError);
            newImages.push(imageUrl);
          } else {
            const newUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}`;
            newImages.push(newUrl);
            updated = true;
          }
          await delay(200); // Small delay to avoid rate limiting
        } catch (e) {
          console.error(`Failed to process ${imageUrl}:`, e);
          newImages.push(imageUrl);
        }
      } else {
        newImages.push(imageUrl);
      }
    }

    if (updated) {
      await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', product.id);
    }
  }
  console.log('Migration attempt finished!');
}

migrateImages();
