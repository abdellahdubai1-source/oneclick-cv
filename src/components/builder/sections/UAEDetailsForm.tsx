'use client';

import type { ReactNode } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import type { VisaStatus } from '@/lib/cv/types';

const VISA_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: 'citizen', label: 'UAE Citizen' },
  { value: 'employment_visa', label: 'Employment Visa' },
  { value: 'golden_visa', label: 'Golden Visa' },
  { value: 'family_sponsored', label: 'Family Sponsored' },
  { value: 'visit_visa', label: 'Visit Visa' },
  { value: 'freelance_permit', label: 'Freelance Permit' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function UAEDetailsForm() {
  const cv = useCVStore((s) => s.cv);
  const updateUAE = useCVStore((s) => s.updateUAE);

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-ink-900">Additional UAE Details</h2>
      <p className="mt-1 text-sm text-ink-500">
        All optional. We never ask for passport numbers, Emirates ID numbers, bank details or your full residential
        address.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nationality">
          <input
            className="input"
            value={cv.uae.nationality ?? ''}
            onChange={(e) => updateUAE({ nationality: e.target.value })}
          />
        </Field>

        <Field label="Visa status">
          <select
            className="input"
            value={cv.uae.visaStatus ?? ''}
            onChange={(e) => updateUAE({ visaStatus: (e.target.value || undefined) as VisaStatus | undefined })}
          >
            <option value="">Select…</option>
            {VISA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Availability">
          <input
            className="input"
            value={cv.uae.availability ?? ''}
            onChange={(e) => updateUAE({ availability: e.target.value })}
            placeholder="e.g. Immediate"
          />
        </Field>

        <Field label="Notice period">
          <input
            className="input"
            value={cv.uae.noticePeriod ?? ''}
            onChange={(e) => updateUAE({ noticePeriod: e.target.value })}
            placeholder="e.g. 30 days"
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={!!cv.uae.hasUAEDrivingLicence}
            onChange={(e) => updateUAE({ hasUAEDrivingLicence: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          UAE driving licence
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={!!cv.uae.willingToRelocate}
            onChange={(e) => updateUAE({ willingToRelocate: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          Willing to relocate within the UAE
        </label>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-ink-600">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
