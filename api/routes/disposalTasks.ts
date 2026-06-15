import { Router, Request, Response } from 'express';
import { loadAllData, saveDisposalTasks, saveDiseases, saveMaintenances } from '../data';
import { DisposalTask, DisposalTaskStatus, Disease, Maintenance } from '../../src/types';
import { formatDate } from '../../src/utils/dateUtils';

const router = Router();

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

router.get('/', (req: Request, res: Response) => {
  const { bridgeId, diseaseId, status, responsibleUnit, upcomingOverdue } = req.query;
  const { disposalTasks } = loadAllData();

  let filtered = [...disposalTasks];

  if (bridgeId) {
    filtered = filtered.filter(t => t.bridgeId === bridgeId);
  }
  if (diseaseId) {
    filtered = filtered.filter(t => t.diseaseId === diseaseId);
  }
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  if (responsibleUnit) {
    filtered = filtered.filter(t => t.responsibleUnit === responsibleUnit);
  }
  if (upcomingOverdue === 'true') {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(t => {
      if (t.status === '已完成') return false;
      const planDate = new Date(t.planFinishDate);
      return planDate >= now && planDate <= sevenDaysLater;
    });
  }

  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { disposalTasks } = loadAllData();
  const task = disposalTasks.find(t => t.id === id);

  if (!task) {
    res.status(404).json({ error: '处置任务不存在' });
    return;
  }

  res.json(task);
});

router.post('/', (req: Request, res: Response) => {
  const { disposalTasks, diseases } = loadAllData();
  const data = req.body;
  const now = formatDate(new Date());

  const disease = diseases.find(d => d.id === data.diseaseId);
  if (!disease) {
    res.status(404).json({ error: '关联病害不存在' });
    return;
  }

  const newTask: DisposalTask = {
    ...data,
    id: generateId(),
    bridgeId: disease.bridgeId,
    status: data.status || '待分派',
    progress: data.progress || 0,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newTask, ...disposalTasks];
  saveDisposalTasks(updated);
  res.status(201).json(newTask);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { disposalTasks } = loadAllData();
  const data = req.body;
  const index = disposalTasks.findIndex(t => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: '处置任务不存在' });
    return;
  }

  const original = disposalTasks[index];
  const now = formatDate(new Date());

  const updatedTask: DisposalTask = {
    ...original,
    ...data,
    id: original.id,
    createdAt: original.createdAt,
    updatedAt: now,
  };

  const updated = [...disposalTasks];
  updated[index] = updatedTask;
  saveDisposalTasks(updated);
  res.json(updatedTask);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { disposalTasks } = loadAllData();
  const index = disposalTasks.findIndex(t => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: '处置任务不存在' });
    return;
  }

  const updated = disposalTasks.filter(t => t.id !== id);
  saveDisposalTasks(updated);
  res.json({ success: true });
});

router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, progress } = req.body;
  const { disposalTasks, diseases } = loadAllData();
  const index = disposalTasks.findIndex(t => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: '处置任务不存在' });
    return;
  }

  const original = disposalTasks[index];
  const now = formatDate(new Date());

  const updatedTask: DisposalTask = {
    ...original,
    status: status as DisposalTaskStatus,
    progress: progress !== undefined ? progress : original.progress,
    updatedAt: now,
  };

  if (status === '已完成') {
    updatedTask.progress = 100;
    const diseaseIndex = diseases.findIndex(d => d.id === original.diseaseId);
    if (diseaseIndex !== -1) {
      const updatedDiseases = [...diseases];
      updatedDiseases[diseaseIndex] = {
        ...updatedDiseases[diseaseIndex],
        status: '已修复',
        repairedDate: now,
        isOverdue: false,
      };
      saveDiseases(updatedDiseases);
    }
  }

  const updated = [...disposalTasks];
  updated[index] = updatedTask;
  saveDisposalTasks(updated);
  res.json(updatedTask);
});

router.put('/:id/link-maintenance', (req: Request, res: Response) => {
  const { id } = req.params;
  const { maintenanceId } = req.body;
  const { disposalTasks, maintenances } = loadAllData();

  const taskIndex = disposalTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    res.status(404).json({ error: '处置任务不存在' });
    return;
  }

  const maintenance = maintenances.find(m => m.id === maintenanceId);
  if (!maintenance) {
    res.status(404).json({ error: '维修记录不存在' });
    return;
  }

  const original = disposalTasks[taskIndex];
  const now = formatDate(new Date());

  const updatedTask: DisposalTask = {
    ...original,
    maintenanceId,
    updatedAt: now,
  };

  const updatedTasks = [...disposalTasks];
  updatedTasks[taskIndex] = updatedTask;
  saveDisposalTasks(updatedTasks);

  const updatedMaintenances = maintenances.map(m =>
    m.id === maintenanceId
      ? { ...m, diseaseId: original.diseaseId }
      : m
  );
  saveMaintenances(updatedMaintenances as Maintenance[]);

  res.json(updatedTask);
});

export default router;
