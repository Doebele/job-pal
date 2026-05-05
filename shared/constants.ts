// ==============================================================================
// Shared Constants — Job-Pal
// ==============================================================================

import type { SchoolType, JobSourceDef } from './types';

export const SCHWEIZER_KANTONE: Record<string, string> = {
  'ZH': 'Zürich',
  'BE': 'Bern',
  'LU': 'Luzern',
  'UR': 'Uri',
  'SZ': 'Schwyz',
  'OW': 'Obwalden',
  'NW': 'Nidwalden',
  'GL': 'Glarus',
  'ZG': 'Zug',
  'FR': 'Freiburg',
  'SO': 'Solothurn',
  'BS': 'Basel-Stadt',
  'BL': 'Basel-Landschaft',
  'SH': 'Schaffhausen',
  'AR': 'Appenzell Ausserrhoden',
  'AI': 'Appenzell Innerrhoden',
  'SG': 'St. Gallen',
  'GR': 'Graubünden',
  'AG': 'Aargau',
  'TG': 'Thurgau',
  'TI': 'Tessin',
  'VD': 'Waadt',
  'VS': 'Wallis',
  'NE': 'Neuenburg',
  'GE': 'Genf',
  'JU': 'Jura',
};

export const BRANCHEN: string[] = [
  'Banken & Finanzen',
  'Versicherungen',
  'IT & Software',
  'E-Commerce',
  'Maschinenbau',
  'Pharmazie & Life Sciences',
  'Handel',
  'Gastronomie & Hotellerie',
  'Gesundheitswesen',
  'Bildung',
  'Öffentlicher Dienst',
  'Logistik & Transport',
  'Energie & Umwelt',
  'Medien & Kommunikation',
  'Rechtswesen',
  'Bauwesen',
  'Tourismus',
  'Andere',
];

export const SPRACHEN: string[] = [
  'Deutsch',
  'Französisch',
  'Italienisch',
  'Englisch',
  'Rätoromanisch',
];

export const JOB_KATEGORIEN: string[] = [
  'Lehre / Ausbildung',
  'Schnupperlehre',
  'Ferienjob',
  'Junior',
  'Mid-Level',
  'Senior',
  'Praktikum',
  'Nebstbeschäftigung',
];

export const SCHNUPPERLEHREN_QUELLEN: { name: string; url: string; description: string }[] = [
  {
    name: 'berufsberatung.ch',
    url: 'https://www.berufsberatung.ch/dyn/show/2732',
    description: 'Offizielle Schnupperlehre-Liste der SEBB',
  },
  {
    name: 'schnuppy.ch',
    url: 'https://www.schnuppy.ch/',
    description: 'Schnupperlehr-Plattform der Stiftung jugend+arbeit',
  },
];

export const CURRENCY_MAP: Record<string, string> = {
  CH: 'CHF',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
};

// --- Schulsystem (CH) ---

export const SCHULSYSTEM_CH: Record<SchoolType, string> = {
  'sec1': 'Sekundarstufe 1',
  'sec2_lehre': 'Berufsllehre (Sek 2)',
  'sec2_bms': 'Berufsmaturität (BMS)',
  'matura': 'Matura / Gymnasium',
  'fms': 'FMS',
  'other': 'Andere',
};

// --- Soft-Skill-Vorschläge ---

export const SOFT_SKILL_SUGGESTIONS: string[] = [
  'Teamarbeit',
  'Kommunikation',
  'Problemlösung',
  'Kreativität',
  'Flexibilität',
  'Zeitenmanagement',
  'Konfliktlösung',
  'Empathie',
  'Führung',
  'Kritisches Denken',
  'Selbstorganisation',
  'Belastbarkeit',
];

// --- Target Role Branchen-Filter (subset für Berufsanfänger) ---

// --- Job-Quellen / Aggregationsquellen ---

export const DEFAULT_JOB_SOURCES: JobSourceDef[] = [
  {
    id: 'job-pal',
    name: 'Job-Pal',
    description: 'Direkt von Arbeitgebern auf Job-Pal erfasste Stellen',
    url: 'https://jobpal.ch',
    type: 'internal',
    requiresKey: false,
    tags: ['CH'],
  },
  {
    id: 'adzuna',
    name: 'Adzuna',
    description: 'Aggregiert Stellen von jobs.ch, jobscout24 und hunderten weiterer CH-Portale (API-Key erforderlich)',
    url: 'https://www.adzuna.ch',
    type: 'api',
    requiresKey: true,
    configKeys: ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'],
    tags: ['CH', 'aggregator'],
  },
];

// Deep-link Quellen: Kein API/RSS — öffnen eine Suche im Browser-Tab des Users
export const DEEPLINK_SOURCES: Array<{
  id: string;
  name: string;
  url: string;
  buildUrl: (q?: string, canton?: string) => string;
  description: string;
}> = [
  {
    id: 'jobs-ch',
    name: 'jobs.ch',
    url: 'https://www.jobs.ch',
    buildUrl: (q, canton) =>
      `https://www.jobs.ch/de/stellenangebote/?term=${encodeURIComponent(q ?? '')}&region=${encodeURIComponent(canton ?? '')}`,
    description: 'Grösstes Schweizer Jobportal',
  },
  {
    id: 'jobscout24',
    name: 'JobScout24',
    url: 'https://www.jobscout24.ch',
    buildUrl: (q, canton) =>
      `https://www.jobscout24.ch/de/jobs/${encodeURIComponent(q ?? '')}`,
    description: 'Scout24 Stellenmarkt Schweiz',
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    url: 'https://www.glassdoor.ch',
    buildUrl: (q, canton) =>
      `https://www.glassdoor.ch/Job/jobs.htm?sc.keyword=${encodeURIComponent(q ?? '')}&locT=N&locId=272&locKeyword=Switzerland`,
    description: 'Jobs + Firmenrezensionen (öffnet in neuem Tab)',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs',
    buildUrl: (q, canton) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q ?? '')}&location=Switzerland`,
    description: 'LinkedIn Stellenangebote Schweiz',
  },
  {
    id: 'berufsberatung',
    name: 'berufsberatung.ch',
    url: 'https://www.berufsberatung.ch',
    buildUrl: (q) =>
      `https://www.berufsberatung.ch/dyn/show/2732?id=&term=${encodeURIComponent(q ?? '')}`,
    description: 'Offizielle Schnupperlehren & Lehrstellen (SEBB)',
  },
];

// --- Target Role Branchen-Filter (subset für Berufsanfänger) ---

export const JUNIOR_BRANCHEN: string[] = [
  'IT & Software',
  'Banken & Finanzen',
  'Versicherungen',
  'E-Commerce',
  'Maschinenbau',
  'Pharmazie & Life Sciences',
  'Handel',
  'Gesundheitswesen',
  'Bildung',
  'Öffentlicher Dienst',
  'Logistik & Transport',
  'Bauwesen',
  'Medien & Kommunikation',
];
