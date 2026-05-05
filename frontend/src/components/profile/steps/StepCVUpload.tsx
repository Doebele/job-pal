import { useState, useRef } from 'react';
import { FileUpload } from '../../ui/FileUpload';
import { Badge } from '../../ui/Badge';
import { useWizardStore } from '../../../stores/wizard-store';
import api from '../../../lib/api';
import { ParsedCvData } from '../../../stores/wizard-store';

interface StepCVUploadProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function StepCVUpload({ onComplete, onSkip }: StepCVUploadProps) {
  const { cvFile, setCvFile, cvParsedData, setCvParsedData, applyCvData, resetWizard } = useWizardStore();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setCvFile(file);
    await parseCV(file);
  };

  const parseCV = async (file: File) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/documents/cv-parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data: ParsedCvData = res.data.data;
      setCvParsedData(data);
    } catch {
      setError('CV konnte nicht analysiert werden. Du kannst die Daten auch manuell eingeben.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (cvParsedData) {
      applyCvData(cvParsedData);
    }
  };

  const handleUndo = () => {
    setCvParsedData(null);
  };

  const handleRemove = () => {
    setCvFile(null);
    setCvParsedData(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatConfidence = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'Sehr gut', variant: 'success' as const };
    if (confidence >= 0.5) return { label: 'Gut', variant: 'warning' as const };
    return { label: 'Mässig', variant: 'info' as const };
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">CV hochladen</p>
        <p className="t-body text-fg-2 mb-4">
          Lade deinen Lebenslauf hoch und wir analysieren ihn automatisch. Alle Daten werden lokal verarbeitet – keine externen Dienste.
        </p>
      </div>

      {/* Upload zone */}
      {!cvFile ? (
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          maxSizeMB={10}
        />
      ) : (
        <div className="bp-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 2h6l4 4v10a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
                <path d="M9 2v4h4" />
              </svg>
              <div>
                <p className="t-body text-fg-1 font-medium">{cvFile.name}</p>
                <p className="t-caption text-fg-3">{formatSize(cvFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="bp-btn-ghost text-t-body-sm text-fg-3 hover:text-red"
            >
              Entfernen
            </button>
          </div>

          {analyzing && (
            <div className="flex items-center gap-2 text-fg-3">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="t-body-sm">Wird analysiert...</span>
            </div>
          )}

          {error && (
            <div className="bp-card bg-red/5 border-red/20 p-3">
              <p className="t-body-sm text-red">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Parsed results */}
      {cvParsedData && !analyzing && (
        <div className="bp-card space-y-4">
          <div className="flex items-center justify-between">
            <p className="t-h3 text-fg-1">Erkannte Daten</p>
            <div className="flex items-center gap-2">
              <Badge variant={formatConfidence(cvParsedData.confidence).variant === 'success' ? 'success' : formatConfidence(cvParsedData.confidence).variant === 'warning' ? 'warning' : 'info'}>
                {formatConfidence(cvParsedData.confidence).label} — {Math.round(cvParsedData.confidence * 100)}%
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cvParsedData.name && (
              <div>
                <p className="t-caption text-fg-3 mb-1">Name</p>
                <p className="t-body text-fg-1">{cvParsedData.name}</p>
              </div>
            )}
            {cvParsedData.email && (
              <div>
                <p className="t-caption text-fg-3 mb-1">E-Mail</p>
                <p className="t-body text-fg-1">{cvParsedData.email}</p>
              </div>
            )}
            {cvParsedData.phone && (
              <div>
                <p className="t-caption text-fg-3 mb-1">Telefon</p>
                <p className="t-body text-fg-1">{cvParsedData.phone}</p>
              </div>
            )}
            {cvParsedData.address && (
              <div>
                <p className="t-caption text-fg-3 mb-1">Adresse</p>
                <p className="t-body text-fg-1">{cvParsedData.address}</p>
              </div>
            )}
          </div>

          {(cvParsedData.education?.length ?? 0) > 0 && (
            <div>
              <p className="t-caption text-fg-3 mb-2">Bildung</p>
              <div className="space-y-2">
                {cvParsedData.education?.map((edu, i) => (
                  <div key={i} className="bp-card bg-surface-2/50 p-3">
                    <p className="t-body text-fg-1 font-medium">{edu.degree} — {edu.field}</p>
                    <p className="t-body-sm text-fg-2">{edu.institution}</p>
                    <p className="t-caption text-fg-3">
                      {edu.startYear} – {edu.endYear || 'heute'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(cvParsedData.skills?.length ?? 0) > 0 && (
            <div>
              <p className="t-caption text-fg-3 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {cvParsedData.skills?.map((skill, i) => (
                  <Badge key={i} variant="info">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {(cvParsedData.languages?.length ?? 0) > 0 && (
            <div>
              <p className="t-caption text-fg-3 mb-2">Sprachen</p>
              <div className="space-y-1">
                {cvParsedData.languages?.map((lang, i) => (
                  <p key={i} className="t-body-sm text-fg-2">
                    {lang.language}: {lang.level}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="bp-btn-primary"
            >
              Daten übernehmen
            </button>
            <button
              type="button"
              onClick={handleUndo}
              className="bp-btn-secondary"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="bp-btn-ghost t-body-sm"
        >
          Später hochladen
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="bp-btn-primary"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
