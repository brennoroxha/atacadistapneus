import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TIRE_SIZES } from "@/lib/tire-sizes";
import { supabase } from "@/lib/supabase";
import { getProductImageUrl, onProductImageError } from "@/lib/product-image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Ruler, HelpCircle, Loader2 } from "lucide-react";


const ALL_COMBOS: Array<{ largura: string; altura: string; aro: string }> =
  TIRE_SIZES.map(([largura, altura, aro]) => ({ largura, altura, aro }));

const numSort = (a: string, b: string) => Number(a) - Number(b);
const uniqSorted = (arr: string[]) => [...new Set(arr)].sort(numSort);

type Tab = "medidas" | "inteligente";

export function TireSearchWidget() {
  const [tab, setTab] = useState<Tab>("medidas");

  return (
    <div className="w-full max-w-5xl mx-auto bg-white md:rounded-2xl md:shadow-xl overflow-hidden border-0 md:border md:border-gray-100">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setTab("medidas")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-4 px-1 text-xs md:text-base font-bold transition-colors relative ${
            tab === "medidas"
              ? "text-[#0a2a8a]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Ruler className="w-3.5 h-3.5 md:w-5 md:h-5" />
          <span className="whitespace-nowrap">Procurar por medidas</span>
          {tab === "medidas" && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0a2a8a] rounded-t" />
          )}
        </button>
        <button
          onClick={() => setTab("inteligente")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-4 px-1 text-xs md:text-base font-bold transition-colors relative ${
            tab === "inteligente"
              ? "text-[#0a2a8a]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Search className="w-3.5 h-3.5 md:w-5 md:h-5" />
          <span className="whitespace-nowrap">Busca inteligente</span>
          {tab === "inteligente" && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0a2a8a] rounded-t" />
          )}
        </button>
      </div>

      <div className="p-6 md:p-10 bg-gradient-to-b from-white via-blue-50/40 to-white">
        {tab === "medidas" ? <MedidasTab /> : <InteligenteTab />}
      </div>
    </div>
  );
}

function MedidasTab() {
  const navigate = useNavigate();
  const combos = ALL_COMBOS;
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
    navigate({
      to: "/products",
      search: {
        largura: largura ? [largura] : undefined,
        altura: altura ? [altura] : undefined,
        aro: aro ? [aro] : undefined,
      } as any,
    });
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-[14px] md:text-4xl font-black text-gray-900 tracking-tighter whitespace-nowrap">
        Encontre o pneu informando as medidas
      </h2>
      <p className="mt-2 text-sm md:text-base text-gray-500">
        O jeito mais fácil e rápido de achar o pneu perfeito para o seu veículo
      </p>


      <div className="w-full flex flex-col lg:flex-row items-stretch gap-3 mt-4">
        <div className="grid grid-cols-3 gap-2 md:gap-3 flex-1">
          <Select value={largura} onValueChange={setLarguraReset}>
            <SelectTrigger className="h-12 rounded-full border-2 border-[#0a2a8a]/30 hover:border-[#0a2a8a] data-[state=open]:border-[#0a2a8a] font-semibold text-[#0a2a8a]">
              <SelectValue placeholder="Largura" />
            </SelectTrigger>
            <SelectContent>{larguras.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={altura} onValueChange={setAlturaReset} disabled={alturas.length === 0}>
            <SelectTrigger className="h-12 rounded-full border-2 border-[#0a2a8a]/30 hover:border-[#0a2a8a] data-[state=open]:border-[#0a2a8a] font-semibold text-[#0a2a8a]">
              <SelectValue placeholder="Altura" />
            </SelectTrigger>
            <SelectContent>{alturas.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={aro} onValueChange={setAro} disabled={aros.length === 0}>
            <SelectTrigger className="h-12 rounded-full border-2 border-[#0a2a8a]/30 hover:border-[#0a2a8a] data-[state=open]:border-[#0a2a8a] font-semibold text-[#0a2a8a]">
              <SelectValue placeholder="Aro" />
            </SelectTrigger>
            <SelectContent>{aros.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSearch}
          className="h-12 px-10 rounded-full bg-[#5cdb5c] hover:bg-[#4cc94c] text-white font-black tracking-widest text-base shadow-md shadow-green-500/20 lg:w-auto w-full"
        >
          BUSCAR
        </Button>
      </div>
    </div>
  );
}

function InteligenteTab() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data: results, isFetching } = useQuery({
    queryKey: ["smart-search", debounced],
    queryFn: async () => {
      if (debounced.length < 2) return [];
      const terms = debounced.split(/\s+/).filter((t) => t.length > 1);
      let q = supabase.from("products").select("id, name, slug, images, price").gt("price", 0).limit(8);
      terms.forEach((term) => {
        q = q.or(`name.ilike.%${term}%,description.ilike.%${term}%,gtin.ilike.%${term}%`);
      });
      const { data } = await q;
      return data ?? [];
    },
    enabled: debounced.length >= 2,
  });

  const submit = () => {
    if (!query.trim()) return;
    navigate({ to: "/products", search: { search: query.trim() } as any });
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-[14px] md:text-4xl font-black text-gray-900 tracking-tighter whitespace-nowrap">
        Use a busca inteligente
      </h2>
      <p className="mt-2 text-sm md:text-base text-[#c97a00] font-medium">
        Pesquise por medida, aro ou marca
      </p>

      <div ref={containerRef} className="w-full max-w-3xl mx-auto mt-6 relative">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Pesquise aqui"
            className="h-14 md:h-16 pl-6 pr-14 rounded-full border-2 border-[#0a2a8a]/40 focus-visible:border-[#0a2a8a] focus-visible:ring-0 text-base md:text-lg shadow-sm"
          />
          <button
            onClick={submit}
            aria-label="Buscar"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-[#0a2a8a] hover:bg-[#0a2a8a]/5 transition"
          >
            {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        </div>

        {open && debounced.length >= 2 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-left">
            {!results || results.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 text-center">
                {isFetching ? "Buscando..." : "Nenhum produto encontrado"}
              </div>
            ) : (
              <ul className="max-h-[360px] overflow-auto divide-y divide-gray-100">
                {results.map((p: any) => (
                  <li key={p.id}>
                    <Link
                      to="/pneu/$productId"
                      params={{ productId: p.slug ?? p.id }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={getProductImageUrl(p.images?.[0])}
                          alt=""
                          onError={onProductImageError}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-sm md:text-base text-gray-800 font-medium truncate">
                        {p.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-start gap-2 text-sm text-gray-500">
          <HelpCircle className="w-4 h-4" />
          <span>Como identifico a medida do pneu do meu veículo?</span>
        </div>
      </div>
    </div>
  );
}
