import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PUSHCUT_PENDING = "https://api.pushcut.io/kXDRvo3PGVEtZP-rSrB8Q/notifications/Pendente%20Comercial";
const PUSHCUT_PAID = "https://api.pushcut.io/kXDRvo3PGVEtZP-rSrB8Q/notifications/Aprovado%20Comercial";

async function notifyPushcut(url: string) {
  try {
    await fetch(url, { method: "POST" });
  } catch (e) {
    console.error("Pushcut notify error", e);
  }
}

const FREEPAY_PUBLIC_KEY = "freepay_live_TWY2K3e3qQyiTwN1AV4HjOOI8vvKTosq";
const FREEPAY_BASE = "https://api.freepaybrasil.com/v1";

function authHeader() {
  const secret = process.env.FREEPAY_SECRET_KEY;
  if (!secret) throw new Error("FREEPAY_SECRET_KEY ausente");
  const token = Buffer.from(`${FREEPAY_PUBLIC_KEY}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

const itemSchema = z.object({
  title: z.string().min(1).max(120),
  unit_price: z.number().int().positive(),
  quantity: z.number().int().positive(),
  tangible: z.boolean().default(true),
});

const createPixSchema = z.object({
  amount: z.number().int().positive(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    document: z.string().min(11),
  }),
  items: z.array(itemSchema).min(1),
});

export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => createPixSchema.parse(d))
  .handler(async ({ data }) => {
    const docDigits = data.customer.document.replace(/\D/g, "");
    const phoneDigits = data.customer.phone.replace(/\D/g, "");

    const body = {
      amount: data.amount,
      payment_method: "pix",
      metadata: { source: "construmais-checkout" },
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        phone: phoneDigits,
        document: {
          type: docDigits.length > 11 ? "cnpj" : "cpf",
          number: docDigits,
        },
      },
      items: data.items.map((i) => ({
        title: i.title,
        unit_price: i.unit_price,
        quantity: i.quantity,
        tangible: i.tangible,
      })),
    };

    const res = await fetch(`${FREEPAY_BASE}/payment-transaction/create`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.success) {
      console.error("FreePay create error", res.status, json);
      throw new Error(
        json?.errors?.[0]?.message ||
          json?.title ||
          `Falha ao criar pagamento PIX (${res.status})`,
      );
    }

    // Notificar Pushcut de novo PIX gerado
    await notifyPushcut(PUSHCUT_PENDING);

    const tx = json.data;
    return {
      id: tx.id as string,
      status: tx.status as string,
      qrCode: tx.pix?.qr_code as string,
      expiresAt: tx.pix?.expiration_date as string | null,
    };
  });

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(
        `${FREEPAY_BASE}/payment-transaction/${data.id}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader(),
            Accept: "application/json",
          },
        },
      );
      if (!res.ok) {
        // FreePay rejects status polling for some keys — treat as pending
        // and rely on webhook/postback for final confirmation.
        return { status: "PENDING" as string };
      }
      const json = await res.json().catch(() => ({}));
      return { status: (json?.data?.status ?? "PENDING") as string };
    } catch {
      return { status: "PENDING" as string };
    }
  });
