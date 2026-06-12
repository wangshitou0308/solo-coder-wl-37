import React from 'react';
import { RATING_ITEMS, RATING_LEVELS } from '@/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface RatingTableProps {
  ratings: Record<string, number>;
  onChange: (key: string, value: number) => void;
  disabled?: boolean;
}

export const RatingTable: React.FC<RatingTableProps> = ({ ratings, onChange, disabled = false }) => {
  const getRatingColor = (value: number) => {
    const colors: Record<number, string> = {
      1: 'bg-emerald-500 hover:bg-emerald-600',
      2: 'bg-amber-500 hover:bg-amber-600',
      3: 'bg-orange-500 hover:bg-orange-600',
      4: 'bg-red-500 hover:bg-red-600',
      5: 'bg-gray-800 hover:bg-gray-900',
    };
    return colors[value] || 'bg-gray-400';
  };

  const getRatingBorderColor = (value: number, selected: boolean) => {
    if (!selected) return 'border-gray-200 hover:border-gray-300';
    const colors: Record<number, string> = {
      1: 'border-emerald-500',
      2: 'border-amber-500',
      3: 'border-orange-500',
      4: 'border-red-500',
      5: 'border-gray-800',
    };
    return colors[value] || 'border-gray-400';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">检测项目</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">说明</th>
              {RATING_LEVELS.map((level) => (
                <th key={level.value} className="px-2 py-3 text-center text-sm font-semibold text-gray-700 w-20">
                  {level.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RATING_ITEMS.map((item) => (
              <tr key={item.key} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    {item.description}
                  </div>
                </td>
                {RATING_LEVELS.map((level) => {
                  const selected = ratings[item.key] === level.value;
                  return (
                    <td key={level.value} className="px-2 py-3 text-center">
                      <label className={`inline-flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                        disabled ? 'opacity-60 cursor-not-allowed' : ''
                      } ${
                        selected
                          ? `${getRatingBorderColor(level.value, true)} bg-gray-50`
                          : `${getRatingBorderColor(level.value, false)}`
                      }`}>
                        <input
                          type="radio"
                          name={item.key}
                          value={level.value}
                          checked={selected}
                          onChange={() => !disabled && onChange(item.key, level.value)}
                          disabled={disabled}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selected ? getRatingColor(level.value) : 'bg-gray-200'
                        }`}>
                          {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-xs mt-1 text-gray-500">{level.value}级</span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
