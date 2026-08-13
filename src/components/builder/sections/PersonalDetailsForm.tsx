'use client';

import type { ReactNode } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import AISuggestBox from '@/components/builder/ai/AISuggestBox';
import PhotoEditor from '@/components/builder/photo/PhotoEditor';

export default function PersonalDetailsForm() {
  const cv = useCVStore((s) => s.cv);
  const updatePersonal = useCVStore((s) => s.updatePersonal);
  const applyTextWithUndo = useCVStore((s) => s.applyTextWithUndo);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Personal Details</h2>
        <p className="mt-1 text-sm text-ink-500">This information appears at the top of every template.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input
              className="input"
              value={cv.personal.fullName}
              onChange={(e) => updatePersonal({ fullName: e.target.value })}
              placeholder="e.g. Fatima Al Mansoori"
            />
          </Field>

          <Field label="Professional title" required>
            <input
              className="input"
              value={cv.personal.professionalTitle}
              onChange={(e) => updatePersonal({ professionalTitle: e.target.value })}
              placeholder="e.g. Senior Marketing Executive"
            />
            <div className="mt-2">
              <AISuggestBox
                field="professionalTitle"
                text={cv.personal.professionalTitle}
                onApply={(text) => applyTextWithUndo('personal.professionalTitle', text, 'Professional title')}
                compact
              />
            </div>
          </Field>

          <Field label="UAE phone number" required>
            <input
              className="input"
              value={cv.personal.phone}
              onChange={(e) => updatePersonal({ phone: e.target.value })}
              placeholder="+971 50 123 4567"
              inputMode="tel"
            />
          </Field>

          <Field label="Email address" required>
            <input
              className="input"
              type="email"
              value={cv.personal.email}
              onChange={(e) => updatePersonal({ email: e.target.value })}
              placeholder="you@email.com"
            />
          </Field>

          <Field label="Current city" required>
            <input
              className="input"
              value={cv.personal.city}
              onChange={(e) => updatePersonal({ city: e.target.value })}
              placeholder="e.g. Dubai"
            />
          </Field>

          <Field label="Country" required>
            <input
              className="input"
              value={cv.personal.country}
              onChange={(e) => updatePersonal({ country: e.target.value })}
            />
          </Field>

          <Field label="LinkedIn (optional)">
            <input
              className="input"
              value={cv.personal.linkedInUrl ?? ''}
              onChange={(e) => updatePersonal({ linkedInUrl: e.target.value })}
              placeholder="https://linkedin.com/in/…"
            />
          </Field>

          <Field label="Portfolio / website (optional)">
            <input
              className="input"
              value={cv.personal.portfolioUrl ?? ''}
              onChange={(e) => updatePersonal({ portfolioUrl: e.target.value })}
              placeholder="https://…"
            />
          </Field>
        </div>
      </div>

      <PhotoEditor />
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
