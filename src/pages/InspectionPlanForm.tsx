import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useInspectionPlanStore } from '@/stores/useInspectionPlanStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { InspectionType, InspectionPlan } from '@/types';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const INSPECTION_TYPES: InspectionType[] = ['常规定期', '结构定期', '特殊检测'];

export default function InspectionPlanForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addPlan, updatePlan, fetchPlanById, loading } = useInspectionPlanStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const isEdit = !!id;

  const [formData, setFormData] = useState({
    bridgeId: '',
    type: '常规定期' as InspectionType,
    planDate: '',
    inspector: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    if (isEdit && id) {
      loadPlan();
    }
  }, [id, isEdit]);

  const loadPlan = async () => {
    if (!id) return;
    const plan = await fetchPlanById(id);
    if (plan) {
      setFormData({
        bridgeId: plan.bridgeId,
        type: plan.type,
        planDate: plan.planDate,
        inspector: plan.inspector || '',
        description: plan.description,
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.bridgeId) newErrors.bridgeId = '请选择桥梁';
    if (!formData.planDate) newErrors.planDate = '请选择计划日期';
    if (!formData.description.trim()) newErrors.description = '请输入计划描述';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updatePlan(id, formData);
      } else {
        await addPlan(formData);
      }
      navigate('/inspection-plans');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <AppLayout title={isEdit ? '编辑检测计划' : '新建检测计划'}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inspection-plans')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? '编辑检测计划' : '新建检测计划'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                桥梁 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bridgeId}
                onChange={(e) => handleChange('bridgeId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm ${
                  errors.bridgeId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEdit}
              >
                <option value="">请选择桥梁</option>
                {bridges.map((bridge) => (
                  <option key={bridge.id} value={bridge.id}>
                    {bridge.name}
                  </option>
                ))}
              </select>
              {errors.bridgeId && (
                <p className="mt-1 text-sm text-red-500">{errors.bridgeId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                检测类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              >
                {INSPECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                计划日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.planDate}
                onChange={(e) => handleChange('planDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm ${
                  errors.planDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.planDate && (
                <p className="mt-1 text-sm text-red-500">{errors.planDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                负责人
              </label>
              <input
                type="text"
                value={formData.inspector}
                onChange={(e) => handleChange('inspector', e.target.value)}
                placeholder="请输入负责人姓名"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                计划描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                placeholder="请输入检测计划的详细描述"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/inspection-plans')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? '保存修改' : '创建计划'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
