import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "\"": return "&quot;";
      case "'": return "&apos;";
      default: return c;
    }
  });
}

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = process.env.PUBLIC_URL || "https://atacadistapneus.com";
        let allProducts: any[] = [];
        let from = 0;
        const limit = 1000;

        while (true) {
          const { data, error } = await supabase
            .from("products")
            .select("*, categories(name)")
            .range(from, from + limit - 1);

          if (error || !data || data.length === 0) break;
          allProducts = [...allProducts, ...data];
          if (data.length < limit) break;
          from += limit;
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Atacadista Pneus</title>
    <link>${baseUrl}</link>
    <description>Atacado e varejo de pneus para carro, moto, caminhão e mais.</description>`;

        allProducts.forEach((product) => {
          const availability = (product.stock ?? 0) > 0 ? "in_stock" : "out_of_stock";
          const title = escapeXml(product.name);
          const description = escapeXml(product.description || "Pneu de alta qualidade");
          const brand = escapeXml(product.specs?.marca || "R&A Atacadista");
          const slug = product.slug ?? product.id;

          xml += `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${baseUrl}/pneu/${slug}</g:link>
      <g:image_link>${product.images?.[0] || ""}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${Number(product.price).toFixed(2)} BRL</g:price>
      <g:google_product_category>5613</g:google_product_category>
      <g:brand>${brand}</g:brand>`;

          if (product.gtin) {
            xml += `
      <g:gtin>${escapeXml(product.gtin)}</g:gtin>`;
          }

          if (product.sku) {
            xml += `
      <g:mpn>${escapeXml(product.sku)}</g:mpn>`;
          }

          if (!product.gtin && !product.sku) {
            xml += `
      <g:identifier_exists>no</g:identifier_exists>`;
          }

          xml += `
      <g:shipping>
        <g:country>BR</g:country>
        <g:service>Padrão</g:service>
        <g:price>0.00 BRL</g:price>
      </g:shipping>
    </item>`;
        });

        xml += `
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
