import { create } from 'zustand';
import { InspectionPlan, InspectionPlanStatus, InspectionType } from '@/types';

interface InspectionPlanState {
  plans: InspectionPlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: (filters?: {
    bridgeId?: string;
    type?: InspectionType;
    status?: InspectionPlanStatus;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  fetchPlanById: (id: string) => Promise<InspectionPlan | null>;
  addPlan: (plan: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<InspectionPlan | null>;
  updatePlan: (id: string, plan: Partial<InspectionPlan>) => Promise<InspectionPlan | null>;
  deletePlan: (id: string) => Promise<boolean>;
  updatePlanStatus: (id: string, status: InspectionPlanStatus) => Promise<InspectionPlan | null>;
  createInspectionFromPlan: (planId: string, inspectionData: any) => Promise<{ plan: InspectionPlan; inspection: any } | null>;
}

export const useInspectionPlanStore = create<InspectionPlanState>((set) => ({
  plans: [],
  loading: false,
  error: null,

  fetchPlans: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.bridgeId) params.append('bridgeId', filters.bridgeId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/inspection-plans?${params.toString()}`);
      const data = await res.json();
      set({ plans: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchPlanById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/inspection-plans/${id}`);
      if (!res.ok) throw new Error('检测计划不存在');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  addPlan: async (plan) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/inspection-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      set((state) => ({ plans: [data, ...state.plans], loading: false }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updatePlan: async (id, plan) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/inspection-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? data : p)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  deletePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/inspection-plans/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除失败');
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  updatePlanStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/inspection-plans/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? data : p)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  createInspectionFromPlan: async (planId, inspectionData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/inspection-plans/${planId}/create-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData),
      });
      const data = await res.json();
      set((state) => ({
        plans: state.plans.map((p) => (p.id === planId ? data.plan : p)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },
}));
