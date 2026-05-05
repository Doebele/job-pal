import { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { JOB_KATEGORIEN, SCHWEIZER_KANTONE, SCHNUPPERLEHREN_QUELLEN } from '@shared/constants';
import { useSourcesStore } from '../../stores/sources-store';

interface FilterBarProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function JobFilterBar({ onFilterChange }: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [canton, setCanton] = useState('');
  const { enabledSourceIds, toggleSource, getAllSources } = useSourcesStore();

  const kantoneOptions = [
    { value: '', label: 'Alle Kantone' },
    ...Object.entries(SCHWEIZER_KANTONE).map(([k, v]) => ({ value: k, label: v })),
  ];
  const categoryOptions = [
    { value: '', label: 'Alle Kategorien' },
    ...JOB_KATEGORIEN.map((c) => ({ value: c, label: c })),
  ];

  const allSources = getAllSources();

  const applyFilters = () => {
    const filters: Record<string, string> = {};
    if (query) filters.q = query;
    if (category) filters.category = category;
    if (canton) filters.canton = canton;
    if (enabledSourceIds.length > 0) filters.sources = enabledSourceIds.join(',');
    onFilterChange(filters);
  };

  return (
    <div className="bp-card space-y-4">
      {/* Search + Kategorie + Kanton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Suche"
          placeholder="Job-Titel oder Beschreibung..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
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

      {/* Quellen-Auswahl */}
      <div>
        <p className="eyebrow mb-2">Quellen</p>
        <div className="flex flex-wrap gap-2">
          {allSources.map((source) => {
            const active = enabledSourceIds.includes(source.id);
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => toggleSource(source.id)}
                title={source.description}
                className={`t-body-sm px-3 py-1 rounded-full border transition-colors ${
                  active
                    ? 'bg-accent/10 border-accent/40 text-accent'
                    : 'bg-surface-2 border-border text-fg-3 hover:border-fg-3'
                }`}
              >
                {source.name}
                {source.requiresKey && (
                  <span className="ml-1 opacity-50" title="API-Key erforderlich">🔑</span>
                )}
              </button>
            );
          })}
        </div>
        {enabledSourceIds.length === 0 && (
          <p className="t-caption text-red mt-1">Mindestens eine Quelle muss ausgewählt sein.</p>
        )}
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
          disabled={enabledSourceIds.length === 0}
          className="bp-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Filter anwenden
        </button>
      </div>
    </div>
  );
}
