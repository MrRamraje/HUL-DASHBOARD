import React, { useEffect, useRef, useState } from "react";

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

const hexSetpoints = [60, 64, 74, 74, 74, 80];

function tempColor(actual: number, setpoint: number): string {
  const diff = Math.abs(actual - setpoint);
  if (diff < 0.5) return "#22c55e";
  if (diff < 1.5) return "#f59e0b";
  return "#ef4444";
}

// ─── Mixing Tank ──────────────────────────────────────────────────────────────
function MixingTankM({ x, y, label, level }: { x: number; y: number; label: string; level: number }) {
  const H = 96, W = 78, cx = x + W / 2;
  const fillH = Math.max(4, (level / 100) * (H - 10));
  const lc = level < 40 ? "#ef4444" : level < 65 ? "#f59e0b" : "#22c55e";
  return (
    <g>
      {/* water inlet arrow */}
      <line x1={cx} y1={y - 28} x2={cx} y2={y} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowM)" />
      {/* top ellipse */}
      <ellipse cx={cx} cy={y} rx={W / 2} ry={8} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.2} />
      {/* body */}
      <rect x={x} y={y} width={W} height={H} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />
      {/* liquid fill */}
      <rect x={x + 1} y={y + H - fillH} width={W - 14} height={fillH} fill={lc} opacity={0.14} />
      {/* right shade */}
      <rect x={x + W - 13} y={y} width={13} height={H} fill="#f1f5f9" />
      {/* bottom ellipse */}
      <ellipse cx={cx} cy={y + H} rx={W / 2} ry={8} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1.2} />
      {/* level bar */}
      <rect x={x + W + 4} y={y + 4} width={6} height={H - 8} rx={2} fill="#f1f5f9" stroke="#dbe2ea" strokeWidth={0.8} />
      <rect x={x + W + 5} y={y + 4 + (H - 8) * (1 - level / 100)} width={4}
        height={(H - 8) * (level / 100)} rx={1} fill={lc} opacity={0.85} />
      {/* label */}
      <text x={cx - 6} y={y + H / 2 - 5} textAnchor="middle" fontSize={8.5} fill="#64748b" fontFamily="sans-serif">{label}</text>
      <text x={cx - 6} y={y + H / 2 + 8} textAnchor="middle" fontSize={8.5} fill="#64748b" fontFamily="sans-serif">TANK</text>
      {/* level text */}
      <text x={cx - 4} y={y + H + 20} textAnchor="middle" fontSize={9} fill={lc} fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{level}%</text>
      {/* outlet legs */}
      {[12, cx - x, W - 12].map((lx, i) => (
        <line key={i} x1={x + lx} y1={y + H + 8} x2={x + lx} y2={y + H + 18} stroke="#cbd5e1" strokeWidth={3} />
      ))}
    </g>
  );
}

// ─── Heat Exchanger with Circular Coil ───────────────────────────────────────
function HeatExchangerSVG({ x, y, temp, actualTemp }: {
  x: number; y: number; temp: number; actualTemp: number;
}) {
  const color = tempColor(actualTemp, temp);
  const W = 52, H = 90;
  const cx = x + W / 2;
  const nLoops = 6;
  const rx = 17, ry = 6;
  const coilTop = y + 10;
  const coilBottom = y + H - 10;
  const loopStep = (coilBottom - coilTop - ry * 2) / (nLoops - 1);

  return (
    <g>
      {/* body */}
      <rect x={x} y={y} width={W} height={H} rx={8} fill="#ffffff" stroke="#dbe2ea" strokeWidth={1.2} />
      {/* right shade panel */}
      <rect x={x + W - 10} y={y + 1} width={9} height={H - 2} rx={0} fill="#f8fafc" />
      <rect x={x + W - 10} y={y} width={10} height={H} rx={8} fill="#f8fafc" stroke="#dbe2ea" strokeWidth={1.2} />

      {/* flow connections top */}
      <line x1={x + 14} y1={y - 12} x2={x + 14} y2={y} stroke="#94a3b8" strokeWidth={1.4} />
      <line x1={x + 28} y1={y} x2={x + 28} y2={y - 12} stroke="#94a3b8" strokeWidth={1.4} />

      {/* ── Circular coil (spring) ── */}
      {Array.from({ length: nLoops }).map((_, i) => {
        const ly = coilTop + ry + i * loopStep;
        // back arc (upper half, lighter)
        const backD = `M ${cx - rx} ${ly} A ${rx} ${ry} 0 0 1 ${cx + rx} ${ly}`;
        // front arc (lower half, solid)
        const frontD = `M ${cx - rx} ${ly} A ${rx} ${ry} 0 0 0 ${cx + rx} ${ly}`;
        return (
          <g key={i}>
            {/* back arc */}
            <path d={backD} fill="none" stroke={color} strokeWidth={2.4} opacity={0.22} strokeLinecap="round" />
            {/* connecting lines between loops */}
            {i < nLoops - 1 && (
              <>
                <line
                  x1={cx - rx} y1={ly}
                  x2={cx - rx} y2={ly + loopStep}
                  stroke={color} strokeWidth={2.4} opacity={0.55} strokeLinecap="round"
                />
                <line
                  x1={cx + rx} y1={ly}
                  x2={cx + rx} y2={ly + loopStep}
                  stroke={color} strokeWidth={2.4} opacity={0.2} strokeLinecap="round"
                />
              </>
            )}
            {/* front arc */}
            <path d={frontD} fill="none" stroke={color} strokeWidth={2.4} opacity={0.88} strokeLinecap="round" />
          </g>
        );
      })}

      {/* outlet */}
      <line x1={cx} y1={y + H} x2={cx} y2={y + H + 14} stroke="#94a3b8" strokeWidth={1.4} />

      {/* temp label below */}
      <text x={cx} y={y + H + 26} textAnchor="middle" fontSize={11} fontWeight="700"
        fill={color} fontFamily="'IBM Plex Mono',monospace">{actualTemp.toFixed(1)}°C</text>
      <text x={cx} y={y + H + 38} textAnchor="middle" fontSize={8} fill="#94a3b8" fontFamily="monospace">sp {temp}°C</text>
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
        water_flow: Math.round(prev.water_flow_min + Math.random() * (prev.water_flow_max - prev.water_flow_min)),
        mixing_tank1_level: Math.round(55 + Math.random() * 30),
        mixing_tank2_level: Math.round(50 + Math.random() * 30),
        hex: prev.hex.map(h => ({
          ...h,
          temp_actual: parseFloat((h.temp_setpoint + (Math.random() - 0.5) * 2.5).toFixed(1)),
          flow_in: Math.round(7900 + Math.random() * 600),
        })),
        output_mashing_efficiency: parseFloat((91 + Math.random() * 6).toFixed(1)),
        output_wastage_pct: parseFloat((1.0 + Math.random() * 3).toFixed(2)),
        output_actual_kg: Math.round(27000 + Math.random() * 1400),
      }));
    }, 2500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const d = liveData;
  const wastageColor = d.output_wastage_pct > 4 ? "#ef4444" : d.output_wastage_pct > 1 ? "#f59e0b" : "#22c55e";
  const effColor = d.output_mashing_efficiency > 93 ? "#22c55e" : d.output_mashing_efficiency > 88 ? "#f59e0b" : "#ef4444";
  const avgDeviation = (d.hex.reduce((s, h, i) => s + Math.abs(h.temp_actual - hexSetpoints[i]), 0) / 6).toFixed(2);

  // Layout
  const tank1X = 48, tank1Y = 112;
  const tank2X = 468, tank2Y = 112;
  const hexY = 128;
  const hexPositions = [174, 250, 326, 556, 632, 708];
  const flowY = tank1Y + 48; // center of tanks for horizontal pipe

  return (
    <div style={{ background: "#ffffff", padding: "16px 0 8px", borderRadius: 18 }}>
      <svg width="100%" viewBox="0 0 1000 500" fontFamily="'IBM Plex Mono', monospace">
        <defs>
          <marker id="arrowM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth={1.5} />
          </marker>
          <marker id="arrowGM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#94a3b8" strokeWidth={1.5} />
          </marker>
          <clipPath id="hexClip">
            <rect x="0" y="0" width="52" height="90" rx="8" />
          </clipPath>
        </defs>

        <rect x={0} y={0} width={1000} height={500} fill="#ffffff" />

        {/* ── Section panel ── */}
        <rect x={12} y={12} width={976} height={296} rx={18} fill="#f8fafc" stroke="#dbe2ea" strokeWidth={1.2} />

        {/* ── Header ── */}
        <text x={28} y={32} fontSize={11} fill="#0f172a" fontWeight="700" letterSpacing={1}>MASHING SECTION</text>
        <line x1={28} y1={38} x2={972} y2={38} stroke="#dbe2ea" strokeWidth={1} />

        {/* ── Header metrics (inline, no cards) ── */}
        <text x={28} y={58} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">WATER FLOW</text>
        <text x={28} y={72} fontSize={13} fill="#3b82f6" fontWeight="700">{d.water_flow.toLocaleString()} kg/h</text>
        <text x={28} y={84} fontSize={8} fill="#94a3b8" fontFamily="sans-serif">range {d.water_flow_min.toLocaleString()}–{d.water_flow_max.toLocaleString()}</text>

        <text x={200} y={58} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">RECIPE</text>
        <text x={200} y={72} fontSize={13} fill="#0ea5e9" fontWeight="700">2 tanks / 6 HEX</text>

        <text x={820} y={58} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">AVG TEMP DEV</text>
        <text x={820} y={72} fontSize={13} fill="#0ea5e9" fontWeight="700">{avgDeviation}°C</text>

        {/* ── Process flow container ── */}
        <rect x={28} y={98} width={944} height={200} rx={14} fill="#ffffff" stroke="#dbe2ea" strokeWidth={1} />
        <text x={44} y={114} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">PROCESS FLOW</text>

        {/* ── Mixing Tank 1 ── */}
        <MixingTankM x={tank1X} y={tank1Y} label="MIXING" level={d.mixing_tank1_level} />

        {/* pipe: tank1 → HEX 1 */}
        <line x1={tank1X + 78} y1={flowY} x2={hexPositions[0]} y2={flowY}
          stroke="#3b82f6" strokeWidth={2} />

        {/* HEX 1–3 */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <HeatExchangerSVG x={hexPositions[i]} y={hexY} temp={hexSetpoints[i]} actualTemp={d.hex[i].temp_actual} />
            {i < 2 && (
              <line x1={hexPositions[i] + 52} y1={flowY} x2={hexPositions[i + 1]} y2={flowY}
                stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowM)" />
            )}
          </g>
        ))}

        {/* steam input */}
        <line x1={338} y1={78} x2={338} y2={hexY} stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="4 3" markerEnd="url(#arrowGM)" />
        <text x={344} y={90} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">steam</text>

        {/* pipe: HEX3 → Tank2 */}
        <line x1={hexPositions[2] + 52} y1={flowY} x2={tank2X} y2={flowY}
          stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowM)" />

        {/* Mixing Tank 2 water inlet */}
        <line x1={tank2X + 39} y1={78} x2={tank2X + 39} y2={tank2Y}
          stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowM)" />

        {/* ── Mixing Tank 2 ── */}
        <MixingTankM x={tank2X} y={tank2Y} label="MIXING" level={d.mixing_tank2_level} />

        {/* pipe: tank2 → HEX 4 */}
        <line x1={tank2X + 78} y1={flowY} x2={hexPositions[3]} y2={flowY}
          stroke="#3b82f6" strokeWidth={2} />

        {/* HEX 4–6 */}
        {[3, 4, 5].map(i => (
          <g key={i}>
            <HeatExchangerSVG x={hexPositions[i]} y={hexY} temp={hexSetpoints[i]} actualTemp={d.hex[i].temp_actual} />
            {i < 5 && (
              <line x1={hexPositions[i] + 52} y1={flowY} x2={hexPositions[i + 1]} y2={flowY}
                stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowM)" />
            )}
          </g>
        ))}

        {/* pipe: HEX6 → output */}
        <line x1={hexPositions[5] + 52} y1={flowY} x2={952} y2={flowY}
          stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowM)" />
        <text x={958} y={flowY - 4} fontSize={8} fill="#3b82f6">out</text>

        {/* water / steam dashes to HEX 5 & 6 */}
        <line x1={660} y1={78} x2={660} y2={hexY} stroke="#3b82f6" strokeWidth={1.4} strokeDasharray="4 3" markerEnd="url(#arrowM)" />
        <line x1={800} y1={78} x2={800} y2={hexY} stroke="#3b82f6" strokeWidth={1.4} strokeDasharray="4 3" markerEnd="url(#arrowM)" />

        {/* ── Temperature profile strip ── */}
        <rect x={12} y={322} width={976} height={62} rx={14} fill="#f8fafc" stroke="#dbe2ea" strokeWidth={1.1} />
        <text x={28} y={338} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif" letterSpacing={1}>TEMPERATURE PROFILE</text>
        {d.hex.map((h, i) => {
          const bx = 28 + i * 160;
          const c = tempColor(h.temp_actual, hexSetpoints[i]);
          return (
            <g key={i}>
              <text x={bx} y={354} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">HEX {i + 1}  sp {hexSetpoints[i]}°C</text>
              <text x={bx} y={374} fontSize={16} fontWeight="700" fill={c} fontFamily="'IBM Plex Mono',monospace">{h.temp_actual.toFixed(1)}°C</text>
            </g>
          );
        })}

        {/* ── Output strip ── */}
        <rect x={12} y={400} width={976} height={88} rx={16} fill="#ffffff" stroke="#dbe2ea" strokeWidth={1.4} />
        <rect x={12} y={400} width={5} height={88} rx={3} fill="#3b82f6" />
        <text x={28} y={418} fontSize={10} fill="#0f172a" fontWeight="700" letterSpacing={1}>TAB OUTPUT — CALCULATED BY FASTAPI</text>
        <line x1={28} y1={424} x2={984} y2={424} stroke="#dbe2ea" strokeWidth={1} />

        {[
          { label: "MASHING EFFICIENCY", value: d.output_mashing_efficiency.toFixed(1) + "%", color: effColor, sub: "Target: 95%" },
          { label: "AVG TEMP DEVIATION", value: avgDeviation + "°C", color: "#38bdf8", sub: "" },
          { label: "ACTUAL OUTPUT", value: d.output_actual_kg.toLocaleString() + " kg", color: "#f59e0b", sub: `Std: ${d.output_std_kg.toLocaleString()}` },
          { label: "WASTAGE", value: d.output_wastage_pct.toFixed(2) + "%", color: wastageColor, sub: "" },
        ].map((kpi, i) => (
          <g key={i}>
            <text x={36 + i * 244} y={442} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">{kpi.label}</text>
            <text x={36 + i * 244} y={466} fontSize={20} fontWeight="700" fill={kpi.color} fontFamily="'IBM Plex Mono',monospace">{kpi.value}</text>
            {kpi.sub && <text x={36 + i * 244} y={479} fontSize={8.5} fill="#94a3b8" fontFamily="sans-serif">{kpi.sub}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default MashingSection;
