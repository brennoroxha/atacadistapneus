export function generateMetadata({ 
  title, 
  description, 
  image, 
  url 
}: { 
  title: string; 
  description: string; 
  image?: string; 
  url?: string; 
}) {
  const baseUrl = "https://atacadistapneus.lovable.app";
  const fullTitle = `${title} | Atacadista Pneus`;
  
  return {
    title: fullTitle,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:image", content: image || "https://atacadistapneus.lovable.app/og-image.jpg" },
      { property: "og:url", content: url ? `${baseUrl}${url}` : baseUrl },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image || "https://atacadistapneus.lovable.app/og-image.jpg" },
    ],
  };
}
