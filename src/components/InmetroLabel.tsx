import { Volume2 } from "lucide-react";

interface InmetroLabelProps {
  consumption: string; // A, B, C, D, E, F, G
  grip: string; // A, B, C, D, E, F, G
  noise: number; // dB
  className?: string;
}

export function InmetroLabel({ consumption, grip, noise, className = "" }: InmetroLabelProps) {
  const ratings = ["A", "B", "C", "D", "E", "F", "G"];
  
  const colors = [
    "bg-[#008d46]", // A
    "bg-[#00a651]", // B
    "bg-[#8dc63f]", // C
    "bg-[#fff200]", // D
    "bg-[#f7941e]", // E
    "bg-[#f26522]", // F
    "bg-[#ed1c24]", // G
  ];

  const getActiveIndex = (val: string) => ratings.indexOf(val.toUpperCase());

  return (
    <div className={`w-[200px] bg-white border-[2px] border-gray-300 rounded-lg p-2 shadow-sm font-sans flex flex-col gap-2 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-1">
        <div className="flex flex-col">
           <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-industrial-blue rounded-full flex items-center justify-center p-1">
                 <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                    <path d="M10,50 A40,40 0 1,1 90,50 A40,40 0 1,1 10,50 Z M40,30 L40,70 M60,30 L60,70 M40,50 L60,50" stroke="currentColor" strokeWidth="8" fill="none" />
                 </svg>
              </div>
              <span className="text-[10px] font-black text-industrial-blue uppercase leading-none">Inmetro</span>
           </div>
        </div>
        <div className="bg-yellow-400 text-[8px] font-black px-1 rounded text-black leading-none">ENERGIA</div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-2 border-b pb-2">
        {/* Consumo */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 border border-industrial-blue/30 rounded-full flex items-center justify-center p-1">
             <img src="/icons/specs/icon-tipo-de-uso.svg" alt="" className="w-full h-full" />
          </div>
          <div className="flex flex-col w-full gap-[1px]">
            {ratings.map((r, i) => (
              <div key={`c-${r}`} className="flex items-center gap-0.5">
                <div className={`h-[10px] flex-1 rounded-sm ${colors[i]} ${getActiveIndex(consumption) === i ? "ring-1 ring-black opacity-100" : "opacity-30"}`} />
                <span className={`text-[8px] font-bold w-2 text-center ${getActiveIndex(consumption) === i ? "text-black" : "text-gray-300"}`}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aderência */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 border border-industrial-blue/30 rounded-full flex items-center justify-center p-1">
             <img src="/icons/specs/icon-aderencia.svg" alt="" className="w-full h-full" />
          </div>
          <div className="flex flex-col w-full gap-[1px]">
            {ratings.map((r, i) => (
              <div key={`g-${r}`} className="flex items-center gap-0.5">
                <span className={`text-[8px] font-bold w-2 text-center ${getActiveIndex(grip) === i ? "text-black" : "text-gray-300"}`}>{r}</span>
                <div className={`h-[10px] flex-1 rounded-sm ${colors[i]} ${getActiveIndex(grip) === i ? "ring-1 ring-black opacity-100" : "opacity-30"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Noise Section - Refined to match image arrow */}
      <div className="flex items-center justify-center py-1">
         <div className="relative flex items-center bg-white border-2 border-industrial-blue rounded-md px-4 py-1.5 min-w-[120px] justify-center">
            <div className="absolute left-[-12px] top-1/2 -translate-y-1/2">
                <div className="w-6 h-6 bg-white border-2 border-industrial-blue rounded-full flex items-center justify-center p-1">
                    <Volume2 className="w-full h-full text-industrial-blue" />
                </div>
            </div>
            
            <div className="flex items-baseline gap-0.5">
              <span className="text-[18px] font-black text-black leading-none">{noise}</span>
              <span className="text-[10px] font-bold text-black uppercase">dB</span>
            </div>

            {/* The Arrow part from the image */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
               <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-black mr-[-1px]" />
               <div className="bg-black text-white text-[10px] font-black px-2 py-1 flex items-center justify-center rounded-r-sm">
                  {noise}
               </div>
            </div>
         </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-between items-end mt-1 pt-1 border-t">
        <div className="flex flex-col items-start">
           <div className="flex items-center gap-0.5">
              <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />
              <span className="text-[7px] font-black text-gray-500 uppercase italic">conpet</span>
           </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
           <span className="text-[6px] font-bold text-gray-400 uppercase">Segurança</span>
           <div className="flex items-center gap-1 border border-gray-400 px-1 py-0.5 rounded-sm">
              <span className="text-[6px] font-black">OCP 0008</span>
              <div className="w-3 h-3 bg-black flex items-center justify-center text-white text-[5px] font-black">N</div>
           </div>
        </div>
      </div>
    </div>
  );
}
