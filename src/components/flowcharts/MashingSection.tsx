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

function tempColor(actual: number, setpoint: number) {
  const diff = Math.abs(actual - setpoint);
  if (diff < 0.5) return "#22c55e";
  if (diff < 1.5) return "#f59e0b";
  return "#ef4444";
}

function ValueBox({ x, y, w = 120, label, value, color = "#22c55e" }: {
  x: number; y: number; w?: number; label: string; value: string; color?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={36} rx={10} fill={color + "14"} stroke={color} strokeWidth={1.1} />
      <text x={x + w / 2} y={y + 12} textAnchor="middle" fontSize={8.5} fill="#64748b" fontFamily="'IBM Plex Mono', monospace">{label}</text>
      <text x={x + w / 2} y={y + 27} textAnchor="middle" fontSize={12} fontWeight="700" fill={color} fontFamily="'IBM Plex Mono', monospace">{value}</text>
    </g>
  );
}

function MixingTankM({ x, y, label, level }: { x: number; y: number; label: string; level: number }) {
  const h = 100;
  const fillH = Math.max(4, (level / 100) * (h - 10));
  const fc = level < 40 ? "#ef4444" : level < 65 ? "#f59e0b" : "#22c55e";
  return (
    <g>
      <line x1={x + 20} y1={y - 30} x2={x + 20} y2={y} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueMash)" />
      <ellipse cx={x + 40} cy={y} rx={40} ry={8} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.2} />
      <rect x={x} y={y} width={80} height={h} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />
      <rect x={x} y={y + h - fillH} width={80} height={fillH} fill={fc} opacity={0.18} />
      <rect x={x + 64} y={y} width={16} height={h} fill="#f8fafc" />
      <ellipse cx={x + 40} cy={y + h} rx={40} ry={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
      <text x={x + 36} y={y + h / 2 - 7} textAnchor="middle" fontSize={9} fill="#475569">{label}</text>
      <text x={x + 36} y={y + h / 2 + 7} textAnchor="middle" fontSize={9} fill="#475569">TANK</text>
      <rect x={x + 82} y={y + 6} width={6} height={h - 12} rx={2} fill="#ffffff" stroke="#cbd5e1" strokeWidth={0.8} />
      <rect x={x + 83} y={y + 6 + (h - 12) * (1 - level / 100)} width={4}
        height={(h - 12) * (level / 100)} rx={1} fill={fc} opacity={0.8} />
      <line x1={x + 16} y1={y + h + 8} x2={x + 16} y2={y + h + 20} stroke="#cbd5e1" strokeWidth={3} />
      <line x1={x + 40} y1={y + h + 8} x2={x + 40} y2={y + h + 20} stroke="#cbd5e1" strokeWidth={3} />
      <line x1={x + 64} y1={y + h + 8} x2={x + 64} y2={y + h + 20} stroke="#cbd5e1" strokeWidth={3} />
    </g>
  );
}

function HeatExchangerSVG({ x, y, temp, actualTemp }: {
  x: number; y: number; temp: number; actualTemp: number;
}) {
  const color = tempColor(actualTemp, temp);
  return (
    <g>
      <rect x={x} y={y} width={52} height={90} rx={8} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.2} />
      <rect x={x + 42} y={y} width={10} height={90} rx={3} fill="#f8fafc" />
      {Array.from({ length: 4 }).map((_, i) => (
        <g key={i}>
          <rect x={x + 6} y={y + 8 + i * 18} width={32} height={14} rx={2}
            fill={color + "20"} stroke={color} strokeWidth={0.8} />
          <line x1={x + 9} y1={y + 15 + i * 18} x2={x + 34} y2={y + 15 + i * 18} stroke={color} strokeWidth={0.4} opacity={0.5} />
        </g>
      ))}
      <line x1={x + 16} y1={y - 12} x2={x + 16} y2={y} stroke="#64748b" strokeWidth={1.5} />
      <line x1={x + 30} y1={y} x2={x + 30} y2={y - 12} stroke="#64748b" strokeWidth={1.5} />
      <text x={x + 26} y={y + 104} textAnchor="middle" fontSize={11} fill={color} fontWeight="700" fontFamily="'IBM Plex Mono', monospace">{actualTemp.toFixed(1)}°C</text>
      <text x={x + 26} y={y + 116} textAnchor="middle" fontSize={9} fill="#64748b" fontFamily="monospace">sp:{temp}°C</text>
    </g>
  );
}

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
  const tank1X = 30;
  const tank2X = 400;
  const hexSetpoints = [60, 64, 74, 74, 74, 80];
  const hexPositions = [150, 220, 295, 490, 563, 636];

  return (
    <div style={{ background: "#eef2ff", padding: "10px 0" }}>
      <svg width="100%" viewBox="0 0 1000 560" fontFamily="'IBM Plex Mono', monospace">
        <defs>
          <marker id="arrowBlueMash" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#3b82f6" strokeWidth={1.5} />
          </marker>
          <marker id="arrowGrayMash" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#64748b" strokeWidth={1.5} />
          </marker>
        </defs>

        <rect x="0" y="0" width="1000" height="560" fill="#eef2ff" />
        <text x={20} y={28} fontSize={13} fill="#0f172a" fontWeight="700" letterSpacing={1}>Mashing Section</text>
        <line x1={20} y1={34} x2={980} y2={34} stroke="#cbd5e1" strokeWidth={1} />

        <text x={40} y={64} fontSize={10} fill="#64748b" fontFamily="sans-serif">Water range</text>
        <text x={40} y={78} fontSize={11} fill="#3b82f6" fontWeight="700">{d.water_flow_min.toLocaleString()}–{d.water_flow_max.toLocaleString()} kg/h</text>
        <ValueBox x={40} y={84} w={140} label="Actual flow" value={d.water_flow.toLocaleString() + " kg/h"} color="#3b82f6" />

        <MixingTankM x={tank1X} y={120} label="MIXING" level={d.mixing_tank1_level} />
        <text x={tank1X + 40} y={238} textAnchor="middle" fontSize={9} fill="#64748b">Level: {d.mixing_tank1_level}%</text>
        <line x1={tank1X + 80} y1={170} x2={hexPositions[0]} y2={170} stroke="#3b82f6" strokeWidth={2} />

        {[0, 1, 2].map(i => (
          <g key={i}>
            <HeatExchangerSVG x={hexPositions[i]} y={140} temp={hexSetpoints[i]} actualTemp={d.hex[i].temp_actual} />
            {i < 2 && (
              <line x1={hexPositions[i] + 52} y1={170} x2={hexPositions[i + 1]} y2={170} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueMash)" />
            )}
          </g>
        ))}

        <line x1={hexPositions[2] + 52} y1={170} x2={tank2X} y2={170} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueMash)" />
        <line x1={300} y1={58} x2={300} y2={170} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowGrayMash)" />
        <text x={308} y={68} fontSize={10} fill="#64748b">steam</text>

        <line x1={tank2X + 20} y1={70} x2={tank2X + 20} y2={120} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueMash)" />
        <MixingTankM x={tank2X} y={120} label="MIXING" level={d.mixing_tank2_level} />
        <text x={tank2X + 40} y={238} textAnchor="middle" fontSize={9} fill="#64748b">Level: {d.mixing_tank2_level}%</text>

        <line x1={tank2X + 80} y1={170} x2={hexPositions[3]} y2={170} stroke="#3b82f6" strokeWidth={2} />
        {[3, 4, 5].map(i => (
          <g key={i}>
            <HeatExchangerSVG x={hexPositions[i]} y={140} temp={hexSetpoints[i]} actualTemp={d.hex[i].temp_actual} />
            {i < 5 && (
              <line x1={hexPositions[i] + 52} y1={170} x2={hexPositions[i + 1]} y2={170} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueMash)" />
            )}
          </g>
        ))}

        <line x1={hexPositions[5] + 52} y1={170} x2={940} y2={170} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueMash)" />
        <text x={946} y={165} fontSize={9} fill="#3b82f6">out</text>

        <line x1={590} y1={58} x2={590} y2={170} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowBlueMash)" />
        <line x1={760} y1={58} x2={760} y2={170} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowBlueMash)" />

        <text x={20} y={310} fontSize={10} fill="#64748b" letterSpacing={1}>Temperature profile</text>
        {d.hex.map((h, i) => {
          const barX = 20 + i * 152;
          const c = tempColor(h.temp_actual, hexSetpoints[i]);
          return (
            <g key={i}>
              <rect x={barX} y={318} width={138} height={48} rx={10} fill={c + "14"} stroke={c} strokeWidth={1} />
              <text x={barX + 69} y={332} textAnchor="middle" fontSize={9} fill="#64748b">HEX {i + 1} — sp {hexSetpoints[i]}°C</text>
              <text x={barX + 69} y={354} textAnchor="middle" fontSize={16} fontWeight="700" fill={c}>{h.temp_actual.toFixed(1)}°C</text>
            </g>
          );
        })}

        <rect x={20} y={400} width={960} height={110} rx={16} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.5} />
        <rect x={20} y={400} width={960} height={24} rx={16} fill="#e2e8f0" />
        <text x={36} y={416} fontSize={11} fill="#0f172a" fontWeight="700" letterSpacing={1}>Tab output — Calculated by FastAPI</text>
        <line x1={20} y1={424} x2={980} y2={424} stroke="#e2e8f0" strokeWidth={1} />

        {[
          { label: "Mashing efficiency", value: d.output_mashing_efficiency.toFixed(1) + "%", color: "#22c55e", target: "Target: 95%" },
          { label: "Avg temp deviation", value: (d.hex.reduce((s, h, i) => s + Math.abs(h.temp_actual - hexSetpoints[i]), 0) / 6).toFixed(2) + "°C", color: "#38bdf8", target: "" },
          { label: "Actual output", value: d.output_actual_kg.toLocaleString(), color: "#f59e0b", target: `Std: ${d.output_std_kg.toLocaleString()}` },
          { label: "Wastage %", value: d.output_wastage_pct.toFixed(2) + "%", color: wastageColor, target: "" },
        ].map((kpi, i) => (
          <g key={i}>
            <rect x={36 + i * 240} y={432} width={216} height={66} rx={12} fill={kpi.color + "14"} stroke={kpi.color} strokeWidth={1.2} />
            <text x={36 + i * 240 + 108} y={450} textAnchor="middle" fontSize={10} fill="#64748b">{kpi.label}</text>
            <text x={36 + i * 240 + 108} y={480} textAnchor="middle" fontSize={20} fontWeight="700" fill={kpi.color}>{kpi.value}</text>
            {kpi.target && <text x={36 + i * 240 + 108} y={495} textAnchor="middle" fontSize={8.5} fill="#475569">{kpi.target}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default MashingSection;
