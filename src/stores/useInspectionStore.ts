import { create } from 'zustand';
import { Inspection, InspectionType } from '@/types';

interface InspectionState {
  inspections: Inspection[];
  loading: boolean;
  error: string | null;
  fetchInspections: (filters?: {
    bridgeId?: string;
    type?: InspectionType;
    year?: number;
  }) => Promise<void>;
  fetchInspectionById: (id: string) => Promise<Inspection | null>;
  addInspection: (inspection: Omit<Inspection, 'id' | 'overallScore' | 'overallGrade'>) => Promise<Inspection | null>;
  updateInspection: (id: string, inspection: Partial<Inspection>) => Promise<Inspection | null>;
}

export const useInspectionStore = create<InspectionState>((set) => ({
  inspections: [],
  loading: false,
  error: null,

  fetchInspections: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.bridgeId) params.append('bridgeId', filters.bridgeId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.year) params.append('year', filters.year.toString());

      const res = await fetch(`/api/inspections?${params.toString()}`);
      const data = await res.json();
      set({ inspections: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchInspectionById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/inspections/${id}`);
      if (!res.ok) throw new Error('检测记录不存在');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  addInspection: async (inspection) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection),
      });
      const data = await res.json();
      set((state) => ({ inspections: [data, ...state.inspections], loading: false }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updateInspection: async (id, inspection) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/inspections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection),
      });
      const data = await res.json();
      set((state) => ({
        inspections: state.inspections.map((i) => (i.id === id ? data : i)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },
}));
