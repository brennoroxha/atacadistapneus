ALTER TABLE public.pix_orders ADD COLUMN ironpay_id TEXT;
CREATE INDEX idx_pix_orders_ironpay_id ON public.pix_orders(ironpay_id);