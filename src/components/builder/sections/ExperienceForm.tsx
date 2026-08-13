'use client';

import { useState, type ReactNode } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import type { WorkExperienceEntry } from '@/lib/cv/types';
import AISuggestBox from '@/components/builder/ai/AISuggestBox';
import { inferProfessionFromTitle } from '@/lib/cv/professionProfiles';

export default function ExperienceForm() {
  const cv = useCVStore((s) => s.cv);
  const addExperience = useCVStore((s) => s.addExperience);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Work Experience</h2>
            <p className="mt-1 text-sm text-ink-500">Add every relevant role, most recent first.</p>
          </div>
          <button type="button" onClick={addExperience} className="btn-secondary">
            + Add role
          </button>
        </div>
      </div>

      {cv.experience.length === 0 && (
        <EmptyState message="No work experience yet. Add your first role to get started." onAdd={addExperience} />
      )}

      {cv.experience.map((exp, index) => (
        <ExperienceCard key={exp.id} exp={exp} index={index} total={cv.experience.length} />
      ))}
    </div>
  );
}

function ExperienceCard({ exp, index, total }: { exp: WorkExperienceEntry; index: number; total: number }) {
  const updateExperience = useCVStore((s) => s.updateExperience);
  const removeExperience = useCVStore((s) => s.removeExperience);
  const duplicateExperience = useCVStore((s) => s.duplicateExperience);
  const reorderExperience = useCVStore((s) => s.reorderExperience);
  const [collapsed, setCollapsed] = useState(false);

  function updateBullet(kind: 'responsibilities' | 'achievements', i: number, value: string) {
    const next = [...exp[kind]];
    next[i] = value;
    updateExperience(exp.id, { [kind]: next });
  }
  function addBullet(kind: 'responsibilities' | 'achievements') {
    updateExperience(exp.id, { [kind]: [...exp[kind], ''] });
  }
  function removeBullet(kind: 'responsibilities' | 'achievements', i: number) {
    updateExperience(exp.id, { [kind]: exp[kind].filter((_, idx) => idx !== i) });
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex-1 text-left"
        >
          <p className="text-sm font-semibold text-ink-900">
            {exp.jobTitle || 'New role'} {exp.companyName && <span className="font-normal text-ink-500">· {exp.companyName}</span>}
          </p>
          <p className="text-xs text-ink-400">{collapsed ? 'Click to expand' : 'Click to collapse'}</p>
        </button>
        <div className="flex shrink-0 gap-1">
          <IconButton label="Move up" disabled={index === 0} onClick={() => reorderExperience(index, index - 1)}>↑</IconButton>
          <IconButton label="Move down" disabled={index === total - 1} onClick={() => reorderExperience(index, index + 1)}>↓</IconButton>
          <IconButton label="Duplicate" onClick={() => duplicateExperience(exp.id)}>⧉</IconButton>
          <IconButton label="Remove" onClick={() => removeExperience(exp.id)} destructive>✕</IconButton>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Job title" required>
              <input className="input" value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })} />
            </Field>
            <Field label="Company name" required>
              <input className="input" value={exp.companyName} onChange={(e) => updateExperience(exp.id, { companyName: e.target.value })} />
            </Field>
            <Field label="Location">
              <input className="input" value={exp.location} onChange={(e) => updateExperience(exp.id, { location: e.target.value })} />
            </Field>
            <div className="flex items-end gap-3">
              <Field label="Start date">
                <input
                  type="month"
                  className="input"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                />
              </Field>
              <Field label="End date">
                <input
                  type="month"
                  className="input"
                  value={exp.endDate ?? ''}
                  disabled={exp.currentlyWorking}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={exp.currentlyWorking}
              onChange={(e) => updateExperience(exp.id, { currentlyWorking: e.target.checked, endDate: e.target.checked ? null : exp.endDate })}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            I currently work here
          </label>

          <BulletList
            label="Responsibilities"
            items={exp.responsibilities}
            onChange={(i, v) => updateBullet('responsibilities', i, v)}
            onAdd={() => addBullet('responsibilities')}
            onRemove={(i) => removeBullet('responsibilities', i)}
            aiField="responsibility"
            entryId={exp.id}
            kind="responsibilities"
          />

          <BulletList
            label="Measurable achievements"
            items={exp.achievements}
            onChange={(i, v) => updateBullet('achievements', i, v)}
            onAdd={() => addBullet('achievements')}
            onRemove={(i) => removeBullet('achievements', i)}
            aiField="achievement"
            entryId={exp.id}
            kind="achievements"
          />
        </div>
      )}
    </div>
  );
}

function BulletList({
  label,
  items,
  onChange,
  onAdd,
  onRemove,
  aiField,
  entryId,
  kind,
}: {
  label: string;
  items: string[];
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  aiField: 'responsibility' | 'achievement';
  entryId: string;
  kind: 'responsibilities' | 'achievements';
}) {
  const updateExperience = useCVStore((s) => s.updateExperience);
  const exp = useCVStore((s) => s.cv.experience.find((e) => e.id === entryId));
  const professionalTitle = useCVStore((s) => s.cv.personal.professionalTitle);
  const existingSkills = useCVStore((s) => [...s.cv.skills.technical, ...s.cv.skills.soft].map((skill) => skill.name));

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-ink-600">{label}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className="input" value={item} onChange={(e) => onChange(i, e.target.value)} />
            <button type="button" onClick={() => onRemove(i)} className="shrink-0 rounded-lg border border-ink-200 px-2.5 text-ink-500 hover:bg-ink-50" aria-label="Remove line">
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={onAdd} className="mt-2 text-xs font-semibold text-brand-600 hover:underline">
        + Add {aiField === 'achievement' ? 'achievement' : 'responsibility'}
      </button>

      <div className="mt-2">
        <AISuggestBox
          field={aiField}
          text={items.join('\n')}
          context={{
            professionalTitle: exp?.jobTitle || professionalTitle,
            profession: inferProfessionFromTitle(exp?.jobTitle || professionalTitle),
            industry: exp?.jobTitle || professionalTitle,
            existingSkills,
          }}
          onApply={(text) => {
            if (!exp) return;
            const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
            updateExperience(entryId, { [kind]: lines.length > 0 ? lines : items });
          }}
          onApplyItem={(item) => {
            if (!exp) return;
            updateExperience(entryId, { [kind]: [...exp[kind], item] });
          }}
        />
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-ink-600">
      {label} {required && <span className="text-red-500">*</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function IconButton({
  children,
  onClick,
  label,
  disabled,
  destructive,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs transition disabled:opacity-30 ${
        destructive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-ink-200 text-ink-500 hover:bg-ink-50'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ message, onAdd }: { message: string; onAdd: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
      <p className="text-sm text-ink-500">{message}</p>
      <button type="button" onClick={onAdd} className="btn-primary">
        + Add role
      </button>
    </div>
  );
}
