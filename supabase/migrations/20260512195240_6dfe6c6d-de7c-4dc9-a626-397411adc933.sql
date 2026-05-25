
-- Pedidos PIX
CREATE TABLE public.pix_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freepay_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_document TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING',
  comprovante_url TEXT,
  comprovante_uploaded_at TIMESTAMPTZ,
  flagged TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pix_orders_created_at_idx ON public.pix_orders (created_at DESC);
CREATE INDEX pix_orders_status_idx ON public.pix_orders (status);

ALTER TABLE public.pix_orders ENABLE ROW LEVEL SECURITY;

-- Inserir é público (criação do PIX no checkout, já validada via server fn)
CREATE POLICY "public_insert_pix_orders" ON public.pix_orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Atualizar (anexar comprovante) também é público; server fn restringe
CREATE POLICY "public_update_pix_orders" ON public.pix_orders
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- SELECT bloqueado para clientes (admin usa service role via server fn)

CREATE OR REPLACE FUNCTION public.touch_pix_orders_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER pix_orders_set_updated_at
  BEFORE UPDATE ON public.pix_orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_pix_orders_updated_at();

-- Bucket de comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes', 'comprovantes', true)
ON CONFLICT (id) DO NOTHING;

-- Upload público (qualquer pessoa pode enviar — nome do arquivo carrega o id do pedido)
CREATE POLICY "public_upload_comprovantes" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'comprovantes');

CREATE POLICY "public_read_comprovantes" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'comprovantes');
