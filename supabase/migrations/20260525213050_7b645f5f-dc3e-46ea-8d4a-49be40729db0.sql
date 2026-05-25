-- Update tires that have incomplete Inmetro info with the example values
UPDATE public.products
SET specs = jsonb_set(
    jsonb_set(
        jsonb_set(specs, '{consumo}', '"E"'),
        '{aderencia}', '"E"'
    ),
    '{ruido_db}', '72'
)
WHERE name ILIKE '%Pneu%'
AND (
    specs->>'consumo' IS NULL 
    OR specs->>'aderencia' IS NULL 
    OR specs->>'ruido_db' IS NULL
    OR specs->>'consumo' = ''
    OR specs->>'aderencia' = ''
);

-- Ensure informacoesTecnicas is also updated to reflect these changes if it exists
UPDATE public.products
SET specs = jsonb_set(
    specs,
    '{informacoesTecnicas}',
    jsonb_build_array(
        jsonb_build_object('texto', 'Consumo: ' || (specs->>'consumo')),
        jsonb_build_object('texto', 'Aderência: ' || (specs->>'aderencia')),
        jsonb_build_object('texto', 'Ruído: ' || (specs->>'ruido_db') || ' dB')
    )
)
WHERE name ILIKE '%Pneu%'
AND specs->'informacoesTecnicas' IS NOT NULL;
