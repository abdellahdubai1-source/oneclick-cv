'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import { TEMPLATE_REGISTRY } from '@/lib/templates/registry';
import Link from 'next/link';

export default function DownloadStep() {
  const cv = useCVStore((s) => s.cv);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [docxBusy, setDocxBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateDef = TEMPLATE_REGISTRY[cv.template.templateId];
  const experienceLines = cv.experience.reduce(
    (total, role) => total + role.responsibilities.filter(Boolean).length + role.achievements.filter(Boolean).length,
    0,
  );
  const skillCount = new Set(
    [...cv.skills.technical, ...cv.skills.soft].map((skill) => skill.name.trim().toLocaleLowerCase()).filter(Boolean),
  ).size;
  const improvementItems = [
    cv.summary.trim().split(/\s+/).length < 60 ? 'Expand your professional summary to 60-100 words.' : null,
    experienceLines < 4 ? 'Add at least four role-specific responsibilities or achievements.' : null,
    skillCount < 8 ? 'Add at least eight relevant technical and soft skills.' : null,
    cv.projects.length === 0 ? 'Add one or two real projects, especially for web, design or technology roles.' : null,
    cv.certifications.length === 0 ? 'Add relevant certifications or completed professional courses, if you have them.' : null,
    !cv.personal.portfolioUrl && /web|design|developer|marketing/i.test(cv.personal.professionalTitle)
      ? 'Add your portfolio or website link.'
      : null,
  ].filter((item): item is string => Boolean(item));

  async function handlePdf() {
    setPdfBusy(true);
    setError(null);
    try {
      const { downloadCVPdf } = await import('@/lib/export/pdfDocuments');
      await downloadCVPdf(cv);
    } catch {
      setError('Could not generate the PDF. Please try again.');
    } finally {
      setPdfBusy(false);
    }
  }

  async function handleDocx() {
    setDocxBusy(true);
    setError(null);
    try {
      const { downloadCVDocx } = await import('@/lib/export/docxGenerator');
      await downloadCVDocx(cv);
    } catch {
      setError('Could not generate the DOCX file. Please try again.');
    } finally {
      setDocxBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-ink-900">Your CV is ready</h2>
      <p className="mt-1 text-sm text-ink-500">
        Your CV is ready. Download a true A4, selectable-text PDF matching your {templateDef.name} template, or an
        ATS-friendly DOCX.
      </p>

      {improvementItems.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Make this CV more complete before applying</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
            {improvementItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-2 text-xs">Only add information that is true. The layout will adapt automatically as you add content.</p>
        </div>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={handlePdf} disabled={pdfBusy} className="btn-primary">
          {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
        </button>
        <button type="button" onClick={handleDocx} disabled={docxBusy} className="btn-secondary">
          {docxBusy ? 'Preparing DOCX…' : 'Download DOCX (ATS-friendly)'}
        </button>
        <Link href="/cover-letter" className="btn-secondary">
          Generate matching cover letter →
        </Link>
      </div>

      <div className="mt-6 rounded-xl bg-ink-50 p-4 text-xs leading-relaxed text-ink-500">
        <p className="font-semibold text-ink-700">Before you send it</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          <li>Recommended length: one page for limited experience, one to two pages for most professionals.</li>
          <li>Use the optional ATS job match only when applying to a specific vacancy.</li>
          <li>Double-check contact details — this is how employers will reach you.</li>
        </ul>
      </div>
    </div>
  );
}
