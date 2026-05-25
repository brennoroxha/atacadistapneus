import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/api/public/google-shopping")({
  server: {
    handlers: {
      GET: async () => {
        const { data: products } = await supabase
          .from("products")
          .select("*, categories(name)");

        if (!products) return new Response("No products", { status: 404 });

        const baseUrl = process.env.PUBLIC_URL || "https://construmais.com.br";

        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>ConstruMais - Materiais de Construção</title>
    <link>${baseUrl}</link>
    <description>A maior loja de materiais de construção online.</description>`;

        products.forEach((product) => {
          xml += `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${product.name}</g:title>
      <g:description>${product.description || 'Material de construção de alta qualidade'}</g:description>
      <g:link>${baseUrl}/pneu/${product.slug ?? product.id}</g:link>
      <g:image_link>${product.images?.[0]}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${(product.stock ?? 0) > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${product.price} BRL</g:price>
      <g:google_product_category>Hardware > Building Consumables</g:google_product_category>
      <g:product_type>${product.categories?.name}</g:product_type>
      <g:brand>ConstruMais</g:brand>
      <g:mpn>${product.sku}</g:mpn>
      <g:gtin>${product.gtin}</g:gtin>
    </item>`;
        });

        xml += `
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
          },
        });
      },
    },
  },
});
