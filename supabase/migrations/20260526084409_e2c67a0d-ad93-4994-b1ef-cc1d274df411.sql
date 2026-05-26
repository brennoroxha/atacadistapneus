-- Force fix descriptions by extracting data directly from name in the formula using substring
UPDATE products
SET description = 
  'Pneu ' || COALESCE(specs->>'brand', 'Original') || 
  ' modelo ' || COALESCE(specs->>'modelo', name) || 
  ' | Medida: ' || COALESCE(
    substring(name from '(\d{3}/\d{2}R\d{2})'),
    COALESCE(specs->>'medida', COALESCE(specs->>'largura', '') || '/' || COALESCE(specs->>'altura', '') || 'R' || COALESCE(specs->>'aro', ''))
  ) || 
  ' | Aro: ' || COALESCE(substring(name from 'Aro\s+(\d{2})'), COALESCE(specs->>'aro', '')) || 
  ' | Índice de carga e velocidade: ' || COALESCE(
    substring(name from '(\d{2,3}[A-Z]{1,2})\s+Aro'),
    COALESCE(specs->>'indice_carga', '') || COALESCE(specs->>'indice_velocidade', '')
  ) || 
  ' | Tipo de construção: Radial | Montagem: Sem câmara | Tipo de uso: Passeio / Urbano | Produto novo, embalagem original do fabricante.'
WHERE description IS NULL 
   OR description = '' 
   OR description ILIKE '%alta qualidade%' 
   OR description ILIKE '%pneu de alta qualidade%'
   OR description ILIKE '%Medida: %/%R%'
   OR description ILIKE '%Medida: /R%'
   OR name ILIKE '%Firestone F-600%';
