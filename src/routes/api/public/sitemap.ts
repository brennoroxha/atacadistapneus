import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/api/public/sitemap")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = process.env.PUBLIC_URL || "https://atacadistapneus.com";
        const staticPages = [
          "",
          "/products",
          "/about",
          "/contact",
          "/privacy",
          "/terms",
          "/refund-policy",
          "/shipping-policy",
          "/faq",
        ];

        let allProducts: any[] = [];
        let from = 0;
        const limit = 1000;
        
        while (true) {
          const { data, error } = await supabase
            .from("products")
            .select("slug, id")
            .range(from, from + limit - 1);
            
          if (error || !data || data.length === 0) break;
          allProducts = [...allProducts, ...data];
          if (data.length < limit) break;
          from += limit;
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("")}
  ${allProducts.map(product => `
  <url>
    <loc>${baseUrl}/pneu/${product.slug ?? product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join("")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
          },
        });
      },
    },
  },
});