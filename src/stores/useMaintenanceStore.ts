import { create } from 'zustand';
import { Maintenance, MaintenanceType } from '@/types';

interface MaintenanceStats {
  totalCount: number;
  totalCost: number;
  byBridge: { bridgeId: string; bridgeName: string; count: number; totalCost: number }[];
  byType: { type: string; count: number; totalCost: number }[];
  byYear: { year: number; count: number; totalCost: number }[];
}

interface MaintenanceState {
  maintenances: Maintenance[];
  stats: MaintenanceStats | null;
  loading: boolean;
  error: string | null;
  fetchMaintenances: (filters?: {
    bridgeId?: string;
    type?: MaintenanceType;
    year?: number;
  }) => Promise<void>;
  fetchStats: (filters?: { bridgeId?: string; year?: number }) => Promise<void>;
  fetchMaintenanceById: (id: string) => Promise<Maintenance | null>;
  addMaintenance: (maintenance: Omit<Maintenance, 'id' | 'isReviewed'>) => Promise<Maintenance | null>;
  updateMaintenance: (id: string, maintenance: Partial<Maintenance>) => Promise<Maintenance | null>;
  updateReview: (id: string, result: string) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  maintenances: [],
  stats: null,
  loading: false,
  error: null,

  fetchMaintenances: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.bridgeId) params.append('bridgeId', filters.bridgeId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.year) params.append('year', filters.year.toString());

      const res = await fetch(`/api/maintenances?${params.toString()}`);
      const data = await res.json();
      set({ maintenances: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchStats: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.bridgeId) params.append('bridgeId', filters.bridgeId);
      if (filters?.year) params.append('year', filters.year.toString());

      const res = await fetch(`/api/maintenances/stats?${params.toString()}`);
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addMaintenance: async (maintenance) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenance),
      });
      const data = await res.json();
      set((state) => ({ maintenances: [data, ...state.maintenances], loading: false }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updateMaintenance: async (id, maintenance) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/maintenances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenance),
      });
      const data = await res.json();
      set((state) => ({
        maintenances: state.maintenances.map((m) => (m.id === id ? data : m)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  fetchMaintenanceById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/maintenances/${id}`);
      if (!res.ok) throw new Error('维修记录不存在');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updateReview: async (id, result) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/maintenances/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewResult: result }),
      });
      const data = await res.json();
      set((state) => ({
        maintenances: state.maintenances.map((m) =>
          m.id === id ? { ...m, isReviewed: true, reviewResult: result } : m
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
