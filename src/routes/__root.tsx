import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import React, { Suspense, lazy } from "react";
const Header = lazy(() => import("@/components/Header").then(m => ({ default: m.Header })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const Newsletter = lazy(() => import("@/components/Newsletter").then(m => ({ default: m.Newsletter })));

import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
const CartDrawer = lazy(() => import("@/components/CartDrawer").then(m => ({ default: m.CartDrawer })));

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-industrial-blue  tracking-tighter">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-foreground  tracking-wide">Página não encontrada</h2>
        <p className="mt-4 text-muted-foreground">
          O material que você procura não está aqui. Que tal voltar para a página inicial?
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-safety-orange px-8 py-4 text-sm font-black  tracking-widest text-black transition-all hover:scale-105 active:scale-95"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold  tracking-widest text-industrial-blue">
          Ocorreu um erro inesperado
        </h1>
        <p className="mt-4 text-muted-foreground">
          Não conseguimos carregar esta página. Tente novamente ou entre em contato com nosso suporte.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-industrial-blue px-8 py-4 text-sm font-black  tracking-widest text-white transition-all hover:scale-105"
          >
            Tentar Novamente
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border-2 border-industrial-blue px-8 py-4 text-sm font-black  tracking-widest text-industrial-blue transition-all hover:bg-muted"
          >
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "google-site-verification", content: "Yu6tmExDSnlXofSugEBX4d2HJMERKsSQ17FO7cHZwbM" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atacadista Pneus - Pneus Atacado e Varejo" },
      { name: "description", content: "A maior loja de pneus do Brasil. Atacado e varejo com os melhores preços e entrega rápida." },
      { name: "author", content: "Atacadista Pneus" },
      { property: "og:title", content: "Atacadista Pneus - Pneus Atacado e Varejo" },
      { property: "og:description", content: "A maior loja de pneus do Brasil. Atacado e varejo com os melhores preços e entrega rápida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0e1629" },
      { name: "twitter:title", content: "Atacadista Pneus - Pneus Atacado e Varejo" },
      { name: "twitter:description", content: "A maior loja de pneus do Brasil. Atacado e varejo com os melhores preços e entrega rápida." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/P1BGVl6n13e77OYjLdHoAVwk1Nv2/social-images/social-1779680339725-ChatGPT_Image_24_de_mai._de_2026,_23_00_01.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/P1BGVl6n13e77OYjLdHoAVwk1Nv2/social-images/social-1779680339725-ChatGPT_Image_24_de_mai._de_2026,_23_00_01.webp" },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
        type: "image/x-icon"
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preconnect",
        href: "https://kssyjenfoxhnkdnhjtdc.supabase.co",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },

    ],
    scripts: [
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-805GXF6771",
      },
      {
        children: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-805GXF6771');`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased selection:bg-safety-orange selection:text-black">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isCheckout = pathname.startsWith("/checkout");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<div className="h-20 bg-white" />}>
          {!isCheckout && <Header />}
        </Suspense>
        <main className={isCheckout ? "flex-1" : "flex-1"}>
          <Outlet />
        </main>
        {!isCheckout && (
          <>
            
            <Suspense fallback={<div className="h-40 bg-neutral-200" />}>
              <Newsletter />
              <Footer />
            </Suspense>
          </>
        )}
        <CookieBanner />
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      </div>
      <Toaster position="top-right" closeButton />
    </QueryClientProvider>
  );
}
