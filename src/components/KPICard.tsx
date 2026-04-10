import React from 'react';

interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  change?: string;
  warn?: boolean;
  good?: boolean;
  bad?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, unit, change, warn, good, bad }) => {
  const getBorderColor = () => {
    if (warn) return 'border-orange-400';
    if (good) return 'border-green-400';
    if (bad) return 'border-red-400';
    return 'border-blue-400';
  };

  const getChangeColor = () => {
    if (warn) return 'text-orange-600';
    if (good) return 'text-green-600';
    if (bad) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-300 border-t-3 ${getBorderColor()}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{label}</div>
      <div className="text-2xl font-bold text-blue-900 font-mono">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
      {change && (
        <div className={`text-sm font-medium mt-2 ${getChangeColor()}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default KPICard;