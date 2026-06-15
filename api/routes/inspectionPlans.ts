import { Router, Request, Response } from 'express';
import { loadAllData, saveInspectionPlans, saveInspections } from '../data';
import { InspectionPlan, InspectionPlanStatus, Inspection } from '../../src/types';
import { formatDate } from '../../src/utils/dateUtils';
import { calculateOverallGrade } from '../../src/utils/gradeCalculator';

const router = Router();

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

router.get('/', (req: Request, res: Response) => {
  const { bridgeId, type, status, startDate, endDate } = req.query;
  const { inspectionPlans } = loadAllData();

  let filtered = [...inspectionPlans];

  if (bridgeId) {
    filtered = filtered.filter(p => p.bridgeId === bridgeId);
  }
  if (type) {
    filtered = filtered.filter(p => p.type === type);
  }
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  if (startDate) {
    filtered = filtered.filter(p => p.planDate >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(p => p.planDate <= endDate);
  }

  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { inspectionPlans } = loadAllData();
  const plan = inspectionPlans.find(p => p.id === id);

  if (!plan) {
    res.status(404).json({ error: '检测计划不存在' });
    return;
  }

  res.json(plan);
});

router.post('/', (req: Request, res: Response) => {
  const { inspectionPlans } = loadAllData();
  const data = req.body;
  const now = formatDate(new Date());

  const newPlan: InspectionPlan = {
    ...data,
    id: generateId(),
    status: data.status || '待执行',
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newPlan, ...inspectionPlans];
  saveInspectionPlans(updated);
  res.status(201).json(newPlan);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { inspectionPlans } = loadAllData();
  const data = req.body;
  const index = inspectionPlans.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: '检测计划不存在' });
    return;
  }

  const original = inspectionPlans[index];
  const now = formatDate(new Date());

  const updatedPlan: InspectionPlan = {
    ...original,
    ...data,
    id: original.id,
    createdAt: original.createdAt,
    updatedAt: now,
  };

  const updated = [...inspectionPlans];
  updated[index] = updatedPlan;
  saveInspectionPlans(updated);
  res.json(updatedPlan);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { inspectionPlans } = loadAllData();
  const index = inspectionPlans.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: '检测计划不存在' });
    return;
  }

  const updated = inspectionPlans.filter(p => p.id !== id);
  saveInspectionPlans(updated);
  res.json({ success: true });
});

router.post('/:id/create-inspection', (req: Request, res: Response) => {
  const { id } = req.params;
  const { inspectionPlans, inspections } = loadAllData();
  const planIndex = inspectionPlans.findIndex(p => p.id === id);

  if (planIndex === -1) {
    res.status(404).json({ error: '检测计划不存在' });
    return;
  }

  const plan = inspectionPlans[planIndex];
  const data = req.body;
  const now = formatDate(new Date());

  const result = calculateOverallGrade(data);

  const newInspection: Inspection = {
    ...data,
    id: generateId(),
    bridgeId: plan.bridgeId,
    type: plan.type,
    inspectionDate: data.inspectionDate || now,
    overallScore: result.score,
    overallGrade: result.grade,
  };

  const updatedInspections = [newInspection, ...inspections];
  saveInspections(updatedInspections);

  const updatedPlan: InspectionPlan = {
    ...plan,
    status: '已完成',
    inspectionId: newInspection.id,
    updatedAt: now,
  };

  const updatedPlans = [...inspectionPlans];
  updatedPlans[planIndex] = updatedPlan;
  saveInspectionPlans(updatedPlans);

  res.status(201).json({ plan: updatedPlan, inspection: newInspection });
});

router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const { inspectionPlans } = loadAllData();
  const index = inspectionPlans.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: '检测计划不存在' });
    return;
  }

  const original = inspectionPlans[index];
  const now = formatDate(new Date());

  const updatedPlan: InspectionPlan = {
    ...original,
    status: status as InspectionPlanStatus,
    updatedAt: now,
  };

  const updated = [...inspectionPlans];
  updated[index] = updatedPlan;
  saveInspectionPlans(updated);
  res.json(updatedPlan);
});

export default router;
