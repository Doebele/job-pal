import { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { JOB_KATEGORIEN, SCHWEIZER_KANTONE } from '@shared/constants';

interface FilterBarProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function JobFilterBar({ onFilterChange }: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [canton, setCanton] = useState('');

  const kantoneOptions = [{ value: '', label: 'Alle Kantone' }, ...Object.entries(SCHWEIZER_KANTONE).map(([k, v]) => ({ value: k, label: v }))];
  const categoryOptions = [{ value: '', label: 'Alle Kategorien' }, ...JOB_KATEGORIEN.map((c) => ({ value: c, label: c }))];

  const applyFilters = () => {
    const filters: Record<string, string> = {};
    if (query) filters.q = query;
    if (category) filters.category = category;
    if (canton) filters.canton = canton;
    onFilterChange(filters);
  };

  return (
    <div className="bp-card gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Suche"
          placeholder="Job-Titel oder Beschreibung..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Kategorie"
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Select
          label="Kanton"
          options={kantoneOptions}
          value={canton}
          onChange={(e) => setCanton(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <button onClick={applyFilters} className="bp-btn-primary">
          Filter anwenden
        </button>
      </div>
    </div>
  );
}
