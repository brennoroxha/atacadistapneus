-- Function to extract value from informacoesTecnicas array
CREATE OR REPLACE FUNCTION public.extract_spec_value(specs JSONB, prefix TEXT)
RETURNS TEXT AS $$
DECLARE
    item JSONB;
BEGIN
    IF specs ? 'informacoesTecnicas' AND jsonb_typeof(specs->'informacoesTecnicas') = 'array' THEN
        FOR item IN SELECT * FROM jsonb_array_elements(specs->'informacoesTecnicas')
        LOOP
            IF item->>'texto' LIKE prefix || '%' THEN
                RETURN trim(replace(replace(item->>'texto', prefix, ''), ':', ''));
            END IF;
        END LOOP;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update products to move nested specs to top level
UPDATE public.products
SET specs = specs || 
    jsonb_build_object(
        'consumo', COALESCE(specs->>'consumo', extract_spec_value(specs, 'Consumo')),
        'aderencia', COALESCE(specs->>'aderencia', extract_spec_value(specs, 'Aderência')),
        'ruido_db', COALESCE(
            specs->>'ruido_db', 
            regexp_replace(extract_spec_value(specs, 'Ruído'), '[^0-9]', '', 'g')
        )
    )
WHERE 
    name ILIKE '%Pneu%' AND
    (
        (specs->>'consumo' IS NULL AND extract_spec_value(specs, 'Consumo') IS NOT NULL) OR
        (specs->>'aderencia' IS NULL AND extract_spec_value(specs, 'Aderência') IS NOT NULL) OR
        (specs->>'ruido_db' IS NULL AND extract_spec_value(specs, 'Ruído') IS NOT NULL)
    );

DROP FUNCTION public.extract_spec_value(JSONB, TEXT);
