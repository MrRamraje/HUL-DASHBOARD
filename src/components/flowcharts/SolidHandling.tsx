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

// ─── Silo ─────────────────────────────────────────────────────────────────────
function Silo({ x, y, label, sub }: { x: number; y: number; label: string; sub?: string }) {
  return (
    <g>
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

// ─── Mill ─────────────────────────────────────────────────────────────────────
function Mill({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={66} height={46} rx={5} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />
      <rect x={x + 50} y={y} width={16} height={46} rx={4} fill="#e2e8f0" />
      <ellipse cx={x + 21} cy={y + 23} rx={13} ry={13} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.2} />
      <ellipse cx={x + 21} cy={y + 23} rx={5}  ry={5}  fill="#3b82f6" />
      <ellipse cx={x + 41} cy={y + 23} rx={13} ry={13} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.2} />
      <ellipse cx={x + 41} cy={y + 23} rx={5}  ry={5}  fill="#3b82f6" />
      <polygon points={`${x + 18},${y + 46} ${x + 46},${y + 46} ${x + 40},${y + 64} ${x + 24},${y + 64}`}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
    </g>
  );
}

// ─── Hopper ───────────────────────────────────────────────────────────────────
function Hopper({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x + 54},${y} ${x + 40},${y + 44} ${x + 14},${y + 44}`}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />
      <polygon points={`${x + 40},${y} ${x + 54},${y} ${x + 40},${y + 44}`}
        fill="#e2e8f0" />
    </g>
  );
}

// ─── Screw Conveyor ───────────────────────────────────────────────────────────
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

// ─── Mixing Tank ──────────────────────────────────────────────────────────────
function MixingTank({ x, y, level }: { x: number; y: number; level: number }) {
  const H = 110, W = 90, cx = x + W / 2;
  const fillH = Math.max(4, (level / 100) * (H - 18));
  const fc = level < 40 ? "#fca5a5" : level < 60 ? "#fde68a" : "#bbf7d0";
  const lc = level < 40 ? "#ef4444" : level < 60 ? "#f59e0b" : "#22c55e";
  return (
    <g>
      <line x1={cx - 16} y1={y - 30} x2={cx - 16} y2={y}
        stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#arrowSH)" />
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
        stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowSH)" />
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
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
        output_wastage_pct: parseFloat((0.8 + Math.random() * 3.5).toFixed(2)),
        output_actual_kg:  Math.round(27000 + Math.random() * 1200),
      }));
    }, 2500);
    return () => { if (iv.current) clearInterval(iv.current); };
  }, []);

  const wgC = sc(d.wg_actual_flow, d.wg_target_flow);
  const wfC = sc(d.wf_actual_flow, d.wf_target_flow);
  const mbC = sc(d.mb_actual_flow, d.mb_target_flow);
  const flC = sc(d.mixing_flow_rate, d.mixing_flow_target);
  const waC: Clr = d.output_wastage_pct > 4
    ? { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" }
    : d.output_wastage_pct > 1
    ? { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" }
    : { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };

  // ── Layout constants ─────────────────────────────────────────────────────────
  const SY = 52;       // silo top y
  const convX = 50;    // conveyor left x
  const convY = 412;   // conveyor top y
  const convW = 390;   // conveyor width
  const TX = 596;      // mixing tank x
  const tankY = 260;   // mixing tank y

  // Silo center x values
  const wgCX = 96,  wfCX = 236, mbCX = 376;

  return (
    <div style={{ background: "#ffffff", padding: "16px 0 8px", borderRadius: 18 }}>
      <svg width="100%" viewBox="0 0 1040 600" fontFamily="'IBM Plex Mono', monospace">
        <defs>
          <marker id="arrowSH" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </marker>
          <marker id="arrowGSH" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
        </defs>

        <rect x={0} y={0} width={1040} height={600} fill="#ffffff" />

        {/* ── Section panels ── */}
        <rect x={12} y={40} width={548} height={420} rx={18} fill="#f8fafc" stroke="#dbe2ea" strokeWidth={1.2} />
        <rect x={572} y={108} width={456} height={312} rx={18} fill="#f8fafc" stroke="#dbe2ea" strokeWidth={1.2} />

        {/* ── Header ── */}
        <text x={12} y={20} fontSize={11} fill="#0f172a" fontWeight="700" letterSpacing={1}>SOLID HANDLING</text>
        <line x1={12} y1={26} x2={1028} y2={26} stroke="#dbe2ea" strokeWidth={1} />

        <text x={28} y={58} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif" letterSpacing={1}>FEED, MILLING & DOSING</text>
        <text x={590} y={126} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif" letterSpacing={1}>MIXING & CONDITIONING</text>

        {/* ════════════════════════════════════════════════
            SILO 1 — WG & ISP
        ════════════════════════════════════════════════ */}
        <Silo x={wgCX - 38} y={SY} label="WG" sub="HOLDING SILO" />
        {/* silo → hopper pipe */}
        <line x1={wgCX} y1={SY + 96} x2={wgCX} y2={SY + 148} stroke="#94a3b8" strokeWidth={3.5} />
        <Hopper x={wgCX - 27} y={SY + 148} />
        {/* hopper → conveyor pipe */}
        <line x1={wgCX} y1={SY + 192} x2={wgCX} y2={convY} stroke="#94a3b8" strokeWidth={3} />
        {/* inline label + value — no card */}
        <text x={wgCX + 32} y={SY + 168} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">WG & ISP</text>
        <text x={wgCX + 32} y={SY + 184} fontSize={12} fill={wgC.text} fontWeight="700">{d.wg_actual_flow.toFixed(0)}</text>
        <text x={wgCX + 32} y={SY + 196} fontSize={8} fill="#94a3b8" fontFamily="sans-serif">kg/h  tgt {d.wg_target_flow.toLocaleString()}</text>

        {/* ════════════════════════════════════════════════
            SILO 2 — WF
        ════════════════════════════════════════════════ */}
        <Silo x={wfCX - 38} y={SY} label="WF" sub="HOLDING SILO" />
        <line x1={wfCX} y1={SY + 96} x2={wfCX} y2={SY + 148} stroke="#94a3b8" strokeWidth={3.5} />
        <Hopper x={wfCX - 27} y={SY + 148} />
        <line x1={wfCX} y1={SY + 192} x2={wfCX} y2={convY} stroke="#94a3b8" strokeWidth={3} />
        {/* inline values */}
        <text x={wfCX + 32} y={SY + 168} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">Wheat Flour</text>
        <text x={wfCX + 32} y={SY + 184} fontSize={12} fill={wfC.text} fontWeight="700">{d.wf_actual_flow.toFixed(0)}</text>
        <text x={wfCX + 32} y={SY + 196} fontSize={8} fill="#94a3b8" fontFamily="sans-serif">kg/h  tgt {d.wf_target_flow}</text>

        {/* ════════════════════════════════════════════════
            SILO 3 — Malted Barley
        ════════════════════════════════════════════════ */}
        <Silo x={mbCX - 38} y={SY} label="MB" sub="BULK STORAGE" />
        {/* silo → mill */}
        <line x1={mbCX} y1={SY + 96} x2={mbCX} y2={SY + 126} stroke="#94a3b8" strokeWidth={3.5} />
        <Mill x={mbCX - 33} y={SY + 126} />
        {/* mill gap / current — inline */}
        <text x={mbCX + 40} y={SY + 141} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">Gap</text>
        <text x={mbCX + 40} y={SY + 154} fontSize={11} fill="#d97706" fontWeight="700">{d.mb_gap.toFixed(2)} mm</text>
        <text x={mbCX + 40} y={SY + 168} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">Current</text>
        <text x={mbCX + 40} y={SY + 181} fontSize={11} fill="#374151" fontWeight="700">{d.mb_current.toFixed(1)} A</text>
        {/* mill → hopper pipe (straight, no badge blocking) */}
        <line x1={mbCX} y1={SY + 190} x2={mbCX} y2={SY + 215} stroke="#94a3b8" strokeWidth={3.5} />
        <Hopper x={mbCX - 27} y={SY + 215} />
        {/* hopper → conveyor (straight clean pipe) */}
        <line x1={mbCX} y1={SY + 259} x2={mbCX} y2={convY} stroke="#94a3b8" strokeWidth={3} />
        {/* MB inline values */}
        <text x={mbCX + 34} y={SY + 232} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">Malted Barley</text>
        <text x={mbCX + 34} y={SY + 247} fontSize={11} fill={mbC.text} fontWeight="700">{d.mb_actual_flow.toFixed(0)} kg/h</text>
        {/* MB breakdown — clean inline */}
        <text x={mbCX + 34} y={SY + 265} fontSize={8} fill="#7c3aed" fontWeight="600">Husk {d.mb_husk_pct.toFixed(1)}%</text>
        <text x={mbCX + 34} y={SY + 278} fontSize={8} fill="#7c3aed" fontWeight="600">Grist {d.mb_grist_pct.toFixed(1)}%</text>
        <text x={mbCX + 34} y={SY + 291} fontSize={8} fill="#7c3aed" fontWeight="600">Powder {d.mb_powder_pct.toFixed(1)}%</text>

        {/* ── Merge funnel connecting all 3 pipes to conveyor ── */}
        <polygon
          points={`${wgCX - 10},${convY - 20} ${mbCX + 10},${convY - 20} ${mbCX - 5},${convY} ${wgCX + 5},${convY}`}
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />

        {/* ── Screw Conveyor ── */}
        <ScrewConveyor x={convX} y={convY} w={convW} />
        {/* conveyor inline values */}
        <text x={convX + convW / 2} y={convY + 42} textAnchor="middle" fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">CONVEYOR FLOW</text>
        <text x={convX + convW / 2} y={convY + 56} textAnchor="middle" fontSize={13} fill="#15803d" fontWeight="700">{d.conveyor_flow_rate.toLocaleString()} kg/h</text>
        <text x={convX + convW / 2} y={convY + 68} textAnchor="middle" fontSize={8} fill="#7c3aed" fontWeight="600">
          MB {d.conveyor_pct_mb.toFixed(1)}% / WG {d.conveyor_pct_wg.toFixed(1)}% / WF {d.conveyor_pct_wf.toFixed(1)}%
        </text>

        {/* ── Pipe: conveyor → mixing tank ── */}
        <line x1={convX + convW} y1={convY + 14} x2={TX + 30} y2={convY + 14}
          stroke="#3b82f6" strokeWidth={2.5} />
        <line x1={TX + 30} y1={convY + 14} x2={TX + 30} y2={tankY + 18}
          stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#arrowSH)" />

        {/* ── Mixing Tank ── */}
        <MixingTank x={TX} y={tankY} level={d.mixing_tank_level} />

        {/* ── Info panel — right of mixing tank, center-aligned with conveyor ──
            Center of conveyor: convX + convW/2 = 245
            Panel width: 200, so x = 245 + offset. But mixing tank is at TX=596.
            We position panel to the right of the tank, directly beside it. */}
        <text x={TX + 115} y={tankY + 14} fontSize={8.5} fill="#3b82f6" fontWeight="700">Water / Weak wort</text>
        <line x1={TX + 115} y1={tankY + 18} x2={TX + 292} y2={tankY + 18} stroke="#dbe2ea" strokeWidth={0.8} />

        {/* RPM, Current, Level — inline */}
        <text x={TX + 115} y={tankY + 38} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">RPM</text>
        <text x={TX + 200} y={tankY + 38} textAnchor="end" fontSize={11} fill="#059669" fontWeight="700">{d.mixing_rpm}</text>
        <text x={TX + 115} y={tankY + 56} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">Current</text>
        <text x={TX + 200} y={tankY + 56} textAnchor="end" fontSize={11} fill="#374151" fontWeight="700">{d.mixing_current.toFixed(1)} A</text>
        <text x={TX + 115} y={tankY + 74} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">Tank Level</text>
        <text x={TX + 200} y={tankY + 74} textAnchor="end" fontSize={11}
          fill={d.mixing_tank_level < 50 ? "#dc2626" : "#059669"} fontWeight="700">{d.mixing_tank_level}%</text>

        

        {/* ── OUTPUT STRIP ── */}
        <rect x={12} y={490} width={1016} height={98} rx={14}
          fill="#ffffff" stroke="#dbe2ea" strokeWidth={1.4} />
        <rect x={12} y={490} width={5} height={98} rx={3} fill="#3b82f6" />
        <text x={28} y={508} fontSize={10} fill="#0f172a" fontWeight="700" letterSpacing={1}>
          TAB OUTPUT
        </text>
        <line x1={28} y1={514} x2={1024} y2={514} stroke="#dbe2ea" strokeWidth={1} />

        {([
          { label: "BOM OUTPUT",         value: d.output_bom.toFixed(2),              color: "#0369a1" },
          { label: "STD OUTPUT (kg)",    value: d.output_std_kg.toLocaleString(),     color: "#15803d" },
          { label: "ACTUAL OUTPUT (kg)", value: d.output_actual_kg.toLocaleString(),  color: sc(d.output_actual_kg, d.output_std_kg).text },
          { label: "WASTAGE %",          value: d.output_wastage_pct.toFixed(2) + "%", color: waC.text },
        ] as { label: string; value: string; color: string }[]).map((kpi, i) => (
          <g key={i}>
            <text x={36 + i * 254} y={532} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">{kpi.label}</text>
            <text x={36 + i * 254} y={562} fontSize={22} fontWeight="700" fill={kpi.color} fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SolidHandling;
