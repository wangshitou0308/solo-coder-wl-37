import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { BridgeType, Material, Grade } from '@/types';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';

const BRIDGE_TYPES: BridgeType[] = ['梁桥', '拱桥', '刚架桥', '悬索桥', '斜拉桥'];
const MATERIALS: Material[] = ['钢筋混凝土', '预应力混凝土', '钢', '钢混组合', '圬工'];

interface FormData {
  name: string;
  type: BridgeType;
  material: Material;
  buildYear: number;
  designLoad: string;
  spanCombination: string;
  managementUnit: string;
  maintenanceUnit: string;
  lat: number;
  lng: number;
  photos: string[];
  currentGrade: Grade;
}

const initialFormData: FormData = {
  name: '',
  type: '梁桥',
  material: '钢筋混凝土',
  buildYear: new Date().getFullYear(),
  designLoad: '',
  spanCombination: '',
  managementUnit: '',
  maintenanceUnit: '',
  lat: 0,
  lng: 0,
  photos: [],
  currentGrade: 'B',
};

export default function BridgeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const { fetchBridgeById, addBridge, updateBridge, loading } = useBridgeStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loadingBridge, setLoadingBridge] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadBridge();
    }
  }, [id]);

  const loadBridge = async () => {
    if (!id) return;
    setLoadingBridge(true);
    const bridge = await fetchBridgeById(id);
    if (bridge) {
      setFormData({
        name: bridge.name,
        type: bridge.type,
        material: bridge.material,
        buildYear: bridge.buildYear,
        designLoad: bridge.designLoad,
        spanCombination: bridge.spanCombination,
        managementUnit: bridge.managementUnit,
        maintenanceUnit: bridge.maintenanceUnit,
        lat: bridge.lat,
        lng: bridge.lng,
        photos: bridge.photos,
        currentGrade: bridge.currentGrade,
      });
    }
    setLoadingBridge(false);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = '请输入桥梁名称';
    if (!formData.buildYear || formData.buildYear < 1900 || formData.buildYear > new Date().getFullYear()) {
      newErrors.buildYear = '请输入有效的建成年份';
    }
    if (!formData.designLoad.trim()) newErrors.designLoad = '请输入设计荷载';
    if (!formData.spanCombination.trim()) newErrors.spanCombination = '请输入跨径组合';
    if (!formData.managementUnit.trim()) newErrors.managementUnit = '请输入管理单位';
    if (!formData.maintenanceUnit.trim()) newErrors.maintenanceUnit = '请输入养护单位';
    if (formData.lat < -90 || formData.lat > 90) newErrors.lat = '纬度范围应为 -90 到 90';
    if (formData.lng < -180 || formData.lng > 180) newErrors.lng = '经度范围应为 -180 到 180';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const bridgeData = {
      ...formData,
      buildYear: Number(formData.buildYear),
      lat: Number(formData.lat),
      lng: Number(formData.lng),
    };

    if (isEdit && id) {
      await updateBridge(id, bridgeData);
    } else {
      await addBridge(bridgeData);
    }
    navigate('/bridges');
  };

  const handleChange = (field: keyof FormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoUpload = () => {
    const mockPhotoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    handleChange('photos', [...formData.photos, mockPhotoUrl]);
  };

  const removePhoto = (index: number) => {
    handleChange('photos', formData.photos.filter((_, i) => i !== index));
  };

  if (loadingBridge) {
    return (
      <AppLayout title={isEdit ? '编辑桥梁' : '新增桥梁'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isEdit ? '编辑桥梁' : '新增桥梁'}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bridges')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? '编辑桥梁' : '新增桥梁'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">桥梁名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入桥梁名称"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">桥梁类型 *</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as BridgeType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {BRIDGE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结构材料 *</label>
              <select
                value={formData.material}
                onChange={(e) => handleChange('material', e.target.value as Material)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {MATERIALS.map((material) => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">建成年代 *</label>
              <input
                type="number"
                value={formData.buildYear}
                onChange={(e) => handleChange('buildYear', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.buildYear ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="如：2020"
              />
              {errors.buildYear && <p className="mt-1 text-sm text-red-600">{errors.buildYear}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">设计荷载 *</label>
              <input
                type="text"
                value={formData.designLoad}
                onChange={(e) => handleChange('designLoad', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.designLoad ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="如：公路-Ⅰ级"
              />
              {errors.designLoad && <p className="mt-1 text-sm text-red-600">{errors.designLoad}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">跨径组合 *</label>
              <input
                type="text"
                value={formData.spanCombination}
                onChange={(e) => handleChange('spanCombination', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.spanCombination ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="如：3×30m"
              />
              {errors.spanCombination && <p className="mt-1 text-sm text-red-600">{errors.spanCombination}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">管理单位 *</label>
              <input
                type="text"
                value={formData.managementUnit}
                onChange={(e) => handleChange('managementUnit', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.managementUnit ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入管理单位"
              />
              {errors.managementUnit && <p className="mt-1 text-sm text-red-600">{errors.managementUnit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">养护单位 *</label>
              <input
                type="text"
                value={formData.maintenanceUnit}
                onChange={(e) => handleChange('maintenanceUnit', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.maintenanceUnit ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入养护单位"
              />
              {errors.maintenanceUnit && <p className="mt-1 text-sm text-red-600">{errors.maintenanceUnit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">经度 *</label>
              <input
                type="number"
                step="0.000001"
                value={formData.lng}
                onChange={(e) => handleChange('lng', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.lng ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="如：116.397428"
              />
              {errors.lng && <p className="mt-1 text-sm text-red-600">{errors.lng}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">纬度 *</label>
              <input
                type="number"
                step="0.000001"
                value={formData.lat}
                onChange={(e) => handleChange('lat', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.lat ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="如：39.90923"
              />
              {errors.lat && <p className="mt-1 text-sm text-red-600">{errors.lat}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">技术状况等级</label>
              <select
                value={formData.currentGrade}
                onChange={(e) => handleChange('currentGrade', e.target.value as Grade)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">A - 完好</option>
                <option value="B">B - 良好</option>
                <option value="C">C - 合格</option>
                <option value="D">D - 不合格</option>
                <option value="E">E - 危险</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">照片（可选）</label>
              <div className="flex flex-wrap gap-3">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img src={photo} alt={`照片 ${index + 1}`} className="w-24 h-24 object-cover rounded" />
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
                  onClick={handlePhotoUpload}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Upload size={24} />
                  <span className="text-xs mt-1">添加照片</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/bridges')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
