export type BridgeType = '梁桥' | '拱桥' | '刚架桥' | '悬索桥' | '斜拉桥';
export type Material = '钢筋混凝土' | '预应力混凝土' | '钢' | '钢混组合' | '圬工';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';
export type InspectionType = '常规定期' | '结构定期' | '特殊检测';
export type DiseaseType = '裂缝' | '剥落' | '钢筋锈蚀' | '变形' | '渗漏' | '其他';
export type DiseaseSeverity = '轻微' | '一般' | '较严重' | '严重' | '危险';
export type DiseaseStatus = '已记录' | '处理中' | '已修复';
export type MaintenanceType = '日常养护' | '小修' | '中修' | '大修' | '加固' | '重建';
export type PatrolType = '日常巡查' | '突发事件';
export type EventType = '车辆撞击' | '洪水冲刷' | '超重车通行' | '地震' | '其他';

export interface Bridge {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  bridgeId: string;
  type: InspectionType;
  inspectionDate: string;
  inspector: string;
  weather: string;
  deckPavement: number;
  expansionJoint: number;
  bearing: number;
  superstructure: number;
  substructure: number;
  railing: number;
  drainage: number;
  overallScore: number;
  overallGrade: Grade;
  remarks: string;
  photos: string[];
}

export interface DiseaseHistory {
  id: string;
  inspectionId: string;
  inspectionDate: string;
  length?: number;
  width?: number;
  depth?: number;
  description: string;
  photos: string[];
}

export interface Disease {
  id: string;
  bridgeId: string;
  inspectionId?: string;
  type: DiseaseType;
  location: string;
  size: string;
  length?: number;
  width?: number;
  depth?: number;
  severity: DiseaseSeverity;
  status: DiseaseStatus;
  description: string;
  photos: string[];
  recordedDate: string;
  assignedDate?: string;
  repairedDate?: string;
  deadline: string;
  isOverdue: boolean;
  historyRecords: DiseaseHistory[];
}

export interface Maintenance {
  id: string;
  bridgeId: string;
  diseaseId?: string;
  type: MaintenanceType;
  startDate: string;
  endDate: string;
  contractor: string;
  cost: number;
  description: string;
  beforePhotos: string[];
  afterPhotos: string[];
  reviewDate: string;
  reviewResult?: string;
  isReviewed: boolean;
}

export interface Patrol {
  id: string;
  bridgeId: string;
  type: PatrolType;
  eventType?: EventType;
  date: string;
  recorder: string;
  description: string;
  emergencyMeasures?: string;
  photos: string[];
  hasGeneratedInspection: boolean;
  generatedInspectionId?: string;
}

export interface DashboardStats {
  totalBridges: number;
  gradeDistribution: Record<string, number>;
  overdueInspections: { bridge: Bridge; daysOverdue: number }[];
  overdueDiseases: { disease: Disease; bridge: Bridge; daysOverdue: number }[];
  ageDistribution: { range: string; count: number }[];
  annualCostTrend: { year: number; cost: number }[];
  inspectionCompletionRate: { type: string; completed: number; total: number }[];
  highRiskBridges: Bridge[];
}

export interface RatingItem {
  key: keyof Inspection;
  label: string;
  description: string;
}

export const RATING_ITEMS: RatingItem[] = [
  { key: 'deckPavement', label: '桥面铺装', description: '桥面铺装层的完好程度' },
  { key: 'expansionJoint', label: '伸缩缝', description: '伸缩缝的完好与功能状态' },
  { key: 'bearing', label: '支座', description: '支座的完好与工作状态' },
  { key: 'superstructure', label: '上部结构', description: '上部承重结构的完好状态' },
  { key: 'substructure', label: '下部结构', description: '桥台、桥墩及基础的完好状态' },
  { key: 'railing', label: '栏杆', description: '栏杆的完好与安全状态' },
  { key: 'drainage', label: '排水设施', description: '排水系统的完好与功能状态' },
];

export const RATING_LEVELS = [
  { value: 1, label: '完好', description: '完好无损，功能正常' },
  { value: 2, label: '良好', description: '轻微缺损，不影响使用' },
  { value: 3, label: '较差', description: '中等缺损，影响使用功能' },
  { value: 4, label: '差', description: '严重缺损，影响结构安全' },
  { value: 5, label: '危险', description: '危险状态，不能正常使用' },
];

export const GRADE_COLORS: Record<Grade, string> = {
  A: '#10b981',
  B: '#f59e0b',
  C: '#f97316',
  D: '#ef4444',
  E: '#1f2937',
};

export const GRADE_LABELS: Record<Grade, string> = {
  A: '完好',
  B: '良好',
  C: '合格',
  D: '不合格',
  E: '危险',
};

export const BRIDGE_TYPE_COLORS: Record<BridgeType, string> = {
  '梁桥': '#3b82f6',
  '拱桥': '#8b5cf6',
  '刚架桥': '#ec4899',
  '悬索桥': '#14b8a6',
  '斜拉桥': '#f43f5e',
};

export const SEVERITY_COLORS: Record<DiseaseSeverity, string> = {
  '轻微': '#10b981',
  '一般': '#f59e0b',
  '较严重': '#f97316',
  '严重': '#ef4444',
  '危险': '#7f1d1d',
};

export const STATUS_COLORS: Record<DiseaseStatus, string> = {
  '已记录': '#3b82f6',
  '处理中': '#f59e0b',
  '已修复': '#10b981',
};
