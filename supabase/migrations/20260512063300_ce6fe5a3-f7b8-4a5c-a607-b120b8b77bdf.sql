-- 1) Remove old seed products (Unsplash placeholder URLs)
DELETE FROM public.products WHERE images[1] LIKE 'https://images.unsplash.com/%';

-- 2) Remove products in pneu / bateria / capacete (by category name or product name)
DELETE FROM public.products
WHERE category_id IN (
  SELECT id FROM public.categories
  WHERE name ILIKE '%pneu%'
     OR name ILIKE '%bateria%'
     OR name ILIKE '%capacete%'
)
OR name ILIKE '%pneu%'
OR name ILIKE '%bateria%'
OR name ILIKE '%capacete%';

-- 3) Remove the categories themselves (children first via CASCADE on parent_id)
DELETE FROM public.categories
WHERE name ILIKE '%pneu%'
   OR name ILIKE '%bateria%'
   OR name ILIKE '%capacete%';

-- 4) Remove any categories that no longer have products (cleanup empty)
DELETE FROM public.categories c
WHERE parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.category_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM public.categories s WHERE s.parent_id = c.id);

DELETE FROM public.categories c
WHERE parent_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.category_id = c.id);

-- 5) Populate category image_url from a sample product image
UPDATE public.categories c
SET image_url = sub.img
FROM (
  SELECT DISTINCT ON (category_id) category_id, images[1] AS img
  FROM public.products
  WHERE images IS NOT NULL AND array_length(images,1) > 0
  ORDER BY category_id, created_at DESC
) sub
WHERE c.id = sub.category_id AND (c.image_url IS NULL OR c.image_url = '');

-- For parent categories, inherit image from any child product
UPDATE public.categories p
SET image_url = sub.img
FROM (
  SELECT c.parent_id, MIN(c.image_url) AS img
  FROM public.categories c
  WHERE c.parent_id IS NOT NULL AND c.image_url IS NOT NULL
  GROUP BY c.parent_id
) sub
WHERE p.id = sub.parent_id AND (p.image_url IS NULL OR p.image_url = '');