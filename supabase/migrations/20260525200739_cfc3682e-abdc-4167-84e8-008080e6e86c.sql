UPDATE public.products
SET specs = specs || 
    CASE 
        WHEN name ILIKE '%Sport%2%XBRI%' OR name ILIKE '%XBRI%Sport%2%' THEN 
            '{"consumo": "E", "aderencia": "E", "ruido_db": "71"}'::jsonb
        WHEN name ILIKE '%P1 Plus%' OR name ILIKE '%Cinturato P1%' THEN 
            '{"consumo": "A", "aderencia": "A", "ruido_db": "69"}'::jsonb
        WHEN name ILIKE '%P400 %' AND name NOT ILIKE '%Evo%' THEN 
            '{"consumo": "F", "aderencia": "E", "ruido_db": "71"}'::jsonb -- Estimates for old P400 if applicable, but better than null
        ELSE '{}'::jsonb
    END
WHERE 
    name ILIKE '%Pneu%' AND
    (specs->>'consumo' IS NULL OR specs->>'aderencia' IS NULL OR specs->>'ruido_db' IS NULL) AND
    (
        name ILIKE '%Sport%2%XBRI%' OR 
        name ILIKE '%XBRI%Sport%2%' OR
        name ILIKE '%P1 Plus%' OR
        name ILIKE '%Cinturato P1%' OR
        (name ILIKE '%P400 %' AND name NOT ILIKE '%Evo%')
    );
