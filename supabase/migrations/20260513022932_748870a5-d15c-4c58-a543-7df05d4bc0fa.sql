ALTER TABLE public.pix_orders ADD COLUMN IF NOT EXISTS blackout_id TEXT;
CREATE INDEX IF NOT EXISTS idx_pix_orders_blackout_id ON public.pix_orders(blackout_id);