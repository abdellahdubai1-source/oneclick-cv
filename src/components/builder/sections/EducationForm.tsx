'use client';

import type { ReactNode } from 'react';
import { useCVStore } from '@/lib/state/cvStore';

export default function EducationForm() {
  const cv = useCVStore((s) => s.cv);
  const addEducation = useCVStore((s) => s.addEducation);
  const updateEducation = useCVStore((s) => s.updateEducation);
  const removeEducation = useCVStore((s) => s.removeEducation);
  const reorderEducation = useCVStore((s) => s.reorderEducation);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Education</h2>
            <p className="mt-1 text-sm text-ink-500">Add your qualifications, most recent first.</p>
          </div>
          <button type="button" onClick={addEducation} className="btn-secondary">
            + Add education
          </button>
        </div>
      </div>

      {cv.education.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="text-sm text-ink-500">No education added yet.</p>
          <button type="button" onClick={addEducation} className="btn-primary">
            + Add education
          </button>
        </div>
      )}

      {cv.education.map((edu, index) => (
        <div key={edu.id} className="card p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Qualification" required>
              <input className="input" value={edu.qualification} onChange={(e) => updateEducation(edu.id, { qualification: e.target.value })} placeholder="e.g. Bachelor of Business Administration" />
            </Field>
            <Field label="Institution" required>
              <input className="input" value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} />
            </Field>
            <Field label="Field of study">
              <input className="input" value={edu.fieldOfStudy ?? ''} onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })} />
            </Field>
            <Field label="Location">
              <input className="input" value={edu.location ?? ''} onChange={(e) => updateEducation(edu.id, { location: e.target.value })} />
            </Field>
            <Field label="Start date">
              <input type="month" className="input" value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} />
            </Field>
            <Field label="End date">
              <input
                type="month"
                className="input"
                value={edu.endDate ?? ''}
                disabled={edu.currentlyStudying}
                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
              />
            </Field>
            <Field label="Grade / Honours (optional)">
              <input className="input" value={edu.gradeOrHonors ?? ''} onChange={(e) => updateEducation(edu.id, { gradeOrHonors: e.target.value })} />
            </Field>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={edu.currentlyStudying}
                onChange={(e) => updateEducation(edu.id, { currentlyStudying: e.target.checked, endDate: e.target.checked ? null : edu.endDate })}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              I'm currently studying here
            </label>
            <div className="flex gap-2">
              <button type="button" disabled={index === 0} onClick={() => reorderEducation(index, index - 1)} className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-500 disabled:opacity-30">↑</button>
              <button type="button" disabled={index === cv.education.length - 1} onClick={() => reorderEducation(index, index + 1)} className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-500 disabled:opacity-30">↓</button>
              <button type="button" onClick={() => removeEducation(edu.id)} className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Remove</button>
            </div>
          </div>
        </div>
      ))}
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
