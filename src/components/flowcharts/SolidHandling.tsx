import React, { useEffect, useRef, useState } from "react";

interface SolidHandlingData {
  wg_target_flow: number; wg_actual_flow: number;
  wf_target_flow: number; wf_actual_flow: number;
  mb_actual_flow: number; mb_target_flow: number;
  mb_gap: number; mb_current: number;
  mb_husk_pct: number; mb_grist_pct: number; mb_powder_pct: number;
  conveyor_flow_rate: number;
  conveyor_pct_mb: number; conveyor_pct_wg: number; conveyor_pct_wf: number;
  mixing_rpm: number; mixing_current: number; mixing_tank_level: number;
  mixing_flow_rate: number; mixing_flow_target: number;
  mixing_pct_ts: number; mixing_pct_mb: number;
  mixing_pct_wg: number; mixing_pct_wf: number;
  output_bom: number; output_std_kg: number;
  output_actual_kg: number; output_wastage_pct: number;
}

const mockData: SolidHandlingData = {
  wg_target_flow: 9600, wg_actual_flow: 9540,
  wf_target_flow: 850,  wf_actual_flow: 871,
  mb_actual_flow: 1200, mb_target_flow: 1200,
  mb_gap: 0.42, mb_current: 14.2,
  mb_husk_pct: 11.2, mb_grist_pct: 75.0, mb_powder_pct: 12.5,
  conveyor_flow_rate: 9600,
  conveyor_pct_mb: 11.2, conveyor_pct_wg: 76.3, conveyor_pct_wf: 8.8,
  mixing_rpm: 100, mixing_current: 18.5, mixing_tank_level: 68,
  mixing_flow_rate: 9600, mixing_flow_target: 10850,
  mixing_pct_ts: 14.8, mixing_pct_mb: 11.2, mixing_pct_wg: 76.3, mixing_pct_wf: 8.8,
  output_bom: 245.67, output_std_kg: 28620,
  output_actual_kg: 27650, output_wastage_pct: 3.39,
};

type Clr = { stroke: string; fill: string; text: string };

function sc(actual: number, target: number, tol = 0.05): Clr {
  const dev = Math.abs(actual - target) / (target || 1);
  if (dev < tol)  return { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };
  if (dev < 0.12) return { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
  return               { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" };
}

const BLUE:   Clr = { stroke: "#3b82f6", fill: "#eff6ff", text: "#1d4ed8" };
const PURPLE: Clr = { stroke: "#7c3aed", fill: "#f5f3ff", text: "#6d28d9" };
const SKY:    Clr = { stroke: "#0284c7", fill: "#f0f9ff", text: "#0369a1" };

function Badge({ x, y, w = 136, h = 44, label, value, unit = "", c }: {
  x: number; y: number; w?: number; h?: number;
  label: string; value: string; unit?: string; c: Clr;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + 14} textAnchor="middle"
        fontSize={9} fill="#6b7280" fontFamily="sans-serif" fontWeight="500" letterSpacing="0.04em">
        {label}
      </text>
      <text x={x + w / 2} y={y + 32} textAnchor="middle"
        fontSize={13} fontWeight="700" fill={c.text}
        fontFamily="'IBM Plex Mono','Courier New',monospace">
        {value}
        {unit && <tspan fontSize={9} fill={c.stroke}> {unit}</tspan>}
      </text>
    </g>
  );
}

function Silo({ x, y, label, sub }: { x: number; y: number; label: string; sub?: string }) {
  return (
    <g>
      <polygon points={`${x + 38},${y - 14} ${x + 30},${y - 2} ${x + 46},${y - 2}`}
        fill="none" stroke="#94a3b8" strokeWidth={1} />
      <text x={x + 38} y={y - 5} textAnchor="middle" fontSize={7} fill="#94a3b8">!</text>
      <ellipse cx={x + 38} cy={y + 6} rx={38} ry={7} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.2} />
      <rect x={x} y={y + 6} width={76} height={62} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.2} />
      <rect x={x + 60} y={y + 6} width={16} height={62} fill="#e2e8f0" />
      <polygon points={`${x},${y + 68} ${x + 76},${y + 68} ${x + 52},${y + 96} ${x + 24},${y + 96}`}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />
      <polygon points={`${x + 60},${y + 68} ${x + 76},${y + 68} ${x + 52},${y + 96}`}
        fill="#e2e8f0" />
      <text x={x + 38} y={y + 38} textAnchor="middle"
        fontSize={11} fill="#1e293b" fontWeight="700" fontFamily="sans-serif">{label}</text>
      {sub && <text x={x + 38} y={y + 54} textAnchor="middle"
        fontSize={8} fill="#94a3b8" fontFamily="sans-serif">{sub}</text>}
    </g>
  );
}

function Mill({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={66} height={46} rx={5} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />
      <rect x={x + 50} y={y} width={16} height={46} rx={4} fill="#e2e8f0" />
      <ellipse cx={x + 21} cy={y + 23} rx={13} ry={13} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.2} />
      <ellipse cx={x + 21} cy={y + 23} rx={5} ry={5} fill="#3b82f6" />
      <ellipse cx={x + 41} cy={y + 23} rx={13} ry={13} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.2} />
      <ellipse cx={x + 41} cy={y + 23} rx={5} ry={5} fill="#3b82f6" />
      <polygon points={`${x + 18},${y + 46} ${x + 46},${y + 46} ${x + 40},${y + 64} ${x + 24},${y + 64}`}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
    </g>
  );
}

function Hopper({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x + 54},${y} ${x + 40},${y + 44} ${x + 14},${y + 44}`}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />
      <polygon points={`${x + 40},${y} ${x + 54},${y} ${x + 40},${y + 44}`}
        fill="#e2e8f0" />
      {label && <text x={x + 27} y={y + 22} textAnchor="middle"
        fontSize={8} fill="#64748b" fontFamily="sans-serif">{label}</text>}
    </g>
  );
}

function ScrewConveyor({ x, y, w }: { x: number; y: number; w: number }) {
  const n = Math.floor(w / 22);
  return (
    <g>
      <rect x={x} y={y} width={w} height={28} rx={4} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.2} />
      {Array.from({ length: n }).map((_, i) => (
        <path key={i}
          d={`M${x + 10 + i * 22},${y + 14}
              C${x + 15 + i * 22},${y + 4} ${x + 21 + i * 22},${y + 4} ${x + 21 + i * 22},${y + 14}
              C${x + 21 + i * 22},${y + 24} ${x + 27 + i * 22},${y + 24} ${x + 27 + i * 22},${y + 14}`}
          fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      ))}
      <line x1={x + 8} y1={y + 14} x2={x + w - 8} y2={y + 14} stroke="#cbd5e1" strokeWidth={2} />
      <rect x={x - 30} y={y + 2} width={30} height={24} rx={4} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
      <text x={x - 15} y={y + 14} textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fill="#475569" fontWeight="700" fontFamily="monospace">M</text>
    </g>
  );
}

function MixingTank({ x, y, level }: { x: number; y: number; level: number }) {
  const H = 110, W = 90, cx = x + W / 2;
  const fillH = Math.max(4, (level / 100) * (H - 18));
  const fc = level < 40 ? "#fca5a5" : level < 60 ? "#fde68a" : "#bbf7d0";
  const lc = level < 40 ? "#ef4444" : level < 60 ? "#f59e0b" : "#22c55e";
  return (
    <g>
      <line x1={cx - 16} y1={y - 30} x2={cx - 16} y2={y}
        stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#arrowSHmain)" />
      <ellipse cx={cx} cy={y} rx={W / 2} ry={9} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.2} />
      <rect x={x} y={y} width={W} height={H} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.2} />
      <rect x={x + 1} y={y + H - fillH} width={W - 2} height={fillH} fill={fc} opacity={0.6} />
      <rect x={x + W - 14} y={y} width={14} height={H} fill="#e2e8f0" />
      <ellipse cx={cx} cy={y + H} rx={W / 2} ry={9} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.2} />
      <rect x={x + W + 4} y={y + 8} width={7} height={H - 16} rx={3} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.8} />
      <rect x={x + W + 5} y={y + 8 + (H - 16) * (1 - level / 100)} width={5}
        height={(H - 16) * (level / 100)} rx={2} fill={lc} opacity={0.9} />
      <text x={cx - 4} y={y + H / 2 - 6}  textAnchor="middle" fontSize={9} fill="#64748b">MIXING</text>
      <text x={cx - 4} y={y + H / 2 + 8}  textAnchor="middle" fontSize={9} fill="#64748b">TANK</text>
      {[18, cx - x, W - 18].map((lx, i) => (
        <line key={i} x1={x + lx} y1={y + H + 9} x2={x + lx} y2={y + H + 22}
          stroke="#94a3b8" strokeWidth={2.5} />
      ))}
      <line x1={x + W + 12} y1={y + H / 2 + 10} x2={x + W + 36} y2={y + H / 2 + 10}
        stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowSHmain)" />
    </g>
  );
}

const SolidHandling: React.FC<{ data?: SolidHandlingData }> = ({ data = mockData }) => {
  const [d, setD] = useState(data);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    iv.current = setInterval(() => {
      setD(prev => ({
        ...prev,
        wg_actual_flow:    prev.wg_target_flow + (Math.random() - 0.5) * 400,
        wf_actual_flow:    prev.wf_target_flow + (Math.random() - 0.5) * 80,
        mb_gap:            parseFloat((0.38 + Math.random() * 0.14).toFixed(2)),
        mb_current:        parseFloat((13 + Math.random() * 4).toFixed(1)),
        mb_husk_pct:       parseFloat((10.5 + Math.random() * 2).toFixed(1)),
        mb_grist_pct:      parseFloat((73 + Math.random() * 4).toFixed(1)),
        mb_powder_pct:     parseFloat((11 + Math.random() * 3).toFixed(1)),
        mixing_tank_level: Math.round(50 + Math.random() * 35),
        mixing_flow_rate:  Math.round(9200 + Math.random() * 800),
        mixing_pct_ts:     parseFloat((13.5 + Math.random() * 2.5).toFixed(1)),
        output_wastage_pct:parseFloat((0.8 + Math.random() * 3.5).toFixed(2)),
        output_actual_kg:  Math.round(27000 + Math.random() * 1200),
      }));
    }, 2500);
    return () => { if (iv.current) clearInterval(iv.current); };
  }, []);

  const wgC = sc(d.wg_actual_flow, d.wg_target_flow);
  const wfC = sc(d.wf_actual_flow, d.wf_target_flow);
  const mbC = sc(d.mb_actual_flow, d.mb_target_flow);
  const flC = sc(d.mixing_flow_rate, d.mixing_flow_target);
  const waC = d.output_wastage_pct > 4
    ? { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" }
    : d.output_wastage_pct > 1
    ? { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" }
    : { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };

  // layout constants
  const SY = 48;   // silo y
  const PY = 420;  // conveyor y
  const TX = 692;  // mixing tank x

  return (
    <div style={{ background: "#ffffff", padding: "16px 16px 0", borderRadius: 8 }}>
      <svg width="100%" viewBox="0 0 1040 640" fontFamily="'Inter','Segoe UI',sans-serif">
        <defs>
          <marker id="arrowSHmain" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </marker>
          <marker id="arrowGSHmain" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* header */}
        <text x={16} y={22} fontSize={11} fill="#64748b" fontWeight="700" letterSpacing={2}>
          SOLID HANDLING
        </text>
        <line x1={16} y1={28} x2={1024} y2={28} stroke="#e2e8f0" strokeWidth={1} />

        {/* ── SILO 1 : WG & ISP ─────────────────────────── */}
        <Silo x={20} y={SY} label="WG & ISP" sub="HOLDING SILO" />
        <line x1={58} y1={SY + 96} x2={58} y2={SY + 148} stroke="#94a3b8" strokeWidth={3.5} />
        <Hopper x={31} y={SY + 148} />
        <text x={58} y={SY + 207} textAnchor="middle" fontSize={8.5} fill="#475569">Wheat Gluten &amp; ISP</text>
        <Badge x={-2}  y={SY + 218} w={120} h={42} label="TARGET FLOW" value={d.wg_target_flow.toFixed(0)} unit="kg/h" c={BLUE} />
        <Badge x={-2}  y={SY + 266} w={120} h={42} label="ACTUAL FLOW" value={d.wg_actual_flow.toFixed(0)} unit="kg/h" c={wgC} />

        {/* ── SILO 2 : WF ───────────────────────────────── */}
        <Silo x={165} y={SY} label="WF" sub="HOLDING SILO" />
        <line x1={203} y1={SY + 96} x2={203} y2={SY + 148} stroke="#94a3b8" strokeWidth={3.5} />
        <Hopper x={176} y={SY + 148} />
        <text x={203} y={SY + 207} textAnchor="middle" fontSize={8.5} fill="#475569">Wheat Flour</text>
        <Badge x={143} y={SY + 218} w={120} h={42} label="TARGET FLOW" value={d.wf_target_flow.toFixed(0)} unit="kg/h" c={BLUE} />
        <Badge x={143} y={SY + 266} w={120} h={42} label="ACTUAL FLOW" value={d.wf_actual_flow.toFixed(0)} unit="kg/h" c={wfC} />

        {/* ── SILO 3 : Malted Barley ──────────────────────── */}
        <Silo x={320} y={SY} label="MB" sub="BULK STORAGE" />
        {/* silo → mill */}
        <line x1={358} y1={SY + 96} x2={358} y2={SY + 126} stroke="#94a3b8" strokeWidth={3.5} />
        <Mill x={325} y={SY + 126} />
        {/* gap / current callout */}
        <text x={406} y={SY + 141} fontSize={9} fill="#6b7280">Gap</text>
        <text x={406} y={SY + 155} fontSize={11} fill="#d97706" fontWeight="700"
          fontFamily="'IBM Plex Mono',monospace">{d.mb_gap.toFixed(2)} mm</text>
        <text x={406} y={SY + 171} fontSize={9} fill="#6b7280">Current</text>
        <text x={406} y={SY + 185} fontSize={11} fill="#374151" fontWeight="700"
          fontFamily="'IBM Plex Mono',monospace">{d.mb_current.toFixed(1)} A</text>
        {/* mill → hopper */}
        <line x1={358} y1={SY + 190} x2={358} y2={SY + 215} stroke="#94a3b8" strokeWidth={3.5} />
        <Hopper x={331} y={SY + 215} />
        <text x={358} y={SY + 273} textAnchor="middle" fontSize={8.5} fill="#475569">Malted Barley</text>
        <Badge x={296} y={SY + 285} w={124} h={42} label="ACTUAL FLOW" value={d.mb_actual_flow.toFixed(0)} unit="kg/h" c={mbC} />
        <Badge x={296} y={SY + 333} w={124} h={42} label="TARGET FLOW" value={d.mb_target_flow.toFixed(0)} unit="kg/h" c={BLUE} />
        {/* % breakdown */}
        <Badge x={432} y={SY + 218} w={108} h={42} label="% HUSK"   value={d.mb_husk_pct.toFixed(1)}  unit="%" c={PURPLE} />
        <Badge x={432} y={SY + 266} w={108} h={42} label="% GRIST"  value={d.mb_grist_pct.toFixed(1)} unit="%" c={PURPLE} />
        <Badge x={432} y={SY + 314} w={108} h={42} label="% POWDER" value={d.mb_powder_pct.toFixed(1)} unit="%" c={PURPLE} />

        {/* ── Pipes down to conveyor ─────────────────────── */}
        <line x1={58}  y1={SY + 315} x2={58}  y2={PY}      stroke="#94a3b8" strokeWidth={3} />
        <line x1={203} y1={SY + 315} x2={203} y2={PY}      stroke="#94a3b8" strokeWidth={3} />
        <line x1={358} y1={SY + 378} x2={358} y2={PY}      stroke="#94a3b8" strokeWidth={3} />
        {/* merge funnel */}
        <polygon points={`200,${PY - 28} 280,${PY - 28} 262,${PY} 218,${PY}`}
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />

        {/* ── Screw conveyor ─────────────────────────────── */}
        <ScrewConveyor x={50} y={PY} w={390} />
        <Badge x={64}  y={PY + 36} w={130} h={42} label="FLOW RATE"
          value={d.conveyor_flow_rate.toLocaleString()} unit="kg/h"
          c={{ stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" }} />
        <Badge x={204} y={PY + 36} w={156} h={42} label="%MB / %WG / %WF"
          value={`${d.conveyor_pct_mb.toFixed(1)} / ${d.conveyor_pct_wg.toFixed(1)} / ${d.conveyor_pct_wf.toFixed(1)}`}
          c={PURPLE} />

        {/* ── Pipe: conveyor → mixing tank ─────────────────── */}
        <line x1={440} y1={PY + 14} x2={TX + 14} y2={PY + 14} stroke="#3b82f6" strokeWidth={2.5} />
        <line x1={TX + 14} y1={PY + 14} x2={TX + 14} y2={292}
          stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#arrowSHmain)" />

        {/* ── Mixing tank ────────────────────────────────── */}
        <MixingTank x={TX} y={192} level={d.mixing_tank_level} />

        {/* annotations */}
        <text x={TX + 118} y={206} fontSize={9}  fill="#3b82f6" fontWeight="600">Water / Weak wort</text>
        <text x={TX + 118} y={230} fontSize={9}  fill="#6b7280">RPM =
          <tspan fill="#059669" fontWeight="700" fontFamily="monospace"> {d.mixing_rpm}</tspan>
        </text>
        <text x={TX + 118} y={246} fontSize={9}  fill="#6b7280">Current =
          <tspan fill="#374151" fontWeight="700" fontFamily="monospace"> {d.mixing_current.toFixed(1)} A</tspan>
        </text>
        <text x={TX + 118} y={265} fontSize={9}  fill="#6b7280">Tank Level =
          <tspan fill={d.mixing_tank_level < 50 ? "#dc2626" : "#059669"} fontWeight="700" fontFamily="monospace"> {d.mixing_tank_level}%</tspan>
        </text>

        <Badge x={TX + 116} y={278} w={152} h={42} label="FLOW RATE act / tgt"
          value={`${d.mixing_flow_rate.toLocaleString()} / ${d.mixing_flow_target.toLocaleString()}`}
          unit="kg/s" c={flC} />
        <Badge x={TX + 116} y={326} w={152} h={42} label="% TS"
          value={d.mixing_pct_ts.toFixed(1)} unit="%" c={SKY} />
        <Badge x={TX + 116} y={374} w={152} h={42} label="%MB / %WG / %WF"
          value={`${d.mixing_pct_mb.toFixed(1)} / ${d.mixing_pct_wg.toFixed(1)} / ${d.mixing_pct_wf.toFixed(1)}`}
          c={PURPLE} />

        {/* ══ OUTPUT STRIP ════════════════════════════════ */}
        <rect x={16} y={510} width={1008} height={116} rx={8}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.5} />
        <rect x={16} y={510} width={5} height={116} rx={3} fill="#3b82f6" />
        <text x={36} y={530} fontSize={10} fill="#374151" fontWeight="700" letterSpacing={1}>
          TAB OUTPUT — CALCULATED BY FASTAPI
        </text>
        <line x1={36} y1={536} x2={1020} y2={536} stroke="#e2e8f0" strokeWidth={1} />

        {([
          { label: "BOM OUTPUT",         value: d.output_bom.toFixed(2),           c: SKY  },
          { label: "STD OUTPUT (kg)",    value: d.output_std_kg.toLocaleString(),  c: { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" } },
          { label: "ACTUAL OUTPUT (kg)", value: d.output_actual_kg.toLocaleString(), c: sc(d.output_actual_kg, d.output_std_kg) },
          { label: "WASTAGE %",          value: d.output_wastage_pct.toFixed(2) + "%", c: waC },
        ] as { label: string; value: string; c: Clr }[]).map((kpi, i) => (
          <g key={i}>
            <rect x={36 + i * 252} y={544} width={234} height={70} rx={7}
              fill={kpi.c.fill} stroke={kpi.c.stroke} strokeWidth={1.3} />
            <text x={36 + i * 252 + 117} y={562} textAnchor="middle"
              fontSize={9.5} fill="#6b7280" letterSpacing={0.5}>{kpi.label}</text>
            <text x={36 + i * 252 + 117} y={600} textAnchor="middle"
              fontSize={22} fontWeight="700" fill={kpi.c.text}
              fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SolidHandling;