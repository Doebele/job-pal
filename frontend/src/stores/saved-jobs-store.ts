import { create } from 'zustand';
import api from '../lib/api';
import type { SavedJob, SavedJobStatus } from '../../../shared/types';

interface SavedJobWithJob extends SavedJob {
  job: {
    title: string;
    category: string;
    location: string;
    canton: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    isPublished: boolean;
    createdAt: string;
  };
}

const STATUS_LABELS: Record<string, string> = {
  saved: 'Gespeichert',
  contacted: 'Kontaktiert',
  application_sent: 'Bewerbung gesendet',
  rejected: 'Abgelehnt',
  invited: 'Eingeladen',
};

const STATUS_BADGE: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  saved: 'neutral',
  contacted: 'info',
  application_sent: 'warning',
  rejected: 'danger',
  invited: 'success',
};

interface SavedJobsState {
  items: SavedJobWithJob[];
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  loadSavedJobs: (statusFilter?: string) => Promise<void>;
  toggleBookmark: (jobId: string) => Promise<void>;
  updateStatus: (savedJobId: string, status: SavedJobStatus) => Promise<void>;
  updateNote: (savedJobId: string, note: string) => Promise<void>;
  removeSavedJob: (savedJobId: string) => Promise<void>;
  clearError: () => void;
}

export const useSavedJobsStore = create<SavedJobsState>()((set, get) => ({
  items: [],
  isSaving: false,
  isLoading: false,
  error: null,

  loadSavedJobs: async (statusFilter?) => {
    set({ isLoading: true, error: null });
    try {
      const url = statusFilter ? `/saved-jobs?status=${statusFilter}` : '/saved-jobs';
      const res = await api.get(url);
      set({ items: res.data.savedJobs, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Laden fehlgeschlagen';
      set({ error: message, isLoading: false });
    }
  },

  toggleBookmark: async (jobId) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post('/saved-jobs', { jobId });
      const item = res.data.savedJob;
      const current = get().items;
      const exists = current.find((i) => i.jobId === jobId);
      if (exists) {
        set({ items: current.map((i) => (i.jobId === jobId ? { ...i, ...item, updatedAt: item.updatedAt } : i)) });
      } else {
        set({ items: [item, ...current] });
      }
      set({ isSaving: false });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Speichern fehlgeschlagen';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  updateStatus: async (savedJobId, status) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/saved-jobs/${savedJobId}/status`, { status });
      const item = res.data.savedJob;
      set({
        items: get().items.map((i) => (i.id === savedJobId ? { ...i, ...item, updatedAt: item.updatedAt } : i)),
        isSaving: false,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Status-Aktualisierung fehlgeschlagen';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  updateNote: async (savedJobId, note) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/saved-jobs/${savedJobId}/note`, { note });
      const item = res.data.savedJob;
      set({
        items: get().items.map((i) => (i.id === savedJobId ? { ...i, ...item, updatedAt: item.updatedAt } : i)),
        isSaving: false,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Notiz-Aktualisierung fehlgeschlagen';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  removeSavedJob: async (savedJobId) => {
    set({ isSaving: true, error: null });
    try {
      await api.delete(`/saved-jobs/${savedJobId}`);
      set({ items: get().items.filter((i) => i.id !== savedJobId), isSaving: false });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Entfernen fehlgeschlagen';
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export { STATUS_LABELS, STATUS_BADGE };
