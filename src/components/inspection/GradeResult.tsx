import React from 'react';
import { GradeBadge } from '@/components/common/GradeBadge';
import { GradeResult as GradeResultType } from '@/utils/gradeCalculator';
import { getRatingLabel } from '@/utils/gradeCalculator';
import { Gauge, TrendingUp, ListChecks } from 'lucide-react';

interface GradeResultProps {
  result: GradeResultType;
}

export const GradeResult: React.FC<GradeResultProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-amber-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 45) return 'text-red-600';
    return 'text-gray-800';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-amber-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 45) return 'bg-red-500';
    return 'bg-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gauge className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">综合得分</span>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
            {result.score.toFixed(1)}
            <span className="text-lg font-normal text-gray-400 ml-1">分</span>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(result.score)}`}
              style={{ width: `${Math.max(0, Math.min(100, result.score))}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">技术状况等级</span>
          </div>
          <div className="flex items-center">
            <GradeBadge grade={result.grade} size="lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ListChecks className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">评定项完成</span>
          </div>
          <div className="text-4xl font-bold text-gray-800">
            {result.details.filter(d => d.rating > 0).length}
            <span className="text-lg font-normal text-gray-400 ml-1">/ {result.details.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">分项评分明细</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {result.details.map((detail, index) => (
            <div key={index} className="px-6 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-800 w-24">{detail.item}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    detail.rating >= 4 ? 'bg-red-100 text-red-700' :
                    detail.rating >= 3 ? 'bg-orange-100 text-orange-700' :
                    detail.rating >= 2 ? 'bg-amber-100 text-amber-700' :
                    detail.rating >= 1 ? 'bg-emerald-100 text-emerald-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {detail.rating > 0 ? `${detail.rating}级 ${getRatingLabel(detail.rating)}` : '未评定'}
                  </span>
                  <span className="text-xs text-gray-400">权重 {(detail.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${detail.weightedScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                    {detail.weightedScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
