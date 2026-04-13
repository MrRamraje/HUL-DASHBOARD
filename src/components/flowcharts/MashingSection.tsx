import React, { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeatExchanger {
  temp_setpoint: number;
  temp_actual: number;
  flow_in: number;
  flow_out: number;
}

interface MashingData {
  water_flow: number;
  water_flow_min: number;
  water_flow_max: number;
  mixing_tank1_level: number;
  mixing_tank2_level: number;
  hex: HeatExchanger[];
  output_mashing_efficiency: number;
  output_temp_profile: number[];
  output_actual_kg: number;
  output_std_kg: number;
  output_wastage_pct: number;
}

const mockData: MashingData = {
  water_flow: 8200,
  water_flow_min: 7500,
  water_flow_max: 8700,
  mixing_tank1_level: 72,
  mixing_tank2_level: 65,
  hex: [
    { temp_setpoint: 60, temp_actual: 59.8, flow_in: 8200, flow_out: 8200 },
    { temp_setpoint: 64, temp_actual: 64.2, flow_in: 8200, flow_out: 8200 },
    { temp_setpoint: 74, temp_actual: 73.6, flow_in: 8200, flow_out: 8200 },
    { temp_setpoint: 74, temp_actual: 74.3, flow_in: 8200, flow_out: 8200 },
    { temp_setpoint: 74, temp_actual: 74.1, flow_in: 8200, flow_out: 8200 },
    { temp_setpoint: 80, temp_actual: 79.8, flow_in: 8200, flow_out: 8200 },
  ],
  output_mashing_efficiency: 94.2,
  output_temp_profile: [59.8, 64.2, 73.6, 74.3, 74.1, 79.8],
  output_actual_kg: 27650,
  output_std_kg: 28620,
  output_wastage_pct: 2.34,
};

const HEX_SETPOINTS = [60, 64, 74, 74, 74, 80];

// ─── Color helpers ────────────────────────────────────────────────────────────
type Clr = { stroke: string; fill: string; text: string };

function tempClr(actual: number, setpoint: number): Clr {
  const d = Math.abs(actual - setpoint);
  if (d <= 0.5) return { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };
  if (d <= 1.5) return { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" };
  return              { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" };
}

// ─── Mixing Tank ──────────────────────────────────────────────────────────────
// W=80  H=100  inlet arrow above, level bar on right, legs below
function MixingTankM({
  x, y, label, level, waterLabel,
}: {
  x: number; y: number; label: string; level: number; waterLabel?: string;
}) {
  const W = 80, H = 100;
  const cx = x + W / 2;
  const fillH = Math.max(4, (level / 100) * (H - 10));
  const lc = level < 40 ? "#dc2626" : level < 65 ? "#d97706" : "#16a34a";
  const lf = level < 40 ? "#fef2f2" : level < 65 ? "#fffbeb" : "#f0fdf4";

  return (
    <g>
      {/* water inlet label + arrow */}
      {waterLabel && (
        <text x={cx} y={y - 36} textAnchor="middle"
          fontSize={8} fill="#3b82f6" fontFamily="sans-serif">{waterLabel}</text>
      )}
      <line x1={cx} y1={y - 24} x2={cx} y2={y - 1}
        stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowMash)" />

      {/* top ellipse */}
      <ellipse cx={cx} cy={y} rx={W / 2} ry={8}
        fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.2} />

      {/* body */}
      <rect x={x} y={y} width={W} height={H}
        fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />

      {/* liquid fill (clip to body, exclude shade column) */}
      <rect x={x + 1} y={y + H - fillH} width={W - 15} height={fillH}
        fill={lf} opacity={0.85} />

      {/* right shade */}
      <rect x={x + W - 13} y={y + 1} width={12} height={H - 1}
        fill="#f1f5f9" />

      {/* bottom ellipse */}
      <ellipse cx={cx} cy={y + H} rx={W / 2} ry={8}
        fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1.2} />

      {/* level bar — sits outside right edge */}
      <rect x={x + W + 4} y={y + 4} width={6} height={H - 8} rx={3}
        fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.8} />
      <rect
        x={x + W + 5}
        y={y + 4 + (H - 8) * (1 - level / 100)}
        width={4}
        height={(H - 8) * (level / 100)}
        rx={2} fill={lc} opacity={0.9} />

      {/* label inside tank */}
      <text x={cx - 6} y={y + H / 2 - 5} textAnchor="middle"
        fontSize={8.5} fill="#64748b" fontFamily="sans-serif">{label}</text>
      <text x={cx - 6} y={y + H / 2 + 9} textAnchor="middle"
        fontSize={8.5} fill="#64748b" fontFamily="sans-serif">TANK</text>

      {/* level % below tank */}
      <text x={cx} y={y + H + 22} textAnchor="middle"
        fontSize={9.5} fill={lc} fontWeight="700"
        fontFamily="'IBM Plex Mono',monospace">{level}%</text>

      {/* legs */}
      {[14, cx - x, W - 14].map((lx, i) => (
        <line key={i}
          x1={x + lx} y1={y + H + 8}
          x2={x + lx} y2={y + H + 16}
          stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
      ))}
    </g>
  );
}

// ─── Heat Exchanger ───────────────────────────────────────────────────────────
//
// Layout (all relative to top-left corner x,y):
//
//   y-14  ─── stub-up    stub-down ───     (two 14-px stubs, centred in W)
//   y      ┌────────────────────────┐
//           │  coil coil coil ...   │      body W×H, rx=8
//   y+H    └────────────────────────┘
//   y+H+10 ─── centre outlet stub
//   y+H+22    "59.8°C"  (actual)
//   y+H+34    "sp 60°C" (setpoint)
//
// W=56  H=92
// Coil: 5 loops, centred horizontally at cx=x+W/2
// Stub pair centred: left stub at cx-10, right stub at cx+10
//
function HeatExchangerSVG({
  x, y, temp, actualTemp,
}: {
  x: number; y: number; temp: number; actualTemp: number;
}) {
  const W = 56, H = 92;
  const cx = x + W / 2;

  const clr: Clr = { stroke: "#1f2937", fill: "#ffffff", text: "#1f2937" };

  // Two inlet/outlet stubs on top, symmetrically about cx
  const stubOffset = 10;
  const stubLen    = 14;

  return (
    <g>
      {/* ── top stubs ── */}
      {/* left stub: fluid IN (down arrow) */}
      <line
        x1={cx - stubOffset} y1={y - stubLen}
        x2={cx - stubOffset} y2={y}
        stroke="#94a3b8" strokeWidth={1.4} strokeLinecap="round" />
      {/* right stub: fluid OUT (up arrow) */}
      <line
        x1={cx + stubOffset} y1={y}
        x2={cx + stubOffset} y2={y - stubLen}
        stroke="#94a3b8" strokeWidth={1.4} strokeLinecap="round"
        markerEnd="url(#arrowGrayMash)" />

      {/* ── coil image ── */}
      <image
        href="/images/coil.png"
        x={x + 6}
        y={y + 8}
        width={W - 16}
        height={H - 16}
        preserveAspectRatio="xMidYMid meet"
      />
      {/* image border */}
      <rect x={x + 6} y={y + 8} width={W - 16} height={H - 16} rx={6}
        fill="none" stroke={clr.stroke} strokeWidth={1} />

      {/* ── bottom outlet stub ── */}
      <line x1={cx} y1={y + H} x2={cx} y2={y + H + 10}
        stroke="#94a3b8" strokeWidth={1.4} strokeLinecap="round" />

      {/* ── temperature labels below ── */}
      <text x={cx} y={y + H + 22} textAnchor="middle"
        fontSize={11} fontWeight="700" fill={clr.text}
        fontFamily="'IBM Plex Mono',monospace">
        {actualTemp.toFixed(1)}°C
      </text>
      <text x={cx} y={y + H + 35} textAnchor="middle"
        fontSize={8} fill="#94a3b8" fontFamily="monospace">
        sp {temp}°C
      </text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const MashingSection: React.FC<{ data?: MashingData }> = ({ data = mockData }) => {
  const [liveData, setLiveData] = useState(data);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        water_flow: Math.round(
          prev.water_flow_min + Math.random() * (prev.water_flow_max - prev.water_flow_min)
        ),
        mixing_tank1_level: Math.round(55 + Math.random() * 30),
        mixing_tank2_level: Math.round(50 + Math.random() * 30),
        hex: prev.hex.map(h => ({
          ...h,
          temp_actual: parseFloat(
            (h.temp_setpoint + (Math.random() - 0.5) * 2.5).toFixed(1)
          ),
          flow_in: Math.round(7900 + Math.random() * 600),
        })),
        output_mashing_efficiency: parseFloat((91 + Math.random() * 6).toFixed(1)),
        output_wastage_pct: parseFloat((1.0 + Math.random() * 3).toFixed(2)),
        output_actual_kg: Math.round(27000 + Math.random() * 1400),
      }));
    }, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const d = liveData;

  // Derived values
  const avgDeviation = (
    d.hex.reduce((s, h, i) => s + Math.abs(h.temp_actual - HEX_SETPOINTS[i]), 0) / 6
  ).toFixed(2);

  const effClr: Clr =
    d.output_mashing_efficiency >= 95
      ? { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" }
      : d.output_mashing_efficiency >= 88
      ? { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" }
      : { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" };

  const wasteClr: Clr =
    d.output_wastage_pct > 4
      ? { stroke: "#dc2626", fill: "#fef2f2", text: "#b91c1c" }
      : d.output_wastage_pct > 1
      ? { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" }
      : { stroke: "#16a34a", fill: "#f0fdf4", text: "#15803d" };

  // ── Layout constants ──────────────────────────────────────────────────────
  //
  // Total viewBox: 760 × 490
  //
  // Process panel:  x=18  y=92  w=720  h=270
  // Tanks:  W=80  H=100
  // HEX:    W=56  H=92
  // Flow pipe Y (mid-tank): tankY + 50   → 190 (tank top=140, so mid=140+50=190)
  //
  // Section 1:  Tank1 at x=40   → right edge 120   pipe → HEX at 136, 202, 268
  // Section 2:  Tank2 at x=400  → right edge 480   pipe → HEX at 496, 562, 628
  //             final pipe runs to x=720
  //
  const TANK_W = 80,  TANK_H = 100;
  const HEX_W  = 56,  HEX_H  = 92;
  const HEX_GAP = 18;                // gap between consecutive HEXes

  const FLOW_OFFSET_Y = 18;
  const tankY  = 140 + FLOW_OFFSET_Y;               // top of both tanks
  const hexY   = 134 + FLOW_OFFSET_Y;               // top of HEX bodies (slightly above tank centre)
  const pipeY  = tankY + TANK_H / 2 + 2; // horizontal flow pipe Y

  // Section 1
  const t1X = 40;
  const h1X = [
    t1X + TANK_W + 22,
    t1X + TANK_W + 22 + (HEX_W + HEX_GAP),
    t1X + TANK_W + 22 + (HEX_W + HEX_GAP) * 2,
  ];

  // Section 2 (starts after a clear gap from the last HEX of section 1)
  const t2X = h1X[2] + HEX_W + 40;
  const h2X = [
    t2X + TANK_W + 22,
    t2X + TANK_W + 22 + (HEX_W + HEX_GAP),
    t2X + TANK_W + 22 + (HEX_W + HEX_GAP) * 2,
  ];

  const finalPipeEnd = h2X[2] + HEX_W + 22;

  return (
    <div style={{
      background: "#ffffff",
      padding: "18px 18px 8px",
      borderRadius: 12,
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <svg width="100%" viewBox="0 0 760 490"
        style={{ display: "block", overflow: "visible" }}>
        <defs>
          <marker id="arrowMash" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </marker>
          <marker id="arrowGrayMash" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
        </defs>

        <g transform="translate(0, 14)">
        {/* ── Outer section panel ── */}
        <rect x={8} y={8} width={744} height={376} rx={14}
          fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.2} />

        {/* ── Header row ── */}
        <text x={24} y={30} fontSize={11} fill="#0f172a"
          fontWeight="700" letterSpacing={1} fontFamily="sans-serif">
          MASHING SECTION
        </text>
        <line x1={24} y1={36} x2={736} y2={36} stroke="#e2e8f0" strokeWidth={1} />

        {/* Water flow inline metric */}
        <text x={24} y={54} fontSize={8.5} fill="#94a3b8"
          fontFamily="sans-serif" letterSpacing={0.5}>WATER FLOW</text>
        <text x={24} y={70} fontSize={14} fill="#3b82f6"
          fontWeight="700" fontFamily="'IBM Plex Mono',monospace">
          {d.water_flow.toLocaleString()} kg/h
        </text>
        <text x={24} y={82} fontSize={7.5} fill="#94a3b8" fontFamily="sans-serif">
          range {d.water_flow_min.toLocaleString()}–{d.water_flow_max.toLocaleString()}
        </text>

        {/* Avg temp deviation inline metric (right side) */}
        <text x={640} y={54} fontSize={8.5} fill="#94a3b8"
          fontFamily="sans-serif" letterSpacing={0.5}>AVG TEMP DEV</text>
        <text x={640} y={70} fontSize={14} fill="#0ea5e9"
          fontWeight="700" fontFamily="'IBM Plex Mono',monospace">
          {avgDeviation}°C
        </text>

        {/* ── Process flow white inner panel ── */}
        <rect x={18} y={90} width={720} height={250} rx={10}
          fill="#ffffff" stroke="#e2e8f0" strokeWidth={1} />
        <text x={30} y={100} fontSize={8} fill="#94a3b8"
          fontFamily="sans-serif" letterSpacing={0.5}>PROCESS FLOW</text>

        {/* ═══════════════════════════════════════════
            SECTION 1 — Tank1 → HEX 1,2,3
        ═══════════════════════════════════════════ */}

        {/* Water input label */}
        <text x={t1X + TANK_W / 2} y={tankY - 42} textAnchor="middle"
          fontSize={8} fill="#3b82f6" fontFamily="sans-serif">
          {d.water_flow.toLocaleString()} kg/h
        </text>

        {/* Tank 1 */}
        <MixingTankM
          x={t1X} y={tankY}
          label="SLURRY" level={d.mixing_tank1_level}
          waterLabel="Water" />

        {/* Pipe: Tank1 right → HEX1 left */}
        <line
          x1={t1X + TANK_W} y1={pipeY}
          x2={h1X[0]}        y2={pipeY}
          stroke="#3b82f6" strokeWidth={2}
          markerEnd="url(#arrowMash)" />

        {/* HEX 1, 2, 3 */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <HeatExchangerSVG
              x={h1X[i]} y={hexY}
              temp={HEX_SETPOINTS[i]}
              actualTemp={d.hex[i].temp_actual} />
            {/* inter-HEX pipe */}
            {i < 2 && (
              <line
                x1={h1X[i] + HEX_W} y1={pipeY}
                x2={h1X[i + 1]}      y2={pipeY}
                stroke="#3b82f6" strokeWidth={2}
                markerEnd="url(#arrowMash)" />
            )}
          </g>
        ))}

        {/* Steam input dashed line above HEX2 */}
        <line
          x1={h1X[1] + HEX_W / 2} y1={110}
          x2={h1X[1] + HEX_W / 2} y2={hexY - 14}
          stroke="#94a3b8" strokeWidth={1.4}
          strokeDasharray="4 3" markerEnd="url(#arrowGrayMash)" />
        <text x={h1X[1] + HEX_W / 2 + 4} y={118}
          fontSize={8} fill="#94a3b8" fontFamily="sans-serif">steam</text>

        {/* Pipe: HEX3 right → Tank2 left */}
        <line
          x1={h1X[2] + HEX_W} y1={pipeY}
          x2={t2X}              y2={pipeY}
          stroke="#3b82f6" strokeWidth={2}
          markerEnd="url(#arrowMash)" />

        {/* ═══════════════════════════════════════════
            SECTION 2 — Tank2 → HEX 4,5,6
        ═══════════════════════════════════════════ */}

        {/* Tank 2 */}
        <MixingTankM
          x={t2X} y={tankY}
          label="INTERMEDIATE" level={d.mixing_tank2_level}
          waterLabel="Water" />

        {/* Pipe: Tank2 right → HEX4 left */}
        <line
          x1={t2X + TANK_W} y1={pipeY}
          x2={h2X[0]}        y2={pipeY}
          stroke="#3b82f6" strokeWidth={2}
          markerEnd="url(#arrowMash)" />

        {/* HEX 4, 5, 6 */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <HeatExchangerSVG
              x={h2X[i]} y={hexY}
              temp={HEX_SETPOINTS[i + 3]}
              actualTemp={d.hex[i + 3].temp_actual} />
            {i < 2 && (
              <line
                x1={h2X[i] + HEX_W} y1={pipeY}
                x2={h2X[i + 1]}      y2={pipeY}
                stroke="#3b82f6" strokeWidth={2}
                markerEnd="url(#arrowMash)" />
            )}
          </g>
        ))}

        {/* Water / steam dashed inputs above HEX5, HEX6 */}
        {[h2X[1], h2X[2]].map((hx, i) => (
          <g key={i}>
            <line
              x1={hx + HEX_W / 2} y1={110}
              x2={hx + HEX_W / 2} y2={hexY - 14}
              stroke="#3b82f6" strokeWidth={1.4}
              strokeDasharray="4 3" markerEnd="url(#arrowMash)" />
          </g>
        ))}

        {/* Final output pipe */}
        <line
          x1={h2X[2] + HEX_W} y1={pipeY}
          x2={finalPipeEnd}     y2={pipeY}
          stroke="#3b82f6" strokeWidth={2}
          markerEnd="url(#arrowMash)" />
        <text x={finalPipeEnd + 4} y={pipeY + 4}
          fontSize={8} fill="#3b82f6" fontFamily="sans-serif">out</text>

        {/* ── Output strip ── */}
        <rect x={18} y={400} width={664} height={42} rx={8}
          fill="#ffffff" stroke="#e2e8f0" strokeWidth={1.2} />
        {/* blue left accent */}
        {/* <rect x={18} y={400} width={4} height={36} rx={2} fill="#3b82f6" /> */}

        {/* 4 KPI cells */}
        {([
          {
            label: "MASHING EFFICIENCY",
            value: d.output_mashing_efficiency.toFixed(1) + "%",
            sub:   "Target: 95%",
            c:     effClr,
          },
          {
            label: "AVG TEMP DEVIATION",
            value: avgDeviation + "°C",
            sub:   "",
            c:     { stroke: "#0284c7", fill: "#f0f9ff", text: "#0369a1" } as Clr,
          },
          {
            label: "ACTUAL OUTPUT",
            value: d.output_actual_kg.toLocaleString() + " kg",
            sub:   "Std: " + d.output_std_kg.toLocaleString(),
            c:     { stroke: "#d97706", fill: "#fffbeb", text: "#b45309" } as Clr,
          },
          {
            label: "WASTAGE",
            value: d.output_wastage_pct.toFixed(2) + "%",
            sub:   "",
            c:     wasteClr,
          },
        ] as { label: string; value: string; sub: string; c: Clr }[]).map((kpi, i) => {
          const cellW = 160;
          const cellX = 22 + i * cellW;
          const labelY = 414;
          const valueY = 428;
          return (
            <g key={i}>
              {/* subtle divider between cells */}
              {i > 0 && (
                <line x1={cellX} y1={408} x2={cellX} y2={432}
                  stroke="#e2e8f0" strokeWidth={1} />
              )}
              <text x={cellX + 8} y={labelY} fontSize={7.5} fill="#94a3b8"
                fontFamily="sans-serif" letterSpacing={0.3}>{kpi.label}</text>
              <text x={cellX + 8} y={valueY} fontSize={12} fontWeight="700"
                fill={kpi.c.text}
                fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
              {kpi.sub && (
                <text x={cellX + 8} y={valueY + 10} fontSize={7} fill="#94a3b8"
                  fontFamily="sans-serif">{kpi.sub}</text>
              )}
            </g>
          );
        })}
        </g>
      </svg>
    </div>
  );
};

export default MashingSection;
