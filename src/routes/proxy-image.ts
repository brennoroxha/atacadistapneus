import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/proxy-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url).searchParams.get("url");
        if (!url) return new Response("Missing url", { status: 400 });

        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Fetch failed");
          
          const contentType = res.headers.get("Content-Type") || "image/jpeg";
          const buffer = await res.arrayBuffer();

          return new Response(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (e) {
          return new Response("Error fetching image", { status: 500 });
        }
      },
    },
  },
});
