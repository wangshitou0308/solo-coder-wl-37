import { Router, Request, Response } from 'express';
import { loadAllData, saveMaintenances } from '../data';
import { Maintenance } from '../../src/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { bridgeId, type, year } = req.query;
  const { maintenances } = loadAllData();

  let filtered = [...maintenances];

  if (bridgeId) {
    filtered = filtered.filter(m => m.bridgeId === bridgeId);
  }
  if (type) {
    filtered = filtered.filter(m => m.type === type);
  }
  if (year) {
    filtered = filtered.filter(m => m.startDate.startsWith(year as string));
  }

  res.json(filtered);
});

router.get('/stats', (req: Request, res: Response) => {
  const { bridgeId, year } = req.query;
  const { maintenances, bridges } = loadAllData();

  let filtered = [...maintenances];

  if (bridgeId) {
    filtered = filtered.filter(m => m.bridgeId === bridgeId);
  }
  if (year) {
    filtered = filtered.filter(m => m.startDate.startsWith(year as string));
  }

  const byBridge: Record<string, { count: number; totalCost: number; bridge: any }> = {};
  const byType: Record<string, { count: number; totalCost: number }> = {};
  const byYear: Record<string, { count: number; totalCost: number }> = {};

  filtered.forEach(m => {
    const bridge = bridges.find(b => b.id === m.bridgeId);
    if (!byBridge[m.bridgeId]) {
      byBridge[m.bridgeId] = { count: 0, totalCost: 0, bridge };
    }
    byBridge[m.bridgeId].count++;
    byBridge[m.bridgeId].totalCost += m.cost;

    if (!byType[m.type]) {
      byType[m.type] = { count: 0, totalCost: 0 };
    }
    byType[m.type].count++;
    byType[m.type].totalCost += m.cost;

    const y = m.startDate.substring(0, 4);
    if (!byYear[y]) {
      byYear[y] = { count: 0, totalCost: 0 };
    }
    byYear[y].count++;
    byYear[y].totalCost += m.cost;
  });

  res.json({
    totalCount: filtered.length,
    totalCost: filtered.reduce((sum, m) => sum + m.cost, 0),
    byBridge: Object.entries(byBridge).map(([bridgeId, data]) => ({
      bridgeId,
      bridgeName: data.bridge?.name || '未知',
      count: data.count,
      totalCost: data.totalCost,
    })),
    byType: Object.entries(byType).map(([type, data]) => ({
      type,
      count: data.count,
      totalCost: data.totalCost,
    })),
    byYear: Object.entries(byYear)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, data]) => ({
        year: parseInt(year),
        count: data.count,
        totalCost: data.totalCost,
      })),
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { maintenances } = loadAllData();
  const maintenance = maintenances.find(m => m.id === id);

  if (!maintenance) {
    res.status(404).json({ error: '维修记录不存在' });
    return;
  }

  res.json(maintenance);
});

router.post('/', (req: Request, res: Response) => {
  const { maintenances } = loadAllData();
  const data = req.body;

  const newMaintenance: Maintenance = {
    ...data,
    id: Math.random().toString(36).substring(2, 11),
    isReviewed: false,
  };

  const updated = [newMaintenance, ...maintenances];
  saveMaintenances(updated);
  res.status(201).json(newMaintenance);
});

router.put('/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reviewResult } = req.body;
  const { maintenances } = loadAllData();
  const index = maintenances.findIndex(m => m.id === id);

  if (index === -1) {
    res.status(404).json({ error: '维修记录不存在' });
    return;
  }

  const maintenance = maintenances[index];
  const updatedMaintenance: Maintenance = {
    ...maintenance,
    isReviewed: true,
    reviewResult,
  };

  const updated = [...maintenances];
  updated[index] = updatedMaintenance;
  saveMaintenances(updated);
  res.json(updatedMaintenance);
});

export default router;
