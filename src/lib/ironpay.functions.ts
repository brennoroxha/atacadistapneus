import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PUSHCUT_PENDING = "https://api.pushcut.io/kXDRvo3PGVEtZP-rSrB8Q/notifications/Pendente%20Comercial";

async function notifyPushcut(url: string) {
  try {
    await fetch(url, { method: "POST" });
  } catch (e) {
    console.error("Pushcut notify error", e);
  }
}

const IRONPAY_BASE = "https://api.ironpay.com.br/api/v1";

function authHeader() {
  const token = process.env.IRONPAY_TOKEN;
  if (!token) throw new Error("IRONPAY_TOKEN ausente");
  return `Bearer ${token}`;
}

const itemSchema = z.object({
  title: z.string().min(1).max(120),
  unit_price: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const createIronPaySchema = z.object({
  amount: z.number().int().positive(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    document: z.string().min(11),
  }),
  items: z.array(itemSchema).min(1),
});

export const createIronPayPixPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => createIronPaySchema.parse(d))
  .handler(async ({ data }) => {
    const docDigits = data.customer.document.replace(/\D/g, "");
    const phoneDigits = data.customer.phone.replace(/\D/g, "");

    // IronPay usually expects a simplified structure for PIX
    // Using the credentials provided by the user
    const body = {
      product_code: "dhax2fql90",
      hash_offer: "uqftytyrci",
      payment_method: "pix",
      amount: (data.amount / 100).toFixed(2), // Convert cents to decimal string if needed
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        document: docDigits,
        phone: phoneDigits,
      },
      // Some gateways use items differently, we'll try to follow standard patterns
      items: data.items.map(i => ({
        name: i.title,
        price: (i.unit_price / 100).toFixed(2),
        quantity: i.quantity
      }))
    };

    const res = await fetch(`${IRONPAY_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": authHeader(),
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("IronPay create error", res.status, json);
      throw new Error(
        json?.message || 
        json?.errors?.[0]?.message || 
        `Falha ao criar pagamento PIX na IronPay (${res.status})`
      );
    }

    await notifyPushcut(PUSHCUT_PENDING);

    // Standardize response for checkout
    // IronPay response usually contains transaction id and pix data
    const tx = json.data || json;
    return {
      id: String(tx.id || tx.transaction_id),
      status: String(tx.status || "pending").toLowerCase(),
      qrCode: (tx.pix?.qrcode || tx.pix?.qr_code || tx.qrcode_text || tx.pix_code) as string,
      expiresAt: (tx.pix?.expiration_date || tx.expires_at || null) as string | null,
    };
  });

export const getIronPayStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`${IRONPAY_BASE}/transactions/${data.id}`, {
        method: "GET",
        headers: {
          "Authorization": authHeader(),
          "Accept": "application/json",
        },
      });
      if (!res.ok) return { status: "pending" };
      const json = await res.json().catch(() => ({}));
      const tx = json.data || json;
      return { status: String(tx.status || "pending").toLowerCase() };
    } catch {
      return { status: "pending" };
    }
  });
