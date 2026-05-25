import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateImages() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, gtin, images')
    .not('images', 'is', null);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products to process`);

  // Process products in batches of 5 to avoid overloading
  const batchSize = 5;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1}...`);
    
    await Promise.all(batch.map(async (product) => {
      const newImages = [];
      let updated = false;

      for (const imageUrl of product.images) {
        if (imageUrl.includes('cdn.jsdelivr.net')) {
          const fileName = imageUrl.split('/').pop();

          try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
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
    }));
  }
  console.log('Migration finished!');
}

migrateImages();
