import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMaintenanceStore } from '@/stores/useMaintenanceStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { Maintenance } from '@/types';
import {
  ArrowLeft,
  Calendar,
  Wrench,
  DollarSign,
  Building2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Save,
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  日常养护: 'bg-green-100 text-green-700',
  小修: 'bg-blue-100 text-blue-700',
  中修: 'bg-amber-100 text-amber-700',
  大修: 'bg-orange-100 text-orange-700',
  加固: 'bg-purple-100 text-purple-700',
  重建: 'bg-red-100 text-red-700',
};

export default function MaintenanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchMaintenanceById, updateReview, loading } = useMaintenanceStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [reviewResult, setReviewResult] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    if (id) {
      loadMaintenance();
    }
  }, [id]);

  const loadMaintenance = async () => {
    if (!id) return;
    const data = await fetchMaintenanceById(id);
    if (data) {
      setMaintenance(data);
      if (data.reviewResult) {
        setReviewResult(data.reviewResult);
      }
    }
  };

  const getBridgeName = (bridgeId: string) => {
    return bridges.find((b) => b.id === bridgeId)?.name || '未知桥梁';
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewResult.trim()) return;

    setSavingReview(true);
    try {
      await updateReview(id, reviewResult);
      await loadMaintenance();
      setShowReviewForm(false);
    } finally {
      setSavingReview(false);
    }
  };

  if (loading && !maintenance) {
    return (
      <AppLayout title="维修详情">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-cyan-600" size={32} />
        </div>
      </AppLayout>
    );
  }

  if (!maintenance) {
    return (
      <AppLayout title="维修详情">
        <div className="text-center py-16 text-gray-500">维修记录不存在</div>
      </AppLayout>
    );
  }

  const isOverdueReview =
    !maintenance.isReviewed && new Date(maintenance.reviewDate) < new Date();

  return (
    <AppLayout title="维修详情" onRefresh={loadMaintenance}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/maintenances')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          <button
            onClick={() => navigate(`/maintenances/${maintenance.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            编辑
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {getBridgeName(maintenance.bridgeId)}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Wrench className="w-4 h-4" />
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[maintenance.type]}`}
                  >
                    {maintenance.type}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {maintenance.startDate} ~ {maintenance.endDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-emerald-600">
                ¥{maintenance.cost.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">施工单位</p>
              <p className="font-medium text-gray-800 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                {maintenance.contractor}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">维修费用</p>
              <p className="font-medium text-gray-800 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                ¥{maintenance.cost.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">复核日期</p>
              <p className="font-medium text-gray-800 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                {maintenance.reviewDate}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">复核状态</p>
              {maintenance.isReviewed ? (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  已复核
                </span>
              ) : isOverdueReview ? (
                <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  超期未复核
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <Clock className="w-4 h-4" />
                  待复核
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">维修描述</h3>
            <p className="text-gray-600 text-sm">{maintenance.description}</p>
          </div>

          {maintenance.reviewResult && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="text-sm font-semibold text-emerald-700 mb-2">复核结果</h3>
              <p className="text-emerald-600 text-sm">{maintenance.reviewResult}</p>
            </div>
          )}

          {!maintenance.isReviewed && (
            <div className="mb-6">
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  完成复核
                </button>
              ) : (
                <form onSubmit={handleReviewSubmit} className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    复核结果
                  </label>
                  <textarea
                    value={reviewResult}
                    onChange={(e) => setReviewResult(e.target.value)}
                    placeholder="请输入复核检测结果..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={savingReview || !reviewResult.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {savingReview ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      保存复核
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">维修前照片</h3>
            {maintenance.beforePhotos && maintenance.beforePhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {maintenance.beforePhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`维修前 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无维修前照片
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">维修后照片</h3>
            {maintenance.afterPhotos && maintenance.afterPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {maintenance.afterPhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`维修后 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无维修后照片
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
