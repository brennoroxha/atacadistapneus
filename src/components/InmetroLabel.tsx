const tops: Record<string, string> = {
  A: "21.5%",
  B: "25.2%",
  C: "28.8%",
  D: "32.5%",
  E: "37.7%",
  F: "41.3%",
  G: "45.0%"
};

interface InmetroLabelProps {
  consumption: string; // A, B, C, D, E, F, G
  grip: string; // A, B, C, D, E, F, G
  noise: number; // dB
  className?: string;
}

export function InmetroLabel({ consumption = "E", grip = "E", noise = 72, className = "" }: InmetroLabelProps) {
  // Normalize values to uppercase and handle potential nulls
  const fuelEfficiency = (consumption || "E").toUpperCase();
  const wetGrip = (grip || "E").toUpperCase();
  const noiseDb = noise || 72;

  return (
    <div className={`relative inline-block ${className}`} style={{ maxWidth: '300px' }}>
      <picture>
        <source media="(max-width:768px)" srcSet="https://www.acheipneus.com.br/inmetro_mobile-8pe.png"/>
        <img 
          alt="Etiqueta Inmetro" 
          src="https://www.acheipneus.com.br/inmetro_desktop-tpc.png" 
          style={{ width: "100%", display: "block" }}
        />
      </picture>

      {/* Seta eficiência — leftposition="43" topposition varia por nota */}
      <div 
        style={{ 
          position: "absolute", 
          left: "43%", 
          top: tops[fuelEfficiency] || tops["E"], 
          transform: "translateY(-50%)", 
          pointerEvents: "none" 
        }}
      >
        <span 
          style={{ 
            background: "#0a3d8f", 
            color: "#fff", 
            fontWeight: 900, 
            fontSize: "clamp(10px, 2.5vw, 13px)", 
            padding: "2px 10px 2px 5px", 
            clipPath: "polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)",
            display: "inline-block",
            lineHeight: 1
          }}
        >
          {fuelEfficiency}
        </span>
      </div>

      {/* Seta aderência — leftposition="56.5" */}
      <div 
        style={{ 
          position: "absolute", 
          left: "56.5%", 
          top: tops[wetGrip] || tops["E"], 
          transform: "translateY(-50%)", 
          pointerEvents: "none" 
        }}
      >
        <span 
          style={{ 
            background: "#0a3d8f", 
            color: "#fff", 
            fontWeight: 900, 
            fontSize: "clamp(10px, 2.5vw, 13px)", 
            padding: "2px 10px 2px 5px", 
            clipPath: "polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)",
            display: "inline-block",
            lineHeight: 1
          }}
        >
          {wetGrip}
        </span>
      </div>

      {/* Ruído — usa img /db-medio-cVF.png + span por cima */}
      <img 
        alt="" 
        src="https://www.acheipneus.com.br/db-medio-cVF.png" 
        style={{ position: "absolute", left: "27%", top: "68%", width: "46%" }}
      />
      <span 
        style={{ 
          position: "absolute", 
          left: "50%", 
          top: "73%", 
          transform: "translate(-50%, -50%)", 
          fontWeight: 900, 
          fontSize: "clamp(14px, 4vw, 20px)", 
          color: "#fff", 
          fontFamily: "Arial" 
        }}
      >
        {noiseDb}dB
      </span>
    </div>
  );
}
