const tops: Record<string, string> = {
  A: "40.5%",
  B: "44.5%",
  C: "48.5%",
  D: "52.5%",
  E: "56.5%",
  F: "60.5%",
  G: "64.5%"
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
    <div className={`relative inline-block ${className}`} style={{ maxWidth: "300px" }}>
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
        }}
      >
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "clamp(10px, 2.5vw, 13px)",
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
        }}
      >
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontWeight: 900,
            fontSize: "clamp(10px, 2.5vw, 13px)",
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
          top: "69.5%",
          transform: "translateX(-50%)",
          width: "37%",
          height: "10%",
          pointerEvents: "none",
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
            fontSize: "clamp(10px, 2.5vw, 15px)",
            padding: "4px 8px 4px 20px",
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
