import { create } from 'zustand';

interface MatchResult {
  job: any;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

interface MatchingState {
  matches: MatchResult[];
  isMatching: boolean;
  setMatches: (matches: MatchResult[]) => void;
  setMatching: (isMatching: boolean) => void;
  clearMatches: () => void;
}

export const useMatchingStore = create<MatchingState>()((set) => ({
  matches: [],
  isMatching: false,

  setMatches: (matches) => set({ matches }),
  setMatching: (isMatching) => set({ isMatching }),
  clearMatches: () => set({ matches: [] }),
}));
