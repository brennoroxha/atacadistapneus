UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category_id = '8d2e5748-bdb5-4a5f-aa44-83bbd0bcc846'
  AND c.slug = 'tipo-carros-camionete-aro-' || (p.specs->>'aro');