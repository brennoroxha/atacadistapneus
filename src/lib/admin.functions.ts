import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import {
  getRequestHeader,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const COOKIE_NAME = "cf_admin";

function sign(value: string) {
  const secret = process.env.SESSION_SECRET || "dev-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

function makeToken() {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12h
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
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
  const ok = verifyToken(readCookie(COOKIE_NAME));
  if (!ok) throw new Error("UNAUTHORIZED");
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new Error("ADMIN_PASSWORD não configurado");
    if (data.password !== expected) {
      await new Promise((r) => setTimeout(r, 600));
      throw new Error("Senha incorreta");
    }
    const token = makeToken();
    setResponseHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`,
    );
    return { ok: true };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  );
  return { ok: true };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  return { authenticated: verifyToken(readCookie(COOKIE_NAME)) };
});

export const adminListOrders = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("pix_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);

  const startDay = new Date();
  startDay.setHours(0, 0, 0, 0);
  const startMs = startDay.getTime();

  let paidToday = 0;
  let paidTodayAmount = 0;
  let pendingTotal = 0;
  let alertCount = 0;

  for (const o of data ?? []) {
    const ts = new Date(o.created_at).getTime();
    if (o.status === "PAID" && ts >= startMs) {
      paidToday++;
      paidTodayAmount += o.amount_cents;
    }
    if (o.status === "PENDING") pendingTotal++;
    if (o.flagged === "ALERTA_DESVIO") alertCount++;
  }

  return {
    orders: data ?? [],
    stats: {
      paid_today: paidToday,
      paid_today_amount_cents: paidTodayAmount,
      pending_total: pendingTotal,
      alert_count: alertCount,
    },
  };
});

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["PENDING", "PAID", "CANCELED", "REFUNDED"]).optional(),
        clear_alert: z.boolean().optional(),
        notes: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const update: {
      status?: string;
      flagged?: string | null;
      notes?: string;
    } = {};
    if (data.status) update.status = data.status;
    if (data.clear_alert) update.flagged = null;
    if (data.notes !== undefined) update.notes = data.notes;
    const { error } = await supabaseAdmin
      .from("pix_orders")
      .update(update)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetSettings = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("key, value");
  if (error) throw new Error(error.message);
  
  const settings: Record<string, any> = {};
  data?.forEach((s) => {
    settings[s.key] = s.value;
  });
  return settings;
});

export const adminUpdateSetting = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ key: z.string(), value: z.any() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin();
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: data.key, value: data.value });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListCategories = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, parent_id, slug")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 200);
}
function parseTec(arr: any[]) {
  const out: Record<string, string> = {};
  for (const it of arr || []) {
    const t = it?.texto || ""; const i = t.indexOf(":");
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}
function parseSelos(url?: string) {
  if (!url) return {} as { consumo?: string; aderencia?: string; ruido_db?: number };
  const m = url.match(/etiqueta[_-].*?([a-g])([a-g])(\d{2,3})\./i);
  if (!m) return {};
  return { consumo: m[1].toUpperCase(), aderencia: m[2].toUpperCase(), ruido_db: parseInt(m[3], 10) };
}
function intFrom(s: any) { const m = String(s || "").match(/(\d+)/); return m ? parseInt(m[1], 10) : null; }

function buildProductRow(p: any, categoryId: string) {
  const tec = parseTec(p.informacoesTecnicas || []);
  const mm = String(p.nome || "").match(/(\d{3})\/(\d{2,3})R(\d{2})/i);
  const medida = mm ? `${mm[1]}/${mm[2]}R${mm[3]}` : "";
  const aro = mm ? mm[3] : "";
  const palavras = String(p.nome || "").replace(/^Pneu\s+Aro\s+\d+\s+/i, "").split(/\s+/);
  const marca = palavras[0] || "";
  const modeloMatch = String(p.nome || "").match(/\d{2}[A-Z]\s+(?:TL\s+)?(.+)$/);
  const modelo = modeloMatch ? modeloMatch[1].trim() : "";
  const selos = parseSelos(p.inmetro);
  const icIvDual = String(p.nome || "").match(/\b(\d{2,3}\/\d{2,3}[A-Z])\b/);
  const icIvSingle = String(p.nome || "").match(/\b(\d{2,3})([A-Z])\b/);
  const icIv = icIvDual ? icIvDual[1] : (icIvSingle ? `${icIvSingle[1]}${icIvSingle[2]}` : "");
  const name = (medida && marca && modelo && aro)
    ? `Pneu ${medida} ${marca} ${modelo} Aro ${aro}${icIv ? " " + icIv : ""}`
    : String(p.nome || "Produto");

  const specs = {
    aro, medida, marca, modelo, letra: tec["Letra"] || "Preta",
    consumo: selos.consumo || null,
    aderencia: selos.aderencia || tec["Aderência (Traction)"] || null,
    traction: tec["Aderência (Traction)"] || null,
    ruido_db: selos.ruido_db || null,
    runflat: /sim/i.test(tec["Runflat"] || ""),
    extra_load: /sim/i.test(tec["Extra Load"] || ""),
    terreno: tec["Terreno"] || null,
    montagem: tec["Montagem"] || "Sem Câmara",
    garantia: p.garantia || null,
    indice_carga: tec["Índice de carga (por pneu)"] || null,
    indice_velocidade: tec["Índice de velocidade"] || null,
    largura: tec["Largura"] || null,
    diametro: tec["Diâmetro"] || null,
    largura_mm: intFrom(tec["Largura"]),
    diametro_mm: intFrom(tec["Diâmetro"]),
    talas_compativeis: tec["Talas compatíveis"] || null,
    treadwear: tec["Durabilidade (Treadwear)"] || null,
    temperature: tec["Resistência ao aquecimento (Temperature)"] || null,
    protetor_borda: /sim/i.test(tec["Protetor de borda"] || ""),
    quantidade_lonas: tec["Quantidade de lonas"] || null,
    categoria: tec["Categoria"] || null,
    inmetro: p.inmetro || null,
    informacoesTecnicas: p.informacoesTecnicas || [],
    informacaoAdicional: p.informacaoAdicional || null,
    veiculos: p.veiculosUtilizadosPorMarca || [],
  };

  return {
    category_id: categoryId,
    name,
    slug: slugify(name),
    description: p.descricao || p.informacaoAdicional || "",
    price: Number(p.preco),
    stock: 100,
    images: Array.isArray(p.imagens) ? p.imagens : [],
    specs,
    featured: false,
  };
}

export const adminImportProducts = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      categoryId: z.string().uuid(),
      products: z.array(z.any()).min(1).max(200),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    let inserted = 0, updated = 0, failed = 0;
    const errors: string[] = [];
    for (const p of data.products) {
      try {
        const row = buildProductRow(p, data.categoryId);
        const { data: exist } = await supabaseAdmin
          .from("products").select("id, specs").eq("slug", row.slug).maybeSingle();
        if (exist) {
          const merged = { ...((exist.specs as object) || {}), ...row.specs };
          const { error } = await supabaseAdmin.from("products")
            .update({ ...row, specs: merged }).eq("id", exist.id);
          if (error) { failed++; errors.push(`${row.name}: ${error.message}`); }
          else updated++;
        } else {
          const { error } = await supabaseAdmin.from("products").insert(row);
          if (error) { failed++; errors.push(`${row.name}: ${error.message}`); }
          else inserted++;
        }
      } catch (e) {
        failed++;
        errors.push((e as Error).message);
      }
    }
    return { inserted, updated, failed, errors };
  });
