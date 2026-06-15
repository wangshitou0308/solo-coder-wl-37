import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Calendar,
  Ruler,
  RefreshCw,
  Play,
  CheckCircle,
  Wrench,
  Plus,
  Clock,
  FileText,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DiseaseTimeline } from '@/components/disease/DiseaseTimeline';
import { GrowthChart } from '@/components/disease/GrowthChart';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { useDisposalTaskStore } from '@/stores/useDisposalTaskStore';
import { useMaintenanceStore } from '@/stores/useMaintenanceStore';
import { Disease, DiseaseStatus, SEVERITY_COLORS, STATUS_COLORS, DISPOSAL_TASK_STATUS_COLORS } from '@/types';
import { formatDate, getDaysOverdue } from '@/utils/dateUtils';

const DiseaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDiseaseById, updateDiseaseStatus, loading, error } = useDiseaseStore();
  const { bridges, fetchBridges } = useBridgeStore();
  const { tasks: disposalTasks, fetchTasks, loading: tasksLoading } = useDisposalTaskStore();
  const { maintenances, fetchMaintenances, loading: maintenancesLoading } = useMaintenanceStore();

  const [disease, setDisease] = useState<Disease | null>(null);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'disposal' | 'maintenance'>('overview');

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    if (id) {
      loadDisease();
      fetchTasks({ diseaseId: id });
      fetchMaintenances();
    }
  }, [id]);

  const loadDisease = async () => {
    if (!id) return;
    const data = await fetchDiseaseById(id);
    if (data) {
      setDisease(data);
    }
  };

  const getBridgeName = (bridgeId: string) => {
    return bridges.find((b) => b.id === bridgeId)?.name || '未知桥梁';
  };

  const getNextStatus = (current: DiseaseStatus): DiseaseStatus | null => {
    if (current === '已记录') return '处理中';
    if (current === '处理中') return '已修复';
    return null;
  };

  const getStatusButtonConfig = (nextStatus: DiseaseStatus | null) => {
    if (!nextStatus) return null;
    const configs: Record<DiseaseStatus, { icon: React.ReactNode; label: string }> = {
      已记录: { icon: <Play size={18} />, label: '开始处理' },
      处理中: { icon: <CheckCircle size={18} />, label: '标记已修复' },
      已修复: { icon: null, label: '' },
    };
    return configs[nextStatus];
  };

  const handleStatusUpdate = async () => {
    if (!disease || !id) return;
    const nextStatus = getNextStatus(disease.status);
    if (!nextStatus) return;

    setUpdating(true);
    try {
      const today = formatDate(new Date());
      await updateDiseaseStatus(id, nextStatus, today);
      await loadDisease();
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateDisposalTask = () => {
    navigate(`/disposal-tasks/new?diseaseId=${id}`);
  };

  const relatedMaintenances = maintenances.filter(
    (m) => disposalTasks.some((t) => t.maintenanceId === m.id) || m.diseaseId === id
  );

  const tabs = [
    { key: 'overview', label: '概览', icon: FileText },
    { key: 'disposal', label: '处置任务', icon: Wrench, count: disposalTasks.length },
    { key: 'maintenance', label: '维修记录', icon: Wrench, count: relatedMaintenances.length },
  ];

  if (loading && !disease) {
    return (
      <AppLayout title="病害详情">
        <div className="p-8 text-center text-gray-500">
          <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-blue-500" />
          加载中...
        </div>
      </AppLayout>
    );
  }

  if (error || !disease) {
    return (
      <AppLayout title="病害详情">
        <div className="p-8 text-center text-red-500">
          {error || '病害记录不存在'}
        </div>
      </AppLayout>
    );
  }

  const nextStatus = getNextStatus(disease.status);
  const buttonConfig = getStatusButtonConfig(nextStatus);
  const overdue = disease.status !== '已修复' && getDaysOverdue(disease.deadline) > 0;
  const daysOverdue = getDaysOverdue(disease.deadline);

  return (
    <AppLayout title="病害详情" onRefresh={loadDisease}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/diseases')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            返回列表
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateDisposalTask}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus size={18} />
              创建处置任务
            </button>
            {buttonConfig && (
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: nextStatus ? STATUS_COLORS[nextStatus] : '#6b7280',
                }}
              >
                {updating ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  buttonConfig.icon
                )}
                {buttonConfig.label}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                        activeTab === tab.key
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          {getBridgeName(disease.bridgeId)}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin size={16} />
                          <span>{disease.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge severity={disease.severity} />
                        <StatusBadge status={disease.status} />
                      </div>
                    </div>

                    {overdue && (
                      <div
                        className="mb-4 p-3 rounded-lg flex items-center gap-2"
                        style={{
                          backgroundColor: `${SEVERITY_COLORS['严重']}15`,
                          border: `1px solid ${SEVERITY_COLORS['严重']}40`,
                        }}
                      >
                        <AlertTriangle size={20} style={{ color: SEVERITY_COLORS['严重'] }} />
                        <span className="font-medium" style={{ color: SEVERITY_COLORS['严重'] }}>
                          该病害已超期 {daysOverdue} 天未处理
                        </span>
                      </div>
                    )}

                    <p className="text-gray-600 mb-4">{disease.description}</p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">类型</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">病害类型</p>
                          <p className="font-medium text-gray-800">{disease.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Ruler size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">尺寸</p>
                          <p className="font-medium text-gray-800">{disease.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                          <Calendar size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">记录日期</p>
                          <p className="font-medium text-gray-800">
                            {formatDate(disease.recordedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            overdue ? 'bg-red-50' : 'bg-orange-50'
                          }`}
                        >
                          <AlertTriangle
                            size={20}
                            className={overdue ? 'text-red-600' : 'text-orange-600'}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">截止日期</p>
                          <p
                            className={`font-medium ${
                              overdue ? 'text-red-600' : 'text-gray-800'
                            }`}
                          >
                            {formatDate(disease.deadline)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Ruler size={20} className="text-blue-500" />
                      当前尺寸
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">长度</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {disease.length !== undefined ? `${disease.length} cm` : '-'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">宽度</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {disease.width !== undefined ? `${disease.width} mm` : '-'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">深度</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {disease.depth !== undefined ? `${disease.depth} cm` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <GrowthChart historyRecords={disease.historyRecords} />
                </div>

                <div className="space-y-6">
                  <DiseaseTimeline disease={disease} />

                  {disease.historyRecords.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">历史记录</h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {[...disease.historyRecords]
                          .sort(
                            (a, b) =>
                              new Date(b.inspectionDate).getTime() -
                              new Date(a.inspectionDate).getTime()
                          )
                          .map((record) => (
                            <div
                              key={record.id}
                              className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-800">
                                  {formatDate(record.inspectionDate)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                              {(record.length || record.width || record.depth) && (
                                <div className="flex gap-4 text-xs text-gray-500">
                                  {record.length && <span>长: {record.length}cm</span>}
                                  {record.width && <span>宽: {record.width}mm</span>}
                                  {record.depth && <span>深: {record.depth}cm</span>}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'disposal' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">处置任务列表</h3>
                  <button
                    onClick={handleCreateDisposalTask}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                  >
                    <Plus size={14} />
                    新建处置任务
                  </button>
                </div>

                {tasksLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : disposalTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无处置任务</p>
                    <button
                      onClick={handleCreateDisposalTask}
                      className="mt-3 text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      创建第一个处置任务
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {disposalTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors cursor-pointer"
                        onClick={() => navigate(`/disposal-tasks/${task.id}/edit`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Wrench size={16} className="text-amber-600" />
                            <span className="font-medium text-gray-800">{task.disposalMeasures}</span>
                          </div>
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${DISPOSAL_TASK_STATUS_COLORS[task.status]}15`,
                              color: DISPOSAL_TASK_STATUS_COLORS[task.status],
                            }}
                          >
                            {task.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">责任单位</p>
                            <p className="text-gray-700">{task.responsibleUnit || '未指派'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">责任人</p>
                            <p className="text-gray-700">{task.responsiblePerson || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">计划完成</p>
                            <p className="text-gray-700">{task.planFinishDate}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">处置进度</span>
                            <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${task.progress}%`,
                                backgroundColor: DISPOSAL_TASK_STATUS_COLORS[task.status],
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">关联维修记录</h3>
                {maintenancesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : relatedMaintenances.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无关联维修记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relatedMaintenances.map((maintenance) => (
                      <div
                        key={maintenance.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
                        onClick={() => navigate(`/maintenances/${maintenance.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Wrench size={16} className="text-emerald-600" />
                            <span className="font-medium text-gray-800">{maintenance.type}</span>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">
                            ¥{maintenance.cost.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">施工单位</p>
                            <p className="text-gray-700">{maintenance.contractor}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">开始日期</p>
                            <p className="text-gray-700">{maintenance.startDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">完成日期</p>
                            <p className="text-gray-700">{maintenance.endDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DiseaseDetail;
