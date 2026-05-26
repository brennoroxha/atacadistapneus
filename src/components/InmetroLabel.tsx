const tops: Record<string, string> = {
  A: "30%",
  B: "33.5%",
  C: "37%",
  D: "40.5%",
  E: "44%",
  F: "47.5%",
  G: "51%",
};

interface InmetroLabelProps {
  consumption: string;
  grip: string;
  noise: number;
  className?: string;
}

export function InmetroLabel({ consumption = "E", grip = "E", noise = 72, className = "" }: InmetroLabelProps) {
  const fuelEfficiency = (consumption || "E").toUpperCase();
  const wetGrip = (grip || "E").toUpperCase();
  const noiseDb = noise || 72;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: "240px", backgroundColor: "#fff" }}>
      <img
        alt="Etiqueta Inmetro"
        src="/inmetro-label.png"
        style={{ width: "100%", display: "block" }}
      />

      {/* Seta consumo (entre coluna de consumo e aderência) */}
      <div
        style={{
          position: "absolute",
          left: "42%",
          top: tops[fuelEfficiency] || tops["E"],
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "13px",
            padding: "3px 5px 3px 14px",
            clipPath: "polygon(100% 0, 28% 0, 0 50%, 28% 100%, 100% 100%)",
            display: "inline-block",
            lineHeight: 1,
            minWidth: "24px",
            textAlign: "center",
          }}
        >
          {fuelEfficiency}
        </span>
      </div>

      {/* Seta aderência (à direita da coluna de aderência) */}
      <div
        style={{
          position: "absolute",
          left: "80%",
          top: tops[wetGrip] || tops["E"],
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "13px",
            padding: "3px 5px 3px 14px",
            clipPath: "polygon(100% 0, 28% 0, 0 50%, 28% 100%, 100% 100%)",
            display: "inline-block",
            lineHeight: 1,
            minWidth: "24px",
            textAlign: "center",
          }}
        >
          {wetGrip}
        </span>
      </div>

      {/* Ruído - seta preta com dB na faixa de som */}
      <div
        style={{
          position: "absolute",
          left: "62%",
          top: "67.5%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "14px",
            padding: "5px 8px 5px 18px",
            clipPath: "polygon(100% 0, 18% 0, 0 50%, 18% 100%, 100% 100%)",
            display: "inline-block",
            lineHeight: 1,
            minWidth: "60px",
            textAlign: "center",
          }}
        >
          {noiseDb} dB
        </span>
      </div>
    </div>
  );
}
