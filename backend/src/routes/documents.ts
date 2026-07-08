// ==============================================================================
// Document Routes — Upload, list, download, delete
// ==============================================================================

import { Hono, type Context } from 'hono';
import { db } from '../db';
import { documents } from '../models/schema';
import { eq } from 'drizzle-orm';
import { config } from '../config';
import { uploadFile, getFileBuffer, deleteFile } from '../services/storage-service';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

const router = new Hono();

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]);

interface ParsedUpload {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

function isUploadedFile(value: unknown): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as File).arrayBuffer === 'function' &&
    typeof (value as File).name === 'string'
  );
}

type UploadResult =
  | { file: ParsedUpload; error?: never }
  | { file?: never; error: Response };

async function parseUploadedFile(c: Context): Promise<UploadResult> {
  const body = await c.req.parseBody();
  const upload = body.file;

  if (!isUploadedFile(upload)) {
    return { error: c.json({ error: 'No file uploaded' }, 400) };
  }

  const mimeType = upload.type || 'application/octet-stream';
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { error: c.json({ error: 'File type not allowed' }, 400) };
  }

  if (upload.size > config.MAX_FILE_SIZE) {
    return { error: c.json({ error: 'File too large' }, 413) };
  }

  const buffer = Buffer.from(await upload.arrayBuffer());
  return {
    file: {
      buffer,
      originalName: upload.name || 'upload.bin',
      mimeType,
      size: buffer.length,
    },
  };
}

// POST /api/documents/upload
router.post('/upload', async (c) => {
  const userId = (c as any).user.id;

  try {
    const parsedUpload = await parseUploadedFile(c);
    if (parsedUpload.error) return parsedUpload.error;

    const uploaded = await uploadFile(parsedUpload.file.buffer, parsedUpload.file.originalName, parsedUpload.file.mimeType);

    const [document] = await db.insert(documents).values({
      userId,
      filename: uploaded.filename,
      originalName: uploaded.originalName,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
    }).returning();

    return c.json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: document.size,
      },
    }, 201);
  } catch (error) {
    console.error('[Documents] Upload error:', error);
    return c.json({ error: 'File upload failed' }, 500);
  }
});

// GET /api/documents/list
router.get('/list', async (c) => {
  const userId = (c as any).user.id;

  const docs = await db
    .select({
      id: documents.id,
      filename: documents.filename,
      originalName: documents.originalName,
      mimeType: documents.mimeType,
      size: documents.size,
      uploadedAt: documents.uploadedAt,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(documents.uploadedAt);

  return c.json({ documents: docs });
});

// GET /api/documents/:id/download
router.get('/:id/download', async (c) => {
  const userId = (c as any).user.id;
  const docId = c.req.param('id');

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, docId))
    .limit(1);

  if (!doc || doc.userId !== userId) {
    return c.json({ error: 'Document not found' }, 404);
  }

  const buffer = getFileBuffer(doc.filename);
  if (!buffer) {
    return c.json({ error: 'File not found on storage' }, 404);
  }

  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  return c.body(body, 200, {
    'Content-Type': doc.mimeType,
    'Content-Disposition': `attachment; filename="${doc.originalName}"`,
  });
});

// DELETE /api/documents/:id
router.delete('/:id', async (c) => {
  const userId = (c as any).user.id;
  const docId = c.req.param('id');

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, docId))
    .limit(1);

  if (!doc || doc.userId !== userId) {
    return c.json({ error: 'Document not found' }, 404);
  }

  deleteFile(doc.filename);
  await db.delete(documents).where(eq(documents.id, docId));

  return c.json({ message: 'Document deleted' });
});

// ==============================================================================
// POST /api/documents/cv-parse — Parse CV and return structured data
// ==============================================================================

router.post('/cv-parse', async (c) => {
  try {
    const parsedUpload = await parseUploadedFile(c);
    if (parsedUpload.error) return parsedUpload.error;
    const { file } = parsedUpload;

    let text = '';

    if (file.mimeType === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      text = pdfData.text;
    } else if (file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimeType === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value;
    } else if (file.mimeType.startsWith('image/')) {
      return c.json({
        data: {
          confidence: 0,
          message: 'Bild-Upload wird unterstützt, aber Text-Extraktion erfordert einen OCR-Dienst. Bitte lade PDF oder DOCX hoch.',
        },
      }, 200);
    } else {
      return c.json({ error: 'Dateityp nicht unterstützt' }, 400);
    }

    const parsed = parseCVText(text);

    return c.json({ data: parsed });
  } catch (error) {
    console.error('[CV-Parse] Error:', error);
    return c.json({ error: 'CV-Parsing fehlgeschlagen' }, 500);
  }
});

// ==============================================================================
// CV Text Parser — heuristic-based extraction
// ==============================================================================

interface ParsedCVResult {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  education?: { institution: string; field: string; degree: string; startYear: number; endYear: number | null }[];
  skills?: string[];
  languages?: { language: string; level: string }[];
  internships?: { company: string; role: string; durationMonths: number; description?: string; skillsUsed: string[] }[];
  confidence: number;
}

function parseCVText(text: string): ParsedCVResult {
  const result: ParsedCVResult = { confidence: 0 };
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullText = text.toLowerCase();

  // Extract name (usually first non-empty line)
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length > 2 && firstLine.length < 50 && !firstLine.includes('@') && !firstLine.match(/\d/)) {
      result.name = firstLine;
    }
  }

  // Extract email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const emails = fullText.match(emailRegex);
  if (emails) result.email = emails[0];

  // Extract phone (Swiss formats)
  const phonePatterns = [
    /(\+41|0041|0)[\s\-]?[1-9]\d[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/,
    /(\+41|0041|0)[\s\-]?[1-9]\d[\s\-]?\d{7}/,
  ];
  for (const pattern of phonePatterns) {
    const match = fullText.match(pattern);
    if (match) { result.phone = match[0]; break; }
  }

  // Extract education
  const eduLines: string[] = [];
  let inEduSection = false;
  const eduKeywords = ['bildung', 'education', 'schul', 'lehre', 'matura', 'bms', 'gymnasium', 'sek', 'studium', 'abschluss'];

  for (const line of lines) {
    const lineLower = line.toLowerCase();
    if (eduKeywords.some((k) => lineLower.includes(k))) {
      inEduSection = true;
      continue;
    }
    if (inEduSection && line.match(/^[\w\s\/\.\-]+$/) && line.length > 3 && line.length < 80) {
      // Stop at non-education sections
      const sectionKeywords = ['erfahrung', 'beruf', 'arbeit', 'skills', 'kompetenzen', 'sprachen', 'language', 'kontakt', 'adresse'];
      if (sectionKeywords.some((k) => lineLower.includes(k)) && !line.match(/[\d]/)) {
        inEduSection = false;
        continue;
      }
      eduLines.push(line);
    } else if (inEduSection) {
      inEduSection = false;
    }
  }

  if (eduLines.length > 0) {
    result.education = eduLines.slice(0, 5).map((line) => {
      const yearMatch = line.match(/(19|20)\d{2}/g);
      const startYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear() - 4;
      return {
        institution: line,
        field: '',
        degree: '',
        startYear,
        endYear: yearMatch?.[1] ? parseInt(yearMatch[1]) : null,
      };
    });
  }

  // Extract skills (heuristic: look for skill-like patterns)
  const commonSkills = [
    'javascript', 'typescript', 'react', 'html', 'css', 'python', 'sql', 'git',
    'agile', 'scrum', 'teamarbeit', 'kommunikation', 'problem solving', 'excel',
    'powerpoint', 'word', 'photoshop', 'deutsch', 'englisch', 'französisch',
    'projektmanagement', 'organisation', 'kundenkontakt', 'leadership',
  ];
  const foundSkills = commonSkills.filter((skill) => fullText.includes(skill));
  if (foundSkills.length > 0) result.skills = foundSkills;

  // Extract languages
  const langLines = lines.filter((line) =>
    ['deutsch', 'englisch', 'französisch', 'italienisch', 'rätoromanisch', 'english', 'german', 'french'].some((l) => line.toLowerCase().includes(l))
  );
  if (langLines.length > 0) {
    result.languages = langLines.slice(0, 5).map((line) => {
      const levelMatch = line.match(/(a1|a2|b1|b2|c1|c2|native|muttersprache|fluency|fortgeschritten|grundk)/i);
      return {
        language: line.split(/[\s\-]+/)[0],
        level: levelMatch ? levelMatch[0] : 'unknown',
      };
    });
  }

  // Calculate confidence score
  let score = 0;
  const fields = [result.name, result.email, result.phone, result.education, result.skills, result.languages];
  const filled = fields.filter((f) => f !== undefined && f !== null && (Array.isArray(f) ? f.length > 0 : true)).length;
  result.confidence = filled / fields.length;

  return result;
}

export default router;
