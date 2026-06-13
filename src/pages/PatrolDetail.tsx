import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePatrolStore } from '@/stores/usePatrolStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import {
  ArrowLeft,
  Calendar,
  User,
  Edit,
  RefreshCw,
  Footprints,
  AlertTriangle,
  Zap,
  FileText,
  Image,
} from 'lucide-react';
import { PatrolType, EventType } from '@/types';

const TYPE_COLORS: Record<PatrolType, string> = {
  '日常巡查': 'bg-blue-100 text-blue-700',
  '突发事件': 'bg-red-100 text-red-700',
};

const EVENT_COLORS: Record<EventType, string> = {
  '车辆撞击': 'bg-orange-100 text-orange-700',
  '洪水冲刷': 'bg-cyan-100 text-cyan-700',
  '超重车通行': 'bg-amber-100 text-amber-700',
  '地震': 'bg-purple-100 text-purple-700',
  '其他': 'bg-gray-100 text-gray-700',
};

export default function PatrolDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { patrols, fetchPatrols, loading, generateInspection } = usePatrolStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [patrol, setPatrol] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchBridges();
    fetchPatrols();
  }, []);

  useEffect(() => {
    if (id && patrols.length > 0) {
      const found = patrols.find(p => p.id === id);
      setPatrol(found);
    }
  }, [id, patrols]);

  const bridge = bridges.find(b => b.id === patrol?.bridgeId);

  const handleGenerateInspection = async () => {
    if (!patrol) return;
    setGenerating(true);
    try {
      await generateInspection(patrol.id);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !patrol) {
    return (
      <AppLayout title="巡查详情">
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!patrol) {
    return (
      <AppLayout title="巡查详情">
        <div className="text-center py-16 text-gray-500">巡查记录不存在</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="巡查详情">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/patrols')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          <button
            onClick={() => navigate(`/patrols/${patrol.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            编辑记录
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  patrol.type === '突发事件' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {patrol.type === '突发事件' ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : (
                    <Footprints className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {bridge?.name || '未知桥梁'}
                    </h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[patrol.type]}`}>
                      {patrol.type}
                    </span>
                    {patrol.eventType && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[patrol.eventType]}`}>
                        {patrol.eventType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {patrol.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {patrol.recorder}
                    </span>
                  </div>
                </div>
              </div>
              {patrol.type === '突发事件' && !patrol.hasGeneratedInspection && (
                <button
                  onClick={handleGenerateInspection}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {generating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  生成特殊检测任务
                </button>
              )}
              {patrol.hasGeneratedInspection && (
                <span className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  已生成检测任务
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">巡查描述</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {patrol.description}
            </p>
          </div>
        </div>

        {patrol.type === '突发事件' && patrol.emergencyMeasures && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-700">应急处理措施</h3>
              </div>
            </div>
            <div className="px-6 py-4 bg-amber-50">
              <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">
                {patrol.emergencyMeasures}
              </p>
            </div>
          </div>
        )}

        {patrol.photos && patrol.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">现场照片</h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {patrol.photos.map((photo: string, index: number) => (
                  <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={photo}
                      alt={`现场照片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">记录信息</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">记录ID</span>
              <span className="text-sm font-mono text-gray-700">{patrol.id}</span>
            </div>
            {patrol.generatedInspectionId && (
              <div className="px-6 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">生成的检测任务ID</span>
                <span className="text-sm font-mono text-green-700">{patrol.generatedInspectionId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
