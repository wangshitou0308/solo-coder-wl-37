import { Router, Request, Response } from 'express';
import { loadAllData, saveInspections } from '../data';
import { Inspection } from '../../src/types';
import { calculateOverallGrade } from '../../src/utils/gradeCalculator';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { bridgeId, type, year } = req.query;
  const { inspections } = loadAllData();

  let filtered = [...inspections];

  if (bridgeId) {
    filtered = filtered.filter(i => i.bridgeId === bridgeId);
  }
  if (type) {
    filtered = filtered.filter(i => i.type === type);
  }
  if (year) {
    filtered = filtered.filter(i => i.inspectionDate.startsWith(year as string));
  }

  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { inspections } = loadAllData();
  const inspection = inspections.find(i => i.id === id);

  if (!inspection) {
    res.status(404).json({ error: '检测记录不存在' });
    return;
  }

  res.json(inspection);
});

router.post('/', (req: Request, res: Response) => {
  const { inspections } = loadAllData();
  const data = req.body;

  const result = calculateOverallGrade(data);

  const newInspection: Inspection = {
    ...data,
    id: Math.random().toString(36).substring(2, 11),
    overallScore: result.score,
    overallGrade: result.grade,
  };

  const updated = [newInspection, ...inspections];
  saveInspections(updated);
  res.status(201).json(newInspection);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { inspections } = loadAllData();
  const data = req.body;
  const index = inspections.findIndex(i => i.id === id);

  if (index === -1) {
    res.status(404).json({ error: '检测记录不存在' });
    return;
  }

  const original = inspections[index];
  const result = calculateOverallGrade(data);

  const updatedInspection: Inspection = {
    ...original,
    ...data,
    id: original.id,
    overallScore: result.score,
    overallGrade: result.grade,
  };

  const updated = [...inspections];
  updated[index] = updatedInspection;
  saveInspections(updated);
  res.json(updatedInspection);
});

export default router;
