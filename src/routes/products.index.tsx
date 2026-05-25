import { createFileRoute, Link, useSearch, useNavigate, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getProductImageUrl, onProductImageError } from "@/lib/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Filter, SlidersHorizontal, ChevronRight, ShoppingCart, X, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart";

import { toast } from "sonner";
import { getBrandLogo } from "@/lib/brand-logo";
import { z } from "zod";
import { useMemo, useState } from "react";

const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (Array.isArray(v)) return v.length ? v : undefined;
    const parts = v.split(",").filter(Boolean);
    return parts.length ? parts : undefined;
  });

const productSearchSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  aro: csv,
  altura: csv,
  largura: csv,
  marca: csv,
  runflat: z.string().optional(),
  sort: z.string().optional(),
});

import { generateMetadata } from "@/lib/seo";

export const Route = createFileRoute("/products/")({
  validateSearch: (search) => productSearchSchema.parse(search),
  head: () =>
    generateMetadata({
      title: "Todos os Produtos",
      description:
        "Confira nossa linha completa de pneus. Qualidade garantida.",
      url: "/products",
    }),
  component: ProductsListingRoute,
});

function ProductsListingRoute() {
  return <ProductsListing />;
}

function parseMedida(m?: string, name?: string) {
  const text = ((m || "") + " " + (name || "")).replace(/\s+/g, " ");
  // Match standard 165/70R13
  const match = text.match(/(\d{3})\/(\d{2})R(\d{2})/i);
  if (match) return { largura: match[1], altura: match[2], aro: match[3] };
  
  // Match variants like 165/70 13 or 165/70-13
  const match2 = text.match(/(\d{3})\/(\d{2})[\s\-R](\d{2})/i);
  if (match2) return { largura: match2[1], altura: match2[2], aro: match2[3] };

  // Match just the components if they appear separately
  const largura = text.match(/\b(\d{3})\b/)?.[1] || "";
  const altura = text.match(/\b(\d{2})\b/)?.[1] || "";
  const aro = text.match(/R(\d{2})\b/i)?.[1] || text.match(/Aro\s*(\d{2})\b/i)?.[1] || "";
  
  return { largura, altura, aro };
}

export function ProductsListing({ categorySlugOverride }: { categorySlugOverride?: string } = {}) {
  const search = useSearch({ strict: false }) as Record<string, any>;
  const categoryFromSearch = search.category as string | undefined;
  const category = categorySlugOverride ?? categoryFromSearch;
  const { search: q, minPrice, maxPrice, aro, altura, largura, marca, runflat, sort } = search;
  const navigate = useNavigate() as any;
  const location = useLocation();
  const currentPath = location.pathname as any;
  const addItem = useCart((state) => state.addItem);
  const openCart = useCart((state) => state.openCart);
  
  const [searchInput, setSearchInput] = useState(q ?? "");
  const [minInput, setMinInput] = useState(minPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxPrice?.toString() ?? "");
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories-listing"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data ?? [];
    },
  });

  // Resolve all category IDs including subcategories
  const relevantCategoryIds = useMemo(() => {
    if (!category || !categories) return null;
    
    const root = categories.find(c => c.slug === category);
    if (!root) return null;

    const ids = [root.id];
    const findChildren = (parentId: string) => {
      categories.forEach(c => {
        if (c.parent_id === parentId) {
          ids.push(c.id);
          findChildren(c.id);
        }
      });
    };
    findChildren(root.id);
    return ids;
  }, [category, categories]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-list", relevantCategoryIds, q, minPrice, maxPrice, aro, altura, largura],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name, slug)");
      
      if (relevantCategoryIds) {
        query = query.in("category_id", relevantCategoryIds);
      }
      
      if (q) {
        const terms = q.trim().split(/\s+/).filter(t => t.length > 1);
        terms.forEach(term => {
          query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,gtin.ilike.%${term}%`);
        });
      }
      
      if (minPrice) query = query.gte("price", minPrice);
      if (maxPrice) query = query.lte("price", maxPrice);
      
      if (aro) {
        const values = Array.isArray(aro) ? aro : [aro];
        query = query.filter('specs->>aro', 'in', `(${values.map(v => `"${v}"`).join(',')})`);
      }
      if (altura) {
        const values = Array.isArray(altura) ? altura : [altura];
        query = query.filter('specs->>altura', 'in', `(${values.map(v => `"${v}"`).join(',')})`);
      }
      if (largura) {
        const values = Array.isArray(largura) ? largura : [largura];
        query = query.filter('specs->>largura', 'in', `(${values.map(v => `"${v}"`).join(',')})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!categories || !category, // Wait for categories if we need to filter by them
  });

  // Build facets from products matching current category and search
  const facets = useMemo(() => {
    const aros = new Set<string>();
    const alturas = new Set<string>();
    const larguras = new Set<string>();
    const marcas = new Set<string>();
    
    (products ?? []).forEach((p: any) => {
      const s = p.specs ?? {};
      const m = parseMedida(s.medida, p.name);
      
      const aroVal = String(s.aro || m.aro || "").trim();
      const alturaVal = String(s.altura || m.altura || "").trim();
      const larguraVal = String(s.largura || m.largura || "").trim();
      
      if (aroVal) aros.add(aroVal);
      if (alturaVal) alturas.add(alturaVal);
      if (larguraVal) larguras.add(larguraVal);
      if (s.marca) marcas.add(String(s.marca));
    });
    
    const numSort = (a: string, b: string) => parseFloat(a.replace(',', '.')) - parseFloat(b.replace(',', '.'));
    
    return {
      aros: [...aros].sort(numSort),
      alturas: [...alturas].sort(numSort),
      larguras: [...larguras].sort(numSort),
      marcas: [...marcas].sort(),
    };
  }, [products]);

  // We now filter mostly on server-side via useQuery above. 
  // Client-side filter remains for Marca/Runflat which are not handled by server query yet.
  const filtered = useMemo(() => {
    const list = (products ?? []).filter((p: any) => {
      const s = p.specs ?? {};
      if (marca?.length && !marca.includes(String(s.marca ?? ""))) return false;
      if (runflat === "sim" && !s.runflat) return false;
      if (runflat === "nao" && s.runflat) return false;
      return true;
    });
    const sorted = [...list];
    const fromPriceOf = (p: any) => p.price * 1.2;
    switch (sort) {
      case "maior-desconto":
        sorted.sort((a, b) => (fromPriceOf(b) - b.price) / fromPriceOf(b) - (fromPriceOf(a) - a.price) / fromPriceOf(a));
        break;
      case "menor-preco":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "maior-preco":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "lancamentos":
        sorted.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
        break;
      case "mais-vendidos":
        sorted.sort((a: any, b: any) => (b.sales ?? 0) - (a.sales ?? 0));
        break;
      case "nome":
        sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        break;
    }
    return sorted;
  }, [products, aro, altura, largura, marca, runflat, sort]);

  const sortLabels: Record<string, string> = {
    "maior-desconto": "Maior desconto",
    "menor-preco": "Menor Preço",
    "maior-preco": "Maior Preço",
    "lancamentos": "Lançamentos",
    "mais-vendidos": "Mais vendidos",
    "nome": "Nome do produto",
  };
  const setSort = (v: string) =>
    navigate({ to: currentPath, search: (prev: any) => ({ ...prev, sort: v || undefined }) });

  const toggle = (key: "aro" | "altura" | "largura" | "marca", value: string) => {
    const current = (search[key] as string[]) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    navigate({
      to: currentPath,
      search: (prev: any) => ({ ...prev, [key]: next.length ? next : undefined }),
    });
  };

  const isChecked = (key: "aro" | "altura" | "largura" | "marca", value: string) =>
    ((search[key] as string[]) ?? []).includes(value);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || "",
    });
    openCart();
  };

  const applyPrice = () => {
    navigate({
      to: currentPath,
      search: (prev: any) => ({
        ...prev,
        minPrice: minInput ? Number(minInput) : undefined,
        maxPrice: maxInput ? Number(maxInput) : undefined,
      }),
    });
  };

  const filterAccordion = (
    <Accordion
      type="multiple"
      defaultValue={["aro"]}
      className="w-full"
    >

      <FacetItem value="altura" label="Altura" options={facets.alturas} isChecked={(v) => isChecked("altura", v)} onToggle={(v) => toggle("altura", v)} />
      <FacetItem value="aro" label="Aro" options={facets.aros} isChecked={(v) => isChecked("aro", v)} onToggle={(v) => toggle("aro", v)} />
      <FacetItem value="largura" label="Largura" options={facets.larguras} isChecked={(v) => isChecked("largura", v)} onToggle={(v) => toggle("largura", v)} />

      <AccordionItem value="runflat" className="px-4">
        <AccordionTrigger className="text-industrial-blue font-bold text-sm hover:no-underline [&>svg]:hidden">
          <span className="flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Runflat
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-2 pb-2">
            {[
              { v: "", label: "Todos" },
              { v: "sim", label: "Sim" },
              { v: "nao", label: "Não" },
            ].map((o) => (
              <label key={o.v} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="runflat"
                  checked={(runflat ?? "") === o.v}
                  onChange={() =>
                    navigate({
                      to: currentPath,
                      search: (prev: any) => ({ ...prev, runflat: o.v || undefined }),
                    })
                  }
                />
                {o.label}
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <FacetItem value="marca" label="Marca/Modelo" options={facets.marcas} isChecked={(v) => isChecked("marca", v)} onToggle={(v) => toggle("marca", v)} />

      <AccordionItem value="preco" className="px-4 border-b-0">
        <AccordionTrigger className="text-industrial-blue font-bold text-sm hover:no-underline [&>svg]:hidden">
          <span className="flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Faixa de preço
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pb-2">
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Mín" className="h-9" value={minInput} onChange={(e) => setMinInput(e.target.value)} />
              <Input type="number" placeholder="Máx" className="h-9" value={maxInput} onChange={(e) => setMaxInput(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" onClick={applyPrice}>Aplicar</Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  // Parse slug like "tipo-carros-camionete-aro-13" => { tipo: "Carro/Camionete", aro: "13" }
  const parsedCategory = (() => {
    if (!category) return null;
    const aroMatch = category.match(/-aro-(\d+)/);
    const aroNum = aroMatch?.[1];
    const tipoSlug = category.replace(/^tipo-/, "").replace(/-aro-\d+$/, "");
    const tipoMap: Record<string, string> = {
      "carros-camionete": "Carro/Camionete",
      "moto": "Moto",
      "caminhao": "Caminhão",
      "caminhonete": "Caminhonete",
    };
    const tipo = tipoMap[tipoSlug] ?? tipoSlug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return { tipo, aro: aroNum };
  })();

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground mb-8">
        <Link to="/" className="hover:text-safety-orange flex items-center"><Home className="h-3.5 w-3.5" /></Link>
        <ChevronRight className="h-3 w-3" />
        {parsedCategory ? (
          <>
            <Link to="/products" className="hover:text-safety-orange text-industrial-blue">
              Pneus {parsedCategory.tipo}
            </Link>
            {parsedCategory.aro && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-safety-orange">Pneus Aro {parsedCategory.aro}</span>
              </>
            )}
          </>
        ) : (
          <Link to="/products" className="hover:text-safety-orange text-industrial-blue">Pneus</Link>
        )}
      </div>

      {/* Page title */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground">
          {parsedCategory?.aro ? `Pneus Aro ${parsedCategory.aro}` : "Pneus Todos"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar - desktop only */}
        <aside className="hidden lg:block lg:sticky lg:top-32 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-safety-orange" />
            <h3 className="font-black tracking-tight text-lg">Filtros</h3>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            {filterAccordion}
          </div>
        </aside>

        {/* Main Listing */}
        <main className="lg:col-span-3 space-y-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const term = String(fd.get("q") ?? "").trim();
              setSearchInput(term);
              navigate({
                to: currentPath,
                search: (prev: any) => ({ ...prev, search: term || undefined }),
              });
            }}
            className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b"
          >
            <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 font-bold text-[10px] tracking-widest lg:hidden"
                  >
                    <Filter className="h-3 w-3" /> Filtrar
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-96 p-0 overflow-y-auto z-[100]">
                  <div className="flex items-center justify-between px-4 py-4 border-b">
                    <span className="font-black tracking-widest text-industrial-blue">FILTRAR</span>
                  </div>
                  <div className="px-2">{filterAccordion}</div>
                </SheetContent>
              </Sheet>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 font-bold text-[10px] tracking-widest ml-auto"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    {sort ? sortLabels[sort] : "Ordenar"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-muted-foreground">Ordenar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(sortLabels).map(([v, label]) => (
                    <DropdownMenuItem
                      key={v}
                      onSelect={() => setSort(v)}
                      className={sort === v ? "bg-industrial-blue/10 text-industrial-blue font-bold" : ""}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </form>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {isLoading ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-[160px] sm:h-[400px] bg-muted animate-pulse rounded-lg border"
                  ></div>
                ))
            ) : (
              filtered.map((product: any) => {
                const brandLogo = getBrandLogo(product.name);
                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white dark:bg-card rounded-lg border overflow-hidden shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="relative shrink flex flex-col">
                      {brandLogo && (
                        <div className="w-full h-10 flex items-center justify-center bg-white px-2 pt-2 pb-1">
                          <img
                            src={brandLogo}
                            alt="Marca"
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            onError={(e) => ((e.currentTarget.parentElement!.style.display = "none"))}
                          />
                        </div>
                      )}
                      <Link
                        to="/pneu/$productId"
                        params={{ productId: product.slug ?? product.id }}
                        className="relative block aspect-square overflow-hidden bg-white p-2"
                      >
                        <img
                          src={getProductImageUrl(product.images?.[0])}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          onError={onProductImageError}
                          className="h-full w-full object-contain scale-[1.15] transition-transform duration-500 group-hover:scale-[1.25]"
                          width="400"
                          height="400"
                        />
                        <div className="absolute right-1 top-2 flex flex-col gap-1 pointer-events-none z-10">
                          {(product.specs?.consumo || product.specs?.aderencia || product.specs?.ruido_db) && (
                            <>
                              {product.specs?.consumo && <EtiquetaBadge src="/etiquetas/consumo.webp" alt="Consumo" value={product.specs.consumo} />}
                              {product.specs?.aderencia && <EtiquetaBadge src="/etiquetas/aderencia.webp" alt="Aderência" value={product.specs.aderencia} />}
                              {product.specs?.ruido_db && <EtiquetaBadge src="/etiquetas/ruido-alto.webp" alt="Ruído" value={`${product.specs.ruido_db}`} suffix="dB" />}
                            </>
                          )}
                        </div>
                      </Link>
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-2 min-w-0">
                      <h3 className="font-medium text-sm leading-snug line-clamp-2 sm:min-h-[2.5rem]">
                        <Link
                          to="/pneu/$productId"
                          params={{ productId: product.slug ?? product.id }}
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <div className="text-xl font-black text-safety-orange tracking-tight leading-none">
                        R$ {product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {filtered.length === 0 && !isLoading && (
            <div className="py-20 text-center space-y-6 bg-muted/30 rounded-2xl border border-dashed">
              <Search className="h-16 w-16 text-muted-foreground mx-auto opacity-20" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter text-industrial-blue">
                  Nenhum produto encontrado
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Tente ajustar seus filtros ou buscar por outro termo.
                </p>
              </div>
              <Button
                variant="outline"
                className="font-black tracking-widest"
                onClick={() => navigate({ to: currentPath, search: {} as any })}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FacetItem({
  value,
  label,
  options,
  isChecked,
  onToggle,
}: {
  value: string;
  label: string;
  options: string[];
  isChecked: (v: string) => boolean;
  onToggle: (v: string) => void;
}) {
  return (
    <AccordionItem value={value} className="px-4">
      <AccordionTrigger className="text-industrial-blue font-bold text-sm hover:no-underline [&>svg]:hidden">
        <span className="flex items-center gap-2">
          <span className="text-lg leading-none">+</span> {label}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground pb-2">Nenhuma opção disponível</p>
        ) : (
          <div className="flex flex-col gap-2 pb-2 max-h-60 overflow-y-auto pr-1">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-safety-orange"
              >
                <Checkbox
                  checked={isChecked(opt)}
                  onCheckedChange={() => onToggle(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function EtiquetaBadge({
  src,
  alt,
  value,
  suffix,
}: {
  src: string;
  alt: string;
  value?: string | number | null;
  suffix?: string;
}) {
  return (
    <div className="relative w-10 sm:w-12">
      <img src={src} alt={alt} className="w-full h-auto" />
      {value && (
        <span className="absolute inset-x-0 bottom-[6%] flex items-center justify-center text-white font-extrabold leading-none text-[10px] sm:text-[11px]">
          {value}
          {suffix ? <span className="ml-[1px] text-[7px]">{suffix}</span> : null}
        </span>
      )}
    </div>
  );
}

