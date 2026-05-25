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

// Statuses from Blackout docs or common payment providers
const PAID_STATUSES = new Set([
  "PAID",
  "APPROVED",
  "CONFIRMED",
  "COMPLETED",
  "SETTLED",
  "SUCCESS",
]);
const REFUND_STATUSES = new Set(["REFUNDED", "CHARGEBACK", "DISPUTED"]);
const CANCEL_STATUSES = new Set(["CANCELED", "CANCELLED", "FAILED", "EXPIRED", "VOIDED", "REFUSED"]);

function normalize(s: unknown): string {
  return String(s ?? "").trim().toUpperCase();
}

function pickId(p: Record<string, unknown>): string | null {
  const data = (p.data ?? p) as Record<string, unknown>;
  // Blackout usually sends ID of the sale/transaction
  const candidate =
    data.id ?? data.sale_id ?? data.transaction_id ?? p.id ?? p.sale_id;
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

export const Route = createFileRoute("/api/public/blackout-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response("ok", { status: 200, headers: { "content-type": "text/plain" } }),

      POST: async ({ request }) => {
        // Validação básica (opcional se Blackout enviar algum secret ou assinar)
        // Por enquanto, aceita secret via header ou query se configurado
        const expected = process.env.BLACKOUT_PRIVATE_KEY;
        if (!expected) {
          console.warn("[blackout-webhook] BLACKOUT_PRIVATE_KEY not set, skipping auth check");
        } else {
          const url = new URL(request.url);
          const provided =
            url.searchParams.get("secret") ||
            request.headers.get("x-webhook-secret") ||
            "";
          // Se o usuário passar um segredo no painel da Blackout, validamos aqui.
          // Se não passar, por enquanto deixamos aberto ou validamos contra o PK se enviado.
          if (provided && provided !== expected) {
            return new Response("Unauthorized", { status: 401 });
          }
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

        console.log("[blackout-webhook] received", { txId, rawStatus, mapped });

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
          .eq("blackout_id", txId);

        if (error) {
          console.error("[blackout-webhook] update error", error);
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
