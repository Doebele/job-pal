import { create } from 'zustand';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface Language {
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';
}

interface Education {
  institution: string;
  field: string;
  degree: string;
  startYear: number;
  endYear: number | null;
  current: boolean;
}

interface ProfileDraft {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  canton: string;
  bio: string;
  skills: Skill[];
  languages: Language[];
  education: Education[];
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
};

interface ProfileStore {
  draft: ProfileDraft;
  step: number;
  setDraft: (draft: Partial<ProfileDraft>) => void;
  setStep: (step: number) => void;
  resetDraft: () => void;
}

export const useProfileStore = create<ProfileStore>()((set) => ({
  draft: { ...DEFAULT_DRAFT },
  step: 0,

  setDraft: (partial) =>
    set((state) => ({
      draft: { ...state.draft, ...partial },
    })),

  setStep: (step) => set({ step }),

  resetDraft: () => set({ draft: { ...DEFAULT_DRAFT }, step: 0 }),
}));
