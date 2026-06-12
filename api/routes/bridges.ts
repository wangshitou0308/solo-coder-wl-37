import { Router, Request, Response } from 'express';
import { loadAllData, saveBridges } from '../data';
import { Bridge } from '../../src/types';
import { formatDate } from '../../src/utils/dateUtils';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { type, material, grade, keyword } = req.query;
  const { bridges } = loadAllData();

  let filtered = [...bridges];

  if (type) {
    filtered = filtered.filter(b => b.type === type);
  }
  if (material) {
    filtered = filtered.filter(b => b.material === material);
  }
  if (grade) {
    filtered = filtered.filter(b => b.currentGrade === grade);
  }
  if (keyword) {
    const kw = (keyword as string).toLowerCase();
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(kw) ||
      b.managementUnit.toLowerCase().includes(kw) ||
      b.maintenanceUnit.toLowerCase().includes(kw)
    );
  }

  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { bridges } = loadAllData();
  const bridge = bridges.find(b => b.id === id);

  if (!bridge) {
    res.status(404).json({ error: '桥梁不存在' });
    return;
  }

  res.json(bridge);
});

router.post('/', (req: Request, res: Response) => {
  const { bridges } = loadAllData();
  const newBridge: Bridge = {
    ...req.body,
    id: Math.random().toString(36).substring(2, 11),
    createdAt: formatDate(new Date()),
    updatedAt: formatDate(new Date()),
  };

  const updated = [...bridges, newBridge];
  saveBridges(updated);
  res.status(201).json(newBridge);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { bridges } = loadAllData();
  const index = bridges.findIndex(b => b.id === id);

  if (index === -1) {
    res.status(404).json({ error: '桥梁不存在' });
    return;
  }

  const updatedBridge: Bridge = {
    ...bridges[index],
    ...req.body,
    id,
    updatedAt: formatDate(new Date()),
  };

  const updated = [...bridges];
  updated[index] = updatedBridge;
  saveBridges(updated);
  res.json(updatedBridge);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { bridges } = loadAllData();
  const filtered = bridges.filter(b => b.id !== id);

  if (filtered.length === bridges.length) {
    res.status(404).json({ error: '桥梁不存在' });
    return;
  }

  saveBridges(filtered);
  res.json({ success: true });
});

export default router;
