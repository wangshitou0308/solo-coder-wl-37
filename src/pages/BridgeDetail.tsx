import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { BridgeInfo } from '@/components/bridge/BridgeInfo';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { useInspectionStore } from '@/stores/useInspectionStore';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { useMaintenanceStore } from '@/stores/useMaintenanceStore';
import { ArrowLeft, Edit2, FileText, AlertTriangle, Wrench, Loader2 } from 'lucide-react';
import { Bridge } from '@/types';

export default function BridgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBridgeById, loading: bridgeLoading, error } = useBridgeStore();
  const { inspections, fetchInspections, loading: inspectionLoading } = useInspectionStore();
  const { diseases, fetchDiseases, loading: diseaseLoading } = useDiseaseStore();
  const { maintenances, fetchMaintenances, loading: maintenanceLoading } = useMaintenanceStore();
  const [bridge, setBridge] = useState<Bridge | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    const bridgeData = await fetchBridgeById(id);
    setBridge(bridgeData);
    fetchInspections({ bridgeId: id });
    fetchDiseases({ bridgeId: id });
    fetchMaintenances({ bridgeId: id });
  };

  const stats = [
    { label: '检测记录', count: inspections.length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: '病害记录', count: diseases.length, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: '维修记录', count: maintenances.length, icon: Wrench, color: 'text-green-600 bg-green-50' },
  ];

  if (bridgeLoading && !bridge) {
    return (
      <AppLayout title="桥梁详情">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </AppLayout>
    );
  }

  if (error || !bridge) {
    return (
      <AppLayout title="桥梁详情">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || '桥梁不存在'}</p>
          <button
            onClick={() => navigate('/bridges')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回列表
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`桥梁详情 - ${bridge?.name || ''}`} onRefresh={loadData}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bridges')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">桥梁详情</h1>
          <div className="flex-1" />
          <button
            onClick={() => navigate(`/bridges/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit2 size={16} />
            编辑
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {inspectionLoading || diseaseLoading || maintenanceLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      stat.count
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <BridgeInfo bridge={bridge} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                最近检测记录
              </h3>
              <button
                onClick={() => navigate(`/inspections?bridgeId=${id}`)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                查看全部
              </button>
            </div>
            {inspectionLoading ? (
              <div className="text-center py-4 text-gray-500">加载中...</div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-4 text-gray-500">暂无检测记录</div>
            ) : (
              <div className="space-y-2">
                {inspections.slice(0, 5).map((inspection) => (
                  <div
                    key={inspection.id}
                    className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/inspections/${inspection.id}`)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{inspection.type}</span>
                      <span className="text-gray-500">{inspection.inspectionDate}</span>
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      评分: {inspection.overallScore.toFixed(1)} / 等级: {inspection.overallGrade}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                最近病害记录
              </h3>
              <button
                onClick={() => navigate(`/diseases?bridgeId=${id}`)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                查看全部
              </button>
            </div>
            {diseaseLoading ? (
              <div className="text-center py-4 text-gray-500">加载中...</div>
            ) : diseases.length === 0 ? (
              <div className="text-center py-4 text-gray-500">暂无病害记录</div>
            ) : (
              <div className="space-y-2">
                {diseases.slice(0, 5).map((disease) => (
                  <div
                    key={disease.id}
                    className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/diseases/${disease.id}`)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{disease.type}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: disease.status === '已修复' ? '#dcfce7' : disease.status === '处理中' ? '#fef3c7' : '#dbeafe',
                          color: disease.status === '已修复' ? '#166534' : disease.status === '处理中' ? '#92400e' : '#1e40af',
                        }}
                      >
                        {disease.status}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {disease.location} - {disease.severity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Wrench size={18} className="text-green-600" />
                最近维修记录
              </h3>
              <button
                onClick={() => navigate(`/maintenances?bridgeId=${id}`)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                查看全部
              </button>
            </div>
            {maintenanceLoading ? (
              <div className="text-center py-4 text-gray-500">加载中...</div>
            ) : maintenances.length === 0 ? (
              <div className="text-center py-4 text-gray-500">暂无维修记录</div>
            ) : (
              <div className="space-y-2">
                {maintenances.slice(0, 5).map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/maintenances/${maintenance.id}`)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{maintenance.type}</span>
                      <span className="text-gray-500">{maintenance.startDate}</span>
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {maintenance.contractor} - ¥{maintenance.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
