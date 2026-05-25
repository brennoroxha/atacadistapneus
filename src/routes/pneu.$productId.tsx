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
import { ProductSpecsSection, AdditionalInfoSection, VehiclesSection, WarrantySection, DescriptionSection } from "@/components/ProductSpecsSection";
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
  loader: async ({ params }) => fetchProductByParam(params.productId),
  head: ({ loaderData }) => {
    if (!loaderData) return generateMetadata({ title: "Produto não encontrado", description: "" });
    return generateMetadata({
      title: loaderData.name,
      description: loaderData.description ?? "",
      image: loaderData.images?.[0] ?? undefined,
      url: `/pneu/${loaderData.slug ?? loaderData.id}`,
    });
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const [quantity, setQuantity] = useState(4);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCart((state) => state.addItem);
  const openCart = useCart((state) => state.openCart);
  
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductByParam(productId),
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

  if (isLoading)
    return <div className="container py-20 px-4 mx-auto animate-pulse h-[600px] bg-muted rounded-xl"></div>;
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
  const specs = (product.specs ?? {}) as Record<string, string | number>;
  const specEntries = Object.entries(specs);

  // Build canonical spec rows (always show what we have)
  const baseRows: Array<[string, string | number | null | undefined]> = [
    ["Produto", product.name],
    ["Categoria", product.categories?.name],
    ["SKU", product.sku],
    ["Código de barras", product.gtin],
  ];
  const rows = [...baseRows, ...specEntries].filter(([, v]) => v !== null && v !== undefined && v !== "");

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
              src={product.images?.[activeImage] ?? product.images?.[0]}
              alt={product.name}
              className="h-full w-full object-contain"
            />
            {((specs as any).consumo || (specs as any).aderencia || (specs as any).ruido_db) && (
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                {(specs as any).consumo && (
                  <EtiquetaBadge src="/etiquetas/consumo.webp" alt="Consumo" value={(specs as any).consumo} />
                )}
                {(specs as any).aderencia && (
                  <EtiquetaBadge src="/etiquetas/aderencia.webp" alt="Aderência" value={(specs as any).aderencia} />
                )}
                {(specs as any).ruido_db && (
                  <EtiquetaBadge src="/etiquetas/ruido-alto.webp" alt="Ruído" value={String((specs as any).ruido_db)} suffix="dB" />
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
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col space-y-3">
          {getBrandLogo(product.name) && (
            <img
              src={getBrandLogo(product.name)!}
              alt="Marca"
              loading="lazy"
              className="h-10 w-32 object-contain object-left self-start"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {product.name}
          </h1>

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

          {/* Quantity selector + total */}
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
            <span className="text-base md:text-lg font-bold text-foreground">
              R$ {(product.price * quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-medium text-muted-foreground ml-1">à vista</span>
            </span>
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
          {Array.isArray((specs as any).veiculos) && (specs as any).veiculos.length > 0 && (
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

      {/* Description */}
      {product.description && (
        <DescriptionSection>
          <div className="max-w-none prose prose-sm prose-slate">
            <FormattedDescription text={product.description} />
          </div>
        </DescriptionSection>
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
                <div className="aspect-square bg-white p-4">
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    loading="lazy" decoding="async"
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
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
}: {
  src: string;
  alt: string;
  value?: string | number | null;
  suffix?: string;
}) {
  return (
    <div className="relative w-12 sm:w-14 drop-shadow-md">
      <img src={src} alt={alt} className="w-full h-auto" />
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
