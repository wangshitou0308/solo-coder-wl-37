import { Router, Request, Response } from 'express';
import { loadAllData, savePatrols, saveInspections } from '../data';
import { Patrol, Inspection } from '../../src/types';
import { calculateOverallGrade } from '../../src/utils/gradeCalculator';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { bridgeId, type } = req.query;
  const { patrols } = loadAllData();

  let filtered = [...patrols];

  if (bridgeId) {
    filtered = filtered.filter(p => p.bridgeId === bridgeId);
  }
  if (type) {
    filtered = filtered.filter(p => p.type === type);
  }

  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { patrols } = loadAllData();
  const patrol = patrols.find(p => p.id === id);

  if (!patrol) {
    res.status(404).json({ error: '巡查记录不存在' });
    return;
  }

  res.json(patrol);
});

router.post('/', (req: Request, res: Response) => {
  const { patrols } = loadAllData();
  const data = req.body;

  const newPatrol: Patrol = {
    ...data,
    id: Math.random().toString(36).substring(2, 11),
    hasGeneratedInspection: false,
  };

  const updated = [newPatrol, ...patrols];
  savePatrols(updated);
  res.status(201).json(newPatrol);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { patrols } = loadAllData();
  const data = req.body;
  const index = patrols.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: '巡查记录不存在' });
    return;
  }

  const original = patrols[index];
  const updatedPatrol: Patrol = {
    ...original,
    ...data,
    id: original.id,
    hasGeneratedInspection: original.hasGeneratedInspection,
    generatedInspectionId: original.generatedInspectionId,
  };

  const updated = [...patrols];
  updated[index] = updatedPatrol;
  savePatrols(updated);
  res.json(updatedPatrol);
});

router.post('/:id/generate-inspection', (req: Request, res: Response) => {
  const { id } = req.params;
  const { patrols, inspections } = loadAllData();
  const patrolIndex = patrols.findIndex(p => p.id === id);

  if (patrolIndex === -1) {
    res.status(404).json({ error: '巡查记录不存在' });
    return;
  }

  const patrol = patrols[patrolIndex];

  if (patrol.hasGeneratedInspection) {
    res.status(400).json({ error: '已生成检测任务' });
    return;
  }

  const inspectionData = {
    bridgeId: patrol.bridgeId,
    type: '特殊检测' as const,
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: '系统自动生成',
    weather: '晴',
    deckPavement: 1,
    expansionJoint: 1,
    bearing: 1,
    superstructure: 1,
    substructure: 1,
    railing: 1,
    drainage: 1,
    remarks: `由突发事件自动生成：${patrol.eventType || patrol.description}`,
    photos: [],
  };

  const result = calculateOverallGrade(inspectionData);
  const newInspection: Inspection = {
    ...inspectionData,
    id: Math.random().toString(36).substring(2, 11),
    overallScore: result.score,
    overallGrade: result.grade,
  };

  const updatedInspections = [newInspection, ...inspections];
  saveInspections(updatedInspections);

  const updatedPatrols = [...patrols];
  updatedPatrols[patrolIndex] = {
    ...patrol,
    hasGeneratedInspection: true,
    generatedInspectionId: newInspection.id,
  };
  savePatrols(updatedPatrols);

  res.status(201).json(newInspection);
});

export default router;
