import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMaintenanceStore } from '@/stores/useMaintenanceStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { MaintenanceType, Maintenance } from '@/types';
import {
  Search,
  Plus,
  Filter,
  RefreshCw,
  Wrench,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const MAINTENANCE_TYPES: MaintenanceType[] = ['日常养护', '小修', '中修', '大修', '加固', '重建'];

const TYPE_COLORS: Record<MaintenanceType, string> = {
  '日常养护': 'bg-green-100 text-green-700',
  '小修': 'bg-blue-100 text-blue-700',
  '中修': 'bg-amber-100 text-amber-700',
  '大修': 'bg-orange-100 text-orange-700',
  '加固': 'bg-purple-100 text-purple-700',
  '重建': 'bg-red-100 text-red-700',
};

export default function MaintenanceList() {
  const navigate = useNavigate();
  const { maintenances, stats, loading, fetchMaintenances, fetchStats } = useMaintenanceStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [bridgeId, setBridgeId] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | ''>('');
  const [yearFilter, setYearFilter] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    const filters: { bridgeId?: string; type?: MaintenanceType; year?: number } = {};
    if (bridgeId) filters.bridgeId = bridgeId;
    if (typeFilter) filters.type = typeFilter;
    if (yearFilter) filters.year = parseInt(yearFilter);
    fetchMaintenances(filters);
    fetchStats(filters);
  }, [fetchMaintenances, fetchStats, bridgeId, typeFilter, yearFilter]);

  const getBridgeName = (id: string) => bridges.find(b => b.id === id)?.name || '未知桥梁';

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleRefresh = () => {
    const filters: { bridgeId?: string; type?: MaintenanceType; year?: number } = {};
    if (bridgeId) filters.bridgeId = bridgeId;
    if (typeFilter) filters.type = typeFilter;
    if (yearFilter) filters.year = parseInt(yearFilter);
    fetchMaintenances(filters);
    fetchStats(filters);
  };

  return (
    <AppLayout title="维修加固记录" onRefresh={handleRefresh}>
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
                value={bridgeId}
                onChange={(e) => setBridgeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">全部桥梁</option>
                {bridges.map((bridge) => (
                  <option key={bridge.id} value={bridge.id}>{bridge.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">维修类型</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as MaintenanceType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">全部类型</option>
                {MAINTENANCE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">年份</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">全部年份</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>{year}年</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  showStats ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                费用统计
                {showStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {showStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-emerald-600" />
                <span className="text-sm text-gray-500">总费用</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">¥{stats.totalCost.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.totalCount} 条记录</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={18} className="text-blue-600" />
                <span className="text-sm text-gray-500">按类型汇总</span>
              </div>
              <div className="space-y-2">
                {stats.byType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.type}</span>
                    <span className="font-medium text-slate-800">¥{item.totalCost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-purple-600" />
                <span className="text-sm text-gray-500">按年度汇总</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stats.byYear.map((item) => (
                  <div key={item.year} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.year}年</span>
                    <span className="font-medium text-slate-800">¥{item.totalCost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            共 <span className="font-semibold text-gray-700">{maintenances.length}</span> 条记录
          </div>
          <button
            onClick={() => navigate('/maintenances/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            新增维修记录
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : maintenances.length === 0 ? (
            <div className="text-center py-16 text-gray-500">暂无维修记录</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">桥梁名称</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">维修类型</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">施工时间</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">施工单位</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">费用</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">复核状态</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {maintenances.map((m) => {
                    const isOverdueReview = !m.isReviewed && new Date(m.reviewDate) < new Date();
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{getBridgeName(m.bridgeId)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[m.type]}`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {m.startDate} ~ {m.endDate}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{m.contractor}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-slate-800">¥{m.cost.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {m.isReviewed ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              <CheckCircle2 size={12} />
                              已复核
                            </span>
                          ) : isOverdueReview ? (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                              <Clock size={12} />
                              待复核
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              <Clock size={12} />
                              待复核
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => navigate(`/maintenances/${m.id}`)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
