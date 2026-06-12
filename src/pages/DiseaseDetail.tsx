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
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DiseaseTimeline } from '@/components/disease/DiseaseTimeline';
import { GrowthChart } from '@/components/disease/GrowthChart';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { Disease, DiseaseStatus, SEVERITY_COLORS, STATUS_COLORS } from '@/types';
import { formatDate, getDaysOverdue } from '@/utils/dateUtils';

const DiseaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDiseaseById, updateDiseaseStatus, loading, error } = useDiseaseStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [disease, setDisease] = useState<Disease | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    if (id) {
      loadDisease();
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
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

            <div className="bg-white rounded-lg shadow-sm border p-6">
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
              <div className="bg-white rounded-lg shadow-sm border p-6">
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
      </div>
    </AppLayout>
  );
};

export default DiseaseDetail;
