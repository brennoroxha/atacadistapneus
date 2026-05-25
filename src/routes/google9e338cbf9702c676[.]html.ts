import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/google9e338cbf9702c676.html")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          "google-site-verification: google9e338cbf9702c676.html",
          {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      },
    },
  },
});
