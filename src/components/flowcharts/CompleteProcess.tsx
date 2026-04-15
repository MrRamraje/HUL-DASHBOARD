import React, { useEffect, useRef, useState } from "react";

interface CompleteProcessData {
  wg_flow: number; wf_flow: number; mb_flow: number;
  conveyor_flow: number;
  mixing1_level: number; mixing2_level: number;
  water_flow: number; steam_on: boolean;
  hex_temps: number[];
  wort_pct: number; ww1_pct: number; ww2_pct: number;
  buffer_level: number;
  total_bip_output: number; std_output: number;
  total_wastage: number; wastage_deviation: number;
}

const mockData: CompleteProcessData = {
  wg_flow: 9540, wf_flow: 871, mb_flow: 1200,
  conveyor_flow: 9600,
  mixing1_level: 72, mixing2_level: 65,
  water_flow: 8200, steam_on: true,
  hex_temps: [59.8, 64.2, 73.6, 74.3, 74.1, 79.8],
  wort_pct: 88.6, ww1_pct: 75.8, ww2_pct: 61.4,
  buffer_level: 74,
  total_bip_output: 27650, std_output: 28620,
  total_wastage: 970, wastage_deviation: 3.39,
};

type Clr = { stroke: string; fill: string; text: string };

function sc(v: number, t: number, tol = 0.05): Clr {
  const dev = Math.abs(v - t) / (t || 1);
  if (dev < tol)  return { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };
  if (dev < 0.12) return { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
  return               { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" };
}

// ─── Mini Silo ────────────────────────────────────────────────────────────────
function MiniSilo({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <ellipse cx={x + 20} cy={y + 3} rx={20} ry={4} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x} y={y + 3} width={40} height={44} fill="#f8fafc" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x + 32} y={y + 3} width={8} height={44} fill="#e2e8f0" />
      <polygon points={`${x},${y + 47} ${x + 40},${y + 47} ${x + 28},${y + 64} ${x + 12},${y + 64}`}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
      <polygon points={`${x + 28},${y + 47} ${x + 40},${y + 47} ${x + 28},${y + 64}`} fill="#e2e8f0" />
      <text x={x + 18} y={y + 29} textAnchor="middle"
        fontSize={9} fill="#1e293b" fontWeight="700" fontFamily="sans-serif">{label}</text>
    </g>
  );
}

// ─── Mini Mix Tank ────────────────────────────────────────────────────────────
function MiniMixTank({ x, y, level, lines = ["MIX", "TANK"] }: { x: number; y: number; level: number; lines?: [string, string] }) {
  const h = 54;
  const fc = level < 50 ? "#fde68a" : "#bbf7d0";
  const lc = level < 50 ? "#f59e0b" : "#22c55e";
  const fillH = (level / 100) * (h - 4);
  return (
    <g transform={`translate(${x + 28}, ${y + h / 2}) scale(1.25) translate(${-(x + 28)}, ${-(y + h / 2)})`}>
      <ellipse cx={x + 28} cy={y} rx={28} ry={5} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x} y={y} width={56} height={h} fill="#f8fafc" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x + 44} y={y} width={12} height={h} fill="#e2e8f0" />
      <rect x={x + 1} y={y + h - fillH} width={54} height={fillH} fill={fc} opacity={0.6} />
      <ellipse cx={x + 28} cy={y + h} rx={28} ry={5} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
      <text x={x + 28} y={y + (h / 2) - 6} textAnchor="middle" fontSize={7.5} fill="#64748b">{lines[0]}</text>
      <text x={x + 28} y={y + (h / 2) + 6} textAnchor="middle" fontSize={7.5} fill="#64748b">{lines[1]}</text>
      <rect x={x + 58} y={y + 4} width={5} height={h - 8} rx={2} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.5} />
      <rect x={x + 59} y={y + 4 + (h - 8) * (1 - level / 100)} width={3}
        height={(h - 8) * (level / 100)} rx={1} fill={lc} opacity={0.9} />
      {/* level text */}
      <text x={x + 28} y={y + h + 14} textAnchor="middle" fontSize={7.5}
        fill={lc} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{level}%</text>
    </g>
  );
}

// ─── Mini HEX with coil ───────────────────────────────────────────────────────
function MiniHex({ x, y, temp, actual }: { x: number; y: number; temp: number; actual: number }) {
  const c = "#1f2937";
  const W = 32, H = 54;
  const cx = x + W / 2;
  return (
    <g>
      {/* coil image */}
      <image
        href="/images/coil.png"
        x={x + 3}
        y={y + 4}
        width={W - 6}
        height={H - 8}
        preserveAspectRatio="xMidYMid meet"
      />
      {/* image border */}
      <rect x={x + 3} y={y + 4} width={W - 6} height={H - 8} rx={4}
        fill="none" stroke={c} strokeWidth={0.9} />
      {/* flow lines top */}
      <line
        x1={x + 10}
        y1={y - 9}
        x2={x + 10}
        y2={y}
        stroke="#94a3b8"
        strokeWidth={1}
        markerEnd="url(#arrowGCP)"
      />
      <line
        x1={x + 22}
        y1={y}
        x2={x + 22}
        y2={y - 9}
        stroke="#94a3b8"
        strokeWidth={1}
        markerEnd="url(#arrowGCP)"
      />
      <text x={x + 16} y={y + H + 12} textAnchor="middle" fontSize={8}
        fill={c} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{actual.toFixed(0)}°</text>
    </g>
  );
}

// ─── Mini Centrifuge ──────────────────────────────────────────────────────────
function MiniCentrifuge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x + 22}, ${y + 19}) scale(1.25) translate(${-(x + 22)}, ${-(y + 19)})`}>
      <rect x={x} y={y} width={44} height={38} rx={4}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.9} />
      <ellipse cx={x + 18} cy={y + 19} rx={12} ry={12}
        fill="#dbeafe" stroke="#3b82f6" strokeWidth={1} />
      <ellipse cx={x + 18} cy={y + 19} rx={4} ry={4} fill="#3b82f6" opacity={0.7} />
      <rect x={x + 34} y={y + 7} width={10} height={14} rx={2}
        fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
    </g>
  );
}

// ─── Mini Buffer Tank ─────────────────────────────────────────────────────────
function MiniBufferTank({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x + 26}, ${y + 26}) scale(1.25) translate(${-(x + 26)}, ${-(y + 26)})`}>
      <polygon
        points={`${x},${y} ${x + 52},${y} ${x + 44},${y + 52} ${x + 8},${y + 52}`}
        fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
      <polygon
        points={`${x + 44},${y} ${x + 52},${y} ${x + 44},${y + 52}`}
        fill="#e2e8f0" />
      <text x={x + 26} y={y + 14} textAnchor="middle" fontSize={6.5} fill="#64748b">Mash</text>
      <text x={x + 26} y={y + 24} textAnchor="middle" fontSize={6.5} fill="#64748b">Buffer</text>
      <text x={x + 26} y={y + 34} textAnchor="middle" fontSize={6.5} fill="#64748b">Tank</text>
      <circle cx={x + 14} cy={y + 43} r={5} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
      <circle cx={x + 38} cy={y + 43} r={5} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
    </g>
  );
}

// ─── Mini Mill (roller style) ────────────────────────────────────────────────
function MiniMill({ x, y, gap, current }: { x: number; y: number; gap: number; current: number }) {
  return (
    <g>
      <rect x={x} y={y} width={44} height={30} rx={4} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
      <circle cx={x + 14} cy={y + 15} r={8.2} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1.2} />
      <circle cx={x + 30} cy={y + 15} r={8.2} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1.2} />
      <circle cx={x + 14} cy={y + 15} r={3.2} fill="#3b82f6" />
      <circle cx={x + 30} cy={y + 15} r={3.2} fill="#3b82f6" />
      <polygon
        points={`${x + 14},${y + 30} ${x + 30},${y + 30} ${x + 26},${y + 42} ${x + 18},${y + 42}`}
        fill="#e2e8f0"
        stroke="#94a3b8"
        strokeWidth={1}
      />
      <text x={x + 50} y={y + 6} fontSize={7.5} fill="#94a3b8" fontFamily="sans-serif">Gap</text>
      <text x={x + 50} y={y + 20} fontSize={8.5} fill="#d97706" fontWeight="700" fontFamily="'IBM Plex Mono',monospace">
        {gap.toFixed(2)} mm
      </text>
      <text x={x + 50} y={y + 31} fontSize={7.5} fill="#94a3b8" fontFamily="sans-serif">Current</text>
      <circle cx={x + 50} cy={y + 38} r={1.8} fill="#ef4444" />
      <text x={x + 56} y={y + 42} fontSize={8.5} fill="#1f2937" fontWeight="700" fontFamily="'IBM Plex Mono',monospace">
        {current.toFixed(1)} A
      </text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const CompleteProcess: React.FC<{ data?: CompleteProcessData }> = ({ data = mockData }) => {
  const [d, setD] = useState(data);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ivRef.current = setInterval(() => {
      setD(prev => ({
        ...prev,
        wg_flow:          Math.round(9200 + Math.random() * 700),
        wf_flow:          Math.round(830  + Math.random() * 80),
        mb_flow:          Math.round(1150 + Math.random() * 120),
        conveyor_flow:    Math.round(9300 + Math.random() * 600),
        mixing1_level:    Math.round(58   + Math.random() * 28),
        mixing2_level:    Math.round(52   + Math.random() * 30),
        water_flow:       Math.round(7700 + Math.random() * 800),
        hex_temps: [60, 64, 74, 74, 74, 80].map(t =>
          parseFloat((t + (Math.random() - 0.5) * 2).toFixed(1))),
        wort_pct:  parseFloat((86 + Math.random() * 4).toFixed(1)),
        ww1_pct:   parseFloat((73 + Math.random() * 5).toFixed(1)),
        ww2_pct:   parseFloat((59 + Math.random() * 5).toFixed(1)),
        buffer_level:       Math.round(58 + Math.random() * 30),
        total_bip_output:   Math.round(27000 + Math.random() * 1200),
        total_wastage:      Math.round(850  + Math.random() * 300),
        wastage_deviation:  parseFloat((1.5 + Math.random() * 3).toFixed(2)),
      }));
    }, 2500);
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, []);

  const MASH_Y_OFFSET = 16;
  const RIGHT_SECTION_SHIFT = 36;
  const SECTION_LABEL_COLOR = "#2563eb";
  const SECTION_LABEL_SIZE = 12;
  const SECTION_LABEL_SPACING = 1.6;
  const MILL_X = 252;
  const MILL_Y = 158;
  const MB_VALUE_X = 304;
  const HEX_AFTER_IV_START_X = 760;
  const HEX_AFTER_IV_SPACING = 48;
  const BUFFER_LEVEL_Y = 334;
  const EXTRACTOR_TANK_Y = 232;
  const EXTRACTOR_TANK_H = 22;
  const EXTRACTOR_NAME_Y = 223;
  const EXTRACTOR_VALUE_Y = 247;
  const EXTRACTOR_BODY_Y = 292;
  const EXTRACTOR_WASTE_LINE_Y = 330;
  const EXTRACTOR_FUNNEL_TOP_Y = 366;
  const EXTRACTOR_FUNNEL_BOTTOM_Y = 406;
  const EXTRACTOR_BOTTOM_LABEL_Y = 422;
  const EXTRACTION_SECTION_Y = 452;
  const WEAK_WORT_BOX_X = 441;
  const WEAK_WORT_BOX_W = 40;
  const WEAK_WORT_BOX_CENTER_X = WEAK_WORT_BOX_X + WEAK_WORT_BOX_W / 2;
  const WEAK_WORT_LINE_BEND_Y = 272;
  const TO_SLURRY_Y = 206;

  return (
    <div style={{
      background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 18%)",
      padding: "16px 12px 12px",
      borderRadius: 18,
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    }}>
      <svg width="100%" viewBox="0 0 1040 490"
        fontFamily="'IBM Plex Mono', monospace">
        <defs>
          <marker id="arrowCP" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </marker>
          <marker id="arrowGCP" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
        </defs>

        <rect x={0} y={0} width={1040} height={490} fill="#ffffff" />

        {/* live dot */}
        <circle cx={1016} cy={16} r={4} fill="#22c55e" />
        <text x={1008} y={19} textAnchor="end" fontSize={8.5} fill="#16a34a" fontWeight="700">LIVE</text>

        {/* ══════════════════════════════════════════════
            LEFT BOX — SOLID DISPENSING
        ══════════════════════════════════════════════ */}

        <text x={180} y={38} textAnchor="middle" fontSize={SECTION_LABEL_SIZE} fill={SECTION_LABEL_COLOR}
          fontWeight="700" letterSpacing={SECTION_LABEL_SPACING}>SOLID DISPENSING</text>

        {/* 3 silos */}
        <MiniSilo x={24}  y={58} label="WG" />
        <MiniSilo x={134} y={58} label="WF" />
        <MiniSilo x={258} y={58} label="MB" />

        {/* inline flow values under silos */}
        {[
          { cx: 44,  v: d.wg_flow, t: 9600 },
          { cx: 154, v: d.wf_flow, t: 850  },
          { cx: 278, v: d.mb_flow, t: 1200 },
        ].map(({ cx, v, t }, i) => {
          const c = sc(v, t);
          const isMillFlow = i === 2;
          const valueX = isMillFlow ? MB_VALUE_X : cx - 10;
          const textAnchor = isMillFlow ? "start" : "end";
          const valueY = isMillFlow ? 140 : 134;
          const unitY = isMillFlow ? 151 : 145;
          return (
            <g key={i}>
              <text x={valueX} y={valueY} textAnchor={textAnchor} fontSize={9}
                fill={c.text} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">
                {v.toLocaleString()}
              </text>
              <text x={valueX} y={unitY} textAnchor={textAnchor} fontSize={7} fill="#94a3b8" fontFamily="sans-serif">kg/h</text>
            </g>
          );
        })}

        {/* pipes down from silos */}
        <line x1={44}  y1={122} x2={44}  y2={264} stroke="#94a3b8" strokeWidth={2.5} markerEnd="url(#arrowGCP)" />
        <line x1={154} y1={122} x2={154} y2={264} stroke="#94a3b8" strokeWidth={2.5} markerEnd="url(#arrowGCP)" />
        
        {/* mill on MB path */}
        <line x1={274} y1={122} x2={274} y2={MILL_Y} stroke="#94a3b8" strokeWidth={2.5} markerEnd="url(#arrowGCP)" />
        <line x1={274} y1={MILL_Y + 42} x2={274} y2={264} stroke="#94a3b8" strokeWidth={2.5} markerEnd="url(#arrowGCP)" />
        <MiniMill x={MILL_X} y={MILL_Y} gap={0.44} current={14.0} />

        {/* merge funnel */}
        <polygon points="120,244 200,244 188,264 132,264"
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />

        {/* screw conveyor */}
        <rect x={32} y={264} width={266} height={18} rx={3}
          fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <path key={i}
            d={`M${42 + i * 26},${273} C${48 + i*26},${266} ${54 + i*26},${266} ${54 + i*26},${273} C${54 + i*26},${280} ${60 + i*26},${280} ${60 + i*26},${273}`}
            fill="none" stroke="#3b82f6" strokeWidth={1} />
        ))}
        {/* motor block */}
        <rect x={4} y={267} width={28} height={14} rx={3}
          fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
        <text x={18} y={275} textAnchor="middle" dominantBaseline="middle"
          fontSize={7} fill="#475569" fontWeight="700">M</text>

        {/* pipe right to mashing (zig zag to left side of mix tank inlet) */}
        <polyline
          points="298,273 350,273 350,115 402,115"
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          markerEnd="url(#arrowCP)"
        />

        {/* ══════════════════════════════════════════════
            RIGHT BOX — MASHING + MALTED DEXTRON
        ══════════════════════════════════════════════ */}


        <g transform={`translate(${RIGHT_SECTION_SHIFT}, 0)`}>
          <text x={561} y={42} textAnchor="middle" fontSize={SECTION_LABEL_SIZE} fill={SECTION_LABEL_COLOR}
            fontWeight="700" letterSpacing={SECTION_LABEL_SPACING}>MASHING SECTION</text>

        {/* water input arrows */}
        <line x1={384} y1={44 + MASH_Y_OFFSET} x2={384} y2={72 + MASH_Y_OFFSET} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
        <text x={392} y={56 + MASH_Y_OFFSET} fontSize={8} fill="#3b82f6" fontFamily="sans-serif">water</text>

        {/* Mixing Tank 1 */}
        <MiniMixTank x={366} y={72 + MASH_Y_OFFSET} level={d.mixing1_level} lines={["SLURRY", "TANK"]} />

        {/* pipe: tank1 → HEX row 1 with expanded gap for labels */}
        <line x1={436} y1={115} x2={504} y2={115} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />
        <text x={469} y={106} textAnchor="middle" fontSize={10} fill="#15803d" fontWeight="700">9,363 kg/h</text>

        {/* HEX row 1: 60°, 64°, 74° */}
        {[0,1,2].map(i => (
          <g key={i}>
            <MiniHex x={502 + i*42} y={72 + MASH_Y_OFFSET} temp={[60,64,74][i]} actual={d.hex_temps[i]} />
            {i < 2 && (
              <line x1={534 + i*42} y1={99 + MASH_Y_OFFSET} x2={544 + i*42} y2={99 + MASH_Y_OFFSET}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
            )}
          </g>
        ))}

        {/* pipe → mixing tank 2 */}
        <line x1={615} y1={115} x2={666} y2={115} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* Mixing Tank 2 */}
        <MiniMixTank x={666} y={72 + MASH_Y_OFFSET} level={d.mixing2_level} lines={["IV", "TANK"]} />

        {/* pipe: tank2 → HEX row 2 */}
        <line x1={722} y1={99 + MASH_Y_OFFSET} x2={HEX_AFTER_IV_START_X} y2={99 + MASH_Y_OFFSET} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* HEX row 2: 74°, 74°, 80° */}
        {[3,4,5].map(i => (
          <g key={i}>
            <MiniHex x={HEX_AFTER_IV_START_X + (i-3)*HEX_AFTER_IV_SPACING} y={72 + MASH_Y_OFFSET} temp={[74,74,80][i-3]} actual={d.hex_temps[i]} />
            {i < 5 && (
              <line
                x1={HEX_AFTER_IV_START_X + (i-3)*HEX_AFTER_IV_SPACING + 32}
                y1={99 + MASH_Y_OFFSET}
                x2={HEX_AFTER_IV_START_X + (i-2)*HEX_AFTER_IV_SPACING}
                y2={99 + MASH_Y_OFFSET}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
            )}
          </g>
        ))}

        {/* pipe → Buffer tank routing */}
        <line
          x1={HEX_AFTER_IV_START_X + 2 * HEX_AFTER_IV_SPACING + 32}
          y1={99 + MASH_Y_OFFSET}
          x2={932}
          y2={99 + MASH_Y_OFFSET}
          stroke="#3b82f6"
          strokeWidth={1.8}
          markerEnd="url(#arrowCP)"
        />
        <line x1={932} y1={99 + MASH_Y_OFFSET} x2={932} y2={256} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* Buffer Tank */}
        <MiniBufferTank x={906} y={258} />
        <text x={932} y={BUFFER_LEVEL_Y} textAnchor="middle" fontSize={7.5}
          fill={d.buffer_level < 40 ? "#d97706" : "#16a34a"} fontWeight="700"
          fontFamily="'IBM Plex Mono',monospace">{d.buffer_level}%</text>

        <rect x={WEAK_WORT_BOX_X} y={EXTRACTOR_TANK_Y} width={WEAK_WORT_BOX_W} height={EXTRACTOR_TANK_H} rx={3}
          fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
        <text x={WEAK_WORT_BOX_CENTER_X} y={EXTRACTOR_VALUE_Y} textAnchor="middle"
          fontSize={6.5} fill="#475569" fontFamily="sans-serif" fontWeight="700">Weak Wort</text>
        <line x1={WEAK_WORT_BOX_CENTER_X} y1={EXTRACTOR_TANK_Y} x2={WEAK_WORT_BOX_CENTER_X} y2={TO_SLURRY_Y}
          stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
        <text x={WEAK_WORT_BOX_CENTER_X} y={TO_SLURRY_Y - 10} textAnchor="middle"
          fontSize={8} fill="#3b82f6" fontFamily="sans-serif" fontWeight="700">To Slurry Tank</text>

        {/* 3 centrifuge columns */}
        {[
          { cx: 380, label: "Weak Wort", pct: d.ww2_pct, tankLabel: "Husk Tank" },
          { cx: 498, label: "Weak Wort", pct: d.ww1_pct, tankLabel: "Wash Tank 2" },
          { cx: 616, label: "DEXTRON", pct: d.wort_pct, tankLabel: "Wash Tank 1" },
        ].map((unit, i) => {
          const ok = Math.abs(unit.pct - 88) < 5;
          const tc: Clr = ok
            ? { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" }
            : { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
          return (
            <g key={i}>
              {i === 2 && (
                <>
                  <text x={unit.cx + 22} y={EXTRACTOR_NAME_Y} textAnchor="middle"
                    fontSize={8.5} fill="#475569" fontFamily="sans-serif" fontWeight="700">{unit.label}</text>
                  {/* output vessel */}
                  <rect x={unit.cx + 2} y={EXTRACTOR_TANK_Y} width={40} height={EXTRACTOR_TANK_H} rx={3}
                    fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
                  <text x={unit.cx + 22} y={EXTRACTOR_VALUE_Y} textAnchor="middle"
                    fontSize={7.5} fill={tc.text} fontWeight="700"
                    fontFamily="'IBM Plex Mono',monospace">{unit.pct.toFixed(1)}%</text>
                </>
              )}
              {i === 2 && (
                <>
                  <line
                    x1={unit.cx + 44}
                    y1={EXTRACTOR_TANK_Y + 11}
                    x2={unit.cx + 66}
                    y2={EXTRACTOR_TANK_Y + 11}
                    stroke="#3b82f6"
                    strokeWidth={1.6}
                    markerEnd="url(#arrowCP)"
                  />
                  <text
                    x={unit.cx + 70}
                    y={EXTRACTOR_TANK_Y + 14}
                    textAnchor="start"
                    fontSize={8.5}
                    fill="#7c3aed"
                    fontWeight="700"
                    letterSpacing={1}
                  >
                    WORT TANK
                  </text>
                </>
              )}

              {/* centrifuge */}
              <MiniCentrifuge x={unit.cx} y={EXTRACTOR_BODY_Y} />

              {/* up arrow → vessel */}
              {i < 2 ? (
                <polyline
                  points={
                    i === 0
                      ? `${unit.cx + 22},${EXTRACTOR_BODY_Y} ${unit.cx + 22},${WEAK_WORT_LINE_BEND_Y} ${WEAK_WORT_BOX_X},${WEAK_WORT_LINE_BEND_Y} ${WEAK_WORT_BOX_X},${EXTRACTOR_TANK_Y + EXTRACTOR_TANK_H}`
                      : `${unit.cx + 22},${EXTRACTOR_BODY_Y} ${unit.cx + 22},${WEAK_WORT_LINE_BEND_Y} ${WEAK_WORT_BOX_X + WEAK_WORT_BOX_W},${WEAK_WORT_LINE_BEND_Y} ${WEAK_WORT_BOX_X + WEAK_WORT_BOX_W},${EXTRACTOR_TANK_Y + EXTRACTOR_TANK_H}`
                  }
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  markerEnd="url(#arrowCP)"
                />
              ) : (
                <line x1={unit.cx + 22} y1={EXTRACTOR_BODY_Y}
                  x2={unit.cx + 22} y2={EXTRACTOR_TANK_Y + EXTRACTOR_TANK_H}
                  stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
              )}
              {i < 2 && (
                <text x={unit.cx + 22} y={274} textAnchor="middle"
                  fontSize={7.5} fill={tc.text} fontWeight="700"
                  fontFamily="'IBM Plex Mono',monospace">{unit.pct.toFixed(1)}%</text>
              )}

              {/* Flow backwards from funnel into previous centrifuge with zig-zag routing */}
              {i > 0 && (
                <polyline
                  points={`${unit.cx + 12},${EXTRACTOR_FUNNEL_BOTTOM_Y} ${unit.cx - 31},${EXTRACTOR_FUNNEL_BOTTOM_Y} ${unit.cx - 31},${EXTRACTOR_BODY_Y + 22} ${unit.cx - 74},${EXTRACTOR_BODY_Y + 22}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  markerEnd="url(#arrowCP)"
                />
              )}

              {/* waste funnel below */}
              <line x1={unit.cx + 22} y1={EXTRACTOR_WASTE_LINE_Y}
                x2={unit.cx + 22} y2={EXTRACTOR_FUNNEL_TOP_Y}
                stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrowGCP)" />
              <polygon
                points={`${unit.cx},${EXTRACTOR_FUNNEL_TOP_Y} ${unit.cx + 44},${EXTRACTOR_FUNNEL_TOP_Y} ${unit.cx + 28},${EXTRACTOR_FUNNEL_BOTTOM_Y} ${unit.cx + 16},${EXTRACTOR_FUNNEL_BOTTOM_Y}`}
                fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
              <text x={unit.cx + 22} y={EXTRACTOR_BOTTOM_LABEL_Y} textAnchor="middle"
                fontSize={8} fill="#94a3b8" fontFamily="sans-serif" fontWeight="700">
                {unit.tankLabel}
              </text>
            </g>
          );
        })}

        <text x={520} y={EXTRACTION_SECTION_Y} textAnchor="middle" fontSize={SECTION_LABEL_SIZE} fill={SECTION_LABEL_COLOR}
          fontWeight="700" letterSpacing={SECTION_LABEL_SPACING}>EXTRACTION SECTION</text>

        {/* pump circle */}
        <circle cx={783} cy={308} r={10}
          fill="#eff6ff" stroke="#3b82f6" strokeWidth={1.2} />
        <text x={783} y={312} textAnchor="middle" fontSize={9}
          fill="#3b82f6" fontWeight="700">P</text>

          {/* pipe: buffer → pump */}
          <polyline points="906,284 850,284 850,308 793,308" stroke="#3b82f6" strokeWidth={1.5} fill="none" markerEnd="url(#arrowCP)" />
          <line x1={773} y1={308} x2={660} y2={308} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
        </g>

      </svg>
    </div>
  );
};

export default CompleteProcess;
