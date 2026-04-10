import React from 'react';

interface StatusBadgeProps {
  status: 'Good' | 'Warn' | 'Optimal' | 'Live' | string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getClasses = () => {
    switch (status.toLowerCase()) {
      case 'good':
      case 'optimal':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'warn':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'live':
        return 'bg-green-50 text-green-600 border-green-200';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide border rounded ${getClasses()} ${className}`}>
      {status === 'Live' ? '● ' : ''}{status}
    </span>
  );
};

export default StatusBadge;