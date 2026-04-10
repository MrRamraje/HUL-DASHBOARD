import React, { useState } from 'react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const Machines: React.FC = () => {
  const [activeTab, setActiveTab] = useState('main');

  const tabs = [
    { id: 'main', label: 'Complete Process' },
    { id: 'solid', label: 'Solid Handling' },
    { id: 'mashing', label: 'Mashing Section' },
    { id: 'extract', label: 'Extraction Section' },
  ];

  const sectionData: Record<string, { title: string; image: string; description: string }> = {
    main: {
      title: 'Complete Process',
      image: '/images/main.png',
      description: 'High level flowchart for waste monitoring and control.',
    },
    solid: {
      title: 'Solid Handling',
      image: '/images/solid_handling.png',
      description: 'Solid handling section flowchart showing material handling and waste separation.',
    },
    mashing: {
      title: 'Mashing Section',
      image: '/images/mashing.png',
      description: 'Mashing section flowchart with process steps, temperature control, and throughput.',
    },
    extract: {
      title: 'Extraction Section',
      image: '/images/extraction.png',
      description: 'Extraction section flowchart for product recovery and waste minimization.',
    },
  };

  const summaryCards = [
    { label: 'Total BIP Output', value: '27,650 kg', sub: 'Standard: 28,620 kg' },
    { label: 'Mashing Efficiency', value: '94.2%', sub: 'Target: 95%', good: true },
    { label: 'Wort Extraction %', value: '88.6%', sub: 'Target: 91%', warn: true },
    { label: 'Total Wastage', value: '970 kg', sub: '3.39% deviation', bad: true },
  ];

  const currentSection = sectionData[activeTab];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Equipment Wise BIP Calculation – Live</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time process architecture with live sensor values &amp; equipment monitoring</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 bg-white border border-slate-300 rounded-lg overflow-hidden mb-5 w-fit">
        {tabs.map((tab) => (
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

      {/* Section content */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{currentSection.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{currentSection.description}</p>
          </div>
          <StatusBadge status="Live" />
        </div>
        <div className="overflow-hidden bg-slate-50">
          <img src={currentSection.image} alt={currentSection.title} className="w-full object-cover" />
        </div>
      </Card>

      {activeTab === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((card, index) => (
            <div key={index} className={`bg-white rounded-lg border border-slate-300 shadow-sm p-4 border-t-3 ${
              card.good ? 'border-t-emerald-400' :
              card.warn ? 'border-t-amber-400' :
              card.bad ? 'border-t-rose-400' : 'border-t-slate-500'
            }`}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{card.label}</div>
              <div className={`text-lg font-bold font-mono ${
                card.good ? 'text-emerald-700' :
                card.warn ? 'text-amber-700' :
                card.bad ? 'text-rose-700' : 'text-slate-900'
              }`}>{card.value}</div>
              <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Machines;