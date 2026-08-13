'use client';

import { create } from 'zustand';
import type {
  CVDocument,
  CVSectionId,
  ColorPresetId,
  TemplateId,
  WorkExperienceEntry,
  EducationEntry,
  CertificationEntry,
  ProjectEntry,
  ReferenceEntry,
  SkillEntry,
  LanguageEntry,
  PersonalDetails,
  UAEDetails,
  PhotoState,
} from '@/lib/cv/types';
import { saveDraft, loadOrCreateActiveDraft } from './draftStorage';
import {
  createEmptyCV,
  createEmptyWorkExperience,
  createEmptyEducation,
  createEmptyCertification,
  createEmptyProject,
  createEmptyReference,
} from '@/lib/cv/defaults';
import { generateId } from '@/lib/utils/id';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UndoSnapshot {
  fieldPath: string;
  previousValue: unknown;
  label: string;
}

interface CVStoreState {
  cv: CVDocument;
  hydrated: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  lastUndo: UndoSnapshot | null;

  hydrate: () => void;
  replaceCV: (cv: CVDocument) => void;

  updatePersonal: (patch: Partial<PersonalDetails>) => void;
  updateUAE: (patch: Partial<UAEDetails>) => void;
  updateSummary: (summary: string) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<WorkExperienceEntry>) => void;
  removeExperience: (id: string) => void;
  duplicateExperience: (id: string) => void;
  reorderExperience: (fromIndex: number, toIndex: number) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (fromIndex: number, toIndex: number) => void;

  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<CertificationEntry>) => void;
  removeCertification: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;

  addReference: () => void;
  updateReference: (id: string, patch: Partial<ReferenceEntry>) => void;
  removeReference: (id: string) => void;

  addSkill: (kind: 'technical' | 'soft', skill: Omit<SkillEntry, 'id'>) => void;
  removeSkill: (kind: 'technical' | 'soft', id: string) => void;

  addLanguage: (language: Omit<LanguageEntry, 'id'>) => void;
  updateLanguage: (id: string, patch: Partial<LanguageEntry>) => void;
  removeLanguage: (id: string) => void;

  setTemplate: (templateId: TemplateId) => void;
  setColorPreset: (colorPreset: ColorPresetId) => void;

  toggleSectionHidden: (section: CVSectionId) => void;
  reorderSections: (order: CVSectionId[]) => void;

  updatePhoto: (patch: Partial<PhotoState>) => void;

  applyTextWithUndo: (fieldPath: string, newValue: string, label: string) => void;
  undoLastChange: () => void;

  persist: () => void;
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAutosave(get: () => CVStoreState, set: (partial: Partial<CVStoreState>) => void) {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  set({ saveStatus: 'saving' });
  autosaveTimer = setTimeout(() => {
    const { cv } = get();
    const result = saveDraft({ ...cv, meta: { ...cv.meta, updatedAt: new Date().toISOString() } });
    if (result.ok) {
      set({ saveStatus: 'saved', saveError: null });
    } else {
      set({ saveStatus: 'error', saveError: result.error });
    }
  }, 600);
}

export const useCVStore = create<CVStoreState>((set, get) => ({
  cv: loadOrCreateActiveDraftSafe(),
  hydrated: false,
  saveStatus: 'idle',
  saveError: null,
  lastUndo: null,

  hydrate: () => {
    set({ cv: loadOrCreateActiveDraftSafe(), hydrated: true });
  },

  replaceCV: (cv) => {
    set({ cv, lastUndo: null });
    scheduleAutosave(get, set);
  },

  updatePersonal: (patch) => {
    set((s) => ({ cv: { ...s.cv, personal: { ...s.cv.personal, ...patch } } }));
    scheduleAutosave(get, set);
  },

  updateUAE: (patch) => {
    set((s) => ({ cv: { ...s.cv, uae: { ...s.cv.uae, ...patch } } }));
    scheduleAutosave(get, set);
  },

  updateSummary: (summary) => {
    set((s) => ({ cv: { ...s.cv, summary } }));
    scheduleAutosave(get, set);
  },

  addExperience: () => {
    set((s) => ({ cv: { ...s.cv, experience: [...s.cv.experience, createEmptyWorkExperience()] } }));
    scheduleAutosave(get, set);
  },
  updateExperience: (id, patch) => {
    set((s) => ({
      cv: {
        ...s.cv,
        experience: s.cv.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    }));
    scheduleAutosave(get, set);
  },
  removeExperience: (id) => {
    set((s) => ({ cv: { ...s.cv, experience: s.cv.experience.filter((e) => e.id !== id) } }));
    scheduleAutosave(get, set);
  },
  duplicateExperience: (id) => {
    set((s) => {
      const source = s.cv.experience.find((e) => e.id === id);
      if (!source) return s;
      const copy: WorkExperienceEntry = { ...source, id: generateId('exp') };
      const index = s.cv.experience.findIndex((e) => e.id === id);
      const next = [...s.cv.experience];
      next.splice(index + 1, 0, copy);
      return { cv: { ...s.cv, experience: next } };
    });
    scheduleAutosave(get, set);
  },
  reorderExperience: (fromIndex, toIndex) => {
    set((s) => {
      const next = [...s.cv.experience];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return s;
      next.splice(toIndex, 0, moved);
      return { cv: { ...s.cv, experience: next } };
    });
    scheduleAutosave(get, set);
  },

  addEducation: () => {
    set((s) => ({ cv: { ...s.cv, education: [...s.cv.education, createEmptyEducation()] } }));
    scheduleAutosave(get, set);
  },
  updateEducation: (id, patch) => {
    set((s) => ({
      cv: { ...s.cv, education: s.cv.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) },
    }));
    scheduleAutosave(get, set);
  },
  removeEducation: (id) => {
    set((s) => ({ cv: { ...s.cv, education: s.cv.education.filter((e) => e.id !== id) } }));
    scheduleAutosave(get, set);
  },
  reorderEducation: (fromIndex, toIndex) => {
    set((s) => {
      const next = [...s.cv.education];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return s;
      next.splice(toIndex, 0, moved);
      return { cv: { ...s.cv, education: next } };
    });
    scheduleAutosave(get, set);
  },

  addCertification: () => {
    set((s) => ({
      cv: { ...s.cv, certifications: [...s.cv.certifications, createEmptyCertification()] },
    }));
    scheduleAutosave(get, set);
  },
  updateCertification: (id, patch) => {
    set((s) => ({
      cv: {
        ...s.cv,
        certifications: s.cv.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      },
    }));
    scheduleAutosave(get, set);
  },
  removeCertification: (id) => {
    set((s) => ({ cv: { ...s.cv, certifications: s.cv.certifications.filter((c) => c.id !== id) } }));
    scheduleAutosave(get, set);
  },

  addProject: () => {
    set((s) => ({ cv: { ...s.cv, projects: [...s.cv.projects, createEmptyProject()] } }));
    scheduleAutosave(get, set);
  },
  updateProject: (id, patch) => {
    set((s) => ({
      cv: { ...s.cv, projects: s.cv.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) },
    }));
    scheduleAutosave(get, set);
  },
  removeProject: (id) => {
    set((s) => ({ cv: { ...s.cv, projects: s.cv.projects.filter((p) => p.id !== id) } }));
    scheduleAutosave(get, set);
  },

  addReference: () => {
    set((s) => ({ cv: { ...s.cv, references: [...s.cv.references, createEmptyReference()] } }));
    scheduleAutosave(get, set);
  },
  updateReference: (id, patch) => {
    set((s) => ({
      cv: { ...s.cv, references: s.cv.references.map((r) => (r.id === id ? { ...r, ...patch } : r)) },
    }));
    scheduleAutosave(get, set);
  },
  removeReference: (id) => {
    set((s) => ({ cv: { ...s.cv, references: s.cv.references.filter((r) => r.id !== id) } }));
    scheduleAutosave(get, set);
  },

  addSkill: (kind, skill) => {
    set((s) => ({
      cv: {
        ...s.cv,
        skills: {
          ...s.cv.skills,
          [kind]: [...s.cv.skills[kind], { ...skill, id: generateId('skill') }],
        },
      },
    }));
    scheduleAutosave(get, set);
  },
  removeSkill: (kind, id) => {
    set((s) => ({
      cv: { ...s.cv, skills: { ...s.cv.skills, [kind]: s.cv.skills[kind].filter((sk) => sk.id !== id) } },
    }));
    scheduleAutosave(get, set);
  },

  addLanguage: (language) => {
    set((s) => ({
      cv: { ...s.cv, languages: [...s.cv.languages, { ...language, id: generateId('lang') }] },
    }));
    scheduleAutosave(get, set);
  },
  updateLanguage: (id, patch) => {
    set((s) => ({
      cv: { ...s.cv, languages: s.cv.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)) },
    }));
    scheduleAutosave(get, set);
  },
  removeLanguage: (id) => {
    set((s) => ({ cv: { ...s.cv, languages: s.cv.languages.filter((l) => l.id !== id) } }));
    scheduleAutosave(get, set);
  },

  setTemplate: (templateId) => {
    // Switching templates must never drop data (spec §6/§9) — only the
    // `template` field changes here.
    set((s) => ({ cv: { ...s.cv, template: { ...s.cv.template, templateId } } }));
    scheduleAutosave(get, set);
  },
  setColorPreset: (colorPreset) => {
    set((s) => ({ cv: { ...s.cv, template: { ...s.cv.template, colorPreset } } }));
    scheduleAutosave(get, set);
  },

  toggleSectionHidden: (section) => {
    set((s) => {
      const hidden = s.cv.sections.hidden.includes(section)
        ? s.cv.sections.hidden.filter((h) => h !== section)
        : [...s.cv.sections.hidden, section];
      return { cv: { ...s.cv, sections: { ...s.cv.sections, hidden } } };
    });
    scheduleAutosave(get, set);
  },
  reorderSections: (order) => {
    set((s) => ({ cv: { ...s.cv, sections: { ...s.cv.sections, order } } }));
    scheduleAutosave(get, set);
  },

  updatePhoto: (patch) => {
    set((s) => ({ cv: { ...s.cv, photo: { ...s.cv.photo, ...patch } } }));
    scheduleAutosave(get, set);
  },

  applyTextWithUndo: (fieldPath, newValue, label) => {
    set((s) => {
      const previousValue = getByPath(s.cv, fieldPath);
      const nextCV = setByPath(s.cv, fieldPath, newValue);
      return { cv: nextCV, lastUndo: { fieldPath, previousValue, label } };
    });
    scheduleAutosave(get, set);
  },

  undoLastChange: () => {
    const { lastUndo } = get();
    if (!lastUndo) return;
    set((s) => ({
      cv: setByPath(s.cv, lastUndo.fieldPath, lastUndo.previousValue),
      lastUndo: null,
    }));
    scheduleAutosave(get, set);
  },

  persist: () => {
    scheduleAutosave(get, set);
  },
}));

function loadOrCreateActiveDraftSafe(): CVDocument {
  if (typeof window === 'undefined') {
    // Server render placeholder — replaced on the client by hydrate().
    return createEmptyCV('My CV');
  }
  return loadOrCreateActiveDraft();
}

/** Minimal dotted-path get/set used only for the small set of AI-editable text fields. */
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function setByPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const clone: Record<string, unknown> = {
    ...(obj as unknown as Record<string, unknown>),
  };
  let cursor = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string;
    const current = cursor[key];
    const nextLevel: Record<string, unknown> =
      current && typeof current === 'object' && !Array.isArray(current)
        ? { ...(current as Record<string, unknown>) }
        : {};
    cursor[key] = nextLevel;
    cursor = nextLevel;
  }
  cursor[keys[keys.length - 1] as string] = value;
  return clone as T;
}
