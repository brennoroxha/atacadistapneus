import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------- Auth (cookie-based admin, mesmo padrão de admin.functions.ts) ----------
const COOKIE_NAME = "cf_admin";
function sign(value: string) {
  const secret = process.env.SESSION_SECRET || "dev-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}
function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expStr, sig] = parts;
  if (role !== "admin") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = sign(`${role}.${expStr}`);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
function readCookie(name: string): string | undefined {
  const raw = getRequestHeader("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}
function requireAdmin() {
  if (!verifyToken(readCookie(COOKIE_NAME))) throw new Error("UNAUTHORIZED");
}

// ---------- AI image edit (Google Gemini API direta) ----------
const GEMINI_MODELS = [
  "gemini-3.1-flash-image-preview",
];

const PROMPT = `This is my own tire product photo for my e-commerce store. Clean up the bottom-right corner by extending the white studio background into that area and removing any text or graphic overlay there. Preserve the tire, shadows, proportions, and all tread/sidewall details exactly. Output a clean photorealistic product image with only the tire on a seamless white background.`;

function getGeminiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter((k): k is string => !!k && k.length > 0);
  if (keys.length === 0) throw new Error("Nenhuma GEMINI_API_KEY configurada");
  return keys;
}

function pickKey(keys: string[]): string {
  return keys[Math.floor(Math.random() * keys.length)];
}

function extractInlineImage(json: any): { data: string; mimeType: string } | null {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    console.log("Gemini: Nenhum 'parts' encontrado na resposta");
    return null;
  }
  
  for (const p of parts) {
    const inlineData = p?.inline_data || p?.inlineData;
    if (inlineData?.data) {
      const data = inlineData.data.replace(/\s/g, "");
      const mimeType = inlineData.mime_type || inlineData.mimeType || "image/png";
      console.log(`Gemini: Recebeu inlineData, mimeType: ${mimeType}`);
      return { data, mimeType };
    }
  }
  console.log("Gemini: Nenhuma parte com inlineData encontrada");
  return null;
}

async function callGemini(base64: string, mimeType: string): Promise<string> {
  const keys = getGeminiKeys();
  const normalizedMimeType = mimeType.split(";")[0]?.trim() || "image/jpeg";
  let lastErr = "";

  for (const model of GEMINI_MODELS) {
    // tenta cada modelo com até 2 keys diferentes
    for (let attempt = 0; attempt < Math.min(2, keys.length); attempt++) {
      const apiKey = pickKey(keys);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      console.log(`Gemini: Usando modelo ${model}`);
      console.log(`Gemini: Endpoint usado: ${url.replace(apiKey, "REDACTED")}`);
      
      let res;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: PROMPT },
                  { inline_data: { mime_type: normalizedMimeType, data: base64 } },
                ],
              },
            ],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
          }),
        });
      } catch (e: any) {
        lastErr = `Fetch error: ${e.message}`;
        console.error(`Gemini: Erro de rede: ${e.message}`);
        continue;
      }

      console.log(`Gemini: Status HTTP: ${res.status}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Gemini: Corpo completo do erro: ${errorText}`);
        
        if (res.status === 429) {
          throw new Error("Limite/quota da API Gemini atingido. Ative billing no Google AI Studio/Google Cloud ou use uma chave de projeto com quota disponível.");
        }
        if (res.status === 404) {
          throw new Error("Modelo Gemini inválido ou indisponível para esta API. Verifique o nome do modelo.");
        }
        
        lastErr = `${model}: ${res.status} ${errorText.slice(0, 500)}`;
        continue;
      }

      const json: any = await res.json();
      const finishReason = json?.candidates?.[0]?.finishReason;
      console.log(`Gemini: finishReason: ${finishReason}`);

      if (finishReason === "IMAGE_RECITATION") {
        throw new Error("Não foi possível editar esta imagem porque ela parece conter marca d’água, logotipo ou conteúdo protegido. Use uma imagem própria/autorizada sem marca d’água.");
      }

      const extracted = extractInlineImage(json);
      if (extracted) {
        console.log(`Gemini: Veio inlineData: Sim, mimeType: ${extracted.mimeType}`);
        return extracted.data;
      }

      console.log("Gemini: Veio inlineData: Não");
      lastErr = `${model}: sem imagem${finishReason ? ` (${finishReason})` : ""}`;
    }
  }
  throw new Error(`Gemini não retornou imagem${lastErr ? ` — ${lastErr}` : ""}`);
}

// ---------- Core ----------
async function processOne(job: { productId: string; imageUrl: string; imageIndex: number }) {
  const imgRes = await fetch(job.imageUrl);
  if (!imgRes.ok) throw new Error(`Download falhou: ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
  const cleanedB64 = await callGemini(buf.toString("base64"), mimeType);
  const cleanedBuf = Buffer.from(cleanedB64, "base64");
  const path = `cleaned/${job.productId}/${Date.now()}-${job.imageIndex}.png`;

  const { error: upErr } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, cleanedBuf, { contentType: "image/png", upsert: true });
  if (upErr) throw new Error(`Upload: ${upErr.message}`);

  const { data: pub } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  const newUrl = pub.publicUrl;

  const { data: prod, error: pErr } = await supabaseAdmin
    .from("products").select("images").eq("id", job.productId).single();
  if (pErr) throw pErr;
  const images = [...((prod.images as string[]) || [])];
  images[job.imageIndex] = newUrl;
  const { error: updErr } = await supabaseAdmin
    .from("products").update({ images }).eq("id", job.productId);
  if (updErr) throw updErr;

  await supabaseAdmin.from("watermark_jobs").insert({
    product_id: job.productId,
    image_index: job.imageIndex,
    original_url: job.imageUrl,
    new_url: newUrl,
    status: "success",
  });
  return newUrl;
}

// Salva imagem já processada no client (via API externa de inpaint)
export const saveCleanedImage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      productId: z.string().uuid(),
      imageIndex: z.number().int().min(0),
      originalUrl: z.string().url(),
      base64: z.string().min(10),
      mimeType: z.string().default("image/png"),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    try {
      const cleanedBuf = Buffer.from(data.base64, "base64");
      const ext = data.mimeType.includes("jpeg") ? "jpg" : "png";
      const path = `cleaned/${data.productId}/${Date.now()}-${data.imageIndex}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("product-images")
        .upload(path, cleanedBuf, { contentType: data.mimeType, upsert: true });
      if (upErr) throw new Error(`Upload: ${upErr.message}`);
      const { data: pub } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
      const newUrl = pub.publicUrl;

      const { data: prod, error: pErr } = await supabaseAdmin
        .from("products").select("images").eq("id", data.productId).single();
      if (pErr) throw pErr;
      const images = [...((prod.images as string[]) || [])];
      images[data.imageIndex] = newUrl;
      const { error: updErr } = await supabaseAdmin
        .from("products").update({ images }).eq("id", data.productId);
      if (updErr) throw updErr;

      await supabaseAdmin.from("watermark_jobs").insert({
        product_id: data.productId,
        image_index: data.imageIndex,
        original_url: data.originalUrl,
        new_url: newUrl,
        status: "success",
      });
      return { newUrl };
    } catch (e: any) {
      await supabaseAdmin.from("watermark_jobs").insert({
        product_id: data.productId,
        image_index: data.imageIndex,
        original_url: data.originalUrl,
        status: "error",
        error_message: e.message,
      });
      throw e;
    }
  });

// ---------- Schemas ----------
const JobSchema = z.object({
  productId: z.string().uuid(),
  imageUrl: z.string().url(),
  imageIndex: z.number().int().min(0),
});

// ---------- Server functions ----------
export const removeWatermark = createServerFn({ method: "POST" })
  .inputValidator((d) => JobSchema.parse(d))
  .handler(async ({ data }) => {
    requireAdmin();
    try {
      const newUrl = await processOne(data);
      return { newUrl };
    } catch (e: any) {
      await supabaseAdmin.from("watermark_jobs").insert({
        product_id: data.productId,
        image_index: data.imageIndex,
        original_url: data.imageUrl,
        status: "error",
        error_message: e.message,
      });
      throw e;
    }
  });

export const removeWatermarkBatch = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ jobs: z.array(JobSchema).min(1).max(500) }).parse(d))
  .handler(async function* ({ data }) {
    requireAdmin();
    let done = 0;
    const total = data.jobs.length;
    for (let i = 0; i < data.jobs.length; i += 3) {
      const chunk = data.jobs.slice(i, i + 3);
      const results = await Promise.all(
        chunk.map(async (job) => {
          try {
            const newUrl = await processOne(job);
            return { type: "ok" as const, job, newUrl };
          } catch (e: any) {
            await supabaseAdmin.from("watermark_jobs").insert({
              product_id: job.productId,
              image_index: job.imageIndex,
              original_url: job.imageUrl,
              status: "error",
              error_message: e.message,
            });
            return { type: "err" as const, job, error: e.message };
          }
        }),
      );
      for (const r of results) {
        done++;
        yield { ...r, done, total };
      }
    }
  });

// ---------- Listagem de produtos com imagens ----------
export const listProductsForWatermark = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      categoryId: z.string().uuid().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("products")
      .select("id, name, sku, images, category_id", { count: "exact" })
      .not("images", "is", null)
      .order("name")
      .range(from, to);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,sku.ilike.%${data.search}%`);
    if (data.categoryId) q = q.eq("category_id", data.categoryId);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0 };
  });

export const listWatermarkHistory = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("watermark_jobs")
    .select("id, product_id, image_index, original_url, new_url, status, error_message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});
