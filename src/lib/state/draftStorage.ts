'use client';

import { cvDocumentSchema } from '@/lib/cv/schema';
import type { CVDocument } from '@/lib/cv/types';
import { createEmptyCV } from '@/lib/cv/defaults';
import { generateId } from '@/lib/utils/id';

/**
 * Local, on-device draft storage (spec §20 — Draft Management and Privacy).
 *
 * CV data and uploaded photos never leave the browser unless the user
 * explicitly triggers an AI suggestion or job-link analysis request. Nothing
 * here talks to a server.
 */

const STORAGE_PREFIX = 'oneclickcv:draft:';
const INDEX_KEY = 'oneclickcv:draft-index';
const ACTIVE_KEY = 'oneclickcv:active-draft-id';
const STORAGE_VERSION = 1;

export interface DraftIndexEntry {
  id: string;
  name: string;
  updatedAt: string;
  templateId: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readIndex(): DraftIndexEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(entries: DraftIndexEntry[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(entries));
}

function upsertIndexEntry(cv: CVDocument): void {
  const entries = readIndex();
  const existingIdx = entries.findIndex((e) => e.id === cv.meta.id);
  const entry: DraftIndexEntry = {
    id: cv.meta.id,
    name: cv.meta.name,
    updatedAt: cv.meta.updatedAt,
    templateId: cv.template.templateId,
  };
  if (existingIdx >= 0) {
    entries[existingIdx] = entry;
  } else {
    entries.push(entry);
  }
  writeIndex(entries);
}

export class DraftStorageError extends Error {}

/** Quota guard: browsers typically allow ~5MB per origin for localStorage. */
const MAX_DRAFT_BYTES = 4 * 1024 * 1024;

export function saveDraft(cv: CVDocument): { ok: true } | { ok: false; error: string } {
  if (!isBrowser()) return { ok: false, error: 'Storage unavailable' };
  try {
    const payload = JSON.stringify({ version: STORAGE_VERSION, cv });
    if (payload.length > MAX_DRAFT_BYTES) {
      return {
        ok: false,
        error:
          'This draft is too large to save locally (likely due to a high-resolution photo). Try replacing the photo with a smaller image.',
      };
    }
    window.localStorage.setItem(STORAGE_PREFIX + cv.meta.id, payload);
    upsertIndexEntry(cv);
    window.localStorage.setItem(ACTIVE_KEY, cv.meta.id);
    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      return {
        ok: false,
        error: 'Your browser storage is full. Delete an old draft or use a smaller photo.',
      };
    }
    return { ok: false, error: 'Could not save draft to this device.' };
  }
}

export function loadDraft(id: string): CVDocument | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = cvDocumentSchema.safeParse(parsed.cv ?? parsed);
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.warn('Stored draft failed validation, ignoring corrupt draft', result.error.flatten());
      return null;
    }
    return result.data as CVDocument;
  } catch {
    return null;
  }
}

export function listDrafts(): DraftIndexEntry[] {
  return readIndex().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getActiveDraftId(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function setActiveDraftId(id: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACTIVE_KEY, id);
}

export function deleteDraft(id: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_PREFIX + id);
  writeIndex(readIndex().filter((e) => e.id !== id));
  if (getActiveDraftId() === id) {
    window.localStorage.removeItem(ACTIVE_KEY);
  }
}

export function renameDraft(id: string, name: string): void {
  const cv = loadDraft(id);
  if (!cv) return;
  cv.meta.name = name;
  cv.meta.updatedAt = new Date().toISOString();
  saveDraft(cv);
}

export function duplicateDraft(id: string, newName?: string): CVDocument | null {
  const cv = loadDraft(id);
  if (!cv) return null;
  const now = new Date().toISOString();
  const duplicate: CVDocument = {
    ...cv,
    meta: {
      ...cv.meta,
      id: generateId('cv'),
      name: newName ?? `${cv.meta.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    },
  };
  saveDraft(duplicate);
  return duplicate;
}

/**
 * Creates a job-tailored copy of a draft without ever mutating the master
 * (spec §17 — Truthful Job-Tailored CV). The copy is linked back via
 * `tailoredFromId` so it can be listed alongside the master in the Draft
 * Manager.
 */
export function createTailoredCopy(
  masterId: string,
  targetCompany: string,
  targetPosition: string,
): CVDocument | null {
  const master = loadDraft(masterId);
  if (!master) return null;
  const now = new Date().toISOString();
  const tailored: CVDocument = {
    ...master,
    meta: {
      ...master.meta,
      id: generateId('cv'),
      name: `${targetPosition || 'Tailored'} — ${targetCompany || 'CV'}`,
      createdAt: now,
      updatedAt: now,
      tailoredFromId: masterId,
      tailoredForCompany: targetCompany,
      tailoredForPosition: targetPosition,
    },
  };
  saveDraft(tailored);
  return tailored;
}

export function loadOrCreateActiveDraft(): CVDocument {
  const activeId = getActiveDraftId();
  if (activeId) {
    const existing = loadDraft(activeId);
    if (existing) return existing;
  }
  // Fall back to the most recently updated draft, if any exist.
  const [latest] = listDrafts();
  if (latest) {
    const existing = loadDraft(latest.id);
    if (existing) {
      setActiveDraftId(existing.meta.id);
      return existing;
    }
  }
  const fresh = createEmptyCV('My CV');
  saveDraft(fresh);
  return fresh;
}
