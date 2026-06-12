import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMaintenanceStore } from '@/stores/useMaintenanceStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { MaintenanceType, Disease } from '@/types';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';

const MAINTENANCE_TYPES: MaintenanceType[] = ['日常养护', '小修', '中修', '大修', '加固', '重建'];

interface FormData {
  bridgeId: string;
  diseaseId: string;
  type: MaintenanceType;
  startDate: string;
  endDate: string;
  contractor: string;
  cost: number;
  description: string;
  beforePhotos: string[];
  afterPhotos: string[];
  reviewDate: string;
  reviewResult: string;
}

const initialFormData: FormData = {
  bridgeId: '',
  diseaseId: '',
  type: '小修',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  contractor: '',
  cost: 0,
  description: '',
  beforePhotos: [],
  afterPhotos: [],
  reviewDate: '',
  reviewResult: '',
};

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const { addMaintenance, loading } = useMaintenanceStore();
  const { bridges, fetchBridges } = useBridgeStore();
  const { diseases, fetchDiseases } = useDiseaseStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    if (formData.bridgeId) {
      fetchDiseases({ bridgeId: formData.bridgeId });
    }
  }, [formData.bridgeId, fetchDiseases]);

  const bridgeDiseases = diseases.filter(d => d.bridgeId === formData.bridgeId && d.status !== '已修复');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.bridgeId) newErrors.bridgeId = '请选择桥梁';
    if (!formData.startDate) newErrors.startDate = '请选择开始日期';
    if (!formData.endDate) newErrors.endDate = '请选择结束日期';
    if (!formData.contractor.trim()) newErrors.contractor = '请输入施工单位';
    if (formData.cost <= 0) newErrors.cost = '请输入有效费用';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: any = {
      bridgeId: formData.bridgeId,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      contractor: formData.contractor,
      cost: Number(formData.cost),
      description: formData.description,
      beforePhotos: formData.beforePhotos,
      afterPhotos: formData.afterPhotos,
      reviewDate: formData.reviewDate || formData.endDate,
      reviewResult: formData.reviewResult || undefined,
      diseaseId: formData.diseaseId || undefined,
    };

    await addMaintenance(data);
    navigate('/maintenances');
  };

  const handleChange = (field: keyof FormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const addMockPhoto = (field: 'beforePhotos' | 'afterPhotos') => {
    handleChange(field, [...formData[field], `https://picsum.photos/400/300?random=${Date.now()}`]);
  };

  const removePhoto = (field: 'beforePhotos' | 'afterPhotos', index: number) => {
    handleChange(field, formData[field].filter((_, i) => i !== index));
  };

  const inputClass = (field: string) => `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
    errors[field] ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <AppLayout title="新增维修记录">
      <div className="space-y-6 max-w-6xl mx-auto">
        <button onClick={() => navigate('/maintenances')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">桥梁 <span className="text-red-500">*</span></label>
                <select value={formData.bridgeId} onChange={(e) => handleChange('bridgeId', e.target.value)} className={inputClass('bridgeId')}>
                  <option value="">请选择桥梁</option>
                  {bridges.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.bridgeId && <p className="mt-1 text-xs text-red-500">{errors.bridgeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联病害</label>
                <select value={formData.diseaseId} onChange={(e) => handleChange('diseaseId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" disabled={!formData.bridgeId}>
                  <option value="">无关联病害</option>
                  {bridgeDiseases.map(d => (
                    <option key={d.id} value={d.id}>{d.type} - {d.location} ({d.severity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">维修类型 <span className="text-red-500">*</span></label>
                <select value={formData.type} onChange={(e) => handleChange('type', e.target.value as MaintenanceType)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始日期 <span className="text-red-500">*</span></label>
                <input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className={inputClass('startDate')} />
                {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束日期 <span className="text-red-500">*</span></label>
                <input type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className={inputClass('endDate')} />
                {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">施工单位 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.contractor} onChange={(e) => handleChange('contractor', e.target.value)} placeholder="请输入施工单位" className={inputClass('contractor')} />
                {errors.contractor && <p className="mt-1 text-xs text-red-500">{errors.contractor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">费用(元) <span className="text-red-500">*</span></label>
                <input type="number" value={formData.cost || ''} onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)} placeholder="请输入维修费用" className={inputClass('cost')} />
                {errors.cost && <p className="mt-1 text-xs text-red-500">{errors.cost}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">复核检测日期</label>
                <input type="date" value={formData.reviewDate} onChange={(e) => handleChange('reviewDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">维修描述</h2>
            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="请输入维修施工详细描述..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">维修前照片</h3>
              <div className="flex flex-wrap gap-3">
                {formData.beforePhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img src={photo} alt={`维修前 ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                    <button type="button" onClick={() => removePhoto('beforePhotos', index)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addMockPhoto('beforePhotos')} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  <Upload size={24} />
                  <span className="text-xs mt-1">添加照片</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">维修后照片</h3>
              <div className="flex flex-wrap gap-3">
                {formData.afterPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img src={photo} alt={`维修后 ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                    <button type="button" onClick={() => removePhoto('afterPhotos', index)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addMockPhoto('afterPhotos')} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  <Upload size={24} />
                  <span className="text-xs mt-1">添加照片</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <button type="button" onClick={() => navigate('/maintenances')} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">取消</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? '保存中...' : '保存维修记录'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
