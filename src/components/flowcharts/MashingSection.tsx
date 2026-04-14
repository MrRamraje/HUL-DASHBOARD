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
  x, y, label, level, waterLabel, waterFlowLabel,
}: {
  x: number; y: number; label: string; level: number; waterLabel?: string; waterFlowLabel?: string;
}) {
  const W = 80, H = 100;
  const cx = x + W / 2;
  const fillH = Math.max(4, (level / 100) * (H - 10));
  const lc = level < 40 ? "#dc2626" : level < 65 ? "#d97706" : "#16a34a";
  const lf = level < 40 ? "#fef2f2" : level < 65 ? "#fffbeb" : "#f0fdf4";

  return (
    <g>
      {/* water inlet label + arrow */}
      {waterFlowLabel && (
        <text x={cx} y={y - 42} textAnchor="middle"
          fontSize={9} fill="#0f172a" fontWeight="700" fontFamily="'Inter','Segoe UI',sans-serif">{waterFlowLabel}</text>
      )}
      {waterLabel && (
        <text x={cx} y={y - 30} textAnchor="middle"
          fontSize={8.5} fill="#0f172a" fontWeight="700" fontFamily="'Inter','Segoe UI',sans-serif">{waterLabel}</text>
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
      <text x={cx} y={y + H + 36} textAnchor="middle"
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
        stroke="#94a3b8" strokeWidth={1.4} strokeLinecap="round"
        markerEnd="url(#arrowGrayMash)" />
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
        fontSize={8.5} fill="#2563eb" fontWeight="600" fontFamily="'IBM Plex Mono',monospace">
        {temp}°C
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
  const t1X = 28;
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
  const WATER_FLOW_LABEL = "8,006 kg/h";

  return (
    <div style={{
      background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 18%)",
      padding: "18px 18px 10px",
      borderRadius: 16,
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
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
        {/* ═══════════════════════════════════════════
            SECTION 1 — Tank1 → HEX 1,2,3
        ═══════════════════════════════════════════ */}

        {/* Tank 1 */}
        <MixingTankM
          x={t1X} y={tankY}
          label="SLURRY" level={d.mixing_tank1_level}
          waterLabel="Water"
          waterFlowLabel={WATER_FLOW_LABEL} />

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
          waterLabel="Water"
          waterFlowLabel={WATER_FLOW_LABEL} />

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

        {/* Final output pipe */}
        <line
          x1={h2X[2] + HEX_W} y1={pipeY}
          x2={finalPipeEnd}     y2={pipeY}
          stroke="#3b82f6" strokeWidth={2}
          markerEnd="url(#arrowMash)" />
        <text x={762} y={209} textAnchor="end"
          fontSize={9} fill="#0f172a" fontWeight="700" fontFamily="'Inter','Segoe UI',sans-serif">To Extraction</text>
        <text x={749} y={219} textAnchor="end"
          fontSize={9} fill="#0f172a" fontWeight="700" fontFamily="'Inter','Segoe UI',sans-serif">Section</text>

        </g>
      </svg>
    </div>
  );
};

export default MashingSection;
