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

const BLACKOUT_BASE = "https://api.blackpayments.pro/v1";

function authHeader() {
  const secret = process.env.BLACKOUT_PRIVATE_KEY;
  if (!secret) throw new Error("BLACKOUT_PRIVATE_KEY ausente");
  // Basic Auth: base64("x:sk_...")  — formato fornecido pela Blackout
  const token = Buffer.from(`x:${secret}`).toString("base64");
  return `Basic ${token}`;
}

const itemSchema = z.object({
  title: z.string().min(1).max(120),
  unit_price: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const createBlackoutSaleSchema = z.object({
  amount: z.number().int().positive(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    document: z.string().min(11),
  }),
  items: z.array(itemSchema).min(1),
});

export const createBlackoutPixPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => createBlackoutSaleSchema.parse(d))
  .handler(async ({ data }) => {
    const docDigits = data.customer.document.replace(/\D/g, "");
    const phoneDigits = data.customer.phone.replace(/\D/g, "");

    const body = {
      amount: data.amount,
      paymentMethod: "pix",
      pix: {
        expiresInDays: 1,
      },
      items: data.items.map((i) => ({
        title: i.title,
        unitPrice: i.unit_price,
        quantity: i.quantity,
        tangible: true,
      })),
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        phone: phoneDigits,
        document: {
          type: docDigits.length > 11 ? "cnpj" : "cpf",
          number: docDigits,
        },
      },
    };

    const res = await fetch(`${BLACKOUT_BASE}/transactions`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      console.error("Blackout create error", res.status, json);
      throw new Error(
        json?.message ||
          json?.errors?.[0]?.message ||
          `Falha ao criar pagamento PIX na Blackout (${res.status})`,
      );
    }

    // Notificar Pushcut de novo PIX gerado
    await notifyPushcut(PUSHCUT_PENDING);

    // Resposta: id, status, pix.qrcode, pix.expirationDate (camelCase)
    return {
      id: String(json.id ?? json.data?.id),
      status: String(json.status ?? json.data?.status ?? "pending"),
      qrCode: (json.pix?.qrcode ?? json.pix?.qrCode ?? json.data?.pix?.qrcode) as string,
      expiresAt: (json.pix?.expirationDate ?? json.data?.pix?.expirationDate ?? null) as string | null,
    };
  });

export const getBlackoutStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`${BLACKOUT_BASE}/transactions/${data.id}`, {
        method: "GET",
        headers: {
          Authorization: authHeader(),
          Accept: "application/json",
        },
      });
      if (!res.ok) return { status: "pending" };
      const json = await res.json().catch(() => ({} as any));
      return { status: String(json?.status ?? json?.data?.status ?? "pending").toLowerCase() };
    } catch {
      return { status: "pending" };
    }
  });
