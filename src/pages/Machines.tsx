import React, { useState } from 'react';
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
  { id: 'solid',   label: 'Solid Dispensing'   },
  { id: 'mashing', label: 'Mashing Section'    },
  { id: 'extract', label: 'Extraction Section' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─────────────────────────────────────────────
// Main component — replaces old Machines.tsx
// Drop-in: same export name, same file path
// ─────────────────────────────────────────────
const Machines: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('main');

  return (
    <div className="space-y-6">
      {/* ── Page header (same style as before) ── */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Equipment Wise BIP Calculation – Live
        </h2>
      </div>

      {/* ── Sub-tabs (same visual style as before) ── */}
      <div className="mb-5 flex w-fit flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-5 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Card wrapper ── */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* ── SVG flowchart area (replaces the old <img> tag) ── */}
        <div className="overflow-x-auto bg-gradient-to-b from-slate-50 via-white to-slate-50 px-3 py-5 sm:px-4 lg:px-6">
          <div className="min-w-[980px]">
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
            { label: 'Total BIP Output',    value: '9.8kg', sub: 'Standard: 28,620 kg' },
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
