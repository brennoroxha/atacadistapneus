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
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import bannerFreteBrasil from "@/assets/banner-frete-gratis-brasil.webp";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CartDrawer } from "@/components/CartDrawer";

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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Comercial Ferragens - Materiais de Construção Online" },
      { name: "description", content: "A maior loja de materiais de construção do Brasil. Cimento, ferragens, tintas e muito mais com entrega rápida." },
      { name: "author", content: "ConstruMais" },
      { property: "og:title", content: "Comercial Ferragens - Materiais de Construção Online" },
      { property: "og:description", content: "A maior loja de materiais de construção do Brasil. Cimento, ferragens, tintas e muito mais com entrega rápida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0e1629" },
      { name: "twitter:title", content: "Comercial Ferragens - Materiais de Construção Online" },
      { name: "twitter:description", content: "A maior loja de materiais de construção do Brasil. Cimento, ferragens, tintas e muito mais com entrega rápida." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9a50d2b8-c953-426c-8db6-a1a4536971f6/id-preview-fb2f4db5--cc272ab3-98a1-4680-a00c-61cdff12d863.lovable.app-1778607776498.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9a50d2b8-c953-426c-8db6-a1a4536971f6/id-preview-fb2f4db5--cc272ab3-98a1-4680-a00c-61cdff12d863.lovable.app-1778607776498.png" },
    ],
    links: [
      {
        rel: "icon",
        href: "https://raw.githubusercontent.com/lucide-react/lucide/main/icons/hard-hat.svg",
        type: "image/svg+xml"
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
        {!isCheckout && <Header />}
        <main className={isCheckout ? "flex-1" : "flex-1"}>
          <Outlet />
        </main>
        {!isCheckout && (
          <>
            <img src={bannerFreteBrasil} alt="Frete grátis para todo o Brasil" className="block w-full h-auto" loading="lazy" />
            <Newsletter />
            <Footer />
            
          </>
        )}
        <CookieBanner />
        <CartDrawer />
      </div>
      <Toaster position="top-right" closeButton />
    </QueryClientProvider>
  );
}
