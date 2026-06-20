// ==============================================================================
// Drizzle ORM Schema — Job-Pal
// ==============================================================================

import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  json,
  jsonb,
  integer,
  uuid,
  unique,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  canton: varchar('canton', { length: 50 }),
  bio: text('bio'),
  skills: jsonb('skills').default([]),
  languages: jsonb('languages').default([]),
  education: jsonb('education').default([]),
  // Berufsanfänger fields
  schoolType: varchar('school_type', { length: 30 }),
  schoolName: varchar('school_name', { length: 255 }),
  graduationYear: integer('graduation_year'),
  targetRoles: jsonb('target_roles').default([]),
  preferredCantons: jsonb('preferred_cantons').default([]),
  internships: jsonb('internships').default([]),
  softSkills: jsonb('soft_skills').default([]),
  motivationStatement: text('motivation_statement'),
  availableFrom: varchar('available_from', { length: 7 }),
  wantsTraining: boolean('wants_training').default(false),
  cvParsed: boolean('cv_parsed').default(false),
  cvParsedAt: timestamp('cv_parsed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  employerId: uuid('employer_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  canton: varchar('canton', { length: 50 }),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryCurrency: varchar('salary_currency', { length: 10 }).default('CHF'),
  startDate: varchar('start_date', { length: 50 }),
  duration: varchar('duration', { length: 100 }),
  isPublished: boolean('is_published').default(false).notNull(),
  applicationDeadline: varchar('application_deadline', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicantId: uuid('applicant_id')
    .notNull()
    .references(() => users.id),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id),
  coverLetter: text('cover_letter'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationFeedback = pgTable('application_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id')
    .notNull()
    .references(() => applications.id),
  employerId: uuid('employer_id')
    .notNull()
    .references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const passwordResets = pgTable('password_resets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const savedJobs = pgTable('saved_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('saved').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userJobUnique: unique('uq_saved_jobs_user_job').on(table.userId, table.jobId),
}));
