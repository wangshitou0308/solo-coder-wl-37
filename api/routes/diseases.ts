import { Router, Request, Response } from 'express';
import { loadAllData, saveDiseases } from '../data';
import { Disease, DiseaseStatus } from '../../src/types';
import { getDaysOverdue } from '../../src/utils/dateUtils';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { bridgeId, severity, status, isOverdue } = req.query;
  const { diseases } = loadAllData();

  let filtered = [...diseases];

  if (bridgeId) {
    filtered = filtered.filter(d => d.bridgeId === bridgeId);
  }
  if (severity) {
    filtered = filtered.filter(d => d.severity === severity);
  }
  if (status) {
    filtered = filtered.filter(d => d.status === status);
  }
  if (isOverdue === 'true') {
    filtered = filtered.filter(d => d.isOverdue);
  }

  filtered = filtered.map(d => ({
    ...d,
    isOverdue: d.status !== '已修复' && getDaysOverdue(d.deadline) > 0,
  }));

  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { diseases } = loadAllData();
  const disease = diseases.find(d => d.id === id);

  if (!disease) {
    res.status(404).json({ error: '病害记录不存在' });
    return;
  }

  const updated = {
    ...disease,
    isOverdue: disease.status !== '已修复' && getDaysOverdue(disease.deadline) > 0,
  };

  res.json(updated);
});

router.post('/', (req: Request, res: Response) => {
  const { diseases } = loadAllData();
  const data = req.body;

  const newDisease: Disease = {
    ...data,
    id: Math.random().toString(36).substring(2, 11),
    status: '已记录' as DiseaseStatus,
    isOverdue: false,
    historyRecords: [],
  };

  const updated = [...diseases];
  const severityOrder = ['危险', '严重', '较严重', '一般', '轻微'];
  const insertIndex = updated.findIndex(d =>
    severityOrder.indexOf(newDisease.severity) < severityOrder.indexOf(d.severity)
  );
  if (insertIndex === -1) {
    updated.push(newDisease);
  } else {
    updated.splice(insertIndex, 0, newDisease);
  }

  saveDiseases(updated);
  res.status(201).json(newDisease);
});

router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, date } = req.body;
  const { diseases } = loadAllData();
  const index = diseases.findIndex(d => d.id === id);

  if (index === -1) {
    res.status(404).json({ error: '病害记录不存在' });
    return;
  }

  const disease = diseases[index];
  const updatedDisease: Disease = {
    ...disease,
    status,
    assignedDate: status !== '已记录' ? date : disease.assignedDate,
    repairedDate: status === '已修复' ? date : disease.repairedDate,
    isOverdue: status !== '已修复' && getDaysOverdue(disease.deadline) > 0,
  };

  const updated = [...diseases];
  updated[index] = updatedDisease;
  saveDiseases(updated);
  res.json(updatedDisease);
});

export default router;
