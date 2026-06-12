import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDiseaseStore } from '@/stores/useDiseaseStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { DiseaseType, DiseaseSeverity } from '@/types';
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Ruler,
  Upload,
  X,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const DISEASE_TYPES: DiseaseType[] = ['裂缝', '剥落', '钢筋锈蚀', '变形', '渗漏', '其他'];
const SEVERITY_LEVELS: DiseaseSeverity[] = ['轻微', '一般', '较严重', '严重', '危险'];

const SEVERITY_DAYS: Record<DiseaseSeverity, number> = {
  轻微: 30,
  一般: 15,
  较严重: 7,
  严重: 3,
  危险: 1,
};

const SEVERITY_COLORS: Record<DiseaseSeverity, string> = {
  轻微: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  一般: 'bg-amber-100 text-amber-700 border-amber-300',
  较严重: 'bg-orange-100 text-orange-700 border-orange-300',
  严重: 'bg-red-100 text-red-700 border-red-300',
  危险: 'bg-red-200 text-red-800 border-red-400',
};

export default function DiseaseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  const { addDisease, fetchDiseaseById, loading } = useDiseaseStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const preselectedBridgeId = searchParams.get('bridgeId') || '';
  const preselectedInspectionId = searchParams.get('inspectionId') || '';

  const [formData, setFormData] = useState({
    bridgeId: preselectedBridgeId,
    inspectionId: preselectedInspectionId,
    type: '裂缝' as DiseaseType,
    location: '',
    size: '',
    length: '' as string | number,
    width: '' as string | number,
    depth: '' as string | number,
    severity: '一般' as DiseaseSeverity,
    description: '',
    recordedDate: new Date().toISOString().split('T')[0],
    deadline: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 15);
      return date.toISOString().split('T')[0];
    })(),
    photos: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  useEffect(() => {
    if (isEdit && id) {
      fetchDisease(id);
    }
  }, [isEdit, id]);

  const fetchDisease = async (diseaseId: string) => {
    const data = await fetchDiseaseById(diseaseId);
    if (data) {
      setFormData({
        bridgeId: data.bridgeId,
        inspectionId: data.inspectionId || '',
        type: data.type,
        location: data.location,
        size: data.size,
        length: data.length !== undefined ? data.length : '',
        width: data.width !== undefined ? data.width : '',
        depth: data.depth !== undefined ? data.depth : '',
        severity: data.severity,
        description: data.description,
        recordedDate: data.recordedDate,
        deadline: data.deadline,
        photos: data.photos || [],
      });
    }
  };

  useEffect(() => {
    const days = SEVERITY_DAYS[formData.severity];
    const deadline = new Date(formData.recordedDate);
    deadline.setDate(deadline.getDate() + days);
    setFormData((prev) => ({
      ...prev,
      deadline: deadline.toISOString().split('T')[0],
    }));
  }, [formData.severity, formData.recordedDate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.bridgeId) newErrors.bridgeId = '请选择桥梁';
    if (!formData.location.trim()) newErrors.location = '请输入病害位置';
    if (!formData.description.trim()) newErrors.description = '请输入病害描述';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: any = {
      bridgeId: formData.bridgeId,
      type: formData.type,
      location: formData.location,
      size: formData.size || `${formData.length || 0}cm × ${formData.width || 0}mm`,
      description: formData.description,
      severity: formData.severity,
      recordedDate: formData.recordedDate,
      deadline: formData.deadline,
      photos: formData.photos,
    };

    if (formData.inspectionId) {
      data.inspectionId = formData.inspectionId;
    }
    if (formData.length !== '') {
      data.length = Number(formData.length);
    }
    if (formData.width !== '') {
      data.width = Number(formData.width);
    }
    if (formData.depth !== '') {
      data.depth = Number(formData.depth);
    }

    await addDisease(data);
    navigate('/diseases');
  };

  const handleChange = (field: string, value: string | string[] | number) => {
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
    <AppLayout title={isEdit ? '编辑病害记录' : '新增病害记录'}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/diseases')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-800">病害基本信息</h2>
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
                  病害类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value as DiseaseType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {DISEASE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  严重程度 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {SEVERITY_LEVELS.map((s) => (
                    <label
                      key={s}
                      className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg cursor-pointer transition-colors text-xs font-medium border-2 ${
                        formData.severity === s
                          ? SEVERITY_COLORS[s]
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={s}
                        checked={formData.severity === s}
                        onChange={(e) =>
                          handleChange('severity', e.target.value as DiseaseSeverity)
                        }
                        className="sr-only"
                      />
                      {s}
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  处理期限：{SEVERITY_DAYS[formData.severity]}天
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  位置 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="如：主梁底部L/3处"
                    className={`pl-9 ${inputClass('location')}`}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  记录日期
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.recordedDate}
                    onChange={(e) => handleChange('recordedDate', e.target.value)}
                    className={`pl-9 ${inputClass('recordedDate')}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  处理截止日期
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    className={`pl-9 ${inputClass('deadline')}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Ruler className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">尺寸信息</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">长度 (cm)</label>
                <input
                  type="number"
                  value={formData.length}
                  onChange={(e) => handleChange('length', e.target.value)}
                  placeholder="如：25"
                  className={inputClass('length')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">宽度 (mm)</label>
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  placeholder="如：0.2"
                  className={inputClass('width')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">深度 (cm)</label>
                <input
                  type="number"
                  value={formData.depth}
                  onChange={(e) => handleChange('depth', e.target.value)}
                  placeholder="如：5"
                  className={inputClass('depth')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">尺寸描述</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  placeholder="如：长25cm，宽0.2mm"
                  className={inputClass('size')}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              病害描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="请详细描述病害情况..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">病害照片</h3>
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`病害照片 ${index + 1}`}
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
              onClick={() => navigate('/diseases')}
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
              {loading ? '保存中...' : '保存病害记录'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
