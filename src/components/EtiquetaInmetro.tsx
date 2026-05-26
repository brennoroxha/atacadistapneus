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
  const len = 28;
  const bodyH = 7;
  const headH = 11;
  const bodyTop = centerY - bodyH / 2;
  const bodyBottom = centerY + bodyH / 2;
  const headTop = centerY - headH / 2;
  const headBottom = centerY + headH / 2;
  const bodyRight = tipX + len;
  const headRight = tipX + headH; // diagonal length for the arrowhead

  // Points: start at tip, go up to head top, then to body top, across to right,
  // down to body bottom, back to head bottom, close to tip.
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
        fontSize={10}
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
  // 1 = quiet, 2 = medium, 3 = loud
  const level = db <= 69 ? 1 : db <= 72 ? 2 : 3;
  const cx = x + w / 2;
  const cy = y + h / 2;
  // Speaker body
  const speakerW = w * 0.35;
  const speakerH = h * 0.5;
  const sx = x;
  const sy = cy - speakerH / 2;

  const wavesActive = level; // 1, 2, or 3
  const waveColor = "#000";

  return (
    <g>
      {/* speaker */}
      <polygon
        points={`${sx},${sy + speakerH * 0.3} ${sx + speakerW * 0.5},${sy + speakerH * 0.3} ${sx + speakerW},${sy} ${sx + speakerW},${sy + speakerH} ${sx + speakerW * 0.5},${sy + speakerH * 0.7} ${sx},${sy + speakerH * 0.7}`}
        fill="#000"
      />
      {/* waves */}
      {[1, 2, 3].map((i) => {
        const active = i <= wavesActive;
        const r = speakerW + i * (w * 0.18);
        return (
          <path
            key={i}
            d={`M ${sx + speakerW + i * (w * 0.12)} ${cy - r * 0.4} A ${r * 0.5} ${r * 0.5} 0 0 1 ${sx + speakerW + i * (w * 0.12)} ${cy + r * 0.4}`}
            stroke={waveColor}
            strokeWidth={1.4}
            fill="none"
            opacity={active ? 1 : 0.18}
          />
        );
      })}
    </g>
  );
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
      style={{ maxWidth: "266px" }}
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
        <NoiseIcon db={db} x={70 - 19 / 2} y={305 - 17 / 2} w={19} h={17} />
        <text
          x={185}
          y={312}
          fill="#fff"
          fontSize={28}
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
