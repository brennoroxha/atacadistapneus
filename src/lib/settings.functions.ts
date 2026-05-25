import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPixGateway = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "pix_gateway")
    .maybeSingle();
  return { gateway: (data?.value as string) || "blackout" };
});
