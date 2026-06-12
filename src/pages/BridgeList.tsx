import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GradeBadge } from '@/components/common/GradeBadge';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { BridgeType, Material, Grade, BRIDGE_TYPE_COLORS } from '@/types';
import { Search, Plus, Filter, Eye, Edit2, Trash2, X } from 'lucide-react';

const BRIDGE_TYPES: BridgeType[] = ['梁桥', '拱桥', '刚架桥', '悬索桥', '斜拉桥'];
const MATERIALS: Material[] = ['钢筋混凝土', '预应力混凝土', '钢', '钢混组合', '圬工'];
const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E'];

export default function BridgeList() {
  const navigate = useNavigate();
  const { bridges, loading, error, fetchBridges, deleteBridge } = useBridgeStore();
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<BridgeType | ''>('');
  const [materialFilter, setMaterialFilter] = useState<Material | ''>('');
  const [gradeFilter, setGradeFilter] = useState<Grade | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBridges();
  }, [typeFilter, materialFilter, gradeFilter, keyword]);

  const loadBridges = () => {
    fetchBridges({
      type: typeFilter || undefined,
      material: materialFilter || undefined,
      grade: gradeFilter || undefined,
      keyword: keyword || undefined,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBridges();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这座桥梁吗？')) {
      await deleteBridge(id);
    }
  };

  const clearFilters = () => {
    setTypeFilter('');
    setMaterialFilter('');
    setGradeFilter('');
    setKeyword('');
  };

  const hasFilters = typeFilter || materialFilter || gradeFilter || keyword;

  return (
    <AppLayout title="桥梁档案管理" onRefresh={loadBridges}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索桥梁名称、管理单位..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                hasFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              筛选
            </button>
          </form>
          <button
            onClick={() => navigate('/bridges/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            新增桥梁
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">筛选条件</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X size={14} />
                  清除筛选
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">桥梁类型</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as BridgeType | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部类型</option>
                  {BRIDGE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结构材料</label>
                <select
                  value={materialFilter}
                  onChange={(e) => setMaterialFilter(e.target.value as Material | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部材料</option>
                  {MATERIALS.map((material) => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">技术状况等级</label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value as Grade | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部等级</option>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结构材料</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">建成年代</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">技术状况</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">管理单位</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">加载中...</td>
                  </tr>
                ) : bridges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">暂无桥梁数据</td>
                  </tr>
                ) : (
                  bridges.map((bridge) => (
                    <tr key={bridge.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{bridge.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 text-xs font-medium rounded text-white"
                          style={{ backgroundColor: BRIDGE_TYPE_COLORS[bridge.type] }}
                        >
                          {bridge.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bridge.material}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bridge.buildYear}年</td>
                      <td className="px-4 py-3">
                        <GradeBadge grade={bridge.currentGrade} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">{bridge.managementUnit}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/bridges/${bridge.id}`)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="查看"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/bridges/${bridge.id}/edit`)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="编辑"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(bridge.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
