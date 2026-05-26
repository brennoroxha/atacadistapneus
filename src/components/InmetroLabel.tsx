const tops: Record<string, string> = {
  A: "18.5%",
  B: "22.5%",
  C: "26.5%",
  D: "30.5%",
  E: "34.5%",
  F: "38.5%",
  G: "42.5%"
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
    <div className={`relative inline-block ${className}`} style={{ width: "240px" }}>
      <img
        alt="Etiqueta Inmetro"
        src="/inmetro-label.png"
        style={{ width: "100%", display: "block" }}
      />

      {/* Seta eficiência */}
      <div
        style={{
          position: "absolute",
          left: "44.5%",
          top: tops[fuelEfficiency] || tops["E"],
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "12px",
            padding: "2px 4px 2px 14px",
            clipPath: "polygon(100% 0, 30% 0, 0 50%, 30% 100%, 100% 100%)",
            display: "inline-block",
            lineHeight: 1,
            minWidth: "22px",
            textAlign: "center",
          }}
        >
          {fuelEfficiency}
        </span>
      </div>

      {/* Seta aderência */}
      <div
        style={{
          position: "absolute",
          left: "92.5%",
          top: tops[wetGrip] || tops["E"],
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "12px",
            padding: "2px 4px 2px 14px",
            clipPath: "polygon(100% 0, 30% 0, 0 50%, 30% 100%, 100% 100%)",
            display: "inline-block",
            lineHeight: 1,
            minWidth: "22px",
            textAlign: "center",
          }}
        >
          {wetGrip}
        </span>
      </div>

      {/* Ruído - texto sobre a seta preta */}
      <div
        style={{
          position: "absolute",
          left: "53%",
          top: "62.5%",
          transform: "translateX(-50%)",
          width: "37%",
          height: "10%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "14px",
            padding: "4px 8px 4px 18px",
            clipPath: "polygon(100% 0, 20% 0, 0 50%, 20% 100%, 100% 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "100%",
            height: "100%",
            boxSizing: "border-box",
            lineHeight: 1,
          }}
        >
          {noiseDb}dB
        </div>
      </div>
    </div>
  );
}
