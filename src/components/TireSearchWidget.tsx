
import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { TIRE_SIZES } from "@/lib/tire-sizes";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Car, Ruler } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL_COMBOS: Array<{ largura: string; altura: string; aro: string }> =
  TIRE_SIZES.map(([largura, altura, aro]) => ({ largura, altura, aro }));

const numSort = (a: string, b: string) => Number(a) - Number(b);
const uniqSorted = (arr: string[]) => [...new Set(arr)].sort(numSort);

export function TireSearchWidget() {
  const navigate = useNavigate();
  const [largura, setLargura] = useState("");
  const [altura, setAltura] = useState("");
  const [aro, setAro] = useState("");

  const combos = ALL_COMBOS;

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
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="bg-[#072052] py-4 px-6 md:px-10 flex items-center justify-between">
        <h2 className="text-white text-lg md:text-xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-safety-orange" />
          Procure o pneu certo para você
        </h2>
      </div>

      <Tabs defaultValue="medida" className="w-full">
        <div className="bg-gray-50 border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger 
              value="medida" 
              className="px-6 md:px-10 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-safety-orange data-[state=active]:bg-white data-[state=active]:text-[#072052] font-bold text-gray-500 uppercase tracking-wider text-sm flex items-center gap-2"
            >
              <Ruler className="w-4 h-4" />
              POR MEDIDA
            </TabsTrigger>
            <TabsTrigger 
              value="veiculo" 
              className="px-6 md:px-10 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-safety-orange data-[state=active]:bg-white data-[state=active]:text-[#072052] font-bold text-gray-500 uppercase tracking-wider text-sm flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              POR VEÍCULO
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6 md:p-10">
          <TabsContent value="medida" className="m-0">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#072052] uppercase tracking-widest">Largura</label>
                  <Select value={largura} onValueChange={setLarguraReset}>
                    <SelectTrigger className="h-14 bg-white border-2 border-gray-200 focus:border-safety-orange rounded-lg text-lg font-bold text-[#072052]">
                      <SelectValue placeholder="205" />
                    </SelectTrigger>
                    <SelectContent>
                      {larguras.map((v) => (
                        <SelectItem key={v} value={v} className="font-medium text-lg">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#072052] uppercase tracking-widest">Perfil</label>
                  <Select value={altura} onValueChange={setAlturaReset} disabled={alturas.length === 0}>
                    <SelectTrigger className="h-14 bg-white border-2 border-gray-200 focus:border-safety-orange rounded-lg text-lg font-bold text-[#072052]">
                      <SelectValue placeholder="55" />
                    </SelectTrigger>
                    <SelectContent>
                      {alturas.map((v) => (
                        <SelectItem key={v} value={v} className="font-medium text-lg">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#072052] uppercase tracking-widest">Aro</label>
                  <Select value={aro} onValueChange={setAro} disabled={aros.length === 0}>
                    <SelectTrigger className="h-14 bg-white border-2 border-gray-200 focus:border-safety-orange rounded-lg text-lg font-bold text-[#072052]">
                      <SelectValue placeholder="16" />
                    </SelectTrigger>
                    <SelectContent>
                      {aros.map((v) => (
                        <SelectItem key={v} value={v} className="font-medium text-lg">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full lg:w-auto min-w-[220px] h-14 bg-safety-orange hover:bg-safety-orange/90 text-white font-black text-lg rounded-lg shadow-lg shadow-safety-orange/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
              >
                BUSCAR PNEUS
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-gray-400 font-medium text-center lg:text-left italic">
              *Selecione os campos acima para encontrar a medida correta.
            </p>
          </TabsContent>

          <TabsContent value="veiculo" className="m-0">
            <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Car className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-500 mb-2">Busca por veículo em breve</h3>
              <p className="text-sm text-gray-400 max-w-xs"> Estamos preparando a melhor base de dados para você encontrar o pneu pelo seu carro.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
