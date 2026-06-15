import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDisposalTaskStore } from '@/stores/useDisposalTaskStore';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { useMaintenanceStore } from '@/stores/useMaintenanceStore';
import { DisposalTaskStatus, DISPOSAL_TASK_STATUS_COLORS } from '@/types';
import { ArrowLeft, Save, Loader2, Link, Wrench } from 'lucide-react';

const TASK_STATUSES: DisposalTaskStatus[] = ['待分派', '处理中', '待验收', '已完成'];

export default function DisposalTaskForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addTask, updateTask, fetchTaskById, linkMaintenance, loading } = useDisposalTaskStore();
  const { diseases, fetchDiseases } = useDiseaseStore();
  const { bridges, fetchBridges } = useBridgeStore();
  const { maintenances, fetchMaintenances } = useMaintenanceStore();

  const isEdit = !!id;
  const queryParams = new URLSearchParams(location.search);
  const diseaseIdFromQuery = queryParams.get('diseaseId');

  const [formData, setFormData] = useState({
    diseaseId: diseaseIdFromQuery || '',
    bridgeId: '',
    responsibleUnit: '',
    responsiblePerson: '',
    planFinishDate: '',
    disposalMeasures: '',
    progress: 0,
    status: '待分派' as DisposalTaskStatus,
    maintenanceId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [linkingMaintenance, setLinkingMaintenance] = useState(false);

  useEffect(() => {
    fetchDiseases();
    fetchBridges();
    fetchMaintenances();
  }, [fetchDiseases, fetchBridges, fetchMaintenances]);

  useEffect(() => {
    if (isEdit && id) {
      loadTask();
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (formData.diseaseId) {
      const disease = diseases.find(d => d.id === formData.diseaseId);
      if (disease) {
        setFormData(prev => ({ ...prev, bridgeId: disease.bridgeId }));
      }
    }
  }, [formData.diseaseId, diseases]);

  const loadTask = async () => {
    if (!id) return;
    const task = await fetchTaskById(id);
    if (task) {
      setFormData({
        diseaseId: task.diseaseId,
        bridgeId: task.bridgeId,
        responsibleUnit: task.responsibleUnit,
        responsiblePerson: task.responsiblePerson,
        planFinishDate: task.planFinishDate,
        disposalMeasures: task.disposalMeasures,
        progress: task.progress,
        status: task.status,
        maintenanceId: task.maintenanceId || '',
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.diseaseId) newErrors.diseaseId = '请选择关联病害';
    if (!formData.planFinishDate) newErrors.planFinishDate = '请选择计划完成日期';
    if (!formData.disposalMeasures.trim()) newErrors.disposalMeasures = '请输入处置措施';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateTask(id, formData);
      } else {
        await addTask({
          diseaseId: formData.diseaseId,
          responsibleUnit: formData.responsibleUnit,
          responsiblePerson: formData.responsiblePerson,
          planFinishDate: formData.planFinishDate,
          disposalMeasures: formData.disposalMeasures,
        });
      }
      navigate('/disposal-tasks');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkMaintenance = async () => {
    if (!id || !formData.maintenanceId) return;
    setLinkingMaintenance(true);
    try {
      await linkMaintenance(id, formData.maintenanceId);
      alert('维修记录关联成功');
    } finally {
      setLinkingMaintenance(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const getBridgeName = (bridgeId: string) => {
    const bridge = bridges.find(b => b.id === bridgeId);
    return bridge?.name || '-';
  };

  const diseaseOptions = diseases.filter(d => d.status !== '已修复');
  const maintenanceOptions = maintenances.filter(m => m.bridgeId === formData.bridgeId);

  return (
    <AppLayout title={isEdit ? '编辑处置任务' : '新建处置任务'}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/disposal-tasks')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? '编辑处置任务' : '新建处置任务'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关联病害 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.diseaseId}
                onChange={(e) => handleChange('diseaseId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm ${
                  errors.diseaseId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEdit}
              >
                <option value="">请选择病害</option>
                {diseaseOptions.map((disease) => (
                  <option key={disease.id} value={disease.id}>
                    {getBridgeName(disease.bridgeId)} - {disease.type} ({disease.location})
                  </option>
                ))}
              </select>
              {errors.diseaseId && (
                <p className="mt-1 text-sm text-red-500">{errors.diseaseId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关联桥梁
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {formData.bridgeId ? getBridgeName(formData.bridgeId) : '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                责任单位
              </label>
              <input
                type="text"
                value={formData.responsibleUnit}
                onChange={(e) => handleChange('responsibleUnit', e.target.value)}
                placeholder="请输入责任单位"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                责任人
              </label>
              <input
                type="text"
                value={formData.responsiblePerson}
                onChange={(e) => handleChange('responsiblePerson', e.target.value)}
                placeholder="请输入责任人姓名"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                计划完成日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.planFinishDate}
                onChange={(e) => handleChange('planFinishDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm ${
                  errors.planFinishDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.planFinishDate && (
                <p className="mt-1 text-sm text-red-500">{errors.planFinishDate}</p>
              )}
            </div>

            {isEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    任务状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    处置进度 ({formData.progress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleChange('progress', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                处置措施 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.disposalMeasures}
                onChange={(e) => handleChange('disposalMeasures', e.target.value)}
                rows={4}
                placeholder="请详细描述处置措施和方案"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none ${
                  errors.disposalMeasures ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.disposalMeasures && (
                <p className="mt-1 text-sm text-red-500">{errors.disposalMeasures}</p>
              )}
            </div>

            {isEdit && (
              <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  关联维修记录
                </h3>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">选择维修记录</label>
                    <select
                      value={formData.maintenanceId}
                      onChange={(e) => handleChange('maintenanceId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    >
                      <option value="">未关联</option>
                      {maintenanceOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.type} - {m.contractor} ({m.startDate})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleLinkMaintenance}
                    disabled={!formData.maintenanceId || linkingMaintenance}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {linkingMaintenance ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Link className="w-4 h-4" />
                    )}
                    关联
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/disposal-tasks')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? '保存修改' : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
