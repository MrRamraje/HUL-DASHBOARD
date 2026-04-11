import React, { useEffect, useRef, useState } from "react";

// ─── Data shape ───────────────────────────────────────────────────────────────
// Each column has: an output vessel, a centrifuge, a wash/buffer tank below,
// and an info box with LT tag, Level %, and BIP value.
interface ExtractionUnit {
  lt_tag: string;           // e.g. "LT12_09_03"
  vessel_name: string;      // e.g. "WORT2"
  level_pct: number;        // tank level %
  bip: number;              // BIP value
}

interface ExtractionData {
  // Top-left global labels
  pct_predicted: number;
  pct_measured: number;
  // Top-right global labels
  target_pct: number;
  pct_ts: number;
  // 3 main centrifuge columns (left→right in diagram: col0, col1, col2)
  // col0 = unlabelled hopper (leftmost), col1 = WORT2, col2 = WORT1
  columns: ExtractionUnit[];
  // Buffer tank (right side)
  buffer: ExtractionUnit;
  // Bottom wash-tank info boxes (one per column)
  wash_boxes: ExtractionUnit[];
  // Output strip
  output_wort_brix: number;
  output_wort_extraction: number;
  output_total_wastage: number;
  output_actual_kg: number;
  output_std_kg: number;
}

const mockData: ExtractionData = {
  pct_predicted: 88.4,
  pct_measured:  88.6,
  target_pct:    91.0,
  pct_ts:        14.8,
  columns: [
    { lt_tag: "LT12_09_03", vessel_name: "",      level_pct: 64, bip: 245.6 },
    { lt_tag: "LT12_09_03", vessel_name: "WORT2", level_pct: 58, bip: 242.1 },
    { lt_tag: "LT13_08_03", vessel_name: "WORT1", level_pct: 71, bip: 248.3 },
  ],
  buffer: { lt_tag: "LT14_11_03", vessel_name: "Buffer Tank", level_pct: 74, bip: 230.0 },
  wash_boxes: [
    { lt_tag: "LT12_09_03", vessel_name: "Wash Tank",  level_pct: 44, bip: 210.5 },
    { lt_tag: "LT12_09_03", vessel_name: "Wash Tank",  level_pct: 52, bip: 214.2 },
    { lt_tag: "LT13_08_03", vessel_name: "Wash Tank",  level_pct: 68, bip: 218.7 },
  ],
  output_wort_brix:       14.8,
  output_wort_extraction: 88.6,
  output_total_wastage:   3.39,
  output_actual_kg:       27650,
  output_std_kg:          28620,
};

// ─── Color helpers ────────────────────────────────────────────────────────────
type Clr = { stroke: string; fill: string; text: string };

function sc(val: number, target: number, tol = 0.05): Clr {
  const dev = Math.abs(val - target) / (target || 1);
  if (dev < tol)  return { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };
  if (dev < 0.12) return { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
  return               { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" };
}

const BLUE:   Clr = { stroke: "#3b82f6", fill: "#eff6ff",  text: "#1d4ed8" };
const RED_LBL        = "#dc2626";
const BLUE_LBL       = "#2563eb";
const ORANGE_LBL     = "#ea580c";

// ─── Reusable SVG pieces ─────────────────────────────────────────────────────

/** Small info box: LT tag + Level % = / BIP = */
function InfoBox({ x, y, w = 140, unit }: {
  x: number; y: number; w?: number; unit: ExtractionUnit;
}) {
  const h = 58;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill="#fff9f9" stroke="#f87171" strokeWidth={1.2} />
      <text x={x + 8} y={y + 14} fontSize={9.5} fill={RED_LBL}
        fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{unit.lt_tag}</text>
      <text x={x + 8} y={y + 28} fontSize={9} fill={RED_LBL}>
        Level % = <tspan fontWeight="700">{unit.level_pct.toFixed(1)}</tspan>
      </text>
      <text x={x + 8} y={y + 43} fontSize={9} fill={RED_LBL}>
        BIP {"    "}= <tspan fontWeight="700">{unit.bip.toFixed(1)}</tspan>
      </text>
    </g>
  );
}

/** Hexagonal output vessel (pentagon shape) matching diagram */
function Vessel({ x, y, w = 80, label }: {
  x: number; y: number; w?: number; label: string;
}) {
  const h = 48;
  const cx = x + w / 2;
  // pentagon: flat bottom, angled top-sides, flat top
  const pts = [
    `${x + 12},${y}`,
    `${x + w - 12},${y}`,
    `${x + w},${y + 16}`,
    `${x + w},${y + h}`,
    `${x},${y + h}`,
    `${x},${y + 16}`,
  ].join(" ");
  return (
    <g>
      <polygon points={pts} fill="#f8fafc" stroke="#64748b" strokeWidth={1.4} />
      {label && (
        <text x={cx} y={y + h / 2 + 5} textAnchor="middle"
          fontSize={10} fill="#1e293b" fontWeight="700" fontFamily="sans-serif">{label}</text>
      )}
    </g>
  );
}

/** Centrifuge — matches the decanter centrifuge icon in the diagram */
function Centrifuge({ x, y }: { x: number; y: number }) {
  const W = 90, H = 58;
  const cx = x + 38, cy = y + H / 2;
  return (
    <g>
      {/* main body — tapered cylinder */}
      <rect x={x} y={y} width={W - 16} height={H} rx={6}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.3} />
      {/* right motor/gearbox block */}
      <rect x={x + W - 18} y={y + 10} width={18} height={H - 20} rx={4}
        fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
      {/* front drum */}
      <ellipse cx={cx} cy={cy} rx={22} ry={22}
        fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.3} />
      {/* inner rotor */}
      <ellipse cx={cx} cy={cy} rx={10} ry={10}
        fill="#eff6ff" stroke="#3b82f6" strokeWidth={0.9} />
      <ellipse cx={cx} cy={cy} rx={4}  ry={4}  fill="#3b82f6" />
      {/* spin lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const r = a * Math.PI / 180;
        return (
          <line key={a}
            x1={cx + Math.cos(r) * 10} y1={cy + Math.sin(r) * 10}
            x2={cx + Math.cos(r) * 20} y2={cy + Math.sin(r) * 20}
            stroke="#93c5fd" strokeWidth={0.8} />
        );
      })}
      {/* scroll inside body */}
      {[0, 1, 2, 3].map(i => (
        <line key={i}
          x1={x + 8}  y1={y + 10 + i * 12}
          x2={x + 60} y2={y + 10 + i * 12}
          stroke="#cbd5e1" strokeWidth={0.8} />
      ))}
      {/* bottom outlet pipe */}
      <line x1={cx} y1={y + H} x2={cx} y2={y + H + 20}
        stroke="#64748b" strokeWidth={3.5} />
    </g>
  );
}

/** Wash / Buffer tank — hopper-bottom shape with two circles */
function HopperTank({ x, y, w = 74, label, level }: {
  x: number; y: number; w?: number; label: string; level: number;
}) {
  const topH = 34, funnelH = 40;
  const fillH = Math.max(2, (level / 100) * topH);
  const lc = level < 40 ? "#ef4444" : level < 60 ? "#f59e0b" : "#22c55e";
  return (
    <g>
      {/* main rectangular body */}
      <rect x={x} y={y} width={w} height={topH}
        fill="#f8fafc" stroke="#64748b" strokeWidth={1.3} />
      {/* liquid fill */}
      <rect x={x + 1} y={y + topH - fillH} width={w - 2} height={fillH}
        fill={lc} opacity={0.18} />
      {/* right shade */}
      <rect x={x + w - 12} y={y} width={12} height={topH}
        fill="#e2e8f0" />
      {/* hopper funnel */}
      <polygon
        points={`${x},${y + topH} ${x + w},${y + topH} ${x + w * 0.72},${y + topH + funnelH} ${x + w * 0.28},${y + topH + funnelH}`}
        fill="#f1f5f9" stroke="#64748b" strokeWidth={1.3} />
      <polygon
        points={`${x + w * 0.72},${y + topH} ${x + w},${y + topH} ${x + w * 0.72},${y + topH + funnelH}`}
        fill="#e2e8f0" />
      {/* two pump circles */}
      {[0.28, 0.62].map((cx_r, i) => (
        <g key={i}>
          <circle cx={x + w * cx_r} cy={y + topH + funnelH * 0.68} r={9}
            fill="#f1f5f9" stroke="#64748b" strokeWidth={1} />
          <circle cx={x + w * cx_r} cy={y + topH + funnelH * 0.68} r={3.5}
            fill="#cbd5e1" />
        </g>
      ))}
      {/* rotated label */}
      <text
        x={x + w / 2} y={y + topH / 2 + 4}
        textAnchor="middle" fontSize={8.5}
        fill="#64748b" fontFamily="sans-serif"
        transform={`rotate(-90, ${x + w / 2}, ${y + topH / 2 + 4})`}
        style={{ writingMode: "vertical-lr" as const }}
      >{label}</text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const ExtractionSection: React.FC<{ data?: ExtractionData }> = ({ data = mockData }) => {
  const [d, setD] = useState(data);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    iv.current = setInterval(() => {
      setD(prev => ({
        ...prev,
        pct_predicted: parseFloat((prev.pct_predicted + (Math.random() - 0.5) * 1.4).toFixed(1)),
        pct_measured:  parseFloat((prev.pct_measured  + (Math.random() - 0.5) * 1.2).toFixed(1)),
        pct_ts:        parseFloat((prev.pct_ts        + (Math.random() - 0.5) * 0.4).toFixed(1)),
        columns: prev.columns.map(u => ({
          ...u,
          level_pct: parseFloat((u.level_pct + (Math.random() - 0.5) * 6).toFixed(1)),
          bip:       parseFloat((u.bip       + (Math.random() - 0.5) * 4).toFixed(1)),
        })),
        buffer: {
          ...prev.buffer,
          level_pct: parseFloat((prev.buffer.level_pct + (Math.random() - 0.5) * 5).toFixed(1)),
          bip:       parseFloat((prev.buffer.bip       + (Math.random() - 0.5) * 4).toFixed(1)),
        },
        wash_boxes: prev.wash_boxes.map(u => ({
          ...u,
          level_pct: parseFloat((u.level_pct + (Math.random() - 0.5) * 5).toFixed(1)),
          bip:       parseFloat((u.bip       + (Math.random() - 0.5) * 4).toFixed(1)),
        })),
        output_wort_brix:       parseFloat((prev.output_wort_brix       + (Math.random() - 0.5) * 0.3).toFixed(1)),
        output_wort_extraction: parseFloat((prev.output_wort_extraction + (Math.random() - 0.5) * 1.0).toFixed(1)),
        output_total_wastage:   parseFloat((prev.output_total_wastage   + (Math.random() - 0.5) * 0.3).toFixed(2)),
        output_actual_kg:       Math.round(prev.output_actual_kg + (Math.random() - 0.5) * 200),
      }));
    }, 2500);
    return () => { if (iv.current) clearInterval(iv.current); };
  }, []);

  // ── Layout constants ─────────────────────────────────────────────────────
  //
  //  3 columns spaced evenly + buffer tank on right
  //  col x-centers: 130, 340, 550   buffer: 760
  //
  const colCX  = [128, 338, 548];    // centrifuge horizontal centre per column
  const centW  = 90;                 // centrifuge width
  const vesW   = 84;                 // vessel width
  const boxW   = 142;                // info box width
  const vesY   = 96;                 // vessel top y
  const centY  = 184;                // centrifuge top y
  const wtY    = 310;                // wash tank top y
  const wbY    = 430;                // wash-box top y
  const bufX   = 718;                // buffer tank left x
  const bufY   = 198;                // buffer tank top y

  const extractC = sc(d.pct_measured, d.target_pct, 0.03);
  const wastageC = d.output_total_wastage > 4
    ? { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" }
    : d.output_total_wastage > 1
    ? { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" }
    : { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };

  return (
    <div style={{ background: "#ffffff", padding: "16px 16px 0", borderRadius: 8 }}>
      <svg width="100%" viewBox="0 0 940 590" fontFamily="'Inter','Segoe UI',sans-serif">
        <defs>
          <marker id="arrowBlueEX" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </marker>
          <marker id="arrowGrayEX" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* ── Section header ── */}
        <text x={16} y={22} fontSize={11} fill="#64748b" fontWeight="700" letterSpacing={2}>
          EXTRACTION SECTION
        </text>
        <line x1={16} y1={28} x2={924} y2={28} stroke="#e2e8f0" strokeWidth={1} />

        {/* ══════════════════════════════════════════════
            TOP-LEFT GLOBAL LABELS  (matching screenshot)
        ══════════════════════════════════════════════ */}
        <text x={20} y={52} fontSize={10} fill={ORANGE_LBL} fontWeight="700">
          % predicted = <tspan fontFamily="'IBM Plex Mono',monospace">{d.pct_predicted.toFixed(1)}</tspan>
        </text>
        <text x={20} y={70} fontSize={10} fill={RED_LBL} fontWeight="700">
          % measured = <tspan fontFamily="'IBM Plex Mono',monospace">{d.pct_measured.toFixed(1)}</tspan>
        </text>

        {/* ══════════════════════════════════════════════
            TOP-RIGHT GLOBAL LABELS
        ══════════════════════════════════════════════ */}
        <text x={680} y={52} fontSize={10} fill={BLUE_LBL} fontWeight="700">Target</text>
        <text x={680} y={70} fontSize={10} fill={BLUE_LBL}>
          %TS = <tspan fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{d.pct_ts.toFixed(1)}</tspan>
        </text>

        {/* ══════════════════════════════════════════════
            3 MAIN COLUMNS
        ══════════════════════════════════════════════ */}
        {colCX.map((cx, col) => {
          const u   = d.columns[col];
          const wu  = d.wash_boxes[col];
          const wb  = d.wash_boxes[col];
          const vx  = cx - vesW / 2;
          const ctx = cx - centW / 2;
          const wtx = cx - 37;
          const infoX = cx + centW / 2 - 4;   // info box to right of centrifuge

          return (
            <g key={col}>
              {/* ── Vessel / output label at top ── */}
              {u.vessel_name
                ? <Vessel x={vx} y={vesY} w={vesW} label={u.vessel_name} />
                : (
                  /* leftmost column: plain hopper-top vessel */
                  <polygon
                    points={`${vx + 12},${vesY} ${vx + vesW - 12},${vesY} ${vx + vesW},${vesY + 16} ${vx + vesW},${vesY + 48} ${vx},${vesY + 48} ${vx},${vesY + 16}`}
                    fill="#f8fafc" stroke="#64748b" strokeWidth={1.4} />
                )
              }

              {/* ── Arrow: centrifuge → vessel ── */}
              <line
                x1={cx} y1={centY}
                x2={cx} y2={vesY + 48}
                stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueEX)" />

              {/* ── Centrifuge ── */}
              <Centrifuge x={ctx} y={centY} />

              {/* ── Info box (LT tag, Level%, BIP) right of centrifuge ── */}
              <InfoBox x={infoX + 8} y={centY - 4} w={boxW} unit={u} />

              {/* ── Arrow: centrifuge → wash tank ── */}
              <line
                x1={cx} y1={centY + 78}
                x2={cx} y2={wtY}
                stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueEX)" />

              {/* ── Wash tank ── */}
              <HopperTank x={wtx} y={wtY} w={74} label="Wash Tank" level={wu.level_pct} />

              {/* ── Horizontal flow arrows between wash tanks (right-to-left flow) ── */}
              {col < 2 && (
                <line
                  x1={wtx}
                  y1={wtY + 22}
                  x2={colCX[col + 1] + 37 + 4}
                  y2={wtY + 22}
                  stroke="#3b82f6" strokeWidth={1.8}
                  markerEnd="url(#arrowBlueEX)"
                />
              )}

              {/* ── Bottom info boxes (wash tank tags) ── */}
              <InfoBox
                x={col === 2 ? cx - boxW / 2 : cx - boxW - 10}
                y={wbY}
                w={boxW}
                unit={wb}
              />
            </g>
          );
        })}

        {/* ══════════════════════════════════════════════
            BUFFER TANK  (right side)
        ══════════════════════════════════════════════ */}
        <HopperTank x={bufX} y={bufY} w={80} label="Buffer Tank" level={d.buffer.level_pct} />
        {/* info box below buffer tank */}
        <InfoBox x={bufX - 8} y={bufY + 108} w={boxW} unit={d.buffer} />

        {/* arrow: buffer tank → rightmost centrifuge */}
        <line
          x1={bufX}           y1={bufY + 30}
          x2={colCX[2] + 46}  y2={centY + 28}
          stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowBlueEX)" />

        {/* ══════════════════════════════════════════════
            OUTPUT STRIP
        ══════════════════════════════════════════════ */}
        <rect x={16} y={500} width={908} height={74} rx={8}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.5} />
        <rect x={16} y={500} width={5} height={74} rx={3} fill="#3b82f6" />
        <text x={36} y={518} fontSize={10} fill="#374151" fontWeight="700" letterSpacing={1}>
          TAB OUTPUT — CALCULATED BY FASTAPI
        </text>
        <line x1={36} y1={524} x2={920} y2={524} stroke="#e2e8f0" strokeWidth={1} />

        {([
          { label: "WORT % BRIX",        value: d.output_wort_brix.toFixed(1) + "%",       c: BLUE },
          { label: "WORT EXTRACTION %",  value: d.output_wort_extraction.toFixed(1) + "%", c: extractC },
          { label: "ACTUAL OUTPUT (kg)", value: d.output_actual_kg.toLocaleString(),        c: sc(d.output_actual_kg, d.output_std_kg) },
          { label: "TOTAL WASTAGE %",    value: d.output_total_wastage.toFixed(2) + "%",    c: wastageC },
        ] as { label: string; value: string; c: Clr }[]).map((kpi, i) => (
          <g key={i}>
            <rect x={36 + i * 224} y={530} width={206} height={36} rx={6}
              fill={kpi.c.fill} stroke={kpi.c.stroke} strokeWidth={1.2} />
            <text x={36 + i * 224 + 103} y={542} textAnchor="middle"
              fontSize={9} fill="#6b7280">{kpi.label}</text>
            <text x={36 + i * 224 + 103} y={559} textAnchor="middle"
              fontSize={14} fontWeight="700" fill={kpi.c.text}
              fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ExtractionSection;