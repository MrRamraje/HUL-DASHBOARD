import React, { useEffect, useRef, useState } from "react";

interface ExtractionUnit {
  lt_tag: string;
  vessel_name: string;
  level_pct: number;
  bip: number;
}

interface ExtractionData {
  pct_predicted: number;
  pct_measured: number;
  target_pct: number;
  pct_ts: number;
  columns: ExtractionUnit[];
  buffer: ExtractionUnit;
  wash_boxes: ExtractionUnit[];
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
    { lt_tag: "LT13_10_03", vessel_name: "WORT2", level_pct: 64, bip: 245.6 },
    { lt_tag: "LT13_08_03", vessel_name: "WORT1", level_pct: 71, bip: 248.3 },
    { lt_tag: "LT14_11_03", vessel_name: "WORT",  level_pct: 58, bip: 242.1 },
  ],
  buffer: { lt_tag: "LT13_11_03", vessel_name: "Buffer Tank", level_pct: 74, bip: 230.0 },
  wash_boxes: [
    { lt_tag: "LT12_09_03", vessel_name: "Wash Tank", level_pct: 44, bip: 210.5 },
    { lt_tag: "LT13_06_03", vessel_name: "Wash Tank", level_pct: 52, bip: 214.2 },
    { lt_tag: "LT13_05_03", vessel_name: "Wash Tank", level_pct: 68, bip: 218.7 },
  ],
  output_wort_brix:       14.8,
  output_wort_extraction: 88.6,
  output_total_wastage:   3.39,
  output_actual_kg:       27650,
  output_std_kg:          28620,
};
const TOP_TANK_LABELS = ["WORT2", "WORT1", "WORT"] as const;
const TOP_TANK_IMAGE_HREF = "/images/cylinder.png";

type Clr = { stroke: string; fill: string; text: string };

function sc(val: number, target: number, tol = 0.05): Clr {
  const dev = Math.abs(val - target) / (target || 1);
  if (dev < tol)  return { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };
  if (dev < 0.12) return { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
  return               { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" };
}

const BLUE:   Clr = { stroke: "#3b82f6", fill: "#eff6ff",  text: "#1d4ed8" };

// ─── Vessel ───────────────────────────────────────────────────────────────────
function Vessel({ x, y, w = 80, label }: { x: number; y: number; w?: number; label: string }) {
  const h = 48;
  return (
    <g>
      <image
        href={TOP_TANK_IMAGE_HREF}
        x={x - 14}
        y={y - 22}
        width={w + 28}
        height={h + 42}
        preserveAspectRatio="xMidYMid meet"
      />
      {label && (
        <text x={x - 12} y={y + 10} textAnchor="end"
          fontSize={9.5} fill="#0f172a" fontWeight="800" fontFamily="sans-serif">{label}</text>
      )}
    </g>
  );
}

// ─── Centrifuge ───────────────────────────────────────────────────────────────
function Centrifuge({ x, y }: { x: number; y: number }) {
  const W = 90, H = 58, cx = x + 38, cy = y + H / 2;
  return (
    <g>
      <rect x={x} y={y} width={W - 16} height={H} rx={6}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.3} />
      <rect x={x + W - 18} y={y + 10} width={18} height={H - 20} rx={4}
        fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
      <ellipse cx={cx} cy={cy} rx={22} ry={22}
        fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.3} />
      <ellipse cx={cx} cy={cy} rx={10} ry={10}
        fill="#eff6ff" stroke="#3b82f6" strokeWidth={0.9} />
      <ellipse cx={cx} cy={cy} rx={4}  ry={4}  fill="#3b82f6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const r = a * Math.PI / 180;
        return (
          <line key={a}
            x1={cx + Math.cos(r) * 10} y1={cy + Math.sin(r) * 10}
            x2={cx + Math.cos(r) * 20} y2={cy + Math.sin(r) * 20}
            stroke="#93c5fd" strokeWidth={0.8} />
        );
      })}
      {[0, 1, 2, 3].map(i => (
        <line key={i}
          x1={x + 8}  y1={y + 10 + i * 12}
          x2={x + 60} y2={y + 10 + i * 12}
          stroke="#cbd5e1" strokeWidth={0.8} />
      ))}
      <line x1={cx} y1={y + H} x2={cx} y2={y + H + 20}
        stroke="#64748b" strokeWidth={3.5} />
    </g>
  );
}

// ─── Hopper Tank ─────────────────────────────────────────────────────────────
function HopperTank({
  x,
  y,
  w = 74,
  level,
  neutral = false,
}: { x: number; y: number; w?: number; level: number; neutral?: boolean }) {
  const topH = 34, funnelH = 40;
  const fillH = Math.max(2, (level / 100) * topH);
  const lc = neutral ? "#cbd5e1" : level < 40 ? "#ef4444" : level < 60 ? "#f59e0b" : "#22c55e";
  const fillOpacity = neutral ? 0.22 : 0.18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={topH}
        fill="#f8fafc" stroke="#64748b" strokeWidth={1.3} />
      <rect x={x + 1} y={y + topH - fillH} width={w - 2} height={fillH}
        fill={lc} opacity={fillOpacity} />
      <rect x={x + w - 12} y={y} width={12} height={topH}
        fill="#e2e8f0" />
      <polygon
        points={`${x},${y + topH} ${x + w},${y + topH} ${x + w * 0.72},${y + topH + funnelH} ${x + w * 0.28},${y + topH + funnelH}`}
        fill="#f1f5f9" stroke="#64748b" strokeWidth={1.3} />
      <polygon
        points={`${x + w * 0.72},${y + topH} ${x + w},${y + topH} ${x + w * 0.72},${y + topH + funnelH}`}
        fill="#e2e8f0" />
      {!neutral && [0.28, 0.62].map((cx_r, i) => (
        <g key={i}>
          <circle cx={x + w * cx_r} cy={y + topH + funnelH * 0.68} r={9}
            fill="#f1f5f9" stroke="#64748b" strokeWidth={1} />
          <circle cx={x + w * cx_r} cy={y + topH + funnelH * 0.68} r={3.5}
            fill="#cbd5e1" />
        </g>
      ))}
      {/* level indicator */}
      <rect x={x + w + 3} y={y} width={5} height={topH} rx={2} fill="#f1f5f9" stroke="#dbe2ea" strokeWidth={0.8} />
      <rect x={x + w + 4} y={y + topH - fillH} width={3} height={fillH} rx={1} fill={lc} opacity={neutral ? 0.6 : 0.9} />
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

  // ── Layout constants ──────────────────────────────────────────────────────
  // 3 columns, evenly spaced. SVG width=960.
  // Column centres: 130, 340, 550. Buffer tank at 760.
  const colCX  = [130, 340, 550];
  const centW  = 90;
  const vesW   = 84;
  const vesY   = 88;
  const centY  = 176;
  const wtY    = 302;
  const wtH    = 74;
  const bufX   = 716;
  const bufY   = 178;

  const extractC = sc(d.pct_measured, d.target_pct, 0.03);
  const wastageC: Clr = d.output_total_wastage > 4
    ? { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" }
    : d.output_total_wastage > 1
    ? { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" }
    : { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };

  return (
    <div style={{
      background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 20%)",
      padding: "16px 10px 10px",
      borderRadius: 18,
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    }}>
      <svg width="100%" viewBox="0 0 960 530" fontFamily="'IBM Plex Mono', monospace">
        <defs>
          <marker id="arrowEX" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </marker>
          <marker id="arrowGEX" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
        </defs>
        <style>{`
          rect {
            display: grid;
            position: absolute;
          }
        `}</style>

        <rect x={0} y={0} width={960} height={530} fill="#ffffff" />

        {/* ── Section panel ── */}
        <rect x={12} y={65} width={930} height={346} rx={18} fill="#f8fafc" stroke="#cfd8e3" strokeWidth={1.2} />

        {/* ── Header ── */}
        <text x={12} y={18} fontSize={11} fill="#0f172a" fontWeight="700" letterSpacing={1}>
          EXTRACTION SECTION
        </text>
        <line x1={12} y1={24} x2={948} y2={24} stroke="#dbe2ea" strokeWidth={1} />

        {/* ── Header metrics (inline, no cards) ── */}
        <text x={16} y={44} fontSize={8.5} fill="#64748b" fontFamily="sans-serif">PREDICTED</text>
        <text x={16} y={60} fontSize={13} fill="#ea580c" fontWeight="700">{d.pct_predicted.toFixed(1)}%</text>

        <text x={130} y={44} fontSize={8.5} fill="#64748b" fontFamily="sans-serif">MEASURED</text>
        <text x={130} y={60} fontSize={13} fill="#dc2626" fontWeight="700">{d.pct_measured.toFixed(1)}%</text>

        <text x={720} y={44} fontSize={8.5} fill="#64748b" fontFamily="sans-serif">TARGET</text>
        <text x={720} y={60} fontSize={13} fill="#2563eb" fontWeight="700">{d.target_pct.toFixed(1)}%</text>

        <text x={810} y={44} fontSize={8.5} fill="#64748b" fontFamily="sans-serif">% TS</text>
        <text x={810} y={60} fontSize={13} fill="#2563eb" fontWeight="700">{d.pct_ts.toFixed(1)}</text>

        {/* ══════════════════════════════════════════════
            3 MAIN COLUMNS
        ══════════════════════════════════════════════ */}
        {colCX.map((cx, col) => {
          const u  = d.columns[col];
          const wu = d.wash_boxes[col];
          const vx = cx - vesW / 2;
          const ctx = cx - centW / 2;
          const wtx = cx - 37;
              const washTankLineX = [123, 333, 543][col];

          return (
            <g key={col}>
              {/* ── Vessel ── */}
              {TOP_TANK_LABELS[col]
                ? <Vessel x={vx} y={vesY} w={vesW} label={TOP_TANK_LABELS[col]} />
                : (
                  <polygon
                    points={`${vx + 12},${vesY} ${vx + vesW - 12},${vesY} ${vx + vesW},${vesY + 16} ${vx + vesW},${vesY + 48} ${vx},${vesY + 48} ${vx},${vesY + 16}`}
                    fill="#f8fafc" stroke="#64748b" strokeWidth={1.4} />
                )
              }

              {/* ── Arrow: extractor → WORT vessel ── */}
              <line
                x1={cx} y1={180}
                x2={cx} y2={156}
                stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowEX)" />
              {col === 2 && (
                <>
                  <line
                    x1={cx + 24} y1={vesY + 12}
                    x2={640} y2={vesY + 12}
                    stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowEX)"
                  />
                  <text
                    x={648}
                    y={vesY + 16}
                    fontSize={8.5}
                    fill="#475569"
                    fontFamily="sans-serif"
                    textAnchor="start"
                  >
                    Maltodextrin Tank
                  </text>
                </>
              )}

              {/* ── Centrifuge ── */}
              <Centrifuge x={ctx} y={centY} />

              {/* ── Top vessel info block (aligned left of vessel) ── */}
              <text x={vx - 12} y={vesY + 24} textAnchor="end" fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">Level</text>
              <text x={vx - 12} y={vesY + 38} textAnchor="end" fontSize={11} fill="#dc2626" fontWeight="700">{u.level_pct.toFixed(1)}%</text>
              <text x={vx - 12} y={vesY + 52} textAnchor="end" fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">BIP</text>
              <text x={vx - 12} y={vesY + 66} textAnchor="end" fontSize={11} fill="#dc2626" fontWeight="700">{u.bip.toFixed(1)}</text>

              {/* ── Arrow: extractor → wash tank (direct vertical) ── */}
              <line
                x1={washTankLineX} y1={254}
                x2={washTankLineX} y2={302}
                stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowEX)"
                style={{ position: "absolute", left: "300px", display: "flex", flexWrap: "wrap" }} />

              {/* ── Wash tank ── */}
              <HopperTank x={wtx} y={wtY} w={74} level={wu.level_pct} neutral />

              {/* wash tank inline label */}
              <text x={wtx + 37} y={wtY + 86} textAnchor="middle" fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">Wash Tank</text>
              <text x={wtx + 37} y={wtY + 100} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight="700">{wu.level_pct.toFixed(1)}%</text>

              {/* ── Cross flow from wash tanks to extractors (bent arrows) ── */}
              {(() => {
                let targetCol: number | null = null;
                // Required routing:
                // LT13_06_03 wash tank -> 1st extractor
                // LT13_05_03 wash tank -> middle extractor
                if (wu.lt_tag === "LT13_06_03" && col === 1) targetCol = 0;
                if (wu.lt_tag === "LT13_05_03" && col === 2) targetCol = 1;
                if (targetCol === null) return null;

                const startX = cx;
                const startY = wtY + 16;

                // Target the side module of centrifuge body for clean visual docking.
                const targetX = colCX[targetCol] + 27;
                const targetY = centY + 30;
                const jogX = targetX + 80;
                const isFirstRequestedPolyline = wu.lt_tag === "LT13_06_03" && col === 1;
                const isSecondRequestedPolyline = wu.lt_tag === "LT13_05_03" && col === 2;
                const isRequestedPolyline = isFirstRequestedPolyline || isSecondRequestedPolyline;
                const polylinePoints = isFirstRequestedPolyline
                  ? "300,318 237,318 237,206 177,206"
                  : isSecondRequestedPolyline
                  ? "511,318 447,318 447,206 390,206"
                  : `${startX},${startY} ${jogX},${startY} ${jogX},${targetY} ${targetX},${targetY}`;

                return (
                  <polyline
                    points={polylinePoints}
                    style={{
                      position: "absolute",
                      display: "grid",
                      flexFlow: "column",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      gridTemplateColumns: "repeat(11, 1fr)",
                      gridTemplateRows: "repeat(8, 1fr)",
                    }}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={isRequestedPolyline ? 1.6 : 1.4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    markerEnd="url(#arrowEX)"
                  />
                );
              })()}

              {/* ── Wash tank side info (consistent with top tank styling) ── */}
              <text x={wtx + 86} y={wtY + 32} fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">Level</text>
              <text x={wtx + 86} y={wtY + 46} fontSize={11} fill="#dc2626" fontWeight="700">{wu.level_pct.toFixed(1)}%</text>
              <text x={wtx + 86} y={wtY + 60} fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">BIP</text>
              <text x={wtx + 86} y={wtY + 74} fontSize={11} fill="#dc2626" fontWeight="700">{wu.bip.toFixed(1)}</text>

            </g>
          );
        })}

        {/* ══════════════════════════════════════════════
            BUFFER TANK (right side)
        ══════════════════════════════════════════════ */}
        <HopperTank x={bufX} y={bufY} w={80} level={d.buffer.level_pct} />
        {/* Buffer inline info */}
        <text x={bufX} y={bufY - 12} fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">Buffer Tank</text>
        <text x={bufX} y={bufY + 102} fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">Level</text>
        <text x={bufX} y={bufY + 116} fontSize={11} fill="#dc2626" fontWeight="700">{d.buffer.level_pct.toFixed(1)}%</text>
        <text x={bufX} y={bufY + 130} fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="sans-serif">BIP</text>
        <text x={bufX} y={bufY + 144} fontSize={11} fill="#dc2626" fontWeight="700">{d.buffer.bip.toFixed(1)}</text>

        {/* arrow: buffer → rightmost centrifuge */}
        <line
          x1={bufX} y1={208}
          x2={596} y2={208}
          stroke="#3b82f6" strokeWidth={1.8} markerEnd="url(#arrowEX)" />

        {/* ══════════════════════════════════════════════
            OUTPUT STRIP
        ══════════════════════════════════════════════ */}
        <rect x={12} y={440} width={930} height={78} rx={14}
          fill="#ffffff" stroke="#dbe2ea" strokeWidth={1.4} />
        <rect x={12} y={440} width={5} height={78} rx={3} fill="#3b82f6" />
        <text x={28} y={458} fontSize={10} fill="#0f172a" fontWeight="700" letterSpacing={1}>
          TAB OUTPUT
        </text>
        <line x1={28} y1={464} x2={938} y2={464} stroke="#dbe2ea" strokeWidth={1} />

        {([
          { label: "WORT % BRIX",        value: d.output_wort_brix.toFixed(1) + "%",       c: BLUE },
          { label: "WORT EXTRACTION %",  value: d.output_wort_extraction.toFixed(1) + "%", c: extractC },
          { label: "ACTUAL OUTPUT (kg)", value: d.output_actual_kg.toLocaleString(),        c: sc(d.output_actual_kg, d.output_std_kg) },
          { label: "TOTAL WASTAGE %",    value: d.output_total_wastage.toFixed(2) + "%",    c: wastageC },
        ] as { label: string; value: string; c: Clr }[]).map((kpi, i) => (
          <g key={i}>
            {i > 0 && <line x1={30 + i * 232} y1={472} x2={30 + i * 232} y2={512} stroke="#e2e8f0" strokeWidth={1} />}
            <text x={36 + i * 232} y={480} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">{kpi.label}</text>
            <text x={36 + i * 232} y={504} fontSize={20} fontWeight="700" fill={kpi.c.text}
              fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ExtractionSection;
