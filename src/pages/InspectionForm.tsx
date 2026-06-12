import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingTable } from '@/components/inspection/RatingTable';
import { GradeResult } from '@/components/inspection/GradeResult';
import { useInspectionStore } from '@/stores/useInspectionStore';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { Inspection, InspectionType, RATING_ITEMS } from '@/types';
import { calculateOverallGrade } from '@/utils/gradeCalculator';
import { ArrowLeft, Save, ClipboardCheck, Cloud, Calendar, User } from 'lucide-react';

const INSPECTION_TYPES: InspectionType[] = ['常规定期', '结构定期', '特殊检测'];
const WEATHER_OPTIONS = ['晴', '阴', '小雨', '中雨', '大雨', '雪', '雾'];

export default function InspectionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { addInspection, fetchInspectionById, loading } = useInspectionStore();
  const { bridges, fetchBridges } = useBridgeStore();

  const [formData, setFormData] = useState({
    bridgeId: '',
    type: '' as InspectionType | '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: '',
    weather: '晴',
    deckPavement: 0,
    expansionJoint: 0,
    bearing: 0,
    superstructure: 0,
    substructure: 0,
    railing: 0,
    drainage: 0,
    remarks: '',
    photos: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBridges();
    if (isEdit && id) fetchInspection(id);
  }, [isEdit, id]);

  const fetchInspection = async (inspectionId: string) => {
    const data = await fetchInspectionById(inspectionId);
    if (data) {
      setFormData({
        bridgeId: data.bridgeId,
        type: data.type,
        inspectionDate: data.inspectionDate,
        inspector: data.inspector,
        weather: data.weather,
        deckPavement: data.deckPavement,
        expansionJoint: data.expansionJoint,
        bearing: data.bearing,
        superstructure: data.superstructure,
        substructure: data.substructure,
        railing: data.railing,
        drainage: data.drainage,
        remarks: data.remarks || '',
        photos: data.photos || [],
      });
    }
  };

  const gradeResult = useMemo(() => {
    const inspection: Partial<Inspection> = {
      deckPavement: formData.deckPavement,
      expansionJoint: formData.expansionJoint,
      bearing: formData.bearing,
      superstructure: formData.superstructure,
      substructure: formData.substructure,
      railing: formData.railing,
      drainage: formData.drainage,
    };
    return calculateOverallGrade(inspection);
  }, [formData.deckPavement, formData.expansionJoint, formData.bearing, formData.superstructure, formData.substructure, formData.railing, formData.drainage]);

  const handleRatingChange = (key: string, value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.bridgeId) newErrors.bridgeId = '请选择桥梁';
    if (!formData.type) newErrors.type = '请选择检测类型';
    if (!formData.inspectionDate) newErrors.inspectionDate = '请选择检测日期';
    if (!formData.inspector.trim()) newErrors.inspector = '请输入检测人员';
    RATING_ITEMS.forEach(item => {
      if (!formData[item.key as keyof typeof formData]) {
        newErrors[item.key] = `请完成${item.label}评定`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await addInspection({
      bridgeId: formData.bridgeId,
      type: formData.type as InspectionType,
      inspectionDate: formData.inspectionDate,
      inspector: formData.inspector,
      weather: formData.weather,
      deckPavement: formData.deckPavement,
      expansionJoint: formData.expansionJoint,
      bearing: formData.bearing,
      superstructure: formData.superstructure,
      substructure: formData.substructure,
      railing: formData.railing,
      drainage: formData.drainage,
      remarks: formData.remarks,
      photos: formData.photos,
    });
    if (result) navigate('/inspections');
  };

  const inputClass = (field: string) => `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
    errors[field] ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <AppLayout title={isEdit ? '编辑检测记录' : '新增检测记录'}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <button onClick={() => navigate('/inspections')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">基本信息</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">桥梁 <span className="text-red-500">*</span></label>
                <select value={formData.bridgeId} onChange={(e) => setFormData(prev => ({ ...prev, bridgeId: e.target.value }))} className={inputClass('bridgeId')}>
                  <option value="">请选择桥梁</option>
                  {bridges.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.bridgeId && <p className="mt-1 text-xs text-red-500">{errors.bridgeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检测类型 <span className="text-red-500">*</span></label>
                <select value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as InspectionType }))} className={inputClass('type')}>
                  <option value="">请选择检测类型</option>
                  {INSPECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检测日期 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={formData.inspectionDate} onChange={(e) => setFormData(prev => ({ ...prev, inspectionDate: e.target.value }))} className={`pl-9 ${inputClass('inspectionDate')}`} />
                </div>
                {errors.inspectionDate && <p className="mt-1 text-xs text-red-500">{errors.inspectionDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">检测人员 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={formData.inspector} onChange={(e) => setFormData(prev => ({ ...prev, inspector: e.target.value }))} placeholder="请输入检测人员姓名" className={`pl-9 ${inputClass('inspector')}`} />
                </div>
                {errors.inspector && <p className="mt-1 text-xs text-red-500">{errors.inspector}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">天气</label>
                <div className="relative">
                  <Cloud className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={formData.weather} onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
                    {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">分项评定表</h2>
              <span className="text-xs text-red-500">* 为必选项目</span>
            </div>
            <RatingTable ratings={{
              deckPavement: formData.deckPavement,
              expansionJoint: formData.expansionJoint,
              bearing: formData.bearing,
              superstructure: formData.superstructure,
              substructure: formData.substructure,
              railing: formData.railing,
              drainage: formData.drainage,
            }} onChange={handleRatingChange} disabled={loading} />
            {Object.keys(errors).some(k => RATING_ITEMS.some(item => item.key === k)) && (
              <p className="text-xs text-red-500">请完成所有分项评定</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">综合评定结果</h2>
            </div>
            <GradeResult result={gradeResult} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea value={formData.remarks} onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))} placeholder="请输入检测备注信息..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>

          <div className="flex justify-end gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <button type="button" onClick={() => navigate('/inspections')} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">取消</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-4 h-4" />
              {loading ? '保存中...' : '保存检测记录'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
