-- 1. Extract specs from product names for better descriptions
-- We use regex to pull out Medida (185/65R14), Indice (86T), and Aro (14)
WITH extracted_specs AS (
  SELECT 
    id,
    (regexp_matches(name, '(\d{3}/\d{2}R\d{2})', 'i'))[1] as extracted_medida,
    (regexp_matches(name, '(\d{2,3}[A-Z]{1,2})\s+Aro', 'i'))[1] as extracted_indice,
    (regexp_matches(name, 'Aro\s+(\d{2})', 'i'))[1] as extracted_aro
  FROM products
  WHERE name ~* '\d{3}/\d{2}R\d{2}'
)
UPDATE products p
SET specs = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(p.specs, '{}'::jsonb),
      '{medida}',
      to_jsonb(e.extracted_medida)
    ),
    '{indice_carga}',
    to_jsonb(SUBSTRING(e.extracted_indice FROM '^\d+'))
  ),
  '{indice_velocidade}',
  to_jsonb(SUBSTRING(e.extracted_indice FROM '[A-Z]+$'))
)
FROM extracted_specs e
WHERE p.id = e.id
AND (p.specs->>'medida' IS NULL OR p.specs->>'medida' = '');

-- 2. Refine descriptions using the newly extracted/corrected specs
UPDATE products
SET description = 
  'Pneu ' || COALESCE(specs->>'brand', 'Original') || 
  ' modelo ' || COALESCE(specs->>'modelo', name) || 
  ' | Medida: ' || COALESCE(specs->>'medida', COALESCE(specs->>'largura', '') || '/' || COALESCE(specs->>'altura', '') || 'R' || COALESCE(specs->>'aro', '')) || 
  ' | Aro: ' || COALESCE(specs->>'aro', '') || 
  ' | Índice de carga e velocidade: ' || COALESCE(specs->>'indice_carga', '') || COALESCE(specs->>'indice_velocidade', '') || 
  ' | Tipo de construção: Radial | Montagem: Sem câmara | Tipo de uso: Passeio / Urbano | Produto novo, embalagem original do fabricante.'
WHERE description IS NULL 
   OR description = '' 
   OR description ILIKE '%alta qualidade%' 
   OR description ILIKE '%pneu de alta qualidade%'
   OR description ILIKE '%Medida: /R%';
