-- 1. Fix encoding issues in product names (remove isolated double quotes)
UPDATE products 
SET name = REPLACE(name, '"', '')
WHERE name LIKE '%"%';

-- 2. Standardize 'brand' in specs based on product name patterns
-- Update brand to manufacturer name for known brands
UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Moura"')
WHERE name ILIKE '%Moura%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Heliar"')
WHERE name ILIKE '%Heliar%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Yuasa"')
WHERE name ILIKE '%Yuasa%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Zetta"')
WHERE name ILIKE '%Zetta%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Duracell"')
WHERE name ILIKE '%Duracell%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Pro Tork"')
WHERE name ILIKE '%Pro Tork%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Levorin"')
WHERE name ILIKE '%Levorin%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Goodride"')
WHERE name ILIKE '%Goodride%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"XBRI"')
WHERE name ILIKE '%XBRI%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Hankook"')
WHERE name ILIKE '%Hankook%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Continental"')
WHERE name ILIKE '%Continental%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Dunlop"')
WHERE name ILIKE '%Dunlop%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Viking"')
WHERE name ILIKE '%Viking%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Pirelli"')
WHERE name ILIKE '%Pirelli%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Firestone"')
WHERE name ILIKE '%Firestone%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Goodyear"')
WHERE name ILIKE '%Goodyear%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Linglong"')
WHERE name ILIKE '%Linglong%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Cooper"')
WHERE name ILIKE '%Cooper%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

UPDATE products
SET specs = jsonb_set(COALESCE(specs, '{}'::jsonb), '{brand}', '"Bridgestone"')
WHERE name ILIKE '%Bridgestone%' AND (specs->>'brand' IS NULL OR specs->>'brand' = 'R&A Atacadista');

-- 3. Enhance generic descriptions
UPDATE products
SET description = 
  'Pneu ' || COALESCE(specs->>'brand', 'Original') || 
  ' modelo ' || COALESCE(specs->>'modelo', name) || 
  ' | Medida: ' || COALESCE(specs->>'largura', '') || '/' || COALESCE(specs->>'altura', '') || 'R' || COALESCE(specs->>'aro', '') || 
  ' | Aro: ' || COALESCE(specs->>'aro', '') || 
  ' | Índice de carga e velocidade: ' || COALESCE(specs->>'indice_carga', '') || COALESCE(specs->>'indice_velocidade', '') || 
  ' | Tipo de construção: Radial | Montagem: Sem câmara | Tipo de uso: Passeio / Urbano | Produto novo, embalagem original do fabricante.'
WHERE description IS NULL 
   OR description = '' 
   OR description ILIKE '%alta qualidade%' 
   OR description ILIKE '%pneu de alta qualidade%'
   OR name ILIKE '%Firestone F-600%'
   OR name ILIKE '%Xbri Ecology%'
   OR name ILIKE '%Xbri Sport +2%'
   OR name ILIKE '%Goodride RP28%'
   OR name ILIKE '%Linglong Crosswind%'
   OR name ILIKE '%Cooper CS1%'
   OR name ILIKE '%Linglong Green-Max%'
   OR name ILIKE '%Goodyear Assurance MaxLife%'
   OR name ILIKE '%Pirelli Cinturato P7%'
   OR name ILIKE '%Viking CityTech II%';
