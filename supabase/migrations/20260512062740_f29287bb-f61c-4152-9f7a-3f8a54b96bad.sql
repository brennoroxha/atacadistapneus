CREATE UNIQUE INDEX IF NOT EXISTS products_slug_uniq ON public.products(slug);
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_uniq ON public.products(sku);