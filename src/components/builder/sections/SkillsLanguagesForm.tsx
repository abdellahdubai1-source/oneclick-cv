'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import AISuggestBox from '@/components/builder/ai/AISuggestBox';
import type { LanguageProficiency } from '@/lib/cv/types';
import { inferProfessionFromTitle } from '@/lib/cv/professionProfiles';

const PROFICIENCIES: LanguageProficiency[] = ['basic', 'conversational', 'fluent', 'native'];

export default function SkillsLanguagesForm() {
  const cv = useCVStore((s) => s.cv);
  const addSkill = useCVStore((s) => s.addSkill);
  const removeSkill = useCVStore((s) => s.removeSkill);
  const addLanguage = useCVStore((s) => s.addLanguage);
  const updateLanguage = useCVStore((s) => s.updateLanguage);
  const removeLanguage = useCVStore((s) => s.removeLanguage);

  const [techInput, setTechInput] = useState('');
  const [softInput, setSoftInput] = useState('');
  const [langInput, setLangInput] = useState('');

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Technical Skills</h2>
        <SkillEditor
          items={cv.skills.technical}
          value={techInput}
          onValueChange={setTechInput}
          onAdd={(name) => addSkill('technical', { name })}
          onRemove={(id) => removeSkill('technical', id)}
        />
        <div className="mt-3">
          <AISuggestBox
            field="skills"
            text=""
            context={{
              professionalTitle: cv.personal.professionalTitle,
              profession: inferProfessionFromTitle(cv.personal.professionalTitle),
              existingSkills: cv.skills.technical.map((s) => s.name),
            }}
            onApply={() => {}}
            onApplyItem={(item) => addSkill('technical', { name: item })}
          />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Soft Skills</h2>
        <SkillEditor
          items={cv.skills.soft}
          value={softInput}
          onValueChange={setSoftInput}
          onAdd={(name) => addSkill('soft', { name })}
          onRemove={(id) => removeSkill('soft', id)}
        />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Languages</h2>
        <div className="mt-3 space-y-2">
          {cv.languages.map((l) => (
            <div key={l.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-ink-800">{l.name}</span>
              <select
                className="input w-40"
                value={l.proficiency}
                onChange={(e) => updateLanguage(l.id, { proficiency: e.target.value as LanguageProficiency })}
              >
                {PROFICIENCIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => removeLanguage(l.id)} className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-500 hover:bg-ink-50">
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            value={langInput}
            onChange={(e) => setLangInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && langInput.trim()) {
                e.preventDefault();
                addLanguage({ name: langInput.trim(), proficiency: 'conversational' });
                setLangInput('');
              }
            }}
            placeholder="e.g. Arabic"
          />
          <button
            type="button"
            onClick={() => {
              if (langInput.trim()) {
                addLanguage({ name: langInput.trim(), proficiency: 'conversational' });
                setLangInput('');
              }
            }}
            className="btn-secondary"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function SkillEditor({
  items,
  value,
  onValueChange,
  onAdd,
  onRemove,
}: {
  items: { id: string; name: string }[];
  value: string;
  onValueChange: (v: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">
            {s.name}
            <button type="button" onClick={() => onRemove(s.id)} aria-label={`Remove ${s.name}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              e.preventDefault();
              onAdd(value.trim());
              onValueChange('');
            }
          }}
          placeholder="Type a skill and press Enter"
        />
        <button
          type="button"
          onClick={() => {
            if (value.trim()) {
              onAdd(value.trim());
              onValueChange('');
            }
          }}
          className="btn-secondary"
        >
          Add
        </button>
      </div>
    </div>
  );
}
