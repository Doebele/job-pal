export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface LanguageProficiency {
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';
}

export interface Education {
  institution: string;
  field: string;
  degree: string;
  startYear: number;
  endYear: number | null;
  current: boolean;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  canton: string | null;
  bio: string | null;
  skills: Skill[];
  languages: LanguageProficiency[];
  education: Education[];
}
