import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, AlertTriangle, Eye, RefreshCw, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { Disease, DiseaseSeverity, DiseaseStatus, SEVERITY_COLORS } from '@/types';
import { formatDate, getDaysOverdue } from '@/utils/dateUtils';

const DiseaseList: React.FC = () => {
  const navigate = useNavigate();
  const { diseases, loading, error, fetchDiseases } = useDiseaseStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [bridgeId, setBridgeId] = useState<string>('');
  const [severity, setSeverity] = useState<DiseaseSeverity | ''>('');
  const [status, setStatus] = useState<DiseaseStatus | ''>('');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    const filters: {
      bridgeId?: string;
      severity?: DiseaseSeverity;
      status?: DiseaseStatus;
      isOverdue?: boolean;
    } = {};
    if (bridgeId) filters.bridgeId = bridgeId;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (onlyOverdue) filters.isOverdue = true;
    fetchDiseases(filters);
  }, [fetchDiseases, bridgeId, severity, status, onlyOverdue]);

  const sortedDiseases = useMemo(() => {
    const severityOrder: DiseaseSeverity[] = ['危险', '严重', '较严重', '一般', '轻微'];
    return [...diseases].sort((a, b) => {
      const aOverdue = a.status !== '已修复' && getDaysOverdue(a.deadline) > 0;
      const bOverdue = b.status !== '已修复' && getDaysOverdue(b.deadline) > 0;
      const aDanger = aOverdue && (a.severity === '严重' || a.severity === '危险');
      const bDanger = bOverdue && (b.severity === '严重' || b.severity === '危险');

      if (aDanger && !bDanger) return -1;
      if (!aDanger && bDanger) return 1;

      const aSeverityIndex = severityOrder.indexOf(a.severity);
      const bSeverityIndex = severityOrder.indexOf(b.severity);
      if (aSeverityIndex !== bSeverityIndex) return aSeverityIndex - bSeverityIndex;

      return new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime();
    });
  }, [diseases]);

  const getBridgeName = (id: string) => {
    return bridges.find((b) => b.id === id)?.name || '未知桥梁';
  };

  const isOverdueDanger = (disease: Disease) => {
    const overdue = disease.status !== '已修复' && getDaysOverdue(disease.deadline) > 0;
    return overdue && (disease.severity === '严重' || disease.severity === '危险');
  };

  const handleRefresh = () => {
    const filters: {
      bridgeId?: string;
      severity?: DiseaseSeverity;
      status?: DiseaseStatus;
      isOverdue?: boolean;
    } = {};
    if (bridgeId) filters.bridgeId = bridgeId;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (onlyOverdue) filters.isOverdue = true;
    fetchDiseases(filters);
  };

  return (
    <AppLayout title="病害追踪" onRefresh={handleRefresh}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-500" />
            <span className="font-medium text-gray-700">筛选条件</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">桥梁</label>
              <select
                value={bridgeId}
                onChange={(e) => setBridgeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              <label className="block text-sm font-medium text-gray-600 mb-1">严重程度</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as DiseaseSeverity | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">全部程度</option>
                <option value="轻微">轻微</option>
                <option value="一般">一般</option>
                <option value="较严重">较严重</option>
                <option value="严重">严重</option>
                <option value="危险">危险</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">处理状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DiseaseStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">全部状态</option>
                <option value="已记录">已记录</option>
                <option value="处理中">处理中</option>
                <option value="已修复">已修复</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOverdue}
                  onChange={(e) => setOnlyOverdue(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-red-500" />
                  仅显示超期未处理
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            共 <span className="font-semibold text-gray-700">{sortedDiseases.length}</span> 条记录
          </div>
          <button
            onClick={() => navigate('/diseases/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            新增病害记录
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-blue-500" />
              加载中...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : sortedDiseases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">暂无病害记录</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      桥梁名称
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      病害类型
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      位置
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      严重程度
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      处理状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      记录日期
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      截止日期
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedDiseases.map((disease) => {
                    const overdue = disease.status !== '已修复' && getDaysOverdue(disease.deadline) > 0;
                    const daysOverdue = getDaysOverdue(disease.deadline);
                    const danger = isOverdueDanger(disease);

                    return (
                      <tr
                        key={disease.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          danger ? 'overdue-danger-row' : ''
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getBridgeName(disease.bridgeId)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {disease.type}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {disease.location}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge severity={disease.severity} size="sm" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={disease.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(disease.recordedDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className={`text-sm ${
                                overdue ? 'text-red-600 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {formatDate(disease.deadline)}
                            </span>
                            {overdue && (
                              <span
                                className="text-xs font-medium"
                                style={{ color: SEVERITY_COLORS['严重'] }}
                              >
                                超期 {daysOverdue} 天
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/diseases/${disease.id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            详情
                          </button>
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
};

export default DiseaseList;
