// ==============================================================================
// Shared Constants — Job-Pal
// ==============================================================================

import type { SchoolType } from './types';

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
  'Junior',
  'Mid-Level',
  'Senior',
  'Praktikum',
  'Nebstbeschäftigung',
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
