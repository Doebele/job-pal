import { useState } from 'react';
import { FileUpload } from '../ui/FileUpload';
import { Badge } from '../ui/Badge';
import api from '../../lib/api';

interface DocumentFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export function DocumentUploader() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocuments((prev) => [res.data.document, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Dokument wirklich löschen?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDownload = async (doc: DocumentFile) => {
    try {
      const res = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <FileUpload onFileSelect={handleFileSelect} maxSizeMB={10} />

      {uploading && (
        <p className="t-body-sm text-fg-3">Hochladen...</p>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bp-card flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 2h6l4 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
                  <path d="M9 2v4h4" />
                </svg>
                <div>
                  <p className="t-body-sm text-fg-1">{doc.originalName}</p>
                  <p className="t-caption text-fg-3">{formatSize(doc.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">
                  {doc.mimeType.split('/')[1]?.toUpperCase()}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="bp-btn-ghost text-t-body-sm"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bp-btn-ghost text-t-body-sm text-fg-3 hover:text-red"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
