import { create } from 'zustand';
import { Patrol, PatrolType } from '@/types';

interface PatrolState {
  patrols: Patrol[];
  loading: boolean;
  error: string | null;
  fetchPatrols: (filters?: {
    bridgeId?: string;
    type?: PatrolType;
  }) => Promise<void>;
  fetchPatrolById: (id: string) => Promise<Patrol | null>;
  addPatrol: (patrol: Omit<Patrol, 'id' | 'hasGeneratedInspection'>) => Promise<Patrol | null>;
  updatePatrol: (id: string, patrol: Partial<Patrol>) => Promise<Patrol | null>;
  generateInspection: (id: string) => Promise<void>;
}

export const usePatrolStore = create<PatrolState>((set) => ({
  patrols: [],
  loading: false,
  error: null,

  fetchPatrols: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.bridgeId) params.append('bridgeId', filters.bridgeId);
      if (filters?.type) params.append('type', filters.type);

      const res = await fetch(`/api/patrols?${params.toString()}`);
      const data = await res.json();
      set({ patrols: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchPatrolById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/patrols/${id}`);
      if (!res.ok) throw new Error('巡查记录不存在');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  addPatrol: async (patrol) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/patrols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patrol),
      });
      const data = await res.json();
      set((state) => ({ patrols: [data, ...state.patrols], loading: false }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updatePatrol: async (id, patrol) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/patrols/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patrol),
      });
      const data = await res.json();
      set((state) => ({
        patrols: state.patrols.map((p) => (p.id === id ? data : p)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  generateInspection: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/patrols/${id}/generate-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      set((state) => ({
        patrols: state.patrols.map((p) =>
          p.id === id ? { ...p, hasGeneratedInspection: true, generatedInspectionId: data.id } : p
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
