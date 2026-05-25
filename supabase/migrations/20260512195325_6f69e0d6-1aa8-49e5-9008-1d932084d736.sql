
-- Remover policies abertas
DROP POLICY IF EXISTS "public_insert_pix_orders" ON public.pix_orders;
DROP POLICY IF EXISTS "public_update_pix_orders" ON public.pix_orders;
DROP POLICY IF EXISTS "public_upload_comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "public_read_comprovantes" ON storage.objects;

-- Função com search_path fixo
CREATE OR REPLACE FUNCTION public.touch_pix_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
