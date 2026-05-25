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

  for (const product of products) {
    const newImages = [];
    let updated = false;

    for (const imageUrl of product.images) {
      if (imageUrl.includes('cdn.jsdelivr.net')) {
        const fileName = imageUrl.split('/').pop();
        console.log(`Processing ${fileName}...`);

        try {
          // Download image
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
          const buffer = await response.arrayBuffer();

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, buffer, {
              upsert: true,
              contentType: response.headers.get('content-type') || 'image/jpeg'
            });

          if (uploadError) {
            console.error(`Error uploading ${fileName}:`, uploadError);
            newImages.push(imageUrl); // Keep original if upload fails
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
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.gtin}:`, updateError);
      } else {
        console.log(`Successfully updated product ${product.gtin}`);
      }
    }
  }
}

migrateImages();
