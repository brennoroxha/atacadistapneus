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

export const Route = createFileRoute("/feed-1.xml")({
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

        const part1 = allProducts.slice(0, Math.ceil(allProducts.length / 2));

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" xmlns:c="http://base.google.com/cns/1.0" version="2.0">
<channel>
<title><![CDATA[Atacadista Pneus - Parte 1]]></title>
<link><![CDATA[${baseUrl}/]]></link>
<description><![CDATA[Feed Parte 1]]></description>`;

        part1.forEach((product) => {
          const title = product.name;
          const description = product.description || "Pneu de alta qualidade";
          const brand = product.specs?.brand || product.specs?.marca || "R&A Atacadista";
          const slug = product.slug ?? product.id;
          const mainImage = (product.images?.[0] || "").startsWith("http") 
            ? product.images[0] 
            : `${baseUrl}${product.images?.[0] || ""}`;

          xml += `
<item>
  <g:id>${product.id}</g:id>
  <g:title><![CDATA[${title}]]></g:title>
  <g:description><![CDATA[${description}]]></g:description>
  <g:link>${baseUrl}/pneu/${slug}</g:link>
  <g:image_link>${mainImage}</g:image_link>
  <g:condition>new</g:condition>
  <g:price>${Number(product.price).toFixed(2)} BRL</g:price>
  <g:brand><![CDATA[${brand}]]></g:brand>`;

          if (product.gtin) {
            xml += `
  <g:gtin>${escapeXml(product.gtin)}</g:gtin>`;
          }

          if (product.images && product.images.length > 1) {
            product.images.slice(1, 10).forEach((img: string) => {
              const additionalImage = img.startsWith("http") ? img : `${baseUrl}${img}`;
              xml += `
  <g:additional_image_link>${additionalImage}</g:additional_image_link>`;
            });
          }

          if (product.gtin || product.sku) {
            xml += `
  <g:identifier_exists>yes</g:identifier_exists>`;
          } else {
            xml += `
  <g:identifier_exists>no</g:identifier_exists>`;
          }

          xml += `
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
