import { create } from 'zustand';
import { Disease, DiseaseType, DiseaseSeverity, DiseaseStatus } from '@/types';

interface DiseaseState {
  diseases: Disease[];
  loading: boolean;
  error: string | null;
  fetchDiseases: (filters?: {
    bridgeId?: string;
    severity?: DiseaseSeverity;
    status?: DiseaseStatus;
    isOverdue?: boolean;
  }) => Promise<void>;
  fetchDiseaseById: (id: string) => Promise<Disease | null>;
  addDisease: (disease: Omit<Disease, 'id' | 'status' | 'isOverdue' | 'historyRecords'>) => Promise<void>;
  updateDiseaseStatus: (id: string, status: DiseaseStatus, date: string) => Promise<void>;
}

export const useDiseaseStore = create<DiseaseState>((set) => ({
  diseases: [],
  loading: false,
  error: null,

  fetchDiseases: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.bridgeId) params.append('bridgeId', filters.bridgeId);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.isOverdue) params.append('isOverdue', 'true');

      const res = await fetch(`/api/diseases?${params.toString()}`);
      const data = await res.json();
      set({ diseases: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDiseaseById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/diseases/${id}`);
      if (!res.ok) throw new Error('病害记录不存在');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  addDisease: async (disease) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/diseases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disease),
      });
      const data = await res.json();
      set((state) => ({ diseases: [data, ...state.diseases], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateDiseaseStatus: async (id, status, date) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/diseases/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, date }),
      });
      const data = await res.json();
      set((state) => ({
        diseases: state.diseases.map((d) => (d.id === id ? data : d)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
