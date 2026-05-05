import { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { JOB_KATEGORIEN, SCHNUPPERLEHREN_QUELLEN } from '@shared/constants';

interface FilterBarProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function JobFilterBar({ onFilterChange }: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  const typeOptions = [
    { value: '', label: 'Alle Typen' },
    { value: 'Lehre', label: 'Lehre' },
    { value: 'Praktikum', label: 'Praktikum' },
    { value: 'Teilzeit', label: 'Teilzeit' },
    { value: 'Vollzeit', label: 'Vollzeit' },
    { value: 'Befristet', label: 'Befristet' },
  ];
  const categoryOptions = [
    { value: '', label: 'Alle Kategorien' },
    ...JOB_KATEGORIEN.map((c) => ({ value: c, label: c })),
  ];

  const applyFilters = () => {
    const filters: Record<string, string> = {};
    if (query) filters.q = query;
    if (location) filters.location = location;
    if (category) filters.category = category;
    if (type) filters.type = type;
    onFilterChange(filters);
  };

  return (
    <div className="bp-card space-y-4">
      {/* Suche + Ort + Kategorie + Typ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Suche"
          placeholder="Job-Titel oder Beschreibung..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <Input
          label="Ort"
          placeholder="z. B. Zürich"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <Select
          label="Kategorie"
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Select
          label="Typ"
          options={typeOptions}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      {/* Schnupperlehre Hinweis */}
      {category === 'Schnupperlehre' && (
        <div className="text-fg-3 t-body-sm">
          <p className="mb-2">Weitere Schnupperlehr-Möglichkeiten:</p>
          <ul className="list-disc list-inside space-y-1">
            {SCHNUPPERLEHREN_QUELLEN.map((quelle) => (
              <li key={quelle.name}>
                <a href={quelle.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {quelle.name}
                </a>
                {quelle.description && <span className="ml-1 text-fg-3">— {quelle.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={applyFilters}
          className="bp-btn-primary"
        >
          Filter anwenden
        </button>
      </div>
    </div>
  );
}
