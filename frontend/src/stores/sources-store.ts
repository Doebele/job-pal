import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_JOB_SOURCES } from '@shared/constants';
import type { JobSourceDef } from '@shared/types';

export interface CustomSource {
  id: string;
  name: string;
  url: string;         // RSS feed URL
  homepageUrl: string; // for attribution link
}

interface SourcesState {
  enabledSourceIds: string[];
  customSources: CustomSource[];

  toggleSource: (id: string) => void;
  enableAll: () => void;
  addCustomSource: (source: Omit<CustomSource, 'id'>) => void;
  removeCustomSource: (id: string) => void;
  getAllSources: () => JobSourceDef[];
}

const DEFAULT_ENABLED = DEFAULT_JOB_SOURCES.map((s) => s.id);

export const useSourcesStore = create<SourcesState>()(
  persist(
    (set, get) => ({
      enabledSourceIds: DEFAULT_ENABLED,
      customSources: [],

      toggleSource: (id) =>
        set((state) => ({
          enabledSourceIds: state.enabledSourceIds.includes(id)
            ? state.enabledSourceIds.filter((s) => s !== id)
            : [...state.enabledSourceIds, id],
        })),

      enableAll: () =>
        set((state) => ({
          enabledSourceIds: [
            ...DEFAULT_JOB_SOURCES.map((s) => s.id),
            ...state.customSources.map((s) => s.id),
          ],
        })),

      addCustomSource: (source) => {
        const id = `custom:${Date.now()}`;
        const def: CustomSource = { ...source, id };
        set((state) => ({
          customSources: [...state.customSources, def],
          enabledSourceIds: [...state.enabledSourceIds, id],
        }));
      },

      removeCustomSource: (id) =>
        set((state) => ({
          customSources: state.customSources.filter((s) => s.id !== id),
          enabledSourceIds: state.enabledSourceIds.filter((s) => s !== id),
        })),

      getAllSources: () => {
        const { customSources } = get();
        const custom: JobSourceDef[] = customSources.map((s) => ({
          id: s.id,
          name: s.name,
          description: `RSS: ${s.url}`,
          url: s.homepageUrl,
          type: 'rss' as const,
          requiresKey: false,
          tags: ['custom'],
        }));
        return [...DEFAULT_JOB_SOURCES, ...custom];
      },
    }),
    { name: 'job-pal-sources' },
  ),
);
