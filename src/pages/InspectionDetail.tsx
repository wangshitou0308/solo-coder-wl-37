import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GradeBadge } from '@/components/common/GradeBadge';
import { GradeResult } from '@/components/inspection/GradeResult';
import { useInspectionStore } from '@/stores/useInspectionStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { RATING_ITEMS, RATING_LEVELS, Inspection } from '@/types';
import { calculateOverallGrade } from '@/utils/gradeCalculator';
import {
  ArrowLeft,
  Calendar,
  User,
  Cloud,
  RefreshCw,
  FileText,
  ClipboardCheck,
  Edit,
  Plus,
} from 'lucide-react';

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchInspectionById, loading } = useInspectionStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [inspection, setInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    if (id) {
      loadInspection();
    }
  }, [id]);

  const loadInspection = async () => {
    if (!id) return;
    const data = await fetchInspectionById(id);
    if (data) {
      setInspection(data);
    }
  };

  const getBridgeName = (bridgeId: string) => {
    return bridges.find((b) => b.id === bridgeId)?.name || '未知桥梁';
  };

  const getRatingLabel = (value: number) => {
    const level = RATING_LEVELS.find((l) => l.value === value);
    return level ? level.label : '-';
  };

  const getRatingColor = (value: number) => {
    const colors: Record<number, string> = {
      1: 'text-emerald-600 bg-emerald-50',
      2: 'text-green-600 bg-green-50',
      3: 'text-amber-600 bg-amber-50',
      4: 'text-orange-600 bg-orange-50',
      5: 'text-red-600 bg-red-50',
    };
    return colors[value] || 'text-gray-600 bg-gray-50';
  };

  if (loading && !inspection) {
    return (
      <AppLayout title="检测详情">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-cyan-600" size={32} />
        </div>
      </AppLayout>
    );
  }

  if (!inspection) {
    return (
      <AppLayout title="检测详情">
        <div className="text-center py-16 text-gray-500">检测记录不存在</div>
      </AppLayout>
    );
  }

  const gradeResult = calculateOverallGrade({
    deckPavement: inspection.deckPavement,
    expansionJoint: inspection.expansionJoint,
    bearing: inspection.bearing,
    superstructure: inspection.superstructure,
    substructure: inspection.substructure,
    railing: inspection.railing,
    drainage: inspection.drainage,
  });

  return (
    <AppLayout title="检测详情" onRefresh={loadInspection}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/inspections')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/diseases/new?bridgeId=${inspection.bridgeId}&inspectionId=${inspection.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              关联病害
            </button>
            <button
              onClick={() => navigate(`/inspections/${inspection.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              编辑
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {getBridgeName(inspection.bridgeId)}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {inspection.inspectionDate}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {inspection.inspector}
                </span>
                <span className="flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  {inspection.weather}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  inspection.type === '常规定期'
                    ? 'bg-blue-100 text-blue-700'
                    : inspection.type === '结构定期'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                <ClipboardCheck className="w-4 h-4 mr-1" />
                {inspection.type}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                分项评定结果
              </h3>
              <div className="space-y-3">
                {RATING_ITEMS.map((item) => {
                  const value = inspection[item.key as keyof Inspection] as number;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(
                          value
                        )}`}
                      >
                        {value}级 - {getRatingLabel(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                综合评定结果
              </h3>
              <GradeResult result={gradeResult} />
            </div>
          </div>

          {inspection.remarks && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">备注</h3>
              <p className="text-gray-600 text-sm">{inspection.remarks}</p>
            </div>
          )}

          {inspection.photos && inspection.photos.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">检测照片</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inspection.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`检测照片 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
