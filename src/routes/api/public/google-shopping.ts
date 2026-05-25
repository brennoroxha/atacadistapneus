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

        const baseUrl = process.env.PUBLIC_URL || "https://atacadistapneus.lovable.app";

        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Atacadista Pneus - Pneus com o Melhor Preço</title>
    <link>${baseUrl}</link>
    <description>Atacado e varejo de pneus para carro, moto, caminhão e mais.</description>`;

        products.forEach((product) => {
          xml += `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${product.name}</g:title>
      <g:description>${product.description || 'Pneu de alta qualidade'}</g:description>
      <g:link>${baseUrl}/pneu/${product.slug ?? product.id}</g:link>
      <g:image_link>${product.images?.[0]}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${(product.stock ?? 0) > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${product.price} BRL</g:price>
      <g:google_product_category>Vehicles Hardware > Building Consumables Parts > Vehicle Parts Hardware > Building Consumables Accessories > Motor Vehicle Parts > Motor Vehicle Tires</g:google_product_category>
      <g:product_type>${product.categories?.name}</g:product_type>
      <g:brand>Atacadista Pneus</g:brand>
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
