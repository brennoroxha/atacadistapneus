import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PUSHCUT_PAID = "https://api.pushcut.io/kXDRvo3PGVEtZP-rSrB8Q/notifications/Aprovado%20Comercial";

async function notifyPushcut(url: string) {
  try {
    await fetch(url, { method: "POST" });
  } catch (e) {
    console.error("Pushcut notify error", e);
  }
}

const PAID_STATUSES = new Set([
  "PAID",
  "APPROVED",
  "CONFIRMED",
  "COMPLETED",
  "SETTLED",
  "PAID_OUT",
]);
const REFUND_STATUSES = new Set(["REFUNDED", "CHARGEBACK", "DISPUTED"]);
const CANCEL_STATUSES = new Set(["CANCELED", "CANCELLED", "FAILED", "EXPIRED", "VOIDED"]);

function normalize(s: unknown): string {
  return String(s ?? "").trim().toUpperCase();
}

function pickId(p: Record<string, unknown>): string | null {
  const data = (p.data ?? p) as Record<string, unknown>;
  const candidate =
    data.id ?? data.transaction_id ?? data.transactionId ?? p.id ?? p.transaction_id;
  return candidate ? String(candidate) : null;
}

function pickStatus(p: Record<string, unknown>): string {
  const data = (p.data ?? p) as Record<string, unknown>;
  return normalize(data.status ?? p.status ?? p.event ?? data.event);
}

function mapStatus(raw: string): "PAID" | "PENDING" | "REFUNDED" | "CANCELED" | null {
  if (!raw) return null;
  if (PAID_STATUSES.has(raw)) return "PAID";
  if (REFUND_STATUSES.has(raw)) return "REFUNDED";
  if (CANCEL_STATUSES.has(raw)) return "CANCELED";
  if (raw === "PENDING" || raw === "WAITING_PAYMENT" || raw === "PROCESSING") return "PENDING";
  return null;
}

export const Route = createFileRoute("/api/public/freepay-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response("ok", { status: 200, headers: { "content-type": "text/plain" } }),

      POST: async ({ request }) => {
        // Validação de segredo: aceita ?secret= ou header x-webhook-secret
        const expected = process.env.FREEPAY_SECRET_KEY;
        if (!expected) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const url = new URL(request.url);
        const provided =
          url.searchParams.get("secret") ||
          request.headers.get("x-webhook-secret") ||
          "";
        if (provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: Record<string, unknown> = {};
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const txId = pickId(payload);
        const rawStatus = pickStatus(payload);
        const mapped = mapStatus(rawStatus);

        console.log("[freepay-webhook]", { txId, rawStatus, mapped });

        if (!txId) {
          return new Response(JSON.stringify({ ok: false, error: "missing transaction id" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        if (!mapped) {
          // Status desconhecido — registra mas não atualiza
          return new Response(JSON.stringify({ ok: true, ignored: rawStatus || "unknown" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        const update: { status: string; flagged?: string | null } = { status: mapped };
        if (mapped === "PAID") {
          update.flagged = null; // pagamento confirmado limpa alerta de desvio
          // Notificar Pushcut de pagamento aprovado
          await notifyPushcut(PUSHCUT_PAID);
        }

        const { error } = await supabaseAdmin
          .from("pix_orders")
          .update(update)
          .eq("freepay_id", txId);

        if (error) {
          console.error("[freepay-webhook] update error", error);
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ ok: true, transaction: txId, status: mapped }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
