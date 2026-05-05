import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SchoolType,
  TargetRole,
  Internship,
  SoftSkill,
  ProfileDraft,
} from '@shared/types';
import api from '../lib/api';

export interface ParsedCvData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  education?: { institution: string; field: string; degree: string; startYear: number; endYear: number | null }[];
  skills?: string[];
  languages?: { language: string; level: string }[];
  internships?: Internship[];
  confidence: number;
}

const DEFAULT_DRAFT: ProfileDraft = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  canton: '',
  bio: '',
  skills: [],
  languages: [],
  education: [],
  schoolType: null,
  schoolName: null,
  graduationYear: null,
  targetRoles: [],
  preferredCantons: [],
  internships: [],
  softSkills: [],
  motivationStatement: null,
  availableFrom: null,
  wantsTraining: false,
  cvParsed: false,
  cvParsedAt: null,
};

interface WizardState {
  currentStep: number;
  cvFile: File | null;
  cvParsedData: ParsedCvData | null;
  draft: ProfileDraft;
  isSaving: boolean;
  saveError: string | null;

  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCvFile: (file: File | null) => void;
  setCvParsedData: (data: ParsedCvData | null) => void;
  setDraft: (partial: Partial<ProfileDraft>) => void;
  saveProfile: () => Promise<void>;
  resetWizard: () => void;
  applyCvData: (data: ParsedCvData) => void;
}

// ProfileDraft is imported from shared/types

// Load from localStorage or use defaults
const storedDraft = typeof window !== 'undefined' ? localStorage.getItem('job-pal-wizard-draft') : null;
const parsedDraft: ProfileDraft = storedDraft ? { ...DEFAULT_DRAFT, ...JSON.parse(storedDraft) } : DEFAULT_DRAFT;

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      cvFile: null,
      cvParsedData: null,
      draft: parsedDraft,
      isSaving: false,
      saveError: null,

      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      setCvFile: (file) => set({ cvFile: file }),
      setCvParsedData: (data) => set((s) => ({
        cvParsedData: data,
        draft: { ...s.draft, cvParsed: !!data, cvParsedAt: data ? new Date().toISOString() : null },
      })),

      setDraft: (partial) => {
        const newDraft = { ...get().draft, ...partial };
        set({ draft: newDraft });
      },

      saveProfile: async () => {
        set({ isSaving: true, saveError: null });
        try {
          await api.put('/profile', get().draft);
        } catch (e: any) {
          if (e.response?.status === 404) {
            set({ isSaving: false });
            await api.post('/profile', get().draft);
          } else {
            set({ isSaving: false, saveError: e.response?.data?.error || e.message || 'Speichern fehlgeschlagen' });
            throw e;
          }
        } finally {
          set({ isSaving: false });
        }
      },

      resetWizard: () => {
        set({
          currentStep: 0,
          cvFile: null,
          cvParsedData: null,
          draft: { ...DEFAULT_DRAFT },
          saveError: null,
        });
        localStorage.removeItem('job-pal-wizard-draft');
      },

      applyCvData: (data) => {
        const newDraft = { ...get().draft };

        if (data.name) {
          const parts = data.name.split(' ');
          newDraft.firstName = parts[0] || '';
          newDraft.lastName = parts.slice(1).join(' ') || '';
        }
        if (data.phone) newDraft.phone = data.phone;
        if (data.address) newDraft.address = data.address;
        if (data.email) newDraft.bio = data.email; // temp storage

        if (data.education?.length) {
          newDraft.education = data.education.map((e) => ({ ...e, current: e.endYear === null }));
        }
        if (data.skills?.length) {
          newDraft.skills = data.skills.map((name) => ({ name, level: 'beginner' as const }));
        }
        if (data.languages?.length) {
          newDraft.languages = data.languages.map((l) => ({
            language: l.language,
            level: (l.level as import('@shared/types').LanguageProficiency['level']) ?? 'A1',
          }));
        }
        if (data.internships?.length) {
          newDraft.internships = data.internships;
        }

        set({ draft: { ...newDraft, cvParsed: true, cvParsedAt: new Date().toISOString() }, cvParsedData: data });
      },
    }),
    { name: 'job-pal-wizard-draft' },
  ),
);
