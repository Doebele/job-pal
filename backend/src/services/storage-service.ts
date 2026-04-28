// ==============================================================================
// Storage Service — File Upload Abstraction (Local FS Phase 1, S3-ready)
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config';

const UPLOAD_DIR = path.resolve(config.UPLOAD_DIR);

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType?: string
): Promise<UploadedFile> {
  ensureUploadDir();

  const id = crypto.randomUUID();
  const ext = path.extname(originalName) || '.bin';
  const filename = `${id}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  return {
    id,
    filename,
    originalName,
    mimeType: mimeType || 'application/octet-stream',
    size: buffer.length,
  };
}

export function getFileBuffer(filename: string): Buffer | null {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

export function deleteFile(filename: string): boolean {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

// Placeholder for S3 adapter
export interface StorageAdapter {
  upload(buffer: Buffer, originalName: string): Promise<UploadedFile>;
  get(filename: string): Buffer | null;
  delete(filename: string): boolean;
}
