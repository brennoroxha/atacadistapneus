const tops: Record<string, string> = {
  A: "20.5%",
  B: "24.5%",
  C: "28.5%",
  D: "32.5%",
  E: "36.5%",
  F: "40.5%",
  G: "44.5%"
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
          left: "31%",
          top: tops[fuelEfficiency] || tops["E"],
          transform: "translateY(-50%)",
          pointerEvents: "none",
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
            lineHeight: 1,
          }}
        >
          {fuelEfficiency}
        </span>
      </div>

      {/* Seta aderência */}
      <div
        style={{
          position: "absolute",
          left: "60%",
          top: tops[wetGrip] || tops["E"],
          transform: "translateY(-50%)",
          pointerEvents: "none",
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
            lineHeight: 1,
          }}
        >
          {wetGrip}
        </span>
      </div>

      {/* Ruído - texto sobre a seta preta */}
      <span
        style={{
          position: "absolute",
          left: "42%",
          top: "62%",
          transform: "translate(-50%, -50%)",
          fontWeight: 900,
          fontSize: "clamp(12px, 3.5vw, 18px)",
          color: "#fff",
          fontFamily: "Arial",
        }}
      >
        {noiseDb}dB
      </span>
    </div>
  );
}
