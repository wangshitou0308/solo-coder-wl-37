import { create } from 'zustand';
import { Bridge, BridgeType, Material, Grade } from '@/types';

interface BridgeState {
  bridges: Bridge[];
  loading: boolean;
  error: string | null;
  fetchBridges: (filters?: {
    type?: BridgeType;
    material?: Material;
    grade?: Grade;
    keyword?: string;
  }) => Promise<void>;
  fetchBridgeById: (id: string) => Promise<Bridge | null>;
  addBridge: (bridge: Omit<Bridge, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBridge: (id: string, bridge: Partial<Bridge>) => Promise<void>;
  deleteBridge: (id: string) => Promise<void>;
}

export const useBridgeStore = create<BridgeState>((set, get) => ({
  bridges: [],
  loading: false,
  error: null,

  fetchBridges: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.material) params.append('material', filters.material);
      if (filters?.grade) params.append('grade', filters.grade);
      if (filters?.keyword) params.append('keyword', filters.keyword);

      const res = await fetch(`/api/bridges?${params.toString()}`);
      const data = await res.json();
      set({ bridges: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchBridgeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/bridges/${id}`);
      if (!res.ok) throw new Error('桥梁不存在');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  addBridge: async (bridge) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/bridges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bridge),
      });
      const data = await res.json();
      set((state) => ({ bridges: [...state.bridges, data], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateBridge: async (id, bridge) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/bridges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bridge),
      });
      const data = await res.json();
      set((state) => ({
        bridges: state.bridges.map((b) => (b.id === id ? data : b)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteBridge: async (id) => {
    set({ loading: true, error: null });
    try {
      await fetch(`/api/bridges/${id}`, { method: 'DELETE' });
      set((state) => ({
        bridges: state.bridges.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
