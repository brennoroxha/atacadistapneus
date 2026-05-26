import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getFeaturedProducts, getCategories, getProductsByCategorySlug } from "@/lib/products.functions";
import { supabase } from "@/lib/supabase";
import {
  getProductCardImageUrl,
  onProductImageError,
  PRODUCT_CARD_IMAGE_CONTAINER_STYLE,
  PRODUCT_CARD_IMAGE_STYLE,
} from "@/lib/product-image";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Truck, ShieldCheck, Clock, Star, MessageSquare, ShoppingCart, Search, Percent, CreditCard, Package } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

import { generateMetadata } from "@/lib/seo";

import bannerFreteHero from "@/assets/banner-frete-gratis-hero.webp";
import bannerEconomize from "@/assets/banner-bridgestone-economize.webp";
import bannerEcopia from "@/assets/banner-ep150-ecopia.webp";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { getBrandLogo } from "@/lib/brand-logo";
import { TireSearchWidget } from "@/components/TireSearchWidget";

export const Route = createFileRoute("/")({
  head: () => {
    const metadata = generateMetadata({
      title: "Pneus com o Melhor Preço e Entrega Rápida",
      description: "Distribuidora de pneus com os melhores preços do Brasil. Bridgestone, Firestone, Goodyear e mais. Entrega rápida e pagamento facilitado.",
    });

    return {
      ...metadata,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Atacadista Pneus",
            "url": "https://atacadistapneus.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://atacadistapneus.com/products?q={search_term_string}",
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
    { src: bannerFreteHero, alt: "Pneus Bridgestone e Firestone com Frete Grátis" },
    { src: bannerEconomize, alt: "Compre 2 pneus Bridgestone e economize" },
    { src: bannerEcopia, alt: "Bridgestone EP150 Ecopia 185/55R16 por R$ 519,90" },
  ];
  return (
    <div className="bg-white">
      <Carousel opts={{ loop: true }} plugins={[autoplay.current]} className="relative bg-white overflow-hidden">
        <CarouselContent className="ml-0 bg-white">
          {banners.map((b, i) => (
            <CarouselItem key={i} className="pl-0">
              <img
                src={b.src}
                alt={b.alt}
                className="w-full h-auto"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                width="1920"
                height="384"
              />
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
  return (
    <section className="relative bg-gray-50 dark:bg-card py-0 md:py-20 px-0 md:px-4">
      <div className="md:container">
        <TireSearchWidget />
      </div>
    </section>
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
            <div className="w-full h-16 flex items-center justify-center px-3 py-3">
              <img
                src={getBrandLogo(product.name)!}
                alt="Marca"
                className="h-full w-auto object-contain"
                loading="lazy"
                onError={(e) => ((e.currentTarget.parentElement!.style.display = "none"))}
              />
            </div>
          )}
          <div className="relative">
            <Link to="/pneu/$productId" params={{ productId: product.slug ?? product.id }} className="block">
              <div style={PRODUCT_CARD_IMAGE_CONTAINER_STYLE}>
                <img
                  src={getProductCardImageUrl(product.images?.[0])}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  onError={onProductImageError}
                  style={PRODUCT_CARD_IMAGE_STYLE}
                  width="400"
                  height="400"
                />
              </div>
            </Link>
            {(product.specs?.consumo || product.specs?.aderencia || product.specs?.ruido_db) && (
              <div className="absolute right-2 bottom-2 flex flex-col items-end gap-1 pointer-events-none">
                {product.specs?.consumo && <EtiquetaBadge src="/etiquetas/consumo.webp" alt="Consumo" value={product.specs.consumo} />}
                {product.specs?.aderencia && <EtiquetaBadge src="/etiquetas/aderencia.webp" alt="Aderência" value={product.specs.aderencia} />}
                {product.specs?.ruido_db && (
                  <EtiquetaBadge
                    src={
                      Number(product.specs.ruido_db) <= 69
                        ? "/icons/noise-low.png"
                        : Number(product.specs.ruido_db) <= 73
                        ? "/icons/noise-medium.png"
                        : "/icons/noise-high.png"
                    }
                    alt="Ruído"
                    value={`${product.specs.ruido_db}`}
                    suffix="dB"
                  />
                )}
              </div>
            )}
          </div>
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
              align: "center",
              loop: true,
            }}
            className="w-full relative md:px-0"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products?.map((product: any) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  {renderProduct(product)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-12 h-10 w-10 hidden md:flex" />
            <CarouselNext className="-right-4 md:-right-12 h-10 w-10 hidden md:flex" />
          </Carousel>
        ) : mobileCarousel ? (
          <div className="flex gap-3 md:gap-6 overflow-x-auto snap-x snap-mandatory -mx-4 px-[18%] md:px-[18%] lg:px-[12.5%] scrollbar-hide">
            {products?.map((product: any) => (
              <div key={product.id} className="snap-center shrink-0 w-[64%] md:w-[32%] lg:w-[24%]">
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
      <img src={src} alt={alt} className="w-full h-auto" loading="lazy" width="56" height="70" />
      {value && (
        <span className="absolute inset-x-0 bottom-[6%] flex items-center justify-center text-white font-extrabold leading-none text-[10px] sm:text-[11px]">
          {value}
          {suffix ? <span className="ml-[1px] text-[7px]">{suffix}</span> : null}
        </span>
      )}
    </div>
  );
}

