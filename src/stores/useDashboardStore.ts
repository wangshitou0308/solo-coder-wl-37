import { create } from 'zustand';
import { DashboardStats } from '@/types';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
