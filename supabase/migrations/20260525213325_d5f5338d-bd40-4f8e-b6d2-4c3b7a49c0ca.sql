
-- 1) Fix mutable search_path on trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Storage: remove public INSERT to product-images; uploads run server-side with service role (bypasses RLS)
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;

-- 3) No client-side listing/access policies for the comprovantes bucket (server-side only).
-- (No existing comprovantes policies to drop; this is a no-op safeguard documented here.)

-- 4) Lock down server-only tables with RESTRICTIVE deny-all policies for anon/authenticated.
-- The service role bypasses RLS so legitimate server flows keep working.

-- pix_orders
DROP POLICY IF EXISTS "Deny all client access to pix_orders" ON public.pix_orders;
CREATE POLICY "Deny all client access to pix_orders"
ON public.pix_orders
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- app_settings
DROP POLICY IF EXISTS "Deny all client access to app_settings" ON public.app_settings;
CREATE POLICY "Deny all client access to app_settings"
ON public.app_settings
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- watermark_jobs
DROP POLICY IF EXISTS "Deny all client access to watermark_jobs" ON public.watermark_jobs;
CREATE POLICY "Deny all client access to watermark_jobs"
ON public.watermark_jobs
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- orders / order_items: writes happen server-side via admin client; deny direct client writes.
-- Keep existing SELECT-own policies; add restrictive write deny.
DROP POLICY IF EXISTS "Deny client writes to orders" ON public.orders;
CREATE POLICY "Deny client writes to orders"
ON public.orders
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client updates to orders" ON public.orders;
CREATE POLICY "Deny client updates to orders"
ON public.orders
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client writes to order_items" ON public.order_items;
CREATE POLICY "Deny client writes to order_items"
ON public.order_items
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);
