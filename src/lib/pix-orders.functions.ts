import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const itemSchema = z.object({
  title: z.string(),
  unit_price: z.number().int(),
  quantity: z.number().int(),
});

export const registerPixOrder = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        freepay_id: z.string().optional(),
        blackout_id: z.string().optional(),
        amount_cents: z.number().int().positive(),
        customer: z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          document: z.string().optional(),
        }),
        items: z.array(itemSchema),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("pix_orders").insert({
      freepay_id: data.freepay_id ?? null,
      blackout_id: data.blackout_id ?? null,
      amount_cents: data.amount_cents,
      customer_name: data.customer.name,
      customer_email: data.customer.email,
      customer_phone: data.customer.phone ?? null,
      customer_document: data.customer.document ?? null,
      items: data.items,
      status: "PENDING",
    });
    if (error) {
      console.error("registerPixOrder error", error);
      // não bloqueia o checkout se falhar
    }
    return { ok: true };
  });

export const getPixOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ freepay_id: z.string().optional(), blackout_id: z.string().optional() }).parse(d))
  .handler(async ({ data }) => {
    let query = supabaseAdmin.from("pix_orders").select("status");
    if (data.blackout_id) {
      query = query.eq("blackout_id", data.blackout_id);
    } else if (data.freepay_id) {
      query = query.eq("freepay_id", data.freepay_id);
    } else {
      return { status: "PENDING" };
    }
    const { data: row } = await query.maybeSingle();
    return { status: row?.status ?? "PENDING" };
  });

export const uploadComprovante = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        freepay_id: z.string().optional(),
        blackout_id: z.string().optional(),
        file_base64: z.string().min(20),
        file_name: z.string().min(1).max(160),
        mime_type: z.string().min(1).max(80),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let query = supabaseAdmin.from("pix_orders").select("id, status");
    if (data.blackout_id) {
      query = query.eq("blackout_id", data.blackout_id);
    } else if (data.freepay_id) {
      query = query.eq("freepay_id", data.freepay_id);
    } else {
      throw new Error("ID do pedido não fornecido");
    }
    const { data: order, error: findErr } = await query.maybeSingle();
    if (findErr || !order) throw new Error("Pedido não encontrado");

    const ext = (data.file_name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
    const path = `${order.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(data.file_base64, "base64");

    const { error: upErr } = await supabaseAdmin.storage
      .from("comprovantes")
      .upload(path, buffer, { contentType: data.mime_type, upsert: false });
    if (upErr) {
      console.error("upload error", upErr);
      throw new Error("Falha ao enviar comprovante");
    }

    const { data: pub } = supabaseAdmin.storage.from("comprovantes").getPublicUrl(path);

    const flagged = order.status === "PENDING" ? "ALERTA_DESVIO" : null;
    const { error: updErr } = await supabaseAdmin
      .from("pix_orders")
      .update({
        comprovante_url: pub.publicUrl,
        comprovante_uploaded_at: new Date().toISOString(),
        flagged,
      })
      .eq("id", order.id);
    if (updErr) {
      console.error("update error", updErr);
      throw new Error("Falha ao registrar comprovante");
    }

    return { ok: true, url: pub.publicUrl, flagged };
  });
