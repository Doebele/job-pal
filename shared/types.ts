// ==============================================================================
// Shared Types — Job-Pal
// ==============================================================================

export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Document {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  canton: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  startDate: string | null;
  duration: string;
  isPublished: boolean;
  applicationDeadline: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobDraft {
  title: string;
  description: string;
  category: string;
  location: string;
  canton?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  startDate?: string | null;
  duration?: string | null;
  applicationDeadline?: string | null;
  isPublished?: boolean;
}

export interface Application {
  id: string;
  applicantId: string;
  jobId: string;
  coverLetter: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: Date;
  updatedAt: Date;
}

export interface ApplicationFeedback {
  id: string;
  applicationId: string;
  employerId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  purpose: 'password_reset' | 'email_verification';
  expiresAt: Date;
  createdAt: Date;
}

// --- Matching ---

export interface MatchResult {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

export interface MatchRequest {
  profileId: string;
  category?: string;
  canton?: string;
  limit?: number;
}

// --- Berufsanfänger / Wizard ---

export type SchoolType = 'sec1' | 'sec2_lehre' | 'sec2_bms' | 'matura' | 'fms' | 'other';

export type TargetRolePriority = 'primary' | 'secondary' | 'exploratory';

export interface TargetRole {
  title: string;
  branch: string;
  priority: TargetRolePriority;
}

export interface Internship {
  company: string;
  role: string;
  durationMonths: number;
  description?: string;
  skillsUsed: string[];
}

export type SoftSkillLevel = 'developing' | 'proficient' | 'advanced';

export interface SoftSkill {
  name: string;
  evidence: string;
  level: SoftSkillLevel;
}

export interface ProfileDraft {
  // Existing personal info
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  canton: string;
  bio: string;
  // Existing profile data
  skills: Skill[];
  languages: LanguageProficiency[];
  education: Education[];
  // Berufsanfänger fields
  schoolType: SchoolType | null;
  schoolName: string | null;
  graduationYear: number | null;
  targetRoles: TargetRole[];
  preferredCantons: string[];
  internships: Internship[];
  softSkills: SoftSkill[];
  motivationStatement: string | null;
  availableFrom: string | null;
  wantsTraining: boolean;
  cvParsed: boolean;
  cvParsedAt: string | null;
}

// --- Aggregated Job Search ---

export interface AggregatedJob {
  id: string;
  title: string;
  description: string;
  company?: string;
  location: string;
  canton?: string;
  url: string;
  source: string;
  sourceName: string;
  publishedAt?: string;
  category?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
}

export interface JobSourceDef {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'internal' | 'rss' | 'api' | 'deeplink';
  requiresKey: boolean;
  configKeys?: string[];
  tags: string[];
}

// --- Saved Jobs / Bookmarks ---

export type SavedJobStatus = 'saved' | 'contacted' | 'application_sent' | 'rejected' | 'invited';

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  status: SavedJobStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}
