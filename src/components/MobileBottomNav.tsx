import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Search, User } from "lucide-react";
import { useState } from "react";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setQuery("");
    navigate({ to: "/products", search: { search: q || undefined } as any });
  };

  return (
    <>
      {searchOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/50 flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={submitSearch}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-background rounded-xl shadow-2xl p-4 flex gap-2"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos..."
              className="flex-1 bg-muted/40 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-safety-orange"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-safety-orange text-black font-bold text-sm"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background border-t shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <ul className="grid grid-cols-3">
          <li>
            <Link
              to="/"
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wider ${
                isActive("/") && location.pathname === "/" ? "text-safety-orange" : "text-muted-foreground"
              }`}
            >
              <Home className="h-5 w-5" />
              INÍCIO
            </Link>
          </li>
          <li>
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wider text-muted-foreground"
            >
              <Search className="h-5 w-5" />
              PESQUISAR
            </button>
          </li>
          <li>
            <Link
              to="/account"
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wider ${
                isActive("/account") ? "text-safety-orange" : "text-muted-foreground"
              }`}
            >
              <User className="h-5 w-5" />
              CONTA
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
