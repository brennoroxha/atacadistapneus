import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Search, Menu, Phone, User, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useCart } from "@/lib/cart";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  DesktopMegaMenu,
  MobileCategoryAccordion,
} from "@/components/CategoryMenu";

export function Header() {
  const { items } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    setMobileOpen(false);
    setSearchQuery(q);
    navigate({ to: "/products", search: { search: q || undefined } as any });
  };

  return (
    <header className="relative z-50 w-full bg-white text-foreground">

      <div className="container flex h-20 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center md:-ml-[33px]"
          aria-label="Pneus"
        >
          <img
            src={logo}
            alt="Logo Pneus"
            className="h-[60px] md:h-[100px] w-auto"
          />
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 max-w-xl md:flex">
          <div className="relative w-full group">
            <Input
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Faça sua busca..."
              className="pl-4 pr-12 w-full h-12 rounded-full bg-white border-2 border-transparent text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:ring-0 focus-visible:border-industrial-blue transition-all"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-industrial-blue hover:text-industrial-blue/80 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-4 -mr-3 md:mr-0">
          <Link to="/account" className="hidden sm:flex">
            <Button variant="ghost" className="gap-2 h-12 text-industrial-blue hover:bg-transparent hover:text-industrial-blue">
              <User className="!h-7 !w-7" />
              <span className="font-semibold">Entrar</span>
            </Button>
          </Link>
          <Link to="/account" className="sm:hidden">
            <Button variant="ghost" size="icon" className="h-12 w-12 text-industrial-blue hover:bg-transparent hover:text-industrial-blue">
              <User className="!h-7 !w-7" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-12 w-12 text-industrial-blue hover:bg-transparent hover:text-industrial-blue"
            onClick={() => useCart.getState().openCart()}
            aria-label="Abrir carrinho"
          >
            <ShoppingCart className="!h-7 !w-7" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-safety-orange text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-12 w-12 text-industrial-blue">
                <Menu className="!h-7 !w-7" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">
                  <img src={logo} alt="Logo Pneus" className="h-10 w-auto" />
                </SheetTitle>
              </SheetHeader>
              <form onSubmit={submitSearch} className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="pl-10 bg-muted/40"
                  />
                </div>
              </form>
              <div className="flex-1 overflow-y-auto p-4">
                <Link
                  to="/products"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-3 text-sm font-black tracking-wide text-safety-orange border-b mb-2"
                >
                  Todos os Produtos
                </Link>
                <MobileCategoryAccordion onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="border-t p-4 grid grid-cols-2 gap-2">
                <Link to="/contact" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold">Contato</Button>
                </Link>
                <Link to="/about" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold">Sobre</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile search bar */}
      <form onSubmit={submitSearch} className="md:hidden border-t px-4 py-2 bg-background">
        <div className="relative group">
          <Input
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Faça sua busca..."
            className="pl-4 pr-12 w-full h-11 rounded-full bg-white border shadow-sm focus-visible:ring-0 transition-all"
            style={{ borderColor: "#072052" }}
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ color: "#072052" }}
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Desktop categories bar */}
      <nav className="hidden md:block text-white shadow-md shadow-black/20" style={{ backgroundColor: "#072052" }}>
        <div className="container flex items-center h-12">
          <DesktopMegaMenu />
        </div>
      </nav>
    </header>
  );
}
