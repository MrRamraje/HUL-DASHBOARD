import React, { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Color helpers ────────────────────────────────────────────────────────────
type Clr = { stroke: string; fill: string; text: string };

function sc(v: number, t: number, tol = 0.05): Clr {
  const dev = Math.abs(v - t) / (t || 1);
  if (dev < tol)  return { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };
  if (dev < 0.12) return { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
  return               { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" };
}

const BLUE:   Clr = { stroke: "#3b82f6", fill: "#eff6ff", text: "#1d4ed8" };
const PURPLE: Clr = { stroke: "#7c3aed", fill: "#f5f3ff", text: "#6d28d9" };

// ─── Shared mini-badge ────────────────────────────────────────────────────────
function Badge({ x, y, w = 80, h = 32, label, value, c }: {
  x: number; y: number; w?: number; h?: number;
  label: string; value: string; c: Clr;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={c.fill} stroke={c.stroke} strokeWidth={1} />
      <text x={x + w / 2} y={y + 11} textAnchor="middle"
        fontSize={7.5} fill="#6b7280" fontFamily="sans-serif" letterSpacing="0.03em">{label}</text>
      <text x={x + w / 2} y={y + 25} textAnchor="middle"
        fontSize={11} fontWeight="700" fill={c.text}
        fontFamily="'IBM Plex Mono','Courier New',monospace">{value}</text>
    </g>
  );
}

// ─── Mini equipment (light theme) ────────────────────────────────────────────

function MiniSilo({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      {/* cylinder */}
      <ellipse cx={x + 20} cy={y + 3} rx={20} ry={4} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x} y={y + 3} width={40} height={44} fill="#f8fafc" stroke="#94a3b8" strokeWidth={0.8} />
      <rect x={x + 32} y={y + 3} width={8} height={44} fill="#e2e8f0" />
      {/* funnel */}
      <polygon points={`${x},${y + 47} ${x + 40},${y + 47} ${x + 28},${y + 64} ${x + 12},${y + 64}`}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
      <polygon points={`${x + 28},${y + 47} ${x + 40},${y + 47} ${x + 28},${y + 64}`} fill="#e2e8f0" />
      <text x={x + 18} y={y + 29} textAnchor="middle"
        fontSize={9} fill="#1e293b" fontWeight="700" fontFamily="sans-serif">{label}</text>
    </g>
  );
}

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
      {/* level bar right */}
      <rect x={x + 58} y={y + 4} width={5} height={h - 8} rx={2} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.5} />
      <rect x={x + 59} y={y + 4 + (h - 8) * (1 - level / 100)} width={3}
        height={(h - 8) * (level / 100)} rx={1} fill={lc} opacity={0.9} />
    </g>
  );
}

function MiniHex({ x, y, temp, actual }: {
  x: number; y: number; temp: number; actual: number;
}) {
  const ok = Math.abs(actual - temp) < 1;
  const c  = ok ? "#16a34a" : "#d97706";
  const fc = ok ? "#f0fdf4" : "#fffbeb";
  return (
    <g>
      <rect x={x} y={y} width={32} height={54} rx={3}
        fill={fc} stroke={c} strokeWidth={0.9} />
      {[0, 1, 2].map(i => (
        <rect key={i} x={x + 4} y={y + 6 + i * 14} width={22} height={10} rx={2}
          fill={c + "30"} stroke={c} strokeWidth={0.6} />
      ))}
      {/* flow arrows */}
      <line x1={x + 10} y1={y - 7} x2={x + 10} y2={y} stroke="#94a3b8" strokeWidth={1} />
      <line x1={x + 22} y1={y} x2={x + 22} y2={y - 7} stroke="#94a3b8" strokeWidth={1} />
      <text x={x + 16} y={y + 63} textAnchor="middle" fontSize={8}
        fill={c} fontWeight="700" fontFamily="monospace">{actual.toFixed(0)}°</text>
    </g>
  );
}

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

  return (
    <div style={{ background: "#ffffff", padding: "16px 16px 0", borderRadius: 8 }}>
      <svg width="100%" viewBox="0 0 1020 530"
        fontFamily="'Inter','Segoe UI',sans-serif">
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

        {/* ── Page header ── */}
        <text x={16} y={22} fontSize={11} fill="#64748b" fontWeight="700" letterSpacing={2}>
          COMPLETE PROCESS — HIGH LEVEL OVERVIEW
        </text>
        <line x1={16} y1={28} x2={1004} y2={28} stroke="#e2e8f0" strokeWidth={1} />

        {/* live dot */}
        <circle cx={992} cy={20} r={4} fill="#22c55e" />
        <text x={984} y={23} textAnchor="end" fontSize={8.5} fill="#16a34a" fontWeight="700">LIVE</text>

        {/* ══════════════════════════════════════════════
            LEFT BOX — SOLID HANDLING
        ══════════════════════════════════════════════ */}
        <rect x={14} y={38} width={330} height={310} rx={8}
          fill="#fafafa" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="7 4" />
        <text x={179} y={56} textAnchor="middle" fontSize={9.5} fill="#64748b"
          fontWeight="700" letterSpacing={1}>SOLID HANDLING</text>

        {/* 3 silos */}
        <MiniSilo x={24}  y={64} label="WG" />
        <MiniSilo x={134} y={64} label="WF" />
        <MiniSilo x={244} y={64} label="MB" />

        {/* flow values under silos */}
        {[
          { x: 44,  v: d.wg_flow, t: 9600 },
          { x: 154, v: d.wf_flow, t: 850  },
          { x: 276, v: d.mb_flow, t: 1200 },
        ].map(({ x, v, t }, i) => {
          const c = sc(v, t);
          return (
            <g key={i}>
              <text x={x} y={142} textAnchor="middle" fontSize={8.5}
                fill={c.text} fontWeight="700" fontFamily="monospace">
                {v.toLocaleString()}
              </text>
              <text x={x} y={153} textAnchor="middle" fontSize={7} fill="#94a3b8">kg/h</text>
            </g>
          );
        })}

        {/* pipes down from silos */}
        <line x1={44}  y1={128} x2={44}  y2={168} stroke="#94a3b8" strokeWidth={2.5} />
        <line x1={154} y1={128} x2={154} y2={168} stroke="#94a3b8" strokeWidth={2.5} />
        <line x1={276} y1={128} x2={276} y2={168} stroke="#94a3b8" strokeWidth={2.5} />

        {/* mill on MB path */}
        <rect x={260} y={146} width={32} height={20} rx={3}
          fill="#eff6ff" stroke="#3b82f6" strokeWidth={1} />
        <text x={276} y={159} textAnchor="middle" fontSize={7.5}
          fill="#3b82f6" fontWeight="700">MILL</text>

        {/* funnel */}
        <polygon points="128,168 192,168 180,188 140,188"
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />

        {/* screw conveyor */}
        <rect x={36} y={188} width={262} height={18} rx={3}
          fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <path key={i}
            d={`M${46 + i * 26},${197} C${52 + i*26},${190} ${58 + i*26},${190} ${58 + i*26},${197} C${58 + i*26},${204} ${64 + i*26},${204} ${64 + i*26},${197}`}
            fill="none" stroke="#3b82f6" strokeWidth={1} />
        ))}
        {/* motor */}
        <rect x={8} y={191} width={28} height={14} rx={3}
          fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
        <text x={22} y={199} textAnchor="middle" dominantBaseline="middle"
          fontSize={7} fill="#475569" fontWeight="700">M</text>

        {/* conveyor flow badge */}
        <Badge x={72} y={212} w={134} h={28} label="CONVEYOR FLOW"
          value={d.conveyor_flow.toLocaleString() + " kg/h"}
          c={{ stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" }} />

        {/* pipe right to mashing box */}
        <line x1={298} y1={197} x2={344} y2={197}
          stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowCP)" />

        {/* ══════════════════════════════════════════════
            RIGHT BOX — MASHING + MALTED DEXTRON
        ══════════════════════════════════════════════ */}
        <rect x={344} y={38} width={660} height={310} rx={8}
          fill="#fafafa" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="7 4" />

        {/* ─ MASHING sub-box ─ */}
        <rect x={356} y={50} width={385} height={190} rx={6}
          fill="#f0f9ff" stroke="#bfdbfe" strokeWidth={1} strokeDasharray="5 3" />
        <text x={548} y={65} textAnchor="middle" fontSize={9} fill="#3b82f6"
          fontWeight="700" letterSpacing={1}>MASHING SECTION</text>

        {/* water input arrows */}
        <line x1={376} y1={50} x2={376} y2={78}
          stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
        <text x={388} y={60} fontSize={8} fill="#3b82f6">water</text>

        <line x1={628} y1={50} x2={628} y2={78}
          stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />

        {/* steam dashed */}
        <line x1={502} y1={50} x2={502} y2={74}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />
        <text x={510} y={60} fontSize={7.5} fill="#94a3b8">steam</text>

        {/* Mixing Tank 1 */}
        <MiniMixTank x={358} y={78} level={d.mixing1_level} />
        <text x={386} y={146} textAnchor="middle" fontSize={7}
          fill={d.mixing1_level < 50 ? "#d97706" : "#16a34a"} fontWeight="700">
          {d.mixing1_level}%
        </text>

        {/* pipe: tank1 → HEX row 1 */}
        <line x1={414} y1={105} x2={434} y2={105}
          stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* HEX row 1: 60°, 64°, 74° */}
        {[0,1,2].map(i => (
          <g key={i}>
            <MiniHex x={434 + i*42} y={78} temp={[60,64,74][i]} actual={d.hex_temps[i]} />
            {i < 2 && (
              <line x1={466 + i*42} y1={105} x2={476 + i*42} y2={105}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
            )}
          </g>
        ))}

        {/* pipe → mixing tank 2 */}
        <line x1={562} y1={105} x2={598} y2={105}
          stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* Mixing Tank 2 */}
        <MiniMixTank x={598} y={78} level={d.mixing2_level} />
        <text x={626} y={146} textAnchor="middle" fontSize={7}
          fill={d.mixing2_level < 50 ? "#d97706" : "#16a34a"} fontWeight="700">
          {d.mixing2_level}%
        </text>

        {/* pipe: tank2 → HEX row 2 */}
        <line x1={654} y1={105} x2={676} y2={105}
          stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* HEX row 2: 74°, 74°, 80° */}
        {[3,4,5].map(i => (
          <g key={i}>
            <MiniHex x={676 + (i-3)*42} y={78} temp={[74,74,80][i-3]} actual={d.hex_temps[i]} />
            {i < 5 && (
              <line x1={708 + (i-3)*42} y1={105} x2={718 + (i-3)*42} y2={105}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />
            )}
          </g>
        ))}

        {/* pipe → Buffer tank */}
        <line x1={802} y1={105} x2={862} y2={105}
          stroke="#3b82f6" strokeWidth={1.8} />
        <line x1={862} y1={105} x2={862} y2={258}
          stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowCP)" />

        {/* ─ Buffer Tank ─ */}
        <MiniBufferTank x={838} y={260} />
        <text x={864} y={330} textAnchor="middle" fontSize={7.5}
          fill={d.buffer_level < 40 ? "#d97706" : "#16a34a"} fontWeight="700">
          {d.buffer_level}%
        </text>

        {/* ─ MALTED DEXTRON sub-box ─ */}
        <rect x={356} y={256} width={470} height={84} rx={6}
          fill="#f5f3ff" stroke="#ddd6fe" strokeWidth={1} strokeDasharray="5 3" />
        <text x={591} y={270} textAnchor="middle" fontSize={9} fill="#7c3aed"
          fontWeight="700" letterSpacing={1}>MALTED DEXTRON SYSTEM</text>

        {/* dashed feed line buffer → system */}
        <line x1={836} y1={268} x2={592} y2={268}
          stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowCP)" />

        {/* 3 centrifuge columns */}
        {[
          { cx: 372, label: "WW2",  pct: d.ww2_pct  },
          { cx: 490, label: "WW1",  pct: d.ww1_pct  },
          { cx: 608, label: "Wort", pct: d.wort_pct },
        ].map((unit, i) => {
          const ok = Math.abs(unit.pct - 88) < 5;
          const tc: Clr = ok
            ? { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" }
            : { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
          return (
            <g key={i}>
              {/* output vessel */}
              <rect x={unit.cx + 2} y={260} width={40} height={24} rx={3}
                fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
              <text x={unit.cx + 22} y={269} textAnchor="middle"
                fontSize={7} fill="#64748b">{unit.label}</text>
              <text x={unit.cx + 22} y={280} textAnchor="middle"
                fontSize={7.5} fill={tc.text} fontWeight="700"
                fontFamily="monospace">{unit.pct.toFixed(1)}%</text>

              {/* centrifuge */}
              <MiniCentrifuge x={unit.cx} y={292} />

              {/* up arrow → vessel */}
              <line x1={unit.cx + 22} y1={292}
                x2={unit.cx + 22} y2={284}
                stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowCP)" />

              {/* cross-pipe between centrifuges */}
              {i < 2 && (
                <line x1={unit.cx + 44} y1={314}
                  x2={unit.cx + 46 + 46} y2={314}
                  stroke="#3b82f6" strokeWidth={1.5} />
              )}

              {/* waste/husk/wash funnel below */}
              <line x1={unit.cx + 22} y1={330}
                x2={unit.cx + 22} y2={346}
                stroke="#94a3b8" strokeWidth={2} />
              <polygon
                points={`${unit.cx + 10},${346} ${unit.cx + 34},${346} ${unit.cx + 28},${358} ${unit.cx + 16},${358}`}
                fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.8} />
              <text x={unit.cx + 22} y={354} textAnchor="middle"
                fontSize={7} fill="#94a3b8">
                {i === 0 ? "Husk" : "Wash"}
              </text>
            </g>
          );
        })}

        {/* pump circle */}
        <circle cx={810} cy={314} r={10}
          fill="#eff6ff" stroke="#3b82f6" strokeWidth={1.2} />
        <text x={810} y={318} textAnchor="middle" fontSize={9}
          fill="#3b82f6" fontWeight="700">P</text>

        {/* pipe: buffer → pump */}
        <line x1={866} y1={314} x2={820} y2={314}
          stroke="#3b82f6" strokeWidth={1.5} />
        {/* pipe: pump → centrifuge row */}
        <line x1={416} y1={314} x2={800} y2={314}
          stroke="#3b82f6" strokeWidth={1.5} />

        {/* ══════════════════════════════════════════════
            OUTPUT KPI STRIP  (2 cards only)
        ══════════════════════════════════════════════ */}
        <rect x={16} y={368} width={988} height={96} rx={8}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.5} />
        {/* blue left accent */}
        <rect x={16} y={368} width={5} height={96} rx={3} fill="#3b82f6" />
        <text x={36} y={386} fontSize={10} fill="#374151" fontWeight="700" letterSpacing={1}>
          PROCESS SUMMARY — CALCULATED BY FASTAPI
        </text>
        <line x1={36} y1={392} x2={1000} y2={392} stroke="#e2e8f0" strokeWidth={1} />

        {/* 2 KPI cards: Total BIP Output + Total Wastage */}
        {([
          {
            label: "TOTAL BIP OUTPUT",
            value: d.total_bip_output.toLocaleString() + " kg",
            sub:   "Std: " + d.std_output.toLocaleString() + " kg",
            c:     sc(d.total_bip_output, d.std_output),
          },
          {
            label: "TOTAL WASTAGE",
            value: d.total_wastage.toLocaleString() + " kg",
            sub:   d.wastage_deviation.toFixed(2) + "% deviation",
            c:     waC,
          },
        ] as { label: string; value: string; sub: string; c: Clr }[]).map((kpi, i) => (
          <g key={i}>
            <rect x={36 + i * 502} y={400} width={478} height={56} rx={7}
              fill={kpi.c.fill} stroke={kpi.c.stroke} strokeWidth={1.3} />
            <text x={36 + i * 502 + 239} y={418} textAnchor="middle"
              fontSize={10} fill="#6b7280" letterSpacing={0.5}>{kpi.label}</text>
            <text x={36 + i * 502 + 239} y={445} textAnchor="middle"
              fontSize={20} fontWeight="700" fill={kpi.c.text}
              fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
            <text x={36 + i * 502 + 239} y={458} textAnchor="middle"
              fontSize={8.5} fill="#94a3b8">{kpi.sub}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default CompleteProcess;