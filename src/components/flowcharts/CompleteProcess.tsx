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
function MiniMixTank({ x, y, level }: { x: number; y: number; level: number }) {
  const h = 54;
  const fc = level < 50 ? "#fde68a" : "#bbf7d0";
  const lc = level < 50 ? "#f59e0b" : "#22c55e";
  const fillH = (level / 100) * (h - 4);
  return (
    <g>
      <ellipse cx={x + 28} cy={y} rx={28} ry={5} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x} y={y} width={56} height={h} fill="#f8fafc" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x + 44} y={y} width={12} height={h} fill="#e2e8f0" />
      <rect x={x + 1} y={y + h - fillH} width={54} height={fillH} fill={fc} opacity={0.6} />
      <ellipse cx={x + 28} cy={y + h} rx={28} ry={5} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
      <text x={x + 22} y={y + h / 2 - 4} textAnchor="middle" fontSize={7.5} fill="#64748b">MIX</text>
      <text x={x + 22} y={y + h / 2 + 8} textAnchor="middle" fontSize={7.5} fill="#64748b">TANK</text>
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
      <line x1={x + 10} y1={y - 7} x2={x + 10} y2={y} stroke="#94a3b8" strokeWidth={1} />
      <line x1={x + 22} y1={y} x2={x + 22} y2={y - 7} stroke="#94a3b8" strokeWidth={1} />
      <text x={x + 16} y={y + H + 12} textAnchor="middle" fontSize={8}
        fill={c} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{actual.toFixed(0)}°</text>
    </g>
  );
}

// ─── Mini Centrifuge ──────────────────────────────────────────────────────────
function MiniCentrifuge({ x, y }: { x: number; y: number }) {
  return (
    <g>
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
    <g>
      <polygon
        points={`${x},${y} ${x + 52},${y} ${x + 44},${y + 52} ${x + 8},${y + 52}`}
        fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
      <polygon
        points={`${x + 44},${y} ${x + 52},${y} ${x + 44},${y + 52}`}
        fill="#e2e8f0" />
      <text x={x + 26} y={y + 23} textAnchor="middle" fontSize={7.5} fill="#64748b">Buffer</text>
      <text x={x + 26} y={y + 35} textAnchor="middle" fontSize={7.5} fill="#64748b">Tank</text>
      <circle cx={x + 14} cy={y + 43} r={5} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
      <circle cx={x + 38} cy={y + 43} r={5} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
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

  const waC: Clr = d.wastage_deviation > 4
    ? { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" }
    : d.wastage_deviation > 1
    ? { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" }
    : { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };

  const outC = sc(d.total_bip_output, d.std_output);

  return (
    <div style={{
      background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 18%)",
      padding: "16px 12px 12px",
      borderRadius: 18,
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    }}>
      <svg width="100%" viewBox="0 0 1040 500"
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

        <rect x={0} y={0} width={1040} height={500} fill="#ffffff" />

        {/* live dot */}
        <circle cx={1016} cy={16} r={4} fill="#22c55e" />
        <text x={1008} y={19} textAnchor="end" fontSize={8.5} fill="#16a34a" fontWeight="700">LIVE</text>

        {/* ══════════════════════════════════════════════
            LEFT BOX — SOLID DISPENSING
        ══════════════════════════════════════════════ */}
        <rect x={12} y={32} width={336} height={316} rx={16}
          fill="#f8fafc" stroke="#cfd8e3" strokeWidth={1.4} />
        <text x={180} y={50} textAnchor="middle" fontSize={9} fill="#64748b"
          fontWeight="700" letterSpacing={1}>SOLID DISPENSING</text>

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
          return (
            <g key={i}>
              <text x={cx} y={136} textAnchor="middle" fontSize={9}
                fill={c.text} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">
                {v.toLocaleString()}
              </text>
              <text x={cx} y={147} textAnchor="middle" fontSize={7} fill="#94a3b8" fontFamily="sans-serif">kg/h</text>
            </g>
          );
        })}

        {/* pipes down from silos */}
        <line x1={44}  y1={122} x2={44}  y2={164} stroke="#94a3b8" strokeWidth={2.5} />
        <line x1={154} y1={122} x2={154} y2={164} stroke="#94a3b8" strokeWidth={2.5} />
        <line x1={278} y1={122} x2={278} y2={164} stroke="#94a3b8" strokeWidth={2.5} />

        {/* mill on MB path */}
        <rect x={262} y={142} width={32} height={20} rx={3}
          fill="#eff6ff" stroke="#3b82f6" strokeWidth={1} />
        <text x={278} y={155} textAnchor="middle" fontSize={7.5}
          fill="#3b82f6" fontWeight="700">MILL</text>

        {/* merge funnel */}
        <polygon points="120,164 200,164 188,184 132,184"
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />

        {/* screw conveyor */}
        <rect x={32} y={184} width={266} height={18} rx={3}
          fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <path key={i}
            d={`M${42 + i * 26},${193} C${48 + i*26},${186} ${54 + i*26},${186} ${54 + i*26},${193} C${54 + i*26},${200} ${60 + i*26},${200} ${60 + i*26},${193}`}
            fill="none" stroke="#3b82f6" strokeWidth={1} />
        ))}
        {/* motor block */}
        <rect x={4} y={187} width={28} height={14} rx={3}
          fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
        <text x={18} y={195} textAnchor="middle" dominantBaseline="middle"
          fontSize={7} fill="#475569" fontWeight="700">M</text>

        {/* conveyor flow inline */}
        <text x={165} y={214} textAnchor="middle" fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">CONVEYOR FLOW</text>
        <text x={165} y={228} textAnchor="middle" fontSize={11} fill="#15803d" fontWeight="700">{d.conveyor_flow.toLocaleString()} kg/h</text>

        {/* pipe right to mashing */}
        <line x1={298} y1={193} x2={352} y2={193}
          stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowCP)" />

        {/* ── Water flow inline label ── */}
        <text x={24} y={258} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">WATER FLOW</text>
        <text x={24} y={272} fontSize={11} fill="#3b82f6" fontWeight="700">{d.water_flow.toLocaleString()} kg/h</text>

        {/* ══════════════════════════════════════════════
            RIGHT BOX — MASHING + MALTED DEXTRON
        ══════════════════════════════════════════════ */}
        <rect x={352} y={32} width={676} height={316} rx={16}
          fill="#f8fafc" stroke="#cfd8e3" strokeWidth={1.4} />

        {/* ─ MASHING sub-box — no fill, just a subtle border ─ */}
        <rect x={364} y={44} width={394} height={188} rx={12}
          fill="none" stroke="#dbe2ea" strokeWidth={1} />
        <text x={561} y={60} textAnchor="middle" fontSize={8.5} fill="#3b82f6"
          fontWeight="700" letterSpacing={1}>MASHING SECTION</text>

        {/* water input arrows */}
        <line x1={384} y1={44} x2={384} y2={72} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
        <text x={392} y={56} fontSize={8} fill="#3b82f6" fontFamily="sans-serif">water</text>
        <line x1={636} y1={44} x2={636} y2={72} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />

        {/* steam dashed */}
        <line x1={512} y1={44} x2={512} y2={68} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />
        <text x={520} y={55} fontSize={7.5} fill="#94a3b8" fontFamily="sans-serif">steam</text>

        {/* Mixing Tank 1 */}
        <MiniMixTank x={366} y={72} level={d.mixing1_level} />

        {/* pipe: tank1 → HEX row 1 */}
        <line x1={422} y1={99} x2={442} y2={99} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* HEX row 1: 60°, 64°, 74° */}
        {[0,1,2].map(i => (
          <g key={i}>
            <MiniHex x={442 + i*42} y={72} temp={[60,64,74][i]} actual={d.hex_temps[i]} />
            {i < 2 && (
              <line x1={474 + i*42} y1={99} x2={484 + i*42} y2={99}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
            )}
          </g>
        ))}

        {/* pipe → mixing tank 2 */}
        <line x1={570} y1={99} x2={606} y2={99} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* Mixing Tank 2 */}
        <MiniMixTank x={606} y={72} level={d.mixing2_level} />

        {/* pipe: tank2 → HEX row 2 */}
        <line x1={662} y1={99} x2={682} y2={99} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* HEX row 2: 74°, 74°, 80° */}
        {[3,4,5].map(i => (
          <g key={i}>
            <MiniHex x={682 + (i-3)*42} y={72} temp={[74,74,80][i-3]} actual={d.hex_temps[i]} />
            {i < 5 && (
              <line x1={714 + (i-3)*42} y1={99} x2={724 + (i-3)*42} y2={99}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
            )}
          </g>
        ))}

        {/* pipe → Buffer tank routing */}
        <line x1={808} y1={99} x2={870} y2={99} stroke="#3b82f6" strokeWidth={1.8} />
        <line x1={870} y1={99} x2={870} y2={256} stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* Buffer Tank */}
        <MiniBufferTank x={846} y={258} />
        <text x={872} y={322} textAnchor="middle" fontSize={7.5}
          fill={d.buffer_level < 40 ? "#d97706" : "#16a34a"} fontWeight="700"
          fontFamily="'IBM Plex Mono',monospace">{d.buffer_level}%</text>

        {/* ─ MALTED DEXTRON sub-box — no fill ─ */}
        <rect x={364} y={250} width={464} height={90} rx={12}
          fill="none" stroke="#dbe2ea" strokeWidth={1} />
        <text x={596} y={265} textAnchor="middle" fontSize={8.5} fill="#7c3aed"
          fontWeight="700" letterSpacing={1}>MALTED DEXTRON SYSTEM</text>

        {/* feed line buffer → system */}
        <line x1={844} y1={270} x2={600} y2={270}
          stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowCP)" />

        {/* 3 centrifuge columns */}
        {[
          { cx: 380, label: "WW2",  pct: d.ww2_pct  },
          { cx: 498, label: "WW1",  pct: d.ww1_pct  },
          { cx: 616, label: "Wort", pct: d.wort_pct },
        ].map((unit, i) => {
          const ok = Math.abs(unit.pct - 88) < 5;
          const tc: Clr = ok
            ? { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" }
            : { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
          return (
            <g key={i}>
              {/* output vessel */}
              <rect x={unit.cx + 2} y={254} width={40} height={22} rx={3}
                fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
              <text x={unit.cx + 22} y={263} textAnchor="middle"
                fontSize={7} fill="#64748b" fontFamily="sans-serif">{unit.label}</text>
              <text x={unit.cx + 22} y={273} textAnchor="middle"
                fontSize={7.5} fill={tc.text} fontWeight="700"
                fontFamily="'IBM Plex Mono',monospace">{unit.pct.toFixed(1)}%</text>

              {/* centrifuge */}
              <MiniCentrifuge x={unit.cx} y={286} />

              {/* up arrow → vessel */}
              <line x1={unit.cx + 22} y1={286}
                x2={unit.cx + 22} y2={276}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />

              {/* cross-pipe between centrifuges */}
              {i < 2 && (
                <line x1={unit.cx + 44} y1={308}
                  x2={unit.cx + 54 + 44} y2={308}
                  stroke="#3b82f6" strokeWidth={1.5} />
              )}

              {/* waste funnel below */}
              <line x1={unit.cx + 22} y1={324}
                x2={unit.cx + 22} y2={336}
                stroke="#94a3b8" strokeWidth={2} />
              <polygon
                points={`${unit.cx + 12},${336} ${unit.cx + 32},${336} ${unit.cx + 27},${345} ${unit.cx + 17},${345}`}
                fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
              <text x={unit.cx + 22} y={343} textAnchor="middle"
                fontSize={6.5} fill="#94a3b8" fontFamily="sans-serif">
                {i === 0 ? "Husk" : "Wash"}
              </text>
            </g>
          );
        })}

        {/* pump circle */}
        <circle cx={808} cy={308} r={10}
          fill="#eff6ff" stroke="#3b82f6" strokeWidth={1.2} />
        <text x={808} y={312} textAnchor="middle" fontSize={9}
          fill="#3b82f6" fontWeight="700">P</text>

        {/* pipe: buffer → pump → centrifuge row */}
        <line x1={870} y1={308} x2={818} y2={308} stroke="#3b82f6" strokeWidth={1.5} />
        <line x1={424} y1={308} x2={798} y2={308} stroke="#3b82f6" strokeWidth={1.5} />

        {/* ══════════════════════════════════════════════
            OUTPUT KPI STRIP — Fixed layout, no overflow
        ══════════════════════════════════════════════ */}
        <rect x={12} y={364} width={1016} height={120} rx={12}
          fill="#ffffff" stroke="#dbe2ea" strokeWidth={1.4} />
        <rect x={12} y={364} width={5} height={120} rx={3} fill="#3b82f6" />

        <text x={28} y={382} fontSize={10} fill="#0f172a" fontWeight="700" letterSpacing={1}>
          PROCESS SUMMARY 
        </text>
        <line x1={28} y1={388} x2={1024} y2={388} stroke="#dbe2ea" strokeWidth={1} />

        {/* KPI cards — 2 cards, proper sizing to prevent overflow */}
        {([
          {
            label: "TOTAL BIP OUTPUT",
            value: d.total_bip_output.toLocaleString() + " kg",
            sub:   "Std: " + d.std_output.toLocaleString() + " kg",
            c:     outC,
          },
          {
            label: "TOTAL WASTAGE",
            value: d.total_wastage.toLocaleString() + " kg",
            sub:   d.wastage_deviation.toFixed(2) + "% deviation",
            c:     waC,
          },
        ] as { label: string; value: string; sub: string; c: Clr }[]).map((kpi, i) => (
          <g key={i}>
            <rect x={28 + i * 512} y={396} width={494} height={78} rx={10}
              fill={kpi.c.fill} stroke={kpi.c.stroke} strokeWidth={1.3} />
            {i > 0 && <line x1={28 + i * 512 - 8} y1={396} x2={28 + i * 512 - 8} y2={474} stroke="#e2e8f0" strokeWidth={1} />}
            {/* label */}
            <text x={28 + i * 512 + 247} y={414} textAnchor="middle"
              fontSize={9.5} fill="#6b7280" fontFamily="sans-serif" letterSpacing={0.5}>
              {kpi.label}
            </text>
            {/* value — centered, large */}
            <text x={28 + i * 512 + 247} y={447} textAnchor="middle"
              fontSize={22} fontWeight="700" fill={kpi.c.text}
              fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
            {/* sub — fits inside card */}
            <text x={28 + i * 512 + 247} y={466} textAnchor="middle"
              fontSize={9} fill="#94a3b8" fontFamily="sans-serif">{kpi.sub}</text>
          </g>
        ))}
      </svg>

      {/* TAB OUTPUT summary (numbers only) */}
      <div style={{ marginTop: 18 }}>
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "16px 18px",
          boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
        }}>
          <div style={{
            fontSize: 10,
            color: "#0f172a",
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 8,
          }}>
            TAB OUTPUT
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 18,
          }}>
            {([
              { label: "WORT % BRIX", value: "15.3%" },
              { label: "WORT EXTRACTION %", value: "89.8%" },
              { label: "ACTUAL OUTPUT (kg)", value: "27,528" },
              { label: "TOTAL WASTAGE %", value: "3.29%" },
            ]).map((kpi, i) => (
              <div key={i}>
                <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 4 }}>{kpi.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProcess;
