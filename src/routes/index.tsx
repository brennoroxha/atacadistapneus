import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getFeaturedProducts, getCategories, getProductsByCategorySlug } from "@/lib/products.functions";
import { supabase } from "@/lib/supabase";
import { getProductImageUrl, onProductImageError } from "@/lib/product-image";
import { TIRE_SIZES } from "@/lib/tire-sizes";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Truck, ShieldCheck, Clock, Star, MessageSquare, ShoppingCart, Search, Percent, CreditCard, Package } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

import { generateMetadata } from "@/lib/seo";

import bannerFreteHero from "@/assets/banner-frete-gratis-hero.webp";
import bannerEconomize from "@/assets/banner-bridgestone-economize.webp";
import bannerEcopia from "@/assets/banner-ep150-ecopia.webp";
import bannerFreteHeroMobile from "@/assets/banner-frete-gratis-hero-mobile.webp";
import bannerEconomizeMobile from "@/assets/banner-bridgestone-economize-mobile.webp";
import bannerEcopiaMobile from "@/assets/banner-ep150-ecopia-mobile.webp";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { getBrandLogo } from "@/lib/brand-logo";

export const Route = createFileRoute("/")({
  head: () => {
    const metadata = generateMetadata({
      title: "Sua Obra Começa Aqui",
      description: "Materiais de construção com o melhor preço e entrega rápida. Cimento, ferragens, tintas e elétrica.",
    });

    return {
      ...metadata,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ConstruMais",
            "url": "https://construmais.com.br",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://construmais.com.br/products?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }
      ]
    };
  },
  component: Index,
});

function Index() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => getFeaturedProducts(),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const addItem = useCart((state) => state.addItem);
  const openCart = useCart((state) => state.openCart);
  

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

  const features = [
    { icon: Truck, title: "Frete Grátis", desc: "Nas compras acima de R$500" },
    { icon: ShieldCheck, title: "Compra Segura", desc: "Pagamento 100% protegido" },
    { icon: Clock, title: "Entrega Rápida", desc: "Em até 24h na sua obra" },
    { icon: Star, title: "Qualidade", desc: "As melhores marcas" },
  ];

  return (
    <div className="flex flex-col gap-0">
      <HeroBannerCarousel />

      <TireSearchHero />
      <ProductSection title="Produtos em Destaque" products={products} loading={productsLoading} onAdd={handleAddToCart} carousel />
    </div>
  );
}

function HeroBannerCarousel() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const banners = [
    { src: bannerFreteHero, srcMobile: bannerFreteHeroMobile, alt: "Pneus Bridgestone e Firestone com Frete Grátis" },
    { src: bannerEconomize, srcMobile: bannerEconomizeMobile, alt: "Compre 2 pneus Bridgestone e economize" },
    { src: bannerEcopia, srcMobile: bannerEcopiaMobile, alt: "Bridgestone EP150 Ecopia 185/55R16 por R$ 519,90" },
  ];
  return (
    <div className="bg-black">
      <Carousel opts={{ loop: true }} plugins={[autoplay.current]} className="relative">
        <CarouselContent className="ml-0">
          {banners.map((b, i) => (
            <CarouselItem key={i} className="pl-0">
              <picture>
                <source media="(max-width: 767px)" srcSet={b.srcMobile} />
                <img src={b.src} alt={b.alt} className="block w-full h-auto" loading={i === 0 ? "eager" : "lazy"} />
              </picture>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 md:left-4 hidden md:flex" />
        <CarouselNext className="right-2 md:right-4 hidden md:flex" />
      </Carousel>
    </div>
  );
}

function TireSearchHero() {
  const navigate = useNavigate();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
  const [category, setCategory] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const handleSearch = () => {
    const search: any = {};
    if (query.trim()) search.search = query.trim();
    if (category) search.category = category;
    navigate({ to: "/products", search });
  };

  const benefits = [
    { icon: Truck, title: "Frete Grátis", desc: "Para todo o Brasil" },
    { icon: Percent, title: "10% OFF", desc: "Pagamento à vista" },
    { icon: CreditCard, title: "10x Sem Juros", desc: "No cartão de crédito" },
    { icon: ShieldCheck, title: "Compra Segura", desc: "Ambiente protegido" },
  ];

  return (
    <section className="relative bg-white dark:bg-card shadow-[0_8px_16px_-8px_rgba(0,0,0,0.15)]">
      <div className="container py-3 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <TireSearchByMeasure />
          <TireSearchByRim />
        </div>
      </div>
    </section>
  );
}

const ALL_COMBOS: Array<{ largura: string; altura: string; aro: string }> =
  TIRE_SIZES.map(([largura, altura, aro]) => ({ largura, altura, aro }));

function useTireCombos() {
  return { data: ALL_COMBOS };
}

const numSort = (a: string, b: string) => Number(a) - Number(b);
const uniqSorted = (arr: string[]) => [...new Set(arr)].sort(numSort);

function TireSearchByMeasure() {
  const navigate = useNavigate();
  const { data: combos = [] } = useTireCombos();
  const [largura, setLargura] = useState("");
  const [altura, setAltura] = useState("");
  const [aro, setAro] = useState("");

  const larguras = useMemo(() => uniqSorted(combos.map((c) => c.largura)), [combos]);
  const alturas = useMemo(
    () => uniqSorted(combos.filter((c) => !largura || c.largura === largura).map((c) => c.altura)),
    [combos, largura],
  );
  const aros = useMemo(
    () =>
      uniqSorted(
        combos
          .filter((c) => (!largura || c.largura === largura) && (!altura || c.altura === altura))
          .map((c) => c.aro),
      ),
    [combos, largura, altura],
  );

  const setLarguraReset = (v: string) => {
    setLargura(v);
    if (altura && !combos.some((c) => c.largura === v && c.altura === altura)) setAltura("");
    if (aro && !combos.some((c) => c.largura === v && (!altura || c.altura === altura) && c.aro === aro)) setAro("");
  };
  const setAlturaReset = (v: string) => {
    setAltura(v);
    if (aro && !combos.some((c) => (!largura || c.largura === largura) && c.altura === v && c.aro === aro)) setAro("");
  };

  const handleSearch = () => {
    const parts = [largura, altura, aro].filter(Boolean).join("/");
    navigate({ to: "/products", search: parts ? ({ search: parts } as any) : {} });
  };

  return (
    <div>
      <h3 className="text-sm md:text-base font-medium tracking-wider text-muted-foreground mb-4">
        PESQUISE PNEUS PELA <span className="font-bold text-industrial-blue dark:text-foreground">MEDIDA</span>
      </h3>
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="grid grid-cols-[1fr_1fr_90px] gap-2 md:gap-3 flex-1">
          <div className="space-y-1.5">
            <label className="text-[11px] md:text-xs font-bold tracking-wider text-muted-foreground">LARGURA</label>
            <Select value={largura} onValueChange={setLarguraReset}>
              <SelectTrigger className="rounded-full"><SelectValue placeholder="205" /></SelectTrigger>
              <SelectContent>{larguras.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] md:text-xs font-bold tracking-wider text-muted-foreground">ALTURA</label>
            <Select value={altura} onValueChange={setAlturaReset} disabled={alturas.length === 0}>
              <SelectTrigger className="rounded-full"><SelectValue placeholder="55" /></SelectTrigger>
              <SelectContent>{alturas.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] md:text-xs font-bold tracking-wider text-muted-foreground">ARO</label>
            <Select value={aro} onValueChange={setAro} disabled={aros.length === 0}>
              <SelectTrigger className="rounded-full"><SelectValue placeholder="16" /></SelectTrigger>
              <SelectContent>{aros.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSearch}
          className="w-full md:w-auto bg-[#072052] hover:bg-[#072052]/90 text-white font-bold h-10 px-6 rounded-full shrink-0"
        >
          PESQUISAR
        </Button>
      </div>
    </div>
  );
}

function TireSearchByRim() {
  const navigate = useNavigate();
  const { data: combos = [] } = useTireCombos();
  const [aro, setAro] = useState("");
  const [larguraAltura, setLarguraAltura] = useState("");

  const aros = useMemo(() => uniqSorted(combos.map((c) => c.aro)), [combos]);
  const combosLA = useMemo(() => {
    const filtered = combos.filter((c) => !aro || c.aro === aro);
    const set = new Set(filtered.map((c) => `${c.largura}/${c.altura}`));
    return [...set].sort((a, b) => {
      const [la, ha] = a.split("/").map(Number);
      const [lb, hb] = b.split("/").map(Number);
      return la - lb || ha - hb;
    });
  }, [combos, aro]);

  const setAroReset = (v: string) => {
    setAro(v);
    if (larguraAltura) {
      const [l, h] = larguraAltura.split("/");
      if (!combos.some((c) => c.aro === v && c.largura === l && c.altura === h)) setLarguraAltura("");
    }
  };

  const handleSearch = () => {
    const parts = [larguraAltura, aro].filter(Boolean).join(" ");
    navigate({ to: "/products", search: parts ? ({ search: parts } as any) : {} });
  };

  return (
    <div>
      <h3 className="text-sm md:text-base font-medium tracking-wider text-muted-foreground mb-4">
        PESQUISE PNEUS PELO <span className="font-bold text-industrial-blue dark:text-foreground">ARO</span>
      </h3>
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="grid grid-cols-[90px_1fr] gap-2 md:gap-3 flex-1">
          <div className="space-y-1.5">
            <label className="text-[11px] md:text-xs font-bold tracking-wider text-muted-foreground">ARO</label>
            <Select value={aro} onValueChange={setAroReset}>
              <SelectTrigger className="rounded-full"><SelectValue placeholder="16" /></SelectTrigger>
              <SelectContent>{aros.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] md:text-xs font-bold tracking-wider text-muted-foreground">LARGURA/ALTURA</label>
            <Select value={larguraAltura} onValueChange={setLarguraAltura} disabled={combosLA.length === 0}>
              <SelectTrigger className="rounded-full"><SelectValue placeholder="205/55" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">{combosLA.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSearch}
          className="w-full md:w-auto bg-[#072052] hover:bg-[#072052]/90 text-white font-bold h-10 px-6 rounded-full shrink-0"
        >
          PESQUISAR
        </Button>
      </div>
    </div>
  );
}

function CategorySection({ title, slug, onAdd, mobileCarousel }: any) {
  const { data, isLoading } = useQuery({
    queryKey: ["category-products", slug],
    queryFn: () => getProductsByCategorySlug({ data: { slug, limit: 8 } }),
  });
  if (!isLoading && (!data || data.length === 0)) return null;
  return <ProductSection title={title} products={data} loading={isLoading} onAdd={onAdd} mobileCarousel={mobileCarousel} />;
}

function ProductSection({ title, products, loading, onAdd, mobileCarousel, carousel }: any) {
  const renderProduct = (product: any) => {
    const fromPrice = product.price * 1.2;
    const discount = Math.round(((fromPrice - product.price) / fromPrice) * 100);
    return (
      <div key={product.id} className={`group flex flex-col bg-white dark:bg-card rounded-lg border overflow-hidden shadow-sm transition-all hover:shadow-md h-full`}>
        <div className="relative shrink flex flex-col">
          {getBrandLogo(product.name) && (
            <div className="w-full">
              <img
                src={getBrandLogo(product.name)!}
                alt="Marca"
                loading="lazy"
                className="w-full h-auto block"
                onError={(e) => ((e.currentTarget.style.display = "none"))}
              />
            </div>
          )}
          <Link to="/pneu/$productId" params={{ productId: product.slug ?? product.id }} className="relative block aspect-square overflow-hidden bg-white p-2">
            <img
              src={getProductImageUrl(product.images?.[0])}
              alt={product.name}
              loading="lazy" decoding="async"
              onError={onProductImageError}
              className="h-full w-full object-contain scale-[1.15] transition-transform duration-500 group-hover:scale-[1.25]"
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
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 sm:min-h-[2.5rem]">
            <Link to="/pneu/$productId" params={{ productId: product.slug ?? product.id }} title={product.name}>
              {product.name}
            </Link>
          </h3>
          <div className="text-xl font-black text-safety-orange tracking-tight leading-none">
            R$ {product.price.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white py-10 md:py-16 overflow-hidden">
      <div className="container px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6">
          <div className="space-y-2">
            {title === "Produtos em Destaque" ? (
              <h2 className="font-sans text-sm md:text-lg font-black tracking-tight uppercase flex items-center gap-1.5">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-safety-orange" strokeWidth={2.5} />
                <span className="text-muted-foreground">Produtos em</span>
                <span className="text-safety-orange">Destaque</span>
              </h2>
            ) : (
              <h2 className="text-2xl font-black tracking-tighter text-black dark:text-primary">{title}</h2>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] bg-white border animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : carousel ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative px-10 md:px-0"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products?.map((product: any) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  {renderProduct(product)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-12 h-10 w-10" />
            <CarouselNext className="-right-4 md:-right-12 h-10 w-10" />
          </Carousel>
        ) : mobileCarousel ? (
          <div className="flex gap-3 md:gap-6 overflow-x-auto snap-x snap-mandatory -mx-4 px-[12%] md:px-[18%] lg:px-[12.5%] scrollbar-hide">
            {products?.map((product: any) => (
              <div key={product.id} className="snap-center shrink-0 w-[76%] md:w-[32%] lg:w-[24%]">
                {renderProduct(product)}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {products?.map((product: any) => renderProduct(product))}
          </div>
        )}
      </div>
    </section>
  );
}

function EtiquetaBadge({ src, alt, value, suffix }: { src: string; alt: string; value?: string | number | null; suffix?: string }) {
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

