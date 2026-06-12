import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { BridgeType, Grade, GRADE_COLORS, GRADE_LABELS } from '@/types';

export interface FilterState {
  type: BridgeType | 'all';
  era: string;
  grade: Grade | 'all';
}

interface MapFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const BRIDGE_TYPES: { value: BridgeType | 'all'; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: '梁桥', label: '梁桥' },
  { value: '拱桥', label: '拱桥' },
  { value: '刚架桥', label: '刚架桥' },
  { value: '悬索桥', label: '悬索桥' },
  { value: '斜拉桥', label: '斜拉桥' },
];

const ERA_OPTIONS = [
  { value: 'all', label: '全部年代' },
  { value: 'before1980', label: '1980年以前' },
  { value: '1980-1999', label: '1980-1999年' },
  { value: '2000-2019', label: '2000-2019年' },
  { value: 'after2020', label: '2020年以后' },
];

const GRADE_OPTIONS: { value: Grade | 'all'; label: string }[] = [
  { value: 'all', label: '全部等级' },
  { value: 'A', label: 'A级 - 完好' },
  { value: 'B', label: 'B级 - 良好' },
  { value: 'C', label: 'C级 - 合格' },
  { value: 'D', label: 'D级 - 不合格' },
  { value: 'E', label: 'E级 - 危险' },
];

export const MapFilter: React.FC<MapFilterProps> = ({ filters, onFilterChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFilterChange({ type: 'all', era: 'all', grade: 'all' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <span className="font-semibold text-gray-700">筛选条件</span>
        </div>
        {isCollapsed ? (
          <ChevronDown size={18} className="text-gray-500" />
        ) : (
          <ChevronUp size={18} className="text-gray-500" />
        )}
      </button>

      {!isCollapsed && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">桥梁类型</label>
            <select
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {BRIDGE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">建成年代</label>
            <select
              value={filters.era}
              onChange={(e) => handleChange('era', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ERA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">技术状况等级</label>
            <select
              value={filters.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
          >
            重置筛选
          </button>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-2">图例说明</p>
            <div className="space-y-1.5">
              {(['A', 'B', 'C', 'D', 'E'] as Grade[]).map((grade) => (
                <div key={grade} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${grade === 'E' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: GRADE_COLORS[grade] }}
                  />
                  <span className="text-sm text-gray-600">
                    {grade}级 - {GRADE_LABELS[grade]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
