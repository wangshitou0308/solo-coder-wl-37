import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePatrolStore } from '@/stores/usePatrolStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { PatrolType, EventType } from '@/types';
import {
  Search,
  Plus,
  Filter,
  RefreshCw,
  Footprints,
  AlertTriangle,
  Calendar,
  User,
  ChevronRight,
  Eye,
  FileText,
  Zap,
} from 'lucide-react';

const PATROL_TYPES: PatrolType[] = ['日常巡查', '突发事件'];
const EVENT_TYPES: EventType[] = ['车辆撞击', '洪水冲刷', '超重车通行', '地震', '其他'];

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

export default function PatrolList() {
  const navigate = useNavigate();
  const { patrols, loading, fetchPatrols, generateInspection } = usePatrolStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [filters, setFilters] = useState({
    bridgeId: '',
    type: '' as PatrolType | '',
  });

  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    const filterParams: { bridgeId?: string; type?: PatrolType } = {};
    if (filters.bridgeId) filterParams.bridgeId = filters.bridgeId;
    if (filters.type) filterParams.type = filters.type as PatrolType;
    fetchPatrols(filterParams);
  }, [fetchPatrols, filters.bridgeId, filters.type]);

  const handleSearch = () => {
    const filterParams: { bridgeId?: string; type?: PatrolType } = {};
    if (filters.bridgeId) filterParams.bridgeId = filters.bridgeId;
    if (filters.type) filterParams.type = filters.type as PatrolType;
    fetchPatrols(filterParams);
  };

  const handleReset = () => {
    setFilters({ bridgeId: '', type: '' });
    fetchPatrols();
  };

  const getBridgeName = (bridgeId: string) => {
    const bridge = bridges.find(b => b.id === bridgeId);
    return bridge?.name || '未知桥梁';
  };

  const handleGenerateInspection = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingId(id);
    try {
      await generateInspection(id);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <AppLayout
      title="养护巡查记录"
      onRefresh={() => {
        const filterParams: { bridgeId?: string; type?: PatrolType } = {};
        if (filters.bridgeId) filterParams.bridgeId = filters.bridgeId;
        if (filters.type) filterParams.type = filters.type as PatrolType;
        fetchPatrols(filterParams);
      }}
    >
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">全部桥梁</option>
                {bridges.map((bridge) => (
                  <option key={bridge.id} value={bridge.id}>
                    {bridge.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">巡查类型</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as PatrolType | '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">全部类型</option>
                {PATROL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
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
            共 <span className="font-semibold text-gray-700">{patrols.length}</span> 条记录
          </div>
          <button
            onClick={() => navigate('/patrols/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            新增巡查记录
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : patrols.length === 0 ? (
            <div className="text-center py-16 text-gray-500">暂无巡查记录</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {patrols.map((patrol) => (
                <div
                  key={patrol.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/patrols/${patrol.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            patrol.type === '突发事件' ? 'bg-red-100' : 'bg-blue-100'
                          }`}
                        >
                          {patrol.type === '突发事件' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Footprints className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {getBridgeName(patrol.bridgeId)}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[patrol.type]}`}
                            >
                              {patrol.type}
                            </span>
                            {patrol.eventType && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[patrol.eventType]}`}
                              >
                                {patrol.eventType}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {patrol.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {patrol.recorder}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 ml-13 pl-[52px] line-clamp-2">
                        {patrol.description}
                      </p>
                      {patrol.emergencyMeasures && (
                        <div className="ml-[52px] mt-2 flex items-start gap-2">
                          <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded">
                            应急措施：{patrol.emergencyMeasures}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {patrol.type === '突发事件' && !patrol.hasGeneratedInspection && (
                        <button
                          onClick={(e) => handleGenerateInspection(patrol.id, e)}
                          disabled={generatingId === patrol.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs font-medium disabled:opacity-50"
                        >
                          {generatingId === patrol.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          生成特殊检测
                        </button>
                      )}
                      {patrol.hasGeneratedInspection && (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          已生成检测
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patrols/${patrol.id}`);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        详情
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
