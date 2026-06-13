import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePatrolStore } from '@/stores/usePatrolStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { PatrolType, EventType } from '@/types';
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Upload,
  X,
  AlertTriangle,
  Footprints,
  Zap,
  FileText,
  RefreshCw,
} from 'lucide-react';

const PATROL_TYPES: PatrolType[] = ['日常巡查', '突发事件'];
const EVENT_TYPES: EventType[] = ['车辆撞击', '洪水冲刷', '超重车通行', '地震', '其他'];

export default function PatrolForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { addPatrol, updatePatrol, fetchPatrolById, loading } = usePatrolStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [formData, setFormData] = useState({
    bridgeId: '',
    type: '日常巡查' as PatrolType,
    eventType: '' as EventType | '',
    date: new Date().toISOString().split('T')[0],
    recorder: '',
    description: '',
    emergencyMeasures: '',
    photos: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBridges();
    if (isEdit && id) {
      loadPatrol(id);
    }
  }, [fetchBridges, isEdit, id]);

  const loadPatrol = async (patrolId: string) => {
    const data = await fetchPatrolById(patrolId);
    if (data) {
      setFormData({
        bridgeId: data.bridgeId,
        type: data.type,
        eventType: data.eventType || '',
        date: data.date,
        recorder: data.recorder,
        description: data.description,
        emergencyMeasures: data.emergencyMeasures || '',
        photos: data.photos || [],
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.bridgeId) newErrors.bridgeId = '请选择桥梁';
    if (!formData.date) newErrors.date = '请选择日期';
    if (!formData.recorder.trim()) newErrors.recorder = '请输入记录人员';
    if (!formData.description.trim()) newErrors.description = '请输入巡查描述';
    if (formData.type === '突发事件' && !formData.eventType) {
      newErrors.eventType = '请选择事件类型';
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
      date: formData.date,
      recorder: formData.recorder,
      description: formData.description,
      photos: formData.photos,
    };

    if (formData.type === '突发事件') {
      data.eventType = formData.eventType;
      if (formData.emergencyMeasures.trim()) {
        data.emergencyMeasures = formData.emergencyMeasures;
      }
    }

    let result;
    if (isEdit && id) {
      result = await updatePatrol(id, data);
    } else {
      result = await addPatrol(data);
    }
    if (result) navigate('/patrols');
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addMockPhoto = () => {
    handleChange('photos', [
      ...formData.photos,
      `https://picsum.photos/400/300?random=${Date.now()}`,
    ]);
  };

  const removePhoto = (index: number) => {
    handleChange(
      'photos',
      formData.photos.filter((_, i) => i !== index)
    );
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <AppLayout title={isEdit ? '编辑巡查记录' : '新增巡查记录'}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/patrols')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              {formData.type === '突发事件' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Footprints className="w-5 h-5 text-blue-600" />
              )}
              <h2 className="text-lg font-semibold text-gray-800">基本信息</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  桥梁 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bridgeId}
                  onChange={(e) => handleChange('bridgeId', e.target.value)}
                  className={inputClass('bridgeId')}
                >
                  <option value="">请选择桥梁</option>
                  {bridges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.bridgeId && (
                  <p className="mt-1 text-xs text-red-500">{errors.bridgeId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  巡查类型 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {PATROL_TYPES.map((t) => (
                    <label
                      key={t}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                        formData.type === t
                          ? t === '突发事件'
                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                            : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t}
                        checked={formData.type === t}
                        onChange={(e) => handleChange('type', e.target.value as PatrolType)}
                        className="sr-only"
                      />
                      {t === '突发事件' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Footprints className="w-4 h-4" />
                      )}
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              {formData.type === '突发事件' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    事件类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => handleChange('eventType', e.target.value)}
                    className={inputClass('eventType')}
                  >
                    <option value="">请选择事件类型</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.eventType && (
                    <p className="mt-1 text-xs text-red-500">{errors.eventType}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={`pl-9 ${inputClass('date')}`}
                  />
                </div>
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  记录人员 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.recorder}
                    onChange={(e) => handleChange('recorder', e.target.value)}
                    placeholder="请输入记录人员姓名"
                    className={`pl-9 ${inputClass('recorder')}`}
                  />
                </div>
                {errors.recorder && (
                  <p className="mt-1 text-xs text-red-500">{errors.recorder}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              巡查描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="请详细描述巡查发现的情况..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {formData.type === '突发事件' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <label className="block text-sm font-medium text-gray-700">
                  应急处理措施
                </label>
              </div>
              <textarea
                value={formData.emergencyMeasures}
                onChange={(e) => handleChange('emergencyMeasures', e.target.value)}
                placeholder="请描述已采取的应急处理措施..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">现场照片</h3>
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`现场照片 ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMockPhoto}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <Upload size={24} />
                <span className="text-xs mt-1">添加照片</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/patrols')}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? '保存中...' : '保存记录'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
