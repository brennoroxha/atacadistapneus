import { Volume2 } from "lucide-react";

interface InmetroLabelProps {
  consumption: string; // A, B, C, D, E, F, G
  grip: string; // A, B, C, D, E, F, G
  noise: number; // dB
  className?: string;
}

export function InmetroLabel({ consumption, grip, noise, className = "" }: InmetroLabelProps) {
  const ratings = ["A", "B", "C", "D", "E", "F", "G"];
  
  const getPosition = (rating: string) => {
    const idx = ratings.indexOf(rating.toUpperCase());
    return idx === -1 ? 4 : idx; // Default to E if not found
  };

  const colors = [
    "bg-green-600",
    "bg-green-500",
    "bg-lime-500",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-orange-600",
    "bg-red-600",
  ];

  return (
    <div className={`w-full max-w-[200px] bg-white border-2 border-gray-200 rounded-lg p-3 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-1 mb-1">
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 100 100" className="w-4 h-4 text-industrial-blue fill-current">
              <path d="M10,50 A40,40 0 1,1 90,50 A40,40 0 1,1 10,50 Z M40,30 L40,70 M60,30 L60,70 M40,50 L60,50" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Inmetro</span>
          </div>
          <div className="bg-yellow-400 text-[8px] font-black px-1 rounded text-black">ENERGIA</div>
        </div>


        {/* Consumo de Combustível */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <img src="/icons/specs/icon-tipo-de-uso.svg" alt="" className="w-4 h-4" />
            <span className="text-[9px] font-bold text-gray-700 uppercase">Consumo</span>
          </div>
          <div className="relative h-6 flex items-center bg-gray-100 rounded-sm overflow-hidden">
            {ratings.map((r, i) => (
              <div 
                key={r} 
                className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold text-white ${colors[i]} ${consumption.toUpperCase() === r ? "ring-2 ring-black ring-inset z-10" : "opacity-30"}`}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Aderência em Pista Molhada */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <img src="/icons/specs/icon-aderencia.svg" alt="" className="w-4 h-4" />
            <span className="text-[9px] font-bold text-gray-700 uppercase">Aderência</span>
          </div>
          <div className="relative h-6 flex items-center bg-gray-100 rounded-sm overflow-hidden">
            {ratings.map((r, i) => (
              <div 
                key={r} 
                className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold text-white ${colors[i]} ${grip.toUpperCase() === r ? "ring-2 ring-black ring-inset z-10" : "opacity-30"}`}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Ruído Externo */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <div className="flex flex-col">
              <span className="text-[14px] font-black text-gray-800 leading-none">{noise}</span>
              <span className="text-[8px] font-bold text-gray-500">dB</span>
            </div>
          </div>
          <div className="flex gap-0.5">
            <div className={`w-1.5 h-3 rounded-full ${noise <= 70 ? "bg-green-500" : "bg-gray-200"}`} />
            <div className={`w-1.5 h-4 rounded-full ${noise <= 72 ? "bg-yellow-500" : "bg-gray-200"}`} />
            <div className={`w-1.5 h-5 rounded-full ${noise > 72 ? "bg-red-500" : "bg-gray-200"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
