import React from 'react';
import { Link } from 'react-router-dom';
import { Bridge, GRADE_COLORS, GRADE_LABELS } from '@/types';

interface MarkerPopupProps {
  bridge: Bridge;
}

export const MarkerPopup: React.FC<MarkerPopupProps> = ({ bridge }) => {
  const gradeColor = GRADE_COLORS[bridge.currentGrade];
  const gradeLabel = GRADE_LABELS[bridge.currentGrade];

  return (
    <div className="min-w-[200px] p-1">
      <h3 className="font-bold text-lg mb-2 text-gray-800">{bridge.name}</h3>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">类型：</span>
          <span className="font-medium text-gray-700">{bridge.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">建成年代：</span>
          <span className="font-medium text-gray-700">{bridge.buildYear}年</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">技术状况：</span>
          <span
            className="px-2 py-0.5 rounded text-xs font-bold"
            style={{
              backgroundColor: gradeColor,
              color: bridge.currentGrade === 'E' || bridge.currentGrade === 'A' ? '#fff' : '#000',
            }}
          >
            {bridge.currentGrade}级 ({gradeLabel})
          </span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-200">
        <Link
          to={`/bridges/${bridge.id}`}
          className="block text-center py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
        >
          查看详情 →
        </Link>
      </div>
    </div>
  );
};
