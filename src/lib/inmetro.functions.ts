import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function extractFromImage(imageUrl: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Esta é uma etiqueta Inmetro de pneu. Identifique três valores: 1) consumo de combustível (letra A-G no primeiro quadro com bomba), 2) aderência em pista molhada (letra A-G no segundo quadro com chuva), 3) ruído externo em decibéis (número no quadro com alto-falante). Responda usando a função fornecida.",
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_ratings",
            description: "Reporta as três notas da etiqueta Inmetro",
            parameters: {
              type: "object",
              properties: {
                consumo: { type: "string", enum: ["A", "B", "C", "D", "E", "F", "G"] },
                aderencia: { type: "string", enum: ["A", "B", "C", "D", "E", "F", "G"] },
                ruido_db: { type: "integer", minimum: 50, maximum: 90 },
              },
              required: ["consumo", "aderencia", "ruido_db"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_ratings" } },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json: any = await res.json();
  const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("No tool call returned");
  return JSON.parse(args) as { consumo: string; aderencia: string; ruido_db: number };
}

export const backfillInmetroRatings = createServerFn({ method: "POST" }).handler(async () => {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, specs")
    .not("specs->>inmetro", "is", null);

  if (error) throw error;

  const pending = (products ?? []).filter((p: any) => {
    const s = p.specs ?? {};
    return s.inmetro && (!s.consumo || !s.aderencia || !s.ruido_db);
  });

  let ok = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const p of pending) {
    try {
      const ratings = await extractFromImage((p as any).specs.inmetro);
      const newSpecs = { ...(p as any).specs, ...ratings };
      const { error: upErr } = await supabaseAdmin
        .from("products")
        .update({ specs: newSpecs })
        .eq("id", (p as any).id);
      if (upErr) throw upErr;
      ok++;
    } catch (e: any) {
      errors.push({ id: (p as any).id, error: String(e?.message ?? e) });
    }
  }

  return { processed: pending.length, ok, errors };
});
