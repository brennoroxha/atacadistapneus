UPDATE public.products
SET specs = specs || 
    CASE 
        WHEN name ILIKE '%Sport %2%XBRI%' OR name ILIKE '%XBRI%Sport %2%' THEN 
            '{"consumo": "E", "aderencia": "E", "ruido_db": "71"}'::jsonb
        WHEN name ILIKE '%Cooper CS1%' THEN 
            '{"consumo": "E", "aderencia": "E", "ruido_db": "70"}'::jsonb
        WHEN name ILIKE '%Apollo Amazer 4G Eco%' THEN 
            '{"consumo": "C", "aderencia": "B", "ruido_db": "70"}'::jsonb
        WHEN name ILIKE '%Cinturato P1 Plus%' THEN 
            '{"consumo": "A", "aderencia": "A", "ruido_db": "69"}'::jsonb
        WHEN name ILIKE '%ContiPowerContact%' THEN 
            '{"consumo": "C", "aderencia": "C", "ruido_db": "72"}'::jsonb
        WHEN name ILIKE '%P400 Evo%' THEN 
            '{"consumo": "E", "aderencia": "E", "ruido_db": "73"}'::jsonb
        WHEN name ILIKE '%Ecology%XBRI%' AND name LIKE '%185/60%14%' THEN 
            '{"consumo": "E", "aderencia": "C", "ruido_db": "69"}'::jsonb
        ELSE '{}'::jsonb
    END
WHERE 
    name ILIKE '%Pneu%' AND
    (specs->>'consumo' IS NULL OR specs->>'aderencia' IS NULL OR specs->>'ruido_db' IS NULL) AND
    (
        name ILIKE '%Sport %2%XBRI%' OR 
        name ILIKE '%XBRI%Sport %2%' OR
        name ILIKE '%Cooper CS1%' OR
        name ILIKE '%Apollo Amazer 4G Eco%' OR
        name ILIKE '%Cinturato P1 Plus%' OR
        name ILIKE '%ContiPowerContact%' OR
        name ILIKE '%P400 Evo%' OR
        (name ILIKE '%Ecology%XBRI%' AND name LIKE '%185/60%14%')
    );
