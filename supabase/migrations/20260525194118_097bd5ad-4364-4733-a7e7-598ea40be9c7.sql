UPDATE products SET images = ARRAY[CASE
  WHEN name ILIKE '%apollo%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/66b3f18c295f26a05419dba94f41cad5.jpg'
  WHEN name ILIKE '%barum%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/BARUM_15409340000.jpg'
  WHEN name ILIKE '%continental%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/repairs/pneu-175-70r14-continental-contipowercontact-2-aro-14-84t-12500.jpg'
  WHEN name ILIKE '%cooper%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/certf-1.jpg'
  WHEN name ILIKE '%firestone%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/pqpq.jpg'
  WHEN name ILIKE '%goodride%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/repairs/pneu-aro-17-goodride-205-40zr17-84w-sa07-extra-load-12736.jpg'
  WHEN name ILIKE '%goodyear%' OR name ILIKE '%kelly%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/0b409f2a33c8d8903f824c1af728afb9-2.jpg'
  WHEN name ILIKE '%kumho%' OR name ILIKE '%zetum%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/pneu-kumho-aro-13-ecowing-es31-175-70r13-82t-1.jpg'
  WHEN name ILIKE '%linglong%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/21338120_1SZ.jpg'
  WHEN name ILIKE '%pirelli%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/repairs/pneu-175-70r13-pirelli-formula-energy-aro-13-82t-12619.jpg'
  WHEN name ILIKE '%viking%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/31128325_1GG.jpg'
  WHEN name ILIKE '%westlake%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/pneu-20560r15-91h-westlake-zupereco-z108-1.webp'
  WHEN name ILIKE '%xbri%' THEN 'https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/product-images/repairs/pneu-aro-14-ecology-82h-185-60-xbri-12633.jpg'
END]
WHERE (images IS NULL OR array_length(images,1) IS NULL)
  AND (name ILIKE '%apollo%' OR name ILIKE '%barum%' OR name ILIKE '%continental%'
    OR name ILIKE '%cooper%' OR name ILIKE '%firestone%' OR name ILIKE '%goodride%'
    OR name ILIKE '%goodyear%' OR name ILIKE '%kelly%' OR name ILIKE '%kumho%'
    OR name ILIKE '%zetum%' OR name ILIKE '%linglong%' OR name ILIKE '%pirelli%'
    OR name ILIKE '%viking%' OR name ILIKE '%westlake%' OR name ILIKE '%xbri%');