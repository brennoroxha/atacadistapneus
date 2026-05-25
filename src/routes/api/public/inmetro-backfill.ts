import { createFileRoute } from "@tanstack/react-router";
import { backfillInmetroRatings } from "@/lib/inmetro.functions";

export const Route = createFileRoute("/api/public/inmetro-backfill")({
  server: {
    handlers: {
      POST: async () => {
        const result = await backfillInmetroRatings();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
