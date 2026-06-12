import React from 'react';
import { Clock, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { Disease, STATUS_COLORS } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface DiseaseTimelineProps {
  disease: Disease;
}

interface TimelineItem {
  status: string;
  date: string;
  icon: React.ReactNode;
  label: string;
  completed: boolean;
}

export const DiseaseTimeline: React.FC<DiseaseTimelineProps> = ({ disease }) => {
  const getTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [
      {
        status: '已记录',
        date: disease.recordedDate,
        icon: <AlertCircle size={20} />,
        label: '病害已记录',
        completed: true,
      },
    ];

    if (disease.assignedDate || disease.status !== '已记录') {
      items.push({
        status: '处理中',
        date: disease.assignedDate || '',
        icon: <Wrench size={20} />,
        label: '开始处理',
        completed: disease.status === '处理中' || disease.status === '已修复',
      });
    }

    if (disease.repairedDate || disease.status === '已修复') {
      items.push({
        status: '已修复',
        date: disease.repairedDate || '',
        icon: <CheckCircle size={20} />,
        label: '修复完成',
        completed: disease.status === '已修复',
      });
    }

    return items;
  };

  const items = getTimelineItems();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-blue-500" />
        状态时间线
      </h3>
      <div className="relative">
        {items.map((item, index) => (
          <div key={item.status} className="flex gap-4">
            {index < items.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}
            <div
              className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: item.completed ? `${STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}20` : '#e5e7eb',
                color: item.completed ? STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] : '#9ca3af',
              }}
            >
              {item.icon}
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{item.label}</span>
                {item.completed && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}20`,
                      color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS],
                    }}
                  >
                    {item.status}
                  </span>
                )}
              </div>
              {item.date ? (
                <p className="text-sm text-gray-500 mt-1">{formatDate(item.date)}</p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">待处理</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
