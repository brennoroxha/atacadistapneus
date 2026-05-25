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

  return (
    <div className={`w-full max-w-[240px] bg-white border-[3px] border-gray-200 rounded-xl p-4 shadow-md font-sans ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-industrial-blue rounded-full flex items-center justify-center p-1.5">
             <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                <path d="M10,50 A40,40 0 1,1 90,50 A40,40 0 1,1 10,50 Z M40,30 L40,70 M60,30 L60,70 M40,50 L60,50" stroke="currentColor" strokeWidth="8" fill="none" />
             </svg>
          </div>
          <span className="text-[12px] font-black text-industrial-blue tracking-tighter uppercase leading-none">Inmetro</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-yellow-400 text-[10px] font-black px-2 py-0.5 rounded text-black leading-none">ENERGIA</div>
          <span className="text-[8px] font-bold text-gray-400">PNEUS</span>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-4">
        {/* Column 1: Consumo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-6 h-6 rounded-full border border-industrial-blue/20 flex items-center justify-center p-1">
               <svg viewBox="0 0 24 24" className="w-full h-full text-industrial-blue fill-current">
                 <path d="M18,3h-2V1h-2v2H8V1H6v2H4C2.9,3,2,3.9,2,5v16c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C20,3.9,19.1,3,18,3z M18,21H4V5h14V21z M6,7h10v2H6V7z M6,11h10v2H6V11z M6,15h10v2H6V15z" />
               </svg>
            </div>
          </div>
          <div className="flex flex-col w-full gap-[2px]">
            {ratings.map((r, i) => (
              <div key={`cons-${r}`} className="flex items-center gap-1">
                <div className={`h-3 flex-1 rounded-sm ${colors[i]} ${consumption.toUpperCase() === r ? "opacity-100 ring-1 ring-black" : "opacity-30"}`} />
                <span className={`text-[10px] font-bold w-3 text-center ${consumption.toUpperCase() === r ? "text-black" : "text-gray-300"}`}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Aderência */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-6 h-6 rounded-full border border-industrial-blue/20 flex items-center justify-center p-1">
               <svg viewBox="0 0 24 24" className="w-full h-full text-industrial-blue fill-current">
                 <path d="M12,2c-5.33,4.55-8,8.48-8,11.8c0,4.98,3.8,8.2,8,8.2s8-3.22,8-8.2C20,10.48,17.33,6.55,12,2z M12,20c-3.35,0-6-2.57-6-6.2 c0-2.34,1.95-5.44,6-9.14c4.05,3.7,6,6.79,6,9.14C18,17.43,15.35,20,12,20z" />
               </svg>
            </div>
          </div>
          <div className="flex flex-col w-full gap-[2px]">
            {ratings.slice(0, 6).map((r, i) => (
              <div key={`grip-${r}`} className="flex items-center gap-1">
                <span className={`text-[10px] font-bold w-3 text-center ${grip.toUpperCase() === r ? "text-black" : "text-gray-300"}`}>{r}</span>
                <div className={`h-3 flex-1 rounded-sm ${colors[i]} ${grip.toUpperCase() === r ? "opacity-100 ring-1 ring-black" : "opacity-30"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Area: Noise and logos */}
      <div className="flex flex-col gap-4">
        {/* Noise */}
        <div className="flex items-center justify-center border-[3px] border-black rounded-lg py-2 px-4 relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-industrial-blue" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-black text-black leading-none">{noise}</span>
            <span className="text-[12px] font-bold text-black uppercase">dB</span>
          </div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <div className={`w-4 h-1 rounded-full ${noise <= 70 ? "bg-green-500" : "bg-gray-200"}`} />
            <div className={`w-4 h-1 rounded-full ${noise <= 72 ? "bg-yellow-500" : "bg-gray-200"}`} />
            <div className={`w-4 h-1 rounded-full ${noise > 72 ? "bg-red-500" : "bg-gray-200"}`} />
          </div>
        </div>

        {/* Bottom Logos */}
        <div className="flex justify-between items-end pt-2">
          <div className="flex flex-col items-start gap-1">
             <div className="flex items-center gap-1">
               <div className="w-4 h-4 bg-green-600 rounded-full" />
               <span className="text-[8px] font-bold text-gray-600">conpet</span>
             </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-gray-500 uppercase">Segurança</span>
            <div className="flex items-center gap-1 border border-gray-300 px-1 py-0.5 rounded">
              <span className="text-[8px] font-black">OCP</span>
              <div className="w-4 h-4 bg-black flex items-center justify-center text-white text-[6px] font-bold">N</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
