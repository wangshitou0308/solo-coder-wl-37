import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import { DiseaseHistory } from '@/types';
import { formatDate } from '@/utils/dateUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GrowthChartProps {
  historyRecords: DiseaseHistory[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ historyRecords }) => {
  const sortedRecords = [...historyRecords].sort(
    (a, b) => new Date(a.inspectionDate).getTime() - new Date(b.inspectionDate).getTime()
  );

  const labels = sortedRecords.map((r) => formatDate(r.inspectionDate));
  const lengthData = sortedRecords.map((r) => r.length || null);
  const widthData = sortedRecords.map((r) => r.width || null);

  const hasLengthData = lengthData.some((v) => v !== null);
  const hasWidthData = widthData.some((v) => v !== null);

  const data = {
    labels,
    datasets: [
      ...(hasLengthData
        ? [
            {
              label: '长度 (cm)',
              data: lengthData,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.3,
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: '#ef4444',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
            },
          ]
        : []),
      ...(hasWidthData
        ? [
            {
              label: '宽度 (mm)',
              data: widthData,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.3,
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            if (context.parsed.y === null) return '';
            return `${context.dataset.label || ''}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (!hasLengthData && !hasWidthData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          发展趋势
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          暂无尺寸变化数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-blue-500" />
        发展趋势
      </h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
