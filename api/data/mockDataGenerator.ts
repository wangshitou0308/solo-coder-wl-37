import {
  Bridge,
  Inspection,
  Disease,
  Maintenance,
  Patrol,
  Grade,
  DiseaseSeverity,
  DiseaseStatus,
  BridgeType,
  Material,
  InspectionType,
  DiseaseType,
  MaintenanceType,
  EventType,
  InspectionPlan,
  InspectionPlanStatus,
  DisposalTask,
  DisposalTaskStatus,
} from '../../src/types';
import { calculateOverallGrade } from '../../src/utils/gradeCalculator';
import { formatDate, addDays, getCurrentYear } from '../../src/utils/dateUtils';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BRIDGE_NAMES = [
  '长江大桥', '黄河大桥', '珠江大桥', '松花江大桥', '钱塘江大桥',
  '杨浦大桥', '南浦大桥', '卢浦大桥', '徐浦大桥', '闵浦大桥',
  '南京长江大桥', '武汉长江大桥', '荆州长江大桥', '宜昌长江大桥', '重庆长江大桥',
  '天津海河大桥', '广州虎门大桥', '深圳湾大桥', '杭州湾大桥', '青岛海湾大桥',
  '北京永定河大桥', '成都锦江大桥', '西安灞河大桥', '沈阳浑河大桥', '哈尔滨松花江大桥',
  '长春伊通河大桥', '济南黄河大桥', '郑州黄河大桥', '石家庄滹沱河大桥', '太原汾河大桥',
];

const BRIDGE_TYPES: string[] = ['梁桥', '拱桥', '刚架桥', '悬索桥', '斜拉桥'];
const MATERIALS: string[] = ['钢筋混凝土', '预应力混凝土', '钢', '钢混组合', '圬工'];
const DESIGN_LOADS = ['公路-I级', '公路-II级', '城市-A级', '城市-B级', '汽车-20级'];
const MANAGEMENT_UNITS = ['市市政工程管理处', '市交通运输局', '区建设委员会', '市桥梁管理所'];
const MAINTENANCE_UNITS = ['市桥梁养护有限公司', '市政工程维修中心', '交通建设工程公司'];
const INSPECTORS = ['张工', '李工', '王工', '刘工', '陈工', '赵工'];
const WEATHERS = ['晴', '多云', '阴', '小雨', '中雨'];
const DISEASE_TYPES: string[] = ['裂缝', '剥落', '钢筋锈蚀', '变形', '渗漏', '其他'];
const DISEASE_SEVERITIES: string[] = ['轻微', '一般', '较严重', '严重', '危险'];
const MAINTENANCE_TYPES: string[] = ['日常养护', '小修', '中修', '大修', '加固', '重建'];
const CONTRACTORS = ['市市政工程公司', '交通建设集团', '桥梁工程有限公司', '建筑安装工程公司'];
const EVENT_TYPES: string[] = ['车辆撞击', '洪水冲刷', '超重车通行', '地震', '其他'];
const RECORDERS = ['王巡查', '李巡查', '张巡查', '刘巡查', '陈巡查'];

function generateBridges(count: number): Bridge[] {
  const bridges: Bridge[] = [];
  const baseLat = 39.9042;
  const baseLng = 116.4074;

  for (let i = 0; i < count; i++) {
    const buildYear = randomInt(1960, getCurrentYear());
    const age = getCurrentYear() - buildYear;
    let grade: Grade;
    if (age < 10) grade = randomChoice(['A', 'A', 'B']);
    else if (age < 20) grade = randomChoice(['A', 'B', 'B', 'C']);
    else if (age < 30) grade = randomChoice(['B', 'C', 'C', 'D']);
    else grade = randomChoice(['C', 'C', 'D', 'D', 'E']);

    bridges.push({
      id: generateId(),
      name: BRIDGE_NAMES[i % BRIDGE_NAMES.length] + (i >= BRIDGE_NAMES.length ? ` ${Math.floor(i / BRIDGE_NAMES.length) + 1}号` : ''),
      type: randomChoice(BRIDGE_TYPES) as BridgeType,
      material: randomChoice(MATERIALS) as Material,
      buildYear,
      designLoad: randomChoice(DESIGN_LOADS),
      spanCombination: `${randomInt(1, 5)}x${randomInt(20, 80)}m`,
      managementUnit: randomChoice(MANAGEMENT_UNITS),
      maintenanceUnit: randomChoice(MAINTENANCE_UNITS),
      lat: baseLat + (Math.random() - 0.5) * 0.5,
      lng: baseLng + (Math.random() - 0.5) * 0.5,
      photos: [],
      currentGrade: grade,
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
    });
  }
  return bridges;
}

function generateInspections(bridges: Bridge[], count: number): Inspection[] {
  const inspections: Inspection[] = [];
  const types: string[] = ['常规定期', '结构定期', '特殊检测'];

  for (let i = 0; i < count; i++) {
    const bridge = randomChoice(bridges);
    const monthsAgo = randomInt(0, 36);
    const inspectionDate = addDays(new Date(), -monthsAgo * 30);

    const baseRating = bridge.currentGrade === 'A' ? randomInt(1, 2) :
                       bridge.currentGrade === 'B' ? randomInt(1, 3) :
                       bridge.currentGrade === 'C' ? randomInt(2, 4) :
                       bridge.currentGrade === 'D' ? randomInt(3, 5) : randomInt(4, 5);

    const inspection = {
      id: generateId(),
      bridgeId: bridge.id,
      type: randomChoice(types) as InspectionType,
      inspectionDate,
      inspector: randomChoice(INSPECTORS),
      weather: randomChoice(WEATHERS),
      deckPavement: Math.min(5, Math.max(1, baseRating + randomInt(-1, 1))),
      expansionJoint: Math.min(5, Math.max(1, baseRating + randomInt(-1, 1))),
      bearing: Math.min(5, Math.max(1, baseRating + randomInt(-1, 1))),
      superstructure: Math.min(5, Math.max(1, baseRating + randomInt(-1, 1))),
      substructure: Math.min(5, Math.max(1, baseRating + randomInt(-1, 1))),
      railing: Math.min(5, Math.max(1, baseRating + randomInt(-1, 1))),
      drainage: Math.min(5, Math.max(1, baseRating + randomInt(-1, 1))),
      overallScore: 0,
      overallGrade: 'A' as Grade,
      remarks: '定期检测完成，各部件状态详见分项评定。',
      photos: [],
    };

    const result = calculateOverallGrade(inspection);
    inspection.overallScore = result.score;
    inspection.overallGrade = result.grade;

    inspections.push(inspection);
  }

  return inspections.sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());
}

function generateDiseases(bridges: Bridge[], inspections: Inspection[], count: number): Disease[] {
  const diseases: Disease[] = [];
  const statuses: DiseaseStatus[] = ['已记录', '处理中', '已修复'];
  const locations = [
    '主梁跨中', '主梁端部', '桥墩顶部', '桥墩底部', '桥台',
    '桥面左侧', '桥面右侧', '伸缩缝处', '支座附近', '栏杆',
  ];

  for (let i = 0; i < count; i++) {
    const bridge = randomChoice(bridges);
    const inspection = randomChoice([...inspections.filter(insp => insp.bridgeId === bridge.id), undefined]);
    const monthsAgo = randomInt(0, 24);
    const recordedDate = addDays(new Date(), -monthsAgo * 30);
    const severity: DiseaseSeverity = bridge.currentGrade === 'A' ? randomChoice(['轻微', '一般']) as DiseaseSeverity :
                     bridge.currentGrade === 'B' ? randomChoice(['轻微', '一般', '较严重']) as DiseaseSeverity :
                     bridge.currentGrade === 'C' ? randomChoice(['一般', '较严重', '严重']) as DiseaseSeverity :
                     randomChoice(['较严重', '严重', '危险']) as DiseaseSeverity;

    const deadlineDays = severity === '危险' ? 7 : severity === '严重' ? 15 : severity === '较严重' ? 30 : 60;
    const deadline = addDays(recordedDate, deadlineDays);
    const isOverdue = new Date() > new Date(deadline);

    const statusIndex = severity === '危险' ? randomInt(0, 1) :
                        severity === '严重' ? randomInt(0, 2) :
                        randomInt(0, 2);
    const status = statuses[statusIndex];

    const length = randomInt(10, 500);
    const width = randomInt(1, 50);
    const depth = randomInt(1, 20);

    const historyRecords = [];
    if (status !== '已记录') {
      for (let h = 0; h < randomInt(1, 3); h++) {
        const historyMonthsAgo = monthsAgo - randomInt(1, 6);
        if (historyMonthsAgo >= 0) {
          historyRecords.push({
            id: generateId(),
            inspectionId: inspection?.id || generateId(),
            inspectionDate: addDays(new Date(), -historyMonthsAgo * 30),
            length: Math.max(5, length - randomInt(5, 50)),
            width: Math.max(1, width - randomInt(1, 10)),
            depth: Math.max(1, depth - randomInt(1, 5)),
            description: `历史检测记录 - 裂缝扩展跟踪`,
            photos: [],
          });
        }
      }
    }

    diseases.push({
      id: generateId(),
      bridgeId: bridge.id,
      inspectionId: inspection?.id,
      type: randomChoice(DISEASE_TYPES) as DiseaseType,
      location: randomChoice(locations),
      size: `${length}cm x ${width}cm x ${depth}cm`,
      length,
      width,
      depth,
      severity,
      status,
      description: `${severity}${status === '已修复' ? '已修复' : ''}病害，需要${status === '已记录' ? '及时' : ''}处理。`,
      photos: [],
      recordedDate,
      assignedDate: status !== '已记录' ? addDays(recordedDate, randomInt(1, 7)) : undefined,
      repairedDate: status === '已修复' ? addDays(recordedDate, randomInt(8, 30)) : undefined,
      deadline,
      isOverdue: status !== '已修复' && isOverdue,
      historyRecords: historyRecords.sort((a, b) =>
        new Date(a.inspectionDate).getTime() - new Date(b.inspectionDate).getTime()
      ),
    });
  }

  return diseases.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    const severityOrder = ['危险', '严重', '较严重', '一般', '轻微'];
    return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
  });
}

function generateMaintenances(bridges: Bridge[], diseases: Disease[], count: number): Maintenance[] {
  const maintenances: Maintenance[] = [];

  for (let i = 0; i < count; i++) {
    const bridge = randomChoice(bridges);
    const disease = randomChoice([...diseases.filter(d => d.bridgeId === bridge.id), undefined]);
    const monthsAgo = randomInt(0, 60);
    const startDate = addDays(new Date(), -monthsAgo * 30);
    const endDate = addDays(startDate, randomInt(1, 30));
    const reviewDate = addDays(endDate, randomInt(30, 90));

    maintenances.push({
      id: generateId(),
      bridgeId: bridge.id,
      diseaseId: disease?.id,
      type: randomChoice(MAINTENANCE_TYPES) as MaintenanceType,
      startDate,
      endDate,
      contractor: randomChoice(CONTRACTORS),
      cost: randomInt(5000, 500000),
      description: `${randomChoice(MAINTENANCE_TYPES) as MaintenanceType}工程施工完成，质量合格。`,
      beforePhotos: [],
      afterPhotos: [],
      reviewDate,
      reviewResult: new Date() > new Date(reviewDate) ? randomChoice(['合格', '良好']) : undefined,
      isReviewed: new Date() > new Date(reviewDate),
    });
  }

  return maintenances.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

function generatePatrols(bridges: Bridge[], count: number): Patrol[] {
  const patrols: Patrol[] = [];

  for (let i = 0; i < count; i++) {
    const bridge = randomChoice(bridges);
    const monthsAgo = randomInt(0, 12);
    const date = addDays(new Date(), -monthsAgo * 30);
    const isEmergency = Math.random() < 0.2;

    patrols.push({
      id: generateId(),
      bridgeId: bridge.id,
      type: isEmergency ? '突发事件' : '日常巡查',
      eventType: isEmergency ? randomChoice(EVENT_TYPES) as EventType : undefined,
      date,
      recorder: randomChoice(RECORDERS),
      description: isEmergency
        ? `发生${randomChoice(EVENT_TYPES) as EventType}事件，已采取应急措施。`
        : `日常巡查完成，桥梁运行正常。`,
      emergencyMeasures: isEmergency ? '已设置警示标志，限制通行，等待进一步检测。' : undefined,
      photos: [],
      hasGeneratedInspection: isEmergency && Math.random() < 0.7,
      generatedInspectionId: isEmergency && Math.random() < 0.7 ? generateId() : undefined,
    });
  }

  return patrols.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateInspectionPlans(bridges: Bridge[], inspections: Inspection[]): InspectionPlan[] {
  const plans: InspectionPlan[] = [];
  const types: InspectionType[] = ['常规定期', '结构定期', '特殊检测'];

  bridges.forEach((bridge) => {
    const planCount = randomInt(1, 3);
    for (let i = 0; i < planCount; i++) {
      const type = randomChoice(types);
      const daysFromNow = randomInt(-60, 90);
      const planDate = addDays(new Date(), daysFromNow);
      const isPast = daysFromNow < 0;
      const isOverdue = isPast && Math.random() < 0.3;

      let status: InspectionPlanStatus;
      let inspectionId: string | undefined;

      if (isOverdue) {
        status = '已逾期';
      } else if (isPast) {
        status = '已完成';
        const bridgeInspections = inspections.filter((ins) => ins.bridgeId === bridge.id && ins.type === type);
        if (bridgeInspections.length > 0) {
          inspectionId = bridgeInspections[0]?.id;
        }
      } else if (Math.random() < 0.4) {
        status = '执行中';
      } else {
        status = '待执行';
      }

      plans.push({
        id: generateId(),
        bridgeId: bridge.id,
        type,
        planDate,
        inspector: status !== '待执行' ? randomChoice(INSPECTORS) : undefined,
        status,
        description: `${bridge.name}${type}检测计划`,
        inspectionId,
        createdAt: addDays(planDate, -randomInt(7, 30)),
        updatedAt: formatDate(new Date()),
      });
    }
  });

  return plans.sort((a, b) => new Date(b.planDate).getTime() - new Date(a.planDate).getTime());
}

function generateDisposalTasks(diseases: Disease[]): DisposalTask[] {
  const tasks: DisposalTask[] = [];
  const statuses: DisposalTaskStatus[] = ['待分派', '处理中', '待验收', '已完成'];
  const responsibleUnits = ['市政工程养护中心', '桥梁维修所', '交通设施维护队', '第三方检测公司'];
  const responsiblePersons = ['李工', '王工', '张工', '刘工', '陈工'];

  diseases.forEach((disease) => {
    if (disease.status === '已记录' && Math.random() < 0.5) return;

    const daysFromRecorded = randomInt(1, 30);
    const createdAt = addDays(new Date(disease.recordedDate), daysFromRecorded);
    const planDays = randomInt(15, 90);
    const planFinishDate = addDays(createdAt, planDays);

    let status: DisposalTaskStatus;
    let progress: number;
    let maintenanceId: string | undefined;

    if (disease.status === '已修复') {
      status = '已完成';
      progress = 100;
    } else if (disease.status === '处理中') {
      const statusIdx = randomInt(1, 2);
      status = statuses[statusIdx];
      progress = status === '处理中' ? randomInt(20, 80) : randomInt(90, 99);
    } else {
      status = '待分派';
      progress = 0;
    }

    tasks.push({
      id: generateId(),
      diseaseId: disease.id,
      bridgeId: disease.bridgeId,
      responsibleUnit: status !== '待分派' ? randomChoice(responsibleUnits) : '',
      responsiblePerson: status !== '待分派' ? randomChoice(responsiblePersons) : '',
      planFinishDate,
      disposalMeasures: `针对${disease.type}病害进行${status === '已完成' ? '修复' : '计划修复'}处理`,
      progress,
      status,
      maintenanceId: status === '已完成' && Math.random() < 0.6 ? generateId() : undefined,
      createdAt,
      updatedAt: formatDate(new Date()),
    });
  });

  return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateMockData() {
  const bridges = generateBridges(30);
  const inspections = generateInspections(bridges, 80);
  const diseases = generateDiseases(bridges, inspections, 60);
  const maintenances = generateMaintenances(bridges, diseases, 40);
  const patrols = generatePatrols(bridges, 50);
  const inspectionPlans = generateInspectionPlans(bridges, inspections);
  const disposalTasks = generateDisposalTasks(diseases);

  return { bridges, inspections, diseases, maintenances, patrols, inspectionPlans, disposalTasks };
}
