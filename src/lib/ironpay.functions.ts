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

const IRONPAY_BASE = "https://api.ironpayapp.com.br/api/public/v1";
const IRONPAY_PRODUCT_HASH = "dhax2fql90";
const IRONPAY_OFFER_HASH = "dhax2fql90_rfnir0pkdp";

function getApiToken() {
  const token = process.env.IRONPAY_TOKEN;
  if (!token) throw new Error("IRONPAY_TOKEN ausente");
  return token;
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

    const body = {
      offer_hash: IRONPAY_OFFER_HASH,
      payment_method: "pix",
      amount: data.amount, // monetário em centavos
      installments: 1,
      transaction_origin: "api",
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        document: docDigits,
        phone_number: phoneDigits,
      },
      cart: data.items.map(i => ({
        product_hash: IRONPAY_PRODUCT_HASH,
        title: i.title,
        price: i.unit_price,
        quantity: i.quantity,
        operation_type: 1,
        tangible: true,
      }))
    };

    const token = getApiToken();
    const res = await fetch(`${IRONPAY_BASE}/transactions?api_token=${token}`, {
      method: "POST",
      headers: {
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
      id: String(tx.hash || tx.transaction_hash || tx.id || tx.transaction_id),
      status: String(tx.payment_status || tx.status || "pending").toLowerCase(),
      qrCode: (tx.pix?.pix_qr_code || tx.pix?.qrcode || tx.pix?.qr_code || tx.qrcode_text || tx.pix_code || tx.pix_copy_paste || tx.qr_code || tx.copy_paste) as string,
      expiresAt: (tx.pix?.expiration_date || tx.expires_at || null) as string | null,
    };
  });

export const getIronPayStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getApiToken();
      const res = await fetch(`${IRONPAY_BASE}/transactions/${data.id}?api_token=${token}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });
      if (!res.ok) return { status: "pending" };
      const json = await res.json().catch(() => ({}));
      const tx = json.data || json;
      return { status: String(tx.payment_status || tx.status || "pending").toLowerCase() };
    } catch {
      return { status: "pending" };
    }
  });
