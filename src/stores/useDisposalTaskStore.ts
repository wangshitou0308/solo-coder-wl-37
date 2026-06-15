import { create } from 'zustand';
import { DisposalTask, DisposalTaskStatus } from '@/types';

interface DisposalTaskState {
  tasks: DisposalTask[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: {
    bridgeId?: string;
    diseaseId?: string;
    status?: DisposalTaskStatus;
    responsibleUnit?: string;
    upcomingOverdue?: boolean;
  }) => Promise<void>;
  fetchTaskById: (id: string) => Promise<DisposalTask | null>;
  addTask: (task: Omit<DisposalTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress' | 'bridgeId'>) => Promise<DisposalTask | null>;
  updateTask: (id: string, task: Partial<DisposalTask>) => Promise<DisposalTask | null>;
  deleteTask: (id: string) => Promise<boolean>;
  updateTaskStatus: (id: string, status: DisposalTaskStatus, progress?: number) => Promise<DisposalTask | null>;
  linkMaintenance: (taskId: string, maintenanceId: string) => Promise<DisposalTask | null>;
}

export const useDisposalTaskStore = create<DisposalTaskState>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.bridgeId) params.append('bridgeId', filters.bridgeId);
      if (filters?.diseaseId) params.append('diseaseId', filters.diseaseId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.responsibleUnit) params.append('responsibleUnit', filters.responsibleUnit);
      if (filters?.upcomingOverdue) params.append('upcomingOverdue', 'true');

      const res = await fetch(`/api/disposal-tasks?${params.toString()}`);
      const data = await res.json();
      set({ tasks: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchTaskById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/disposal-tasks/${id}`);
      if (!res.ok) throw new Error('处置任务不存在');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  addTask: async (task) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/disposal-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const data = await res.json();
      set((state) => ({ tasks: [data, ...state.tasks], loading: false }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updateTask: async (id, task) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/disposal-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const data = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? data : t)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/disposal-tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除失败');
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  updateTaskStatus: async (id, status, progress) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/disposal-tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, progress }),
      });
      const data = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? data : t)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  linkMaintenance: async (taskId, maintenanceId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/disposal-tasks/${taskId}/link-maintenance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceId }),
      });
      const data = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? data : t)),
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },
}));
