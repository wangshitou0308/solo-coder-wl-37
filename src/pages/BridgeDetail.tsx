import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { BridgeInfo } from '@/components/bridge/BridgeInfo';
import { GradeBadge } from '@/components/common/GradeBadge';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { useInspectionStore } from '@/stores/useInspectionStore';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { useMaintenanceStore } from '@/stores/useMaintenanceStore';
import { usePatrolStore } from '@/stores/usePatrolStore';
import {
  ArrowLeft,
  Edit2,
  FileText,
  AlertTriangle,
  Wrench,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  Activity,
  Footprints,
  Zap,
  Plus,
  ChevronRight,
  Map,
} from 'lucide-react';
import {
  Bridge,
  LifecycleEvent,
  GRADE_COLORS,
  GRADE_LABELS,
  SEVERITY_COLORS,
  STATUS_COLORS,
  INSPECTION_PLAN_STATUS_COLORS,
  DISPOSAL_TASK_STATUS_COLORS,
} from '@/types';
import { formatDate } from '@/utils/dateUtils';

type TabKey = 'inspections' | 'diseases' | 'maintenances' | 'patrols' | 'events';

export default function BridgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBridgeById, loading: bridgeLoading, error } = useBridgeStore();
  const { inspections, fetchInspections, loading: inspectionLoading } = useInspectionStore();
  const { diseases, fetchDiseases, loading: diseaseLoading } = useDiseaseStore();
  const { maintenances, fetchMaintenances, loading: maintenanceLoading } = useMaintenanceStore();
  const { patrols, fetchPatrols, loading: patrolLoading } = usePatrolStore();
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('inspections');

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
    fetchPatrols({ bridgeId: id });
  };

  const lifecycleEvents = useMemo<LifecycleEvent[]>(() => {
    const events: LifecycleEvent[] = [];

    inspections.forEach((ins) => {
      events.push({
        id: `ins-${ins.id}`,
        type: 'inspection',
        date: ins.inspectionDate,
        title: `${ins.type}检测`,
        description: `评分: ${ins.overallScore.toFixed(1)} · 等级: ${ins.overallGrade}`,
        status: ins.overallGrade,
      });
    });

    diseases.forEach((dis) => {
      events.push({
        id: `dis-${dis.id}`,
        type: 'disease',
        date: dis.recordedDate,
        title: `${dis.type}病害`,
        description: `${dis.location} · ${dis.severity}`,
        status: dis.status,
      });
    });

    maintenances.forEach((mai) => {
      events.push({
        id: `mai-${mai.id}`,
        type: 'maintenance',
        date: mai.startDate,
        title: `${mai.type}工程`,
        description: `${mai.contractor} · ¥${mai.cost.toLocaleString()}`,
        status: mai.isReviewed ? '已验收' : '进行中',
      });
    });

    patrols.forEach((pat) => {
      events.push({
        id: `pat-${pat.id}`,
        type: pat.type === '突发事件' ? 'event' : 'patrol',
        date: pat.date,
        title: pat.type === '突发事件' ? `${pat.eventType}事件` : '日常巡查',
        description: pat.description.substring(0, 30),
        status: pat.type === '突发事件' ? (pat.hasGeneratedInspection ? '已跟进' : '待跟进') : '已完成',
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inspections, diseases, maintenances, patrols]);

  const riskOverview = useMemo(() => {
    if (!bridge) return null;

    const unrepairedDiseases = diseases.filter(d => d.status !== '已修复');
    const severeDiseases = diseases.filter(d =>
      d.status !== '已修复' && (d.severity === '严重' || d.severity === '危险')
    );

    const latestInspection = inspections[0];
    const latestMaintenance = maintenances[0];

    const totalCost = maintenances.reduce((sum, m) => sum + m.cost, 0);

    return {
      currentGrade: bridge.currentGrade,
      unrepairedCount: unrepairedDiseases.length,
      severeCount: severeDiseases.length,
      latestInspectionDate: latestInspection?.inspectionDate || '-',
      latestMaintenanceDate: latestMaintenance?.endDate || '-',
      totalMaintenanceCost: totalCost,
    };
  }, [bridge, diseases, inspections, maintenances]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'inspection': return <FileText size={16} />;
      case 'disease': return <AlertTriangle size={16} />;
      case 'maintenance': return <Wrench size={16} />;
      case 'patrol': return <Footprints size={16} />;
      case 'event': return <Zap size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'inspection': return '#3b82f6';
      case 'disease': return '#f59e0b';
      case 'maintenance': return '#10b981';
      case 'patrol': return '#8b5cf6';
      case 'event': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleEventClick = (event: LifecycleEvent) => {
    if (event.type === 'inspection') {
      const id = event.id.replace('ins-', '');
      navigate(`/inspections/${id}`);
    } else if (event.type === 'disease') {
      const id = event.id.replace('dis-', '');
      navigate(`/diseases/${id}`);
    } else if (event.type === 'maintenance') {
      const id = event.id.replace('mai-', '');
      navigate(`/maintenances/${id}`);
    } else if (event.type === 'patrol' || event.type === 'event') {
      const id = event.id.replace('pat-', '');
      navigate(`/patrols/${id}`);
    }
  };

  const tabs = [
    { key: 'inspections', label: '检测记录', icon: FileText, count: inspections.length },
    { key: 'diseases', label: '病害记录', icon: AlertTriangle, count: diseases.length },
    { key: 'maintenances', label: '维修记录', icon: Wrench, count: maintenances.length },
    { key: 'patrols', label: '巡查记录', icon: Footprints, count: patrols.filter(p => p.type === '日常巡查').length },
    { key: 'events', label: '突发事件', icon: Zap, count: patrols.filter(p => p.type === '突发事件').length },
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

  const eventPatrols = patrols.filter(p => p.type === '突发事件');
  const dailyPatrols = patrols.filter(p => p.type === '日常巡查');

  return (
    <AppLayout title={`桥梁详情 - ${bridge?.name || ''}`} onRefresh={loadData}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bridges')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{bridge.name}</h1>
            <p className="text-sm text-gray-500">{bridge.type} · {bridge.buildYear}年建</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/map?bridgeId=${id}`)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Map size={16} />
              查看地图
            </button>
            <button
              onClick={() => navigate(`/bridges/${id}/edit`)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Edit2 size={16} />
              编辑
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{bridge.name}</h2>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: GRADE_COLORS[bridge.currentGrade],
                  }}
                >
                  {bridge.currentGrade}级 - {GRADE_LABELS[bridge.currentGrade]}
                </span>
              </div>
              <p className="text-slate-300 text-sm">{bridge.material} · {bridge.type}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/inspections/new?bridgeId=${id}`)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                新增检测
              </button>
              <button
                onClick={() => navigate(`/diseases/new?bridgeId=${id}`)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                新增病害
              </button>
              <button
                onClick={() => navigate(`/maintenances/new?bridgeId=${id}`)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                新增维修
              </button>
              <button
                onClick={() => navigate(`/patrols/new?bridgeId=${id}`)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                新增巡查
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-cyan-400" />
                <span className="text-xs text-slate-400">技术等级</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: GRADE_COLORS[bridge.currentGrade] }}>
                {bridge.currentGrade}级
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-amber-400" />
                <span className="text-xs text-slate-400">未修复病害</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">
                {diseaseLoading ? '-' : riskOverview?.unrepairedCount}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-red-400" />
                <span className="text-xs text-slate-400">严重病害</span>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {diseaseLoading ? '-' : riskOverview?.severeCount}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-blue-400" />
                <span className="text-xs text-slate-400">最近检测</span>
              </div>
              <p className="text-lg font-semibold text-blue-400">
                {inspectionLoading ? '-' : riskOverview?.latestInspectionDate}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench size={18} className="text-emerald-400" />
                <span className="text-xs text-slate-400">最近维修</span>
              </div>
              <p className="text-lg font-semibold text-emerald-400">
                {maintenanceLoading ? '-' : riskOverview?.latestMaintenanceDate}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-purple-400" />
                <span className="text-xs text-slate-400">累计维修费</span>
              </div>
              <p className="text-lg font-semibold text-purple-400">
                {maintenanceLoading ? '-' : `¥${(riskOverview?.totalMaintenanceCost || 0).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as TabKey)}
                      className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'border-cyan-500 text-cyan-600 bg-cyan-50/30'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                      <span
                        className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                          activeTab === tab.key
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-5 max-h-[500px] overflow-y-auto">
                {activeTab === 'inspections' && (
                  <div className="space-y-3">
                    {inspectionLoading ? (
                      <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-gray-400" size={24} /></div>
                    ) : inspections.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无检测记录</div>
                    ) : (
                      inspections.map((ins) => (
                        <div
                          key={ins.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-cyan-300 hover:bg-cyan-50/30 cursor-pointer transition-all"
                          onClick={() => navigate(`/inspections/${ins.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-blue-600" />
                              <span className="font-medium text-gray-800">{ins.type}</span>
                            </div>
                            <GradeBadge grade={ins.overallGrade} size="sm" />
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{ins.inspectionDate} · {ins.inspector}</span>
                            <span>评分: {ins.overallScore.toFixed(1)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'diseases' && (
                  <div className="space-y-3">
                    {diseaseLoading ? (
                      <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-gray-400" size={24} /></div>
                    ) : diseases.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无病害记录</div>
                    ) : (
                      diseases.map((dis) => (
                        <div
                          key={dis.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer transition-all"
                          onClick={() => navigate(`/diseases/${dis.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={16} style={{ color: SEVERITY_COLORS[dis.severity] }} />
                              <span className="font-medium text-gray-800">{dis.type}</span>
                            </div>
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${STATUS_COLORS[dis.status]}15`,
                                color: STATUS_COLORS[dis.status],
                              }}
                            >
                              {dis.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{dis.location} · {dis.severity}</span>
                            <span>{dis.recordedDate}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'maintenances' && (
                  <div className="space-y-3">
                    {maintenanceLoading ? (
                      <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-gray-400" size={24} /></div>
                    ) : maintenances.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无维修记录</div>
                    ) : (
                      maintenances.map((mai) => (
                        <div
                          key={mai.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-all"
                          onClick={() => navigate(`/maintenances/${mai.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Wrench size={16} className="text-emerald-600" />
                              <span className="font-medium text-gray-800">{mai.type}</span>
                            </div>
                            <span className="font-semibold text-emerald-600">¥{mai.cost.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{mai.contractor}</span>
                            <span>{mai.startDate} ~ {mai.endDate}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'patrols' && (
                  <div className="space-y-3">
                    {patrolLoading ? (
                      <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-gray-400" size={24} /></div>
                    ) : dailyPatrols.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无巡查记录</div>
                    ) : (
                      dailyPatrols.map((pat) => (
                        <div
                          key={pat.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transition-all"
                          onClick={() => navigate(`/patrols/${pat.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Footprints size={16} className="text-purple-600" />
                              <span className="font-medium text-gray-800">{pat.type}</span>
                            </div>
                            <span className="text-xs text-gray-500">{pat.date}</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{pat.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'events' && (
                  <div className="space-y-3">
                    {patrolLoading ? (
                      <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-gray-400" size={24} /></div>
                    ) : eventPatrols.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无突发事件记录</div>
                    ) : (
                      eventPatrols.map((pat) => (
                        <div
                          key={pat.id}
                          className="p-4 bg-red-50 rounded-lg border border-red-100 hover:border-red-300 cursor-pointer transition-all"
                          onClick={() => navigate(`/patrols/${pat.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap size={16} className="text-red-600" />
                              <span className="font-medium text-gray-800">{pat.eventType}</span>
                            </div>
                            <span className="text-xs text-gray-500">{pat.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{pat.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-cyan-600" />
                全生命周期时间轴
              </h3>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {lifecycleEvents.slice(0, 15).map((event) => (
                    <div
                      key={event.id}
                      className="relative pl-8 cursor-pointer group"
                      onClick={() => handleEventClick(event)}
                    >
                      <div
                        className="absolute left-1.5 top-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: getEventColor(event.type) }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-gray-100 transition-colors border border-gray-100 group-hover:border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span style={{ color: getEventColor(event.type) }}>
                              {getEventIcon(event.type)}
                            </span>
                            <span className="text-sm font-medium text-gray-800">{event.title}</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{event.date}</p>
                        <p className="text-xs text-gray-600">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <BridgeInfo bridge={bridge} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
