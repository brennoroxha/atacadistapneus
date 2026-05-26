import { useEffect, useRef, useState } from "react";

type Grade = "A" | "B" | "C" | "D" | "E" | "F" | "G";

interface EtiquetaInmetroProps {
  fuel: Grade | string;
  wet: Grade | string;
  db: number;
  imageUrl?: string;
  className?: string;
}

const VB_W = 266;
const VB_H = 503;

const ROW_Y: Record<string, number> = {
  A: 107,
  B: 126,
  C: 146,
  D: 166,
  E: 187,
  F: 207,
  G: 227,
};

const DEFAULT_IMAGE = "/inmetro-label.png";

function Arrow({
  tipX,
  centerY,
  letter,
}: {
  tipX: number;
  centerY: number;
  letter: string;
}) {
  const len = 35;
  const bodyH = 10;
  const headH = 14;
  const bodyTop = centerY - bodyH / 2;
  const bodyBottom = centerY + bodyH / 2;
  const headTop = centerY - headH / 2;
  const headBottom = centerY + headH / 2;
  const bodyRight = tipX + len;
  const headRight = tipX + headH;

  const points = [
    `${tipX},${centerY}`,
    `${headRight},${headTop}`,
    `${headRight},${bodyTop}`,
    `${bodyRight},${bodyTop}`,
    `${bodyRight},${bodyBottom}`,
    `${headRight},${bodyBottom}`,
    `${headRight},${headBottom}`,
  ].join(" ");

  const textX = (headRight + bodyRight) / 2;

  return (
    <g>
      <polygon points={points} fill="#000" />
      <text
        x={textX}
        y={centerY}
        fill="#fff"
        fontSize={14}
        fontWeight={900}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {letter}
      </text>
    </g>
  );
}

function NoiseIcon({ db, x, y, w, h }: { db: number; x: number; y: number; w: number; h: number }) {
  const href =
    db < 71
      ? "/icons/noise-low.png"
      : db <= 74
      ? "/icons/noise-medium.png"
      : "/icons/noise-high.png";
  return <image href={href} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />;
}


export function EtiquetaInmetro({
  fuel,
  wet,
  db,
  imageUrl = DEFAULT_IMAGE,
  className = "",
}: EtiquetaInmetroProps) {
  const f = (fuel || "E").toUpperCase();
  const w = (wet || "E").toUpperCase();
  const fuelY = ROW_Y[f] ?? ROW_Y.E;
  const wetY = ROW_Y[w] ?? ROW_Y.E;

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width } = e.contentRect;
        setSize({ w: width, h: (width * VB_H) / VB_W });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className}`}
      style={{ maxWidth: "220px" }}
    >
      <img
        src={imageUrl}
        alt="Etiqueta Inmetro"
        style={{ width: "100%", display: "block" }}
      />
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <Arrow tipX={80} centerY={fuelY} letter={f} />
        <Arrow tipX={200} centerY={wetY} letter={w} />
        <NoiseIcon db={db} x={70 - 64 / 2} y={305 - 54 / 2} w={64} h={54} />
        <text
          x={185}
          y={312}
          fill="#fff"
          fontSize={38}
          fontWeight={900}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {db}
        </text>
      </svg>
    </div>
  );
}

export default EtiquetaInmetro;