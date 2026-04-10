import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  title?: string;
  badge?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', header, title, badge }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-300 p-5 ${className}`}>
      {(header || title || badge) && (
        <div className="flex justify-between items-center mb-4">
          {title && <div className="text-sm font-semibold text-blue-900">{title}</div>}
          {header}
          {badge}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;