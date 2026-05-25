import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type Specs = Record<string, any>;

// Local SVG icons saved in public/icons/specs/
const ICON_BASE = "/icons/specs";
function specIcon(name: string) {
  return `${ICON_BASE}/icon-${name}.svg`;
}

// Maps a free-form label keyword → local svg filename slug
const LABEL_ICON_MAP: Array<{ match: RegExp; svg: string }> = [
  { match: /equipamento original|original/i, svg: "equipamento-original" },
  { match: /categoria|tipo de uso/i, svg: "tipo-de-uso" },
  { match: /terreno/i, svg: "terreno" },
  { match: /índice de carga|indice de carga|\bcarga\b/i, svg: "carga" },
  { match: /índice de velocidade|indice de velocidade|velocidade|\bíndice\b|\bindice\b/i, svg: "indice" },
  { match: /talas?/i, svg: "talas" },
  { match: /largura/i, svg: "largura" },
  { match: /diâmetro|diametro/i, svg: "diametro" },
  { match: /treadwear|durabilidade/i, svg: "durabilidade" },
  { match: /traction|aderência|aderencia/i, svg: "aderencia" },
  { match: /temperature|temperatura|aquecimento/i, svg: "temperatura" },
  { match: /runflat|run.?flat/i, svg: "runflat" },
  { match: /extra.?load/i, svg: "extra-load" },
  { match: /protetor/i, svg: "protetor-bordar" },
  { match: /lonas?/i, svg: "quantidade-lonas" },
  { match: /montagem/i, svg: "montagem" },
  { match: /letra/i, svg: "letra" },
  { match: /sulco/i, svg: "sulco" },
];

function iconForLabel(label: string): string | null {
  const m = LABEL_ICON_MAP.find((r) => r.match.test(label));
  return m ? specIcon(m.svg) : null;
}

const SPEC_ROWS: Array<{ key: string; label: string; svg: string; format?: (v: any) => string }> = [
  { key: "categoria", label: "Categoria", svg: "tipo-de-uso" },
  { key: "terreno", label: "Terreno", svg: "terreno" },
  { key: "indice_carga", label: "Índice de carga (por pneu)", svg: "carga" },
  { key: "indice_velocidade", label: "Índice de velocidade", svg: "indice" },
  { key: "talas_compativeis", label: "Talas compatíveis", svg: "talas" },
  { key: "largura_mm", label: "Largura", svg: "largura", format: (v) => `${v} mm` },
  { key: "diametro_mm", label: "Diâmetro", svg: "diametro", format: (v) => `${v} mm` },
  { key: "treadwear", label: "Durabilidade (Treadwear)", svg: "durabilidade" },
  { key: "traction", label: "Aderência (Traction)", svg: "aderencia" },
  { key: "temperature", label: "Resistência ao aquecimento (Temperature)", svg: "temperatura" },
  { key: "runflat", label: "Runflat", svg: "runflat", format: (v) => (v ? "Sim" : "Não") },
  { key: "extra_load", label: "Extra Load", svg: "extra-load", format: (v) => (v ? "Sim" : "Não") },
  { key: "protetor_borda", label: "Protetor de borda", svg: "protetor-bordar", format: (v) => (v ? "Sim" : "Não") },
  { key: "quantidade_lonas", label: "Quantidade de lonas", svg: "quantidade-lonas", format: (v) => v || "Não Possui" },
  { key: "montagem", label: "Montagem", svg: "montagem" },
  { key: "letra", label: "Letra", svg: "letra" },
];

export function ProductSpecsSection({ specs }: { specs: Specs }) {
  // Try to find technical info in different possible field names
  let info: Array<{ icone?: string; texto?: string; label?: string; value?: any }> | undefined = 
    specs.informacoesTecnicas || specs.info_tecnica;

  const inmetroUrl = specs.inmetro || specs.inmetro_url;

  // If we have the array format, let's normalize it
  if (Array.isArray(info) && info.length > 0) {
    return (
      <section className="mt-12 bg-muted/25 py-8 md:py-10 relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="container px-4 mx-auto">
          <div className="border-b mb-6">
            <h2 className="inline-block pb-2 border-b-2 border-industrial-blue font-bold text-lg text-industrial-blue dark:text-primary uppercase tracking-wide">
              Informações Técnicas
            </h2>
          </div>
          <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-8">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-7">
              {info.map((item, idx) => {
                let label = "";
                let value = "";
                let icone = item.icone;

                if (item.texto) {
                  const [labelRaw, ...rest] = item.texto.split(":");
                  label = labelRaw;
                  value = rest.join(":").trim();
                } else if (item.label) {
                  label = item.label;
                  value = String(item.value || "");
                }

                // Prefer a local svg matched by label; fall back to supplier-provided icone
                const localSvg = iconForLabel(label);
                const iconSrc = localSvg || icone;

                return (
                  <div key={idx} className="flex items-center gap-3">
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt=""
                        className="shrink-0 h-[40px] w-[40px] object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="shrink-0 w-[40px] h-[40px] rounded-full bg-industrial-blue/10" />
                    )}
                    <div className="text-sm leading-tight">
                      <div className="text-muted-foreground">{label}:</div>
                      <div className="font-bold text-foreground">{value || "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {inmetroUrl && (
              <div className="mt-8 pt-6 border-t lg:mt-0 lg:pt-0 lg:border-t-0 lg:pl-4 lg:w-[240px]">
                <h3 className="font-black text-industrial-blue dark:text-primary text-sm uppercase tracking-wide mb-3">
                  Etiqueta Inmetro
                </h3>
                <a href={inmetroUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                  <img
                    src={inmetroUrl}
                    alt="Etiqueta Inmetro"
                    loading="lazy"
                    className="w-full h-auto rounded-lg border bg-white max-w-[224px]"
                  />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Fallback: legacy structured specs with lucide icons
  const rows = SPEC_ROWS.filter(({ key }) => {
    const v = specs[key];
    return v !== undefined && v !== null && v !== "";
  });

  if (rows.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="border-b mb-6">
        <h2 className="inline-block pb-2 border-b-2 border-industrial-blue font-bold text-lg text-industrial-blue dark:text-primary uppercase tracking-wide">
          Informações Técnicas
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-7">
        {rows.map(({ key, label, svg, format }) => (
          <div key={key} className="flex items-start gap-3">
            <img src={specIcon(svg)} alt="" className="shrink-0 h-[40px] w-[40px] object-contain" loading="lazy" />
            <div className="text-sm leading-tight pt-1">
              <div className="text-muted-foreground">{label}:</div>
              <div className="font-bold text-foreground">
                {format ? format(specs[key]) : String(specs[key])}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdditionalInfoSection({ texto }: { texto?: string }) {
  if (!texto || !texto.trim()) return null;
  const lines = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: Array<{ title?: string; items: string[] }> = [];
  let current: { title?: string; items: string[] } = { items: [] };
  for (const line of lines) {
    const isHeading = /^[A-ZÀ-Ý0-9 ]{3,}$/.test(line) && line === line.toUpperCase();
    if (isHeading) {
      if (current.title || current.items.length) blocks.push(current);
      current = { title: line, items: [] };
    } else {
      current.items.push(line);
    }
  }
  if (current.title || current.items.length) blocks.push(current);

  return (
    <CollapsibleSection title="Informações Adicionais">
      <div className="space-y-6">
        {blocks.map((b, i) => (
          <div key={i}>
            {b.title && (
              <h3 className="font-black text-industrial-blue dark:text-primary text-sm uppercase tracking-wide mb-2">
                {b.title}
              </h3>
            )}
            <ul className="space-y-1.5 list-disc pl-5 text-sm md:text-base text-foreground">
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

export function DescriptionSection({ children, defaultOpen = false }: { children: React.ReactNode; defaultOpen?: boolean }) {
  return <CollapsibleSection title="Descrição" defaultOpen={defaultOpen}>{children}</CollapsibleSection>;
}

function CollapsibleSection({
  title,
  children,
  id,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (!id) return;
    const check = () => {
      if (typeof window !== "undefined" && window.location.hash === `#${id}`) {
        setOpen(true);
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [id]);
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full border-b mb-6 flex items-center justify-between"
        aria-expanded={open}
      >
        <h2 className="inline-block pb-2 border-b-2 border-industrial-blue font-bold text-lg text-industrial-blue dark:text-primary uppercase tracking-wide">
          {title}
        </h2>
        <ChevronDown className={`h-5 w-5 text-industrial-blue dark:text-primary transition mb-2 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}

const VEHICLE_LOGO_BUCKET = "https://icakzbsxlmazwlptzcqm.supabase.co/storage/v1/object/public/brand-logos";

const VEHICLE_LOGO_SLUGS: Record<string, string> = {
  agrale: "agrale", "alfa romeo": "alfa-romeo", "alfa-romeo": "alfa-romeo",
  audi: "audi", bmw: "bmw", byd: "byd",
  "caoa chery": "caoa-chery", "caoa-chery": "caoa-chery",
  chevrolet: "chevrolet", gm: "chevrolet",
  citroen: "citroen", "citroën": "citroen",
  dodge: "dodge", fiat: "fiat", ford: "ford", gwm: "gwm",
  honda: "honda", hyundai: "hyundai", iveco: "iveco",
  jac: "jac", jeep: "jeep", kia: "kia",
  "land rover": "land-rover", "land-rover": "land-rover", landrover: "land-rover",
  lexus: "lexus",
  "mercedes-benz": "mercedes-benz", "mercedes benz": "mercedes-benz", mercedes: "mercedes-benz",
  mini: "mini", mitsubishi: "mitsubishi", nissan: "nissan",
  peugeot: "peugeot", porsche: "porsche", ram: "ram",
  renault: "renault", subaru: "subaru", suzuki: "suzuki",
  toyota: "toyota", troller: "troller",
  volkswagen: "volkswagen", vw: "volkswagen",
  volvo: "volvo",
};

export function brandLogoUrl(marca: string) {
  const key = marca.trim().toLowerCase();
  const slug = VEHICLE_LOGO_SLUGS[key];
  if (!slug) return null;
  return `${VEHICLE_LOGO_BUCKET}/vehicle-${slug}.webp`;
}

type VeiculoItem = { marca: string; modelos: string[] };

function normalizeVeiculos(input: any): VeiculoItem[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((v) => {
        if (!v) return null;
        if (typeof v === "string") {
          const [marca, rest] = v.split(":");
          if (!marca) return null;
          return { marca: marca.trim(), modelos: (rest ?? "").split(",").map((s) => s.trim()).filter(Boolean) };
        }
        if (typeof v === "object" && v.marca) {
          const modelos = Array.isArray(v.modelos) ? v.modelos : typeof v.modelos === "string" ? v.modelos.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
          return { marca: String(v.marca), modelos };
        }
        return null;
      })
      .filter(Boolean) as VeiculoItem[];
  }
  if (typeof input === "string") {
    return input
      .split(/\n+/)
      .map((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return null;
        const marca = line.slice(0, idx).trim();
        const modelos = line.slice(idx + 1).split(",").map((s) => s.trim()).filter(Boolean);
        if (!marca) return null;
        return { marca, modelos };
      })
      .filter(Boolean) as VeiculoItem[];
  }
  return [];
}

export function VehiclesSection({ veiculos }: { veiculos: any }) {

  const list = normalizeVeiculos(veiculos);
  if (!list || list.length === 0) return null;
  return (

    <CollapsibleSection title="Veículos Compatíveis" id="veiculos-compativeis">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((v) => {
          const logo = brandLogoUrl(v.marca);
          return (
            <div key={v.marca} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                {logo && (
                  <img
                    src={logo}
                    alt={v.marca}
                    loading="lazy"
                    className="h-10 w-10 object-contain shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="font-black text-industrial-blue dark:text-primary text-sm uppercase tracking-wide">
                  {v.marca}
                </div>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {v.modelos.join(" • ")}
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

export function WarrantySection({ garantia }: { garantia?: string }) {
  if (!garantia) return null;
  return (
    <CollapsibleSection title="Garantia">
      <p className="text-sm md:text-base font-medium text-foreground">{garantia}</p>
    </CollapsibleSection>
  );
}

// ============================================================
// Especificações (clean table layout — Lider Auto Center style)
// ============================================================
export function EspecificacoesTable({
  product,
  specs,
}: {
  product: { name: string; gtin?: string | null; categories?: { name?: string } | null };
  specs: Specs;
}) {
  // Parse medida (e.g. "185/70R13") into largura / perfil / aro
  const medida: string = String(specs.medida || "");
  const match = medida.match(/^(\d{2,3})\/(\d{2})R(\d{1,2})/i);
  const largura = match?.[1] || specs.largura || specs.largura_mm || "";
  const perfil = match?.[2] || specs.perfil || "";
  const aro = match?.[3] || specs.aro || "";
  const marca = String(specs.marca || specs.brand || "").toUpperCase();
  const categoria = product.categories?.name || (aro ? `Pneus Aro ${aro}` : "");
  const gtin = product.gtin || specs.gtin || specs.ean || "";

  const rows: Array<[string, string | number]> = [];
  if (marca) rows.push(["Marca", marca]);
  if (largura) rows.push(["Largura", String(largura)]);
  if (perfil) rows.push(["Perfil", String(perfil)]);
  if (aro) rows.push(["Aro", `${aro}"`]);
  if (categoria) rows.push(["Categoria", categoria]);
  if (gtin) rows.push(["GTIN/EAN", String(gtin)]);

  if (rows.length === 0) return null;

  return (
    <section className="mt-10 space-y-8">
      {/* Especificações */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="block w-1 h-5 bg-safety-orange rounded" />
          <h2 className="font-black text-industrial-blue dark:text-primary text-lg">Especificações</h2>
        </div>
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v], i) => (
                <tr key={k} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                  <td className="px-4 py-3 text-industrial-blue/80 dark:text-primary/80">{k}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
