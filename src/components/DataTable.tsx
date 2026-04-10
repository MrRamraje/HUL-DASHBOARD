import React from 'react';
import StatusBadge from './StatusBadge';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue-50 text-blue-800 font-semibold uppercase tracking-wide border-b-2 border-blue-200">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-blue-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;