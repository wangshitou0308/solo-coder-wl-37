import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  AppLayout,
} from '@/components/layout/AppLayout';
import { GradeBadge } from '@/components/common/GradeBadge';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import {
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  Activity,
  ShieldAlert,
  RefreshCw,
  CalendarClock,
  FileX,
  Target,
  AlertOctagon,
  Hourglass,
  CheckSquare,
} from 'lucide-react';
import { Grade, GRADE_COLORS, GRADE_LABELS } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Home() {
  const navigate = useNavigate();
  const { stats, loading, fetchStats } = useDashboardStore();
  const { bridges, fetchBridges } = useBridgeStore();

  useEffect(() => {
    fetchStats();
    fetchBridges();
  }, [fetchStats, fetchBridges]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    const totalA = stats.gradeDistribution['A'] || 0;
    const totalD = (stats.gradeDistribution['D'] || 0) + (stats.gradeDistribution['E'] || 0);
    return [
      {
        label: '桥梁总数',
        value: stats.totalBridges,
        icon: Building2,
        color: 'from-cyan-500 to-blue-600',
        textColor: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        trend: `${totalA}座A级`,
        trendIcon: TrendingUp,
        trendColor: 'text-emerald-600',
      },
      {
        label: '重点关注',
        value: totalD,
        icon: ShieldAlert,
        color: 'from-red-500 to-rose-600',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        trend: 'D/E级桥梁',
        trendIcon: AlertTriangle,
        trendColor: 'text-red-600',
      },
      {
        label: '超期告警',
        value: stats.overdueDiseases.length,
        icon: AlertTriangle,
        color: 'from-amber-500 to-orange-600',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        trend: '病害超期未处理',
        trendIcon: Clock,
        trendColor: 'text-amber-600',
      },
      {
        label: '年度维修费用',
        value: (() => {
          const currentYear = new Date().getFullYear();
          const thisYear = stats.annualCostTrend.find(y => y.year === currentYear);
          return thisYear ? `¥${(thisYear.cost / 10000).toFixed(1)}万` : '¥0万';
        })(),
        icon: Wrench,
        color: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        trend: '本年度累计',
        trendIcon: Activity,
        trendColor: 'text-emerald-600',
      },
    ];
  }, [stats]);

  const inspectionPlanCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: '本月待检计划',
        value: stats.monthlyPendingPlans,
        icon: CalendarClock,
        color: 'from-blue-500 to-cyan-600',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        label: '逾期检测计划',
        value: stats.overduePlans,
        icon: FileX,
        color: 'from-rose-500 to-red-600',
        textColor: 'text-rose-600',
        bgColor: 'bg-rose-50',
      },
      {
        label: '计划完成率',
        value: `${stats.planCompletionRate}%`,
        icon: Target,
        color: 'from-emerald-500 to-green-600',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      },
    ];
  }, [stats]);

  const disposalCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: '待处置严重病害',
        value: stats.pendingSevereDiseases,
        icon: AlertOctagon,
        color: 'from-orange-500 to-amber-600',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
      {
        label: '即将超期任务',
        value: stats.upcomingOverdueTasks,
        icon: Hourglass,
        color: 'from-amber-500 to-yellow-600',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
      },
      {
        label: '处置完成率',
        value: `${stats.disposalCompletionRate}%`,
        icon: CheckSquare,
        color: 'from-teal-500 to-emerald-600',
        textColor: 'text-teal-600',
        bgColor: 'bg-teal-50',
      },
    ];
  }, [stats]);

  const gradePieData = useMemo(() => {
    if (!stats) return null;
    const labels = ['A', 'B', 'C', 'D', 'E'] as Grade[];
    return {
      labels: labels.map(g => `${g}级 - ${GRADE_LABELS[g]}`),
      datasets: [{
        data: labels.map(g => stats.gradeDistribution[g] || 0),
        backgroundColor: labels.map(g => GRADE_COLORS[g]),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8,
      }],
    };
  }, [stats]);

  const ageBarData = useMemo(() => {
    if (!stats) return null;
    return {
      labels: stats.ageDistribution.map(d => d.range),
      datasets: [{
        label: '桥梁数量',
        data: stats.ageDistribution.map(d => d.count),
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      }],
    };
  }, [stats]);

  const costLineData = useMemo(() => {
    if (!stats) return null;
    return {
      labels: stats.annualCostTrend.map(d => `${d.year}年`),
      datasets: [{
        label: '维修费用(万元)',
        data: stats.annualCostTrend.map(d => Math.round(d.cost / 10000)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }],
    };
  }, [stats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
      },
    },
  };

  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 11 },
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { size: 11 },
          stepSize: 1,
        },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { size: 11 },
          callback: (value: any) => `${value}万`,
        },
      },
    },
  };

  if (loading && !stats) {
    return (
      <AppLayout title="数据看板">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-cyan-600" size={32} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="数据看板" onRefresh={() => { fetchStats(); fetchBridges(); }}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <card.trendIcon size={14} className={card.trendColor} />
                    <span className={`text-xs font-medium ${card.trendColor}`}>{card.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <card.icon size={24} className={card.textColor} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardCheck size={18} className="text-blue-600" />
                检测计划统计
              </h3>
              <button
                onClick={() => navigate('/inspection-plans')}
                className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
              >
                查看全部 <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {inspectionPlanCards.map((card, idx) => (
                <div key={idx} className="text-center p-4 rounded-lg bg-gray-50/50">
                  <div className={`inline-flex p-2.5 rounded-xl ${card.bgColor} mb-2`}>
                    <card.icon size={20} className={card.textColor} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                病害处置统计
              </h3>
              <button
                onClick={() => navigate('/disposal-tasks')}
                className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
              >
                查看全部 <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {disposalCards.map((card, idx) => (
                <div key={idx} className="text-center p-4 rounded-lg bg-gray-50/50">
                  <div className={`inline-flex p-2.5 rounded-xl ${card.bgColor} mb-2`}>
                    <card.icon size={20} className={card.textColor} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-cyan-600" />
                技术状况等级分布
              </h3>
            </div>
            <div className="h-64">
              {gradePieData && <Pie data={gradePieData} options={pieOptions} />}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-cyan-600" />
                桥梁年龄分布
              </h3>
            </div>
            <div className="h-64">
              {ageBarData && <Bar data={ageBarData} options={barOptions} />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Wrench size={18} className="text-emerald-600" />
                年度维修费用趋势
              </h3>
            </div>
            <div className="h-64">
              {costLineData && <Line data={costLineData} options={lineOptions} />}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardCheck size={18} className="text-blue-600" />
                检测计划完成率
              </h3>
            </div>
            <div className="space-y-5 mt-2">
              {stats?.inspectionCompletionRate.map((item) => {
                const rate = item.total > 0 ? Math.min(100, Math.round((item.completed / item.total) * 100)) : 0;
                const color = rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{item.type}</span>
                      <span className="text-sm text-gray-500">
                        {item.completed}/{item.total} ({rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-600" />
                D/E级重点关注桥梁
              </h3>
              <button
                onClick={() => navigate('/bridges?grade=D')}
                className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
              >
                查看全部 <ChevronRight size={14} />
              </button>
            </div>
            {stats && stats.highRiskBridges.length === 0 ? (
              <div className="text-center py-8 text-gray-400">暂无重点关注桥梁</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats?.highRiskBridges.slice(0, 8).map((bridge) => (
                  <div
                    key={bridge.id}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded px-2"
                    onClick={() => navigate(`/bridges/${bridge.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <GradeBadge grade={bridge.currentGrade} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{bridge.name}</p>
                        <p className="text-xs text-gray-400">{bridge.type} · {bridge.buildYear}年</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                超期未检测桥梁
              </h3>
              <button
                onClick={() => navigate('/inspections')}
                className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
              >
                查看全部 <ChevronRight size={14} />
              </button>
            </div>
            {stats && stats.overdueInspections.length === 0 ? (
              <div className="text-center py-8 text-gray-400">暂无超期检测</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats?.overdueInspections.slice(0, 8).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded px-2"
                    onClick={() => navigate(`/bridges/${item.bridge.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.bridge.name}</p>
                      <p className="text-xs text-gray-400">{item.bridge.type}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      超期{item.daysOverdue}天
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {stats && stats.overdueDiseases.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-50 px-6 py-3 flex items-center gap-2 border-b border-red-200">
              <AlertTriangle size={18} className="text-red-600 danger-blink-icon" />
              <h3 className="text-base font-semibold text-red-800">严重病害超期未处理告警</h3>
              <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                {stats.overdueDiseases.length} 条告警
              </span>
            </div>
            <div className="divide-y divide-red-50">
              {stats.overdueDiseases.slice(0, 6).map((item) => (
                <div
                  key={item.disease.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-red-50/50 cursor-pointer transition-colors overdue-danger-row"
                  onClick={() => navigate(`/diseases/${item.disease.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.bridge?.name || '未知桥梁'} - {item.disease.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.disease.location} · {item.disease.severity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-600">
                      超期{item.daysOverdue}天
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
            {stats.overdueDiseases.length > 6 && (
              <div className="px-6 py-3 text-center border-t border-red-100">
                <button
                  onClick={() => navigate('/diseases?overdue=true')}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  查看全部 {stats.overdueDiseases.length} 条告警
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .danger-blink-icon {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </AppLayout>
  );
}
