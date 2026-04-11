import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import CompleteProcess from '../components/flowcharts/CompleteProcess';
import SolidHandling from '../components/flowcharts/SolidHandling';
import MashingSection from '../components/flowcharts/MashingSection';
import ExtractionSection from '../components/flowcharts/ExtractionSection';

// ─────────────────────────────────────────────
// Tab definitions (same IDs as before so routing
// and any saved state keeps working)
// ─────────────────────────────────────────────
const TABS = [
  { id: 'main',    label: 'Complete Process'   },
  { id: 'solid',   label: 'Solid Handling'     },
  { id: 'mashing', label: 'Mashing Section'    },
  { id: 'extract', label: 'Extraction Section' },
] as const;

type TabId = typeof TABS[number]['id'];

const TAB_DESCRIPTIONS: Record<TabId, string> = {
  main:    'High level flowchart for waste monitoring and control.',
  solid:   'Solid handling section flowchart showing material handling and waste separation.',
  mashing: 'Mashing section flowchart with process steps, temperature control, and throughput.',
  extract: 'Extraction section flowchart for product recovery and waste minimization.',
};

// ─────────────────────────────────────────────
// Main component — replaces old Machines.tsx
// Drop-in: same export name, same file path
// ─────────────────────────────────────────────
const Machines: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('main');

  return (
    <div>
      {/* ── Page header (same style as before) ── */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Equipment Wise BIP Calculation – Live
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Real-time process architecture with live sensor values &amp; equipment monitoring
        </p>
      </div>

      {/* ── Sub-tabs (same visual style as before) ── */}
      <div className="flex gap-0 bg-white border border-slate-300 rounded-lg overflow-hidden mb-5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-r border-slate-300 last:border-r-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Card wrapper (same Card + StatusBadge pattern as before) ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">

        {/* Card header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {TABS.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {TAB_DESCRIPTIONS[activeTab]}
            </p>
          </div>
          {/* Re-use your existing StatusBadge — no change needed there */}
          <StatusBadge status="Live" />
        </div>

        {/* ── SVG flowchart area (replaces the old <img> tag) ── */}
        {/*
          The SVGs are dark-themed internally (deep navy background).
          The surrounding card stays white to match your existing UI.
          overflow-x-auto handles very wide diagrams on small screens.
        */}
        <div className="overflow-x-auto bg-[#020b18] rounded-b-xl">
          <div className="min-w-[900px]">
            {activeTab === 'main'    && <CompleteProcess />}
            {activeTab === 'solid'   && <SolidHandling />}
            {activeTab === 'mashing' && <MashingSection />}
            {activeTab === 'extract' && <ExtractionSection />}
          </div>
        </div>
      </div>

      {/* ── Summary cards — only shown on Complete Process tab ──
           Kept 100% identical to your original code              */}
      {activeTab === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total BIP Output',    value: '27,650 kg', sub: 'Standard: 28,620 kg' },
            { label: 'Mashing Efficiency',  value: '94.2%',     sub: 'Target: 95%',       good: true  },
            { label: 'Wort Extraction %',   value: '88.6%',     sub: 'Target: 91%',       warn: true  },
            { label: 'Total Wastage',        value: '970 kg',    sub: '3.39% deviation',   bad: true   },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-white rounded-lg border border-slate-300 shadow-sm p-4 border-t-2 ${
                card.good ? 'border-t-emerald-400' :
                card.warn ? 'border-t-amber-400'   :
                card.bad  ? 'border-t-rose-400'    : 'border-t-slate-500'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                {card.label}
              </div>
              <div className={`text-lg font-bold font-mono ${
                card.good ? 'text-emerald-700' :
                card.warn ? 'text-amber-700'   :
                card.bad  ? 'text-rose-700'    : 'text-slate-900'
              }`}>
                {card.value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Machines;