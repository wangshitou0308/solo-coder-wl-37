import { Router, Request, Response } from 'express';
import { loadAllData } from '../data';
import { getDaysOverdue, getAgeRange, getCurrentYear } from '../../src/utils/dateUtils';

const router = Router();

router.get('/stats', (_req: Request, res: Response) => {
  const { bridges, inspections, diseases, maintenances, inspectionPlans, disposalTasks } = loadAllData();

  const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  bridges.forEach(b => {
    gradeDistribution[b.currentGrade]++;
  });

  const overdueInspections = bridges
    .map(bridge => {
      const bridgeInspections = inspections.filter(i => i.bridgeId === bridge.id);
      const lastInspection = bridgeInspections[0];
      if (!lastInspection) return { bridge, daysOverdue: 365 };

      const lastDate = new Date(lastInspection.inspectionDate);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      const interval = lastInspection.type === '常规定期' ? 365 : lastInspection.type === '结构定期' ? 1095 : 180;

      return { bridge, daysOverdue: Math.max(0, diffDays - interval) };
    })
    .filter(item => item.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  const overdueDiseases = diseases
    .filter(d => d.status !== '已修复')
    .map(d => {
      const bridge = bridges.find(b => b.id === d.bridgeId);
      const daysOverdue = getDaysOverdue(d.deadline);
      return { disease: d, bridge: bridge!, daysOverdue };
    })
    .filter(item => item.daysOverdue > 0 && item.bridge)
    .sort((a, b) => {
      const severityOrder = ['危险', '严重', '较严重', '一般', '轻微'];
      const sevDiff = severityOrder.indexOf(a.disease.severity) - severityOrder.indexOf(b.disease.severity);
      if (sevDiff !== 0) return sevDiff;
      return b.daysOverdue - a.daysOverdue;
    });

  const ageRanges = ['0-10年', '10-20年', '20-30年', '30-40年', '40-50年', '50年以上'];
  const ageDistribution = ageRanges.map(range => ({
    range,
    count: bridges.filter(b => getAgeRange(b.buildYear) === range).length,
  }));

  const currentYear = getCurrentYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
  const annualCostTrend = years.map(year => ({
    year,
    cost: maintenances
      .filter(m => m.startDate.startsWith(year.toString()))
      .reduce((sum, m) => sum + m.cost, 0),
  }));

  const inspectionTypes = ['常规定期', '结构定期', '特殊检测'];
  const inspectionCompletionRate = inspectionTypes.map(type => {
    const typeInspections = inspections.filter(i => i.type === type);
    const thisYear = typeInspections.filter(i => i.inspectionDate.startsWith(currentYear.toString()));
    return {
      type,
      completed: thisYear.length,
      total: Math.ceil(bridges.length / (type === '常规定期' ? 1 : type === '结构定期' ? 3 : 0.5)),
    };
  });

  const highRiskBridges = bridges
    .filter(b => b.currentGrade === 'D' || b.currentGrade === 'E')
    .sort((a, b) => b.currentGrade.localeCompare(a.currentGrade));

  const currentYear = getCurrentYear();
  const currentMonth = new Date().getMonth();
  const monthlyPendingPlans = inspectionPlans.filter(p => {
    const planDate = new Date(p.planDate);
    return planDate.getFullYear() === currentYear &&
           planDate.getMonth() === currentMonth &&
           p.status !== '已完成';
  }).length;

  const overduePlans = inspectionPlans.filter(p => p.status === '已逾期').length;

  const totalPlans = inspectionPlans.length;
  const completedPlans = inspectionPlans.filter(p => p.status === '已完成').length;
  const planCompletionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  const pendingSevereDiseases = diseases.filter(d =>
    d.status !== '已修复' && (d.severity === '严重' || d.severity === '危险')
  ).length;

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingOverdueTasks = disposalTasks.filter(t => {
    if (t.status === '已完成') return false;
    const planDate = new Date(t.planFinishDate);
    return planDate >= now && planDate <= sevenDaysLater;
  }).length;

  const totalTasks = disposalTasks.length;
  const completedTasks = disposalTasks.filter(t => t.status === '已完成').length;
  const disposalCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    totalBridges: bridges.length,
    gradeDistribution,
    overdueInspections,
    overdueDiseases,
    ageDistribution,
    annualCostTrend,
    inspectionCompletionRate,
    highRiskBridges,
    monthlyPendingPlans,
    overduePlans,
    planCompletionRate,
    pendingSevereDiseases,
    upcomingOverdueTasks,
    disposalCompletionRate,
  });
});

export default router;
