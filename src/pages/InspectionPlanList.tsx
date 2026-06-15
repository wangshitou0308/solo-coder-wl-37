import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Empty from '@/components/Empty';
import { useInspectionPlanStore } from '@/stores/useInspectionPlanStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { InspectionType, InspectionPlanStatus, INSPECTION_PLAN_STATUS_COLORS } from '@/types';
import { Search, Plus, Calendar, User, ClipboardList, Filter, RefreshCw, CalendarRange, Edit2, Trash2, Play, FileText } from 'lucide-react';

const INSPECTION_TYPES: InspectionType[] = ['常规定期', '结构定期', '特殊检测'];
const PLAN_STATUSES: InspectionPlanStatus[] = ['待执行', '执行中', '已完成', '已逾期'];

export default function InspectionPlanList() {
  const navigate = useNavigate();
  const { plans, loading, fetchPlans, deletePlan, updatePlanStatus } = useInspectionPlanStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [filters, setFilters] = useState({
    bridgeId: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPlans();
    fetchBridges();
  }, [fetchPlans, fetchBridges]);

  const handleSearch = () => {
    const filterParams: any = {};
    if (filters.bridgeId) filterParams.bridgeId = filters.bridgeId;
    if (filters.type) filterParams.type = filters.type as InspectionType;
    if (filters.status) filterParams.status = filters.status as InspectionPlanStatus;
    if (filters.startDate) filterParams.startDate = filters.startDate;
    if (filters.endDate) filterParams.endDate = filters.endDate;
    fetchPlans(filterParams);
  };

  const handleReset = () => {
    setFilters({ bridgeId: '', type: '', status: '', startDate: '', endDate: '' });
    fetchPlans();
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

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个检测计划吗？')) {
      await deletePlan(id);
    }
  };

  const handleStartExecution = async (id: string) => {
    await updatePlanStatus(id, '执行中');
  };

  const handleCreateInspection = (planId: string) => {
    navigate(`/inspections/new?planId=${planId}`);
  };

  const statusCounts = {
    total: plans.length,
    pending: plans.filter(p => p.status === '待执行').length,
    inProgress: plans.filter(p => p.status === '执行中').length,
    completed: plans.filter(p => p.status === '已完成').length,
    overdue: plans.filter(p => p.status === '已逾期').length,
  };

  return (
    <AppLayout title="检测计划" onRefresh={() => fetchPlans()}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">全部计划</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{statusCounts.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-blue-200 p-4 bg-blue-50/50">
            <p className="text-sm text-blue-600">待执行</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{statusCounts.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-amber-200 p-4 bg-amber-50/50">
            <p className="text-sm text-amber-600">执行中</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{statusCounts.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-4 bg-emerald-50/50">
            <p className="text-sm text-emerald-600">已完成</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{statusCounts.completed}</p>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-4 bg-red-50/50">
            <p className="text-sm text-red-600">已逾期</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{statusCounts.overdue}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">筛选条件</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">桥梁</label>
              <select
                value={filters.bridgeId}
                onChange={(e) => setFilters({ ...filters, bridgeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              >
                <option value="">全部类型</option>
                {INSPECTION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">执行状态</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              >
                <option value="">全部状态</option>
                {PLAN_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">计划开始日期</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">计划结束日期</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
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
            共 <span className="font-semibold text-gray-700">{plans.length}</span> 条计划
          </div>
          <button
            onClick={() => navigate('/inspection-plans/new')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            新建检测计划
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Empty message="暂无检测计划" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">桥梁名称</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">检测类型</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">计划日期</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">负责人</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {getBridgeName(plan.bridgeId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(plan.type)}`}>
                          {plan.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarRange className="w-4 h-4 text-gray-400" />
                          {plan.planDate}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          {plan.inspector || '未指派'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${INSPECTION_PLAN_STATUS_COLORS[plan.status]}15`,
                            color: INSPECTION_PLAN_STATUS_COLORS[plan.status],
                          }}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {plan.status === '待执行' && (
                            <button
                              onClick={() => handleStartExecution(plan.id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="开始执行"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {(plan.status === '待执行' || plan.status === '执行中') && (
                            <button
                              onClick={() => handleCreateInspection(plan.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="创建检测记录"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/inspection-plans/${plan.id}/edit`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
