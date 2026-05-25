import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { pathFromDbSlug } from "@/lib/category-paths";

/** Build the public URL for a category. Aro-level slugs go to /tipo/aro-N, others stay on /products?category=... */
function categoryLinkProps(dbSlug: string): any {
  const parts = pathFromDbSlug(dbSlug);
  if (parts) {
    return { to: "/$tipo/aro-{$aro}", params: { tipo: parts.tipo, aro: parts.aro } };
  }
  return { to: "/products", search: { category: dbSlug } };
}


type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type CategoryNode = Category & { children: CategoryNode[]; productCount: number };

function useTireMenuData() {
  return useQuery({
    queryKey: ["tire-menu-tree"],
    queryFn: async () => {
      const [{ data: cats, error: e1 }, { data: counts, error: e2 }] = await Promise.all([
        supabase.from("categories").select("id, name, slug, parent_id"),
        supabase.from("products").select("category_id"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;

      const countMap = new Map<string, number>();
      (counts ?? []).forEach((p: { category_id: string | null }) => {
        if (!p.category_id) return;
        countMap.set(p.category_id, (countMap.get(p.category_id) ?? 0) + 1);
      });

      const all = (cats ?? []) as Category[];
      const byParent = new Map<string | null, Category[]>();
      all.forEach((c) => {
        const arr = byParent.get(c.parent_id) ?? [];
        arr.push(c);
        byParent.set(c.parent_id, arr);
      });

      const build = (cat: Category): CategoryNode => {
        const children = (byParent.get(cat.id) ?? []).map(build);
        const ownCount = countMap.get(cat.id) ?? 0;
        const totalCount = ownCount + children.reduce((s, c) => s + c.productCount, 0);
        return { ...cat, children, productCount: totalCount };
      };

      const pneus = all.find((c) => c.slug === "pneus");
      if (!pneus) return { vehicleTypes: [] as CategoryNode[] };

      const vehicleTypes = (byParent.get(pneus.id) ?? [])
        .map(build)
        .filter((vt) => vt.productCount > 0);

      // Sort each vehicle type's aros (by numeric value extracted from name)
      const aroNum = (name: string) => {
        const m = name.match(/(\d+(?:[.,]\d+)?)/);
        return m ? parseFloat(m[1].replace(",", ".")) : 999;
      };
      vehicleTypes.forEach((vt) => {
        vt.children = vt.children
          .filter((c) => c.productCount > 0)
          .sort((a, b) => aroNum(a.name) - aroNum(b.name));
      });

      return { vehicleTypes };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Desktop mega menu: "Navegue por" → vehicle types in columns with their aros */
export function DesktopMegaMenu() {
  const { data } = useTireMenuData();
  const vehicleTypes = data?.vehicleTypes ?? [];
  const [tab] = useState<"aros">("aros");

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            onPointerMove={(e) => e.preventDefault()}
            onPointerLeave={(e) => e.preventDefault()}
            className="font-bold tracking-wide text-base bg-transparent text-white hover:bg-transparent hover:text-white focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-white px-0"
          >
            Escolha seu pneu
          </NavigationMenuTrigger>
          <NavigationMenuContent
            onPointerEnter={(e) => e.preventDefault()}
            onPointerLeave={(e) => e.preventDefault()}
          >
            <div className="flex w-[min(95vw,1200px)] max-h-[70vh] overflow-hidden">
              {/* Left sidebar tabs */}
              <aside className="w-44 shrink-0 border-r bg-muted/30 p-4 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  Navegue por:
                </span>
                <button
                  type="button"
                  className={cn(
                    "text-left text-sm font-semibold py-1.5 transition-colors",
                    tab === "aros"
                      ? "text-industrial-blue"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Aros
                </button>
              </aside>

              {/* Columns */}
              <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
                {vehicleTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria com produtos disponíveis.
                  </p>
                ) : (
                  <div className="flex gap-6 min-w-max">
                    {vehicleTypes.map((vt) => (
                      <div key={vt.id} className="min-w-[120px]">
                        <Link
                          to="/products"
                          search={{ category: vt.slug }}
                          className="block text-sm font-bold text-industrial-blue mb-2 hover:text-safety-orange"
                        >
                          {vt.name}{" "}
                          <span className="text-muted-foreground font-normal">({vt.productCount})</span>
                        </Link>
                        <ul className="flex flex-col gap-1">
                          {vt.children.map((aro) => (
                            <li key={aro.id}>
                              <Link
                                {...categoryLinkProps(aro.slug)}
                                className="text-sm text-foreground hover:text-safety-orange transition-colors block py-0.5"
                              >
                                {aro.name}{" "}
                                <span className="text-muted-foreground">({aro.productCount})</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/** Mobile: accordion tree — only shows categories with products */
export function MobileCategoryAccordion({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isLoading } = useTireMenuData();
  const vehicleTypes = data?.vehicleTypes ?? [];

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando…</div>;
  }

  if (vehicleTypes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Nenhuma categoria com produtos disponíveis.
      </p>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {vehicleTypes.map((vt) => (
        <AccordionItem key={vt.id} value={vt.id}>
          {vt.children.length > 0 ? (
            <>
              <AccordionTrigger className="text-sm font-bold tracking-wide hover:text-safety-orange">
                {vt.name}{" "}
                <span className="text-muted-foreground font-normal">({vt.productCount})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-1 pl-2">
                  <Link
                    to="/products"
                    search={{ category: vt.slug }}
                    onClick={onNavigate}
                    className="text-xs font-bold text-industrial-blue py-1.5 hover:text-safety-orange"
                  >
                    Ver tudo de {vt.name}
                  </Link>
                  {vt.children.map((sub) => (
                    <Link
                      key={sub.id}
                      {...categoryLinkProps(sub.slug)}
                      onClick={onNavigate}
                      className="text-xs text-muted-foreground py-1.5 hover:text-safety-orange"
                    >
                      {sub.name}{" "}
                      <span>({sub.productCount})</span>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </>
          ) : (
            <Link
              to="/products"
              search={{ category: vt.slug }}
              onClick={onNavigate}
              className="flex items-center justify-between py-4 text-sm font-bold tracking-wide hover:text-safety-orange border-b"
            >
              <span>
                {vt.name}{" "}
                <span className="text-muted-foreground font-normal">({vt.productCount})</span>
              </span>
              <ChevronDown className="h-4 w-4 -rotate-90 opacity-50" />
            </Link>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
