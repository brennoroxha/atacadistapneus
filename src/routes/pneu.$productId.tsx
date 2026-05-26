import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getProductImageUrl, onProductImageError } from "@/lib/product-image";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Home,
  ShoppingCart,
  Truck,
  Zap,
  Car,
  Search,
  MapPin,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { generateMetadata } from "@/lib/seo";
import { FormattedDescription } from "@/components/FormattedDescription";
import { ProductSpecsSection, AdditionalInfoSection, VehiclesSection, WarrantySection, DescriptionSection, EspecificacoesTable } from "@/components/ProductSpecsSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBrandLogo } from "@/lib/brand-logo";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchProductByParam(param: string) {
  const col = UUID_RE.test(param) ? "id" : "slug";
  const { data } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq(col, param)
    .maybeSingle();
  return data;
}

export const Route = createFileRoute("/pneu/$productId")({
  loader: async ({ params }) => {
    const product = await fetchProductByParam(params.productId);
    if (product) return { product };
    return { product: null };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return generateMetadata({ title: "Produto não encontrado", description: "" });
    const metadata = generateMetadata({
      title: product.name,
      description: product.description ?? "",
      image: product.images?.[0] ?? undefined,
      url: `/pneu/${product.slug ?? product.id}`,
    });

    const specs = (product.specs ?? {}) as Record<string, any>;
    const brandName = specs.brand || specs.marca || "R&A Atacadista";
    const availability = (product.stock ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

    return {
      ...metadata,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images?.[0],
            "description": product.description,
            "sku": product.sku,
            "gtin": product.gtin,
            "brand": { "@type": "Brand", "name": brandName },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "BRL",
              "price": product.price,
              "availability": availability,
              "url": `https://atacadistapneus.com/pneu/${product.slug ?? product.id}`
            }
          })
        }
      ]
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product: initialProduct } = Route.useLoaderData();
  const { productId } = Route.useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCart((state) => state.addItem);
  const openCart = useCart((state) => state.openCart);
  
  const navigate = useNavigate();

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductByParam(productId),
    initialData: initialProduct,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related-products", product?.category_id, product?.id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price, images")
        .eq("category_id", product!.category_id as string)
        .neq("id", product!.id)
        .limit(4);
      return data ?? [];
    },
  });

  if (!product)
    return <div className="container py-20 px-4 mx-auto text-center">Produto não encontrado.</div>;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || "",
    });
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate({ to: "/checkout" });
  };

  const inStock = (product.stock ?? 0) > 0;
  const specs = (product.specs ?? {}) as Record<string, any>;
  const specEntries = Object.entries(specs).filter(([k]) => k !== "info_tecnica" && k !== "informacoesTecnicas" && k !== "veiculos_por_marca");

  // Extract Inmetro values from technical info if not present in root
  const infoTecnica = (specs.info_tecnica || specs.informacoesTecnicas) as any[];
  let consumo = specs.consumo;
  let aderencia = specs.aderencia;
  let ruido_db = specs.ruido_db;

  if (Array.isArray(infoTecnica)) {
    infoTecnica.forEach(item => {
      const label = (item.label || item.texto || "").toLowerCase();
      const value = String(item.value || (item.texto?.split(":")[1] || "")).trim();
      
      if (label.includes("consumo") || label.includes("rolamento")) {
        consumo = consumo || value;
      } else if (label.includes("aderência") || label.includes("pista molhada")) {
        aderencia = aderencia || value;
      } else if (label.includes("ruído") || label.includes("db")) {
        ruido_db = ruido_db || value.replace(/\D/g, "");
      }
    });
  }

  // Build canonical spec rows (always show what we have)
  const baseRows: Array<[string, string | number | null | undefined]> = [
    ["Produto", product.name],
    ["Categoria", product.categories?.name],
    ["SKU", product.sku],
    ["Código de barras", product.gtin],
  ];
  const rows = [...baseRows, ...specEntries].filter(([, v]) => v !== null && v !== undefined && v !== "" && typeof v !== "object");

  return (
    <div className="container px-4 mx-auto py-4 md:py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4 whitespace-nowrap overflow-hidden">
        <Link to="/" className="hover:text-safety-orange inline-flex items-center shrink-0" aria-label="Início">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        {(specs as any).marca && (
          <>
            <Link
              to="/products"
              search={{ brand: String((specs as any).marca) }}
              className="hover:text-safety-orange shrink-0"
            >
              {String((specs as any).marca)}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
          </>
        )}
        <span className="text-industrial-blue font-medium truncate min-w-0">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden p-6">
            <img
              src={getProductImageUrl(product.images?.[activeImage] ?? product.images?.[0], { width: 800, quality: 85 })}
              alt={product.name}
              onError={onProductImageError}
               className="h-full w-full object-contain" loading="eager" fetchPriority="high" width="600" height="600"
            />

            {(consumo || aderencia || ruido_db) && (
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                {consumo && (
                  <EtiquetaBadge src="/etiquetas/consumo.webp" alt="Consumo" value={consumo} width="48" height="64" />
                )}
                {aderencia && (
                  <EtiquetaBadge src="/etiquetas/aderencia.webp" alt="Aderência" value={aderencia} width="48" height="64" />
                )}
                {ruido_db && (
                  <EtiquetaBadge
                    src="/icons/noise-badge.png"
                    alt="Ruído"
                    value={String(ruido_db)}
                    suffix="dB"
                    width="48"
                    height="64"
                  />
                )}
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square bg-white border-2 rounded-lg overflow-hidden p-2 transition ${
                    i === activeImage ? "border-industrial-blue" : "border-muted hover:border-industrial-blue/50"
                  }`}
                >
                  <img src={getProductImageUrl(img, { width: 150, quality: 75 })} alt={`${product.name} ${i + 1}`} onError={onProductImageError} className="w-full h-full object-contain" loading="lazy" width="100" height="100" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col space-y-3">
          {getBrandLogo(product.name) && (
            <div className="h-10 w-32 flex items-center justify-start mb-2">
              <img
                src={getBrandLogo(product.name)!}
                alt="Marca"
                className="max-h-full max-w-full object-contain object-left"
                loading="lazy"
                onError={(e) => { (e.currentTarget.parentElement as HTMLDivElement).style.display = "none"; }}
              />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {product.name}
          </h1>

          {product.gtin && (
            <p className="text-[10px] text-muted-foreground -mt-1">
              GTIN/EAN: {product.gtin}
            </p>
          )}

          {product.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: <span className="font-medium text-foreground">{product.sku}</span>
            </p>
          )}

          {/* Price */}
          <div className="border-y py-3">
            <span className="text-4xl md:text-5xl font-bold text-industrial-blue dark:text-primary tracking-tight">
              R$ {product.price.toFixed(2)}
            </span>
          </div>

          {/* Pix offer banner */}
          <div className="flex items-center gap-3 bg-green-600 text-white rounded-xl px-4 py-3 shadow-md">
            <Zap className="h-5 w-5 shrink-0" />
            <span className="font-bold text-sm md:text-base">Oferta válida para pagamento via Pix!</span>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={String(quantity)} onValueChange={(v) => setQuantity(Number(v))}>
              <SelectTrigger className="w-[140px] h-11 rounded-full border-2 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={String(n)} className="font-bold">
                    {n} {n === 1 ? "PNEU" : "PNEUS"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* Action */}
          <Button
            disabled={!inStock}
            className="w-full h-12 bg-industrial-blue hover:bg-industrial-blue/90 text-white font-bold"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="h-5 w-5 mr-2" /> COMPRAR
          </Button>

          {/* Veículos Aplicáveis */}
          {((Array.isArray((specs as any).veiculos) && (specs as any).veiculos.length > 0) || (typeof (specs as any).veiculos === "string" && (specs as any).veiculos.trim().length > 0)) && (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("veiculos-compativeis");
                if (el) {
                  if (window.location.hash !== "#veiculos-compativeis") {
                    window.history.replaceState(null, "", "#veiculos-compativeis");
                    window.dispatchEvent(new HashChangeEvent("hashchange"));
                  } else {
                    window.dispatchEvent(new HashChangeEvent("hashchange"));
                  }
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md border-2 border-industrial-blue text-industrial-blue dark:text-primary font-bold text-sm"
            >
              <Car className="h-5 w-5" /> Veículos Aplicáveis
            </button>
          )}

          {/* Shipping calculator */}
          <ShippingCalculator />


        </div>
      </div>

      <ProductSpecsSection specs={specs} />

      <EspecificacoesTable product={product} specs={specs} />

      {product.description && (
        <section className="mt-12">
          <div className="border-b mb-6">
            <h2 className="inline-block pb-3 border-b-4 border-safety-orange font-black text-lg text-industrial-blue dark:text-primary">
              Descrição do produto
            </h2>
          </div>
          <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
            {product.description}
          </div>
        </section>
      )}

      <AdditionalInfoSection texto={(specs as any).informacaoAdicional} />
      <VehiclesSection veiculos={(specs as any).veiculos} />
      <WarrantySection garantia={(specs as any).garantia} />


      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <div className="border-b mb-8">
            <h2 className="inline-block pb-3 border-b-4 border-safety-orange font-black text-lg text-industrial-blue dark:text-primary">
              Produtos relacionados
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p: any) => (
              <Link
                key={p.id}
                to="/pneu/$productId"
                params={{ productId: (p as any).slug ?? p.id }}
                className="group bg-white dark:bg-card rounded-xl border overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex items-center justify-center w-full h-[180px] overflow-hidden bg-white p-2">
                  <img
                    src={getProductImageUrl(p.images?.[0], { width: 300, quality: 75 })}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    onError={onProductImageError}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '160px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                    width="400"
                    height="400"
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                  <p className="text-lg font-black text-industrial-blue dark:text-primary">
                    R$ {Number(p.price).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EtiquetaBadge({
  src,
  alt,
  value,
  suffix,
  width,
  height,
}: {
  src: string;
  alt: string;
  value?: string | number | null;
  suffix?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div className="relative w-12 sm:w-14 drop-shadow-md">
      <img src={src} alt={alt} className="w-full h-auto" loading="lazy" width={width || "56"} height={height || "70"} />
      {value && (
        <span className="absolute inset-x-0 bottom-[6%] flex items-center justify-center text-white font-extrabold leading-none text-[11px] sm:text-[13px]">
          {value}
          {suffix ? <span className="ml-[1px] text-[8px]">{suffix}</span> : null}
        </span>
      )}
    </div>
  );
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function ShippingCalculator() {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ logradouro?: string; bairro?: string; localidade?: string; uf?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("CEP inválido");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data?.erro) {
        setError("CEP não encontrado");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setError("Erro ao consultar CEP");
    } finally {
      setLoading(false);
    }
  };

  // Estimate delivery: 6-7 business days from today
  const addBusinessDays = (date: Date, days: number) => {
    const d = new Date(date);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return d;
  };
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const today = new Date();
  const start = addBusinessDays(today, 6);
  const end = addBusinessDays(today, 7);
  const monthName = months[end.getMonth()];

  const address = result
    ? [result.logradouro, result.bairro].filter(Boolean).join(", ") +
      (result.localidade ? ` - ${result.localidade}` : "") +
      (result.uf ? ` - ${result.uf}` : "")
    : null;

  return (
    <div className="pt-3 border-t">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">Frete e prazo</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); lookup(); }}
          className="relative"
        >
          <Input
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            placeholder="Digite seu CEP"
            inputMode="numeric"
            maxLength={9}
            className="h-11 rounded-full pr-12"
          />
          <button
            type="submit"
            aria-label="Buscar CEP"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-industrial-blue"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </form>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {address && (
          <div className="flex items-start gap-2 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-industrial-blue shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>
        )}

        {result && (
          <div className="flex items-start gap-3 text-sm pt-1">
            <Truck className="h-5 w-5 text-industrial-blue shrink-0 mt-0.5" />
            <ul className="space-y-0.5">
              <li><span className="font-bold">Forma de envio:</span> Transportadora</li>
              <li><span className="font-bold">Valor:</span> Grátis</li>
              <li><span className="font-bold">Prazo:</span> 6 a 7 dias úteis</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
