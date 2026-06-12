import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GradeBadge } from '@/components/common/GradeBadge';
import Empty from '@/components/Empty';
import { useInspectionStore } from '@/stores/useInspectionStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { InspectionType } from '@/types';
import { Search, Plus, Calendar, User, ClipboardList, Filter, RefreshCw } from 'lucide-react';

const INSPECTION_TYPES: InspectionType[] = ['常规定期', '结构定期', '特殊检测'];

export default function InspectionList() {
  const navigate = useNavigate();
  const { inspections, loading, fetchInspections } = useInspectionStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [filters, setFilters] = useState({
    bridgeId: '',
    type: '',
    year: '',
  });

  useEffect(() => {
    fetchInspections();
    fetchBridges();
  }, [fetchInspections, fetchBridges]);

  const handleSearch = () => {
    const filterParams: { bridgeId?: string; type?: InspectionType; year?: number } = {};
    if (filters.bridgeId) filterParams.bridgeId = filters.bridgeId;
    if (filters.type) filterParams.type = filters.type as InspectionType;
    if (filters.year) filterParams.year = parseInt(filters.year);
    fetchInspections(filterParams);
  };

  const handleReset = () => {
    setFilters({ bridgeId: '', type: '', year: '' });
    fetchInspections();
  };

  const getBridgeName = (bridgeId: string) => {
    const bridge = bridges.find(b => b.id === bridgeId);
    return bridge?.name || '-';
  };

  const getTypeColor = (type: InspectionType) => {
    const colors: Record<InspectionType, string> = {
      '常规定期': 'bg-blue-100 text-blue-700',
      '结构定期': 'bg-purple-100 text-purple-700',
      '特殊检测': 'bg-orange-100 text-orange-700',
    };
    return colors[type];
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <AppLayout title="定期检测记录" onRefresh={() => fetchInspections()}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">筛选条件</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">桥梁</label>
              <select
                value={filters.bridgeId}
                onChange={(e) => setFilters({ ...filters, bridgeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">全部桥梁</option>
                {bridges.map((bridge) => (
                  <option key={bridge.id} value={bridge.id}>{bridge.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">检测类型</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">全部类型</option>
                {INSPECTION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">年份</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">全部年份</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>{year}年</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Search className="w-4 h-4" />
                搜索
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            共 <span className="font-semibold text-gray-700">{inspections.length}</span> 条记录
          </div>
          <button
            onClick={() => navigate('/inspections/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            新增检测记录
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>暂无检测记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">桥梁名称</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">检测类型</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">检测日期</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">检测人员</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">综合得分</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">技术状况等级</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {getBridgeName(inspection.bridgeId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(inspection.type)}`}>
                          {inspection.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {inspection.inspectionDate}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          {inspection.inspector}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-semibold ${
                          inspection.overallScore >= 90 ? 'text-emerald-600' :
                          inspection.overallScore >= 75 ? 'text-amber-600' :
                          inspection.overallScore >= 60 ? 'text-orange-600' :
                          inspection.overallScore >= 45 ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {inspection.overallScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <GradeBadge grade={inspection.overallGrade} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/inspections/${inspection.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
