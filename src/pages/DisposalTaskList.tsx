import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Empty from '@/components/Empty';
import { useDisposalTaskStore } from '@/stores/useDisposalTaskStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { DisposalTaskStatus, DISPOSAL_TASK_STATUS_COLORS, DiseaseSeverity, SEVERITY_COLORS } from '@/types';
import { Search, Plus, Calendar, User, ClipboardList, Filter, RefreshCw, Building2, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';

const TASK_STATUSES: DisposalTaskStatus[] = ['待分派', '处理中', '待验收', '已完成'];

export default function DisposalTaskList() {
  const navigate = useNavigate();
  const { tasks, loading, fetchTasks, deleteTask, updateTaskStatus } = useDisposalTaskStore();
  const { bridges, fetchBridges } = useBridgeStore();
  const { diseases, fetchDiseases } = useDiseaseStore();

  const [filters, setFilters] = useState({
    bridgeId: '',
    status: '',
    severity: '',
    upcomingOverdue: false,
  });

  useEffect(() => {
    fetchTasks();
    fetchBridges();
    fetchDiseases();
  }, [fetchTasks, fetchBridges, fetchDiseases]);

  const handleSearch = () => {
    const filterParams: any = {};
    if (filters.bridgeId) filterParams.bridgeId = filters.bridgeId;
    if (filters.status) filterParams.status = filters.status as DisposalTaskStatus;
    if (filters.upcomingOverdue) filterParams.upcomingOverdue = true;
    fetchTasks(filterParams);
  };

  const handleReset = () => {
    setFilters({ bridgeId: '', status: '', severity: '', upcomingOverdue: false });
    fetchTasks();
  };

  const getBridgeName = (bridgeId: string) => {
    const bridge = bridges.find(b => b.id === bridgeId);
    return bridge?.name || '-';
  };

  const getDiseaseInfo = (diseaseId: string) => {
    const disease = diseases.find(d => d.id === diseaseId);
    return disease || null;
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个处置任务吗？')) {
      await deleteTask(id);
    }
  };

  const handleStatusChange = async (id: string, status: DisposalTaskStatus) => {
    await updateTaskStatus(id, status, status === '已完成' ? 100 : undefined);
  };

  const getNextStatus = (current: DisposalTaskStatus): DisposalTaskStatus | null => {
    if (current === '待分派') return '处理中';
    if (current === '处理中') return '待验收';
    if (current === '待验收') return '已完成';
    return null;
  };

  const statusCounts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === '待分派').length,
    inProgress: tasks.filter(t => t.status === '处理中').length,
    pendingReview: tasks.filter(t => t.status === '待验收').length,
    completed: tasks.filter(t => t.status === '已完成').length,
  };

  return (
    <AppLayout title="病害处置任务" onRefresh={() => fetchTasks()}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">全部任务</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{statusCounts.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-300 p-4 bg-gray-50">
            <p className="text-sm text-gray-600">待分派</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{statusCounts.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-amber-200 p-4 bg-amber-50/50">
            <p className="text-sm text-amber-600">处理中</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{statusCounts.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-4 bg-purple-50/50">
            <p className="text-sm text-purple-600">待验收</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.pendingReview}</p>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-4 bg-emerald-50/50">
            <p className="text-sm text-emerald-600">已完成</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{statusCounts.completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">筛选条件</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">桥梁</label>
              <select
                value={filters.bridgeId}
                onChange={(e) => setFilters({ ...filters, bridgeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="">全部桥梁</option>
                {bridges.map((bridge) => (
                  <option key={bridge.id} value={bridge.id}>{bridge.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">任务状态</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="">全部状态</option>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.upcomingOverdue}
                  onChange={(e) => setFilters({ ...filters, upcomingOverdue: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">即将超期（7天内）</span>
              </label>
            </div>
            <div className="lg:col-span-2 flex items-end gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
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
            共 <span className="font-semibold text-gray-700">{tasks.length}</span> 条任务
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Empty message="暂无处置任务" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">桥梁名称</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">病害信息</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">责任单位/人</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">计划完成日期</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">处置进度</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task) => {
                    const disease = getDiseaseInfo(task.diseaseId);
                    const nextStatus = getNextStatus(task.status);
                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {getBridgeName(task.bridgeId)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {disease && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${SEVERITY_COLORS[disease.severity as DiseaseSeverity]}15`,
                                  color: SEVERITY_COLORS[disease.severity as DiseaseSeverity],
                                }}
                              >
                                {disease.type} - {disease.severity}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">{disease?.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium">{task.responsibleUnit || '未指派'}</p>
                            <p className="text-gray-500 text-xs">{task.responsiblePerson || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {task.planFinishDate}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${task.progress}%`,
                                  backgroundColor: DISPOSAL_TASK_STATUS_COLORS[task.status],
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${DISPOSAL_TASK_STATUS_COLORS[task.status]}15`,
                              color: DISPOSAL_TASK_STATUS_COLORS[task.status],
                            }}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {nextStatus && (
                              <button
                                onClick={() => handleStatusChange(task.id, nextStatus)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title={`标记为${nextStatus}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/disposal-tasks/${task.id}/edit`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
