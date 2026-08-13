'use client';

import { useState } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import { TEMPLATE_REGISTRY } from '@/lib/templates/registry';

export default function DownloadStep() {
  const cv = useCVStore((s) => s.cv);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [docxBusy, setDocxBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateDef = TEMPLATE_REGISTRY[cv.template.templateId];

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
      <h2 className="text-lg font-semibold text-ink-900">Download</h2>
      <p className="mt-1 text-sm text-ink-500">
        Your CV is ready. Download a true A4, selectable-text PDF matching your {templateDef.name} template, or an
        ATS-friendly DOCX.
      </p>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={handlePdf} disabled={pdfBusy} className="btn-primary">
          {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
        </button>
        <button type="button" onClick={handleDocx} disabled={docxBusy} className="btn-secondary">
          {docxBusy ? 'Preparing DOCX…' : 'Download DOCX (ATS-friendly)'}
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-ink-50 p-4 text-xs leading-relaxed text-ink-500">
        <p className="font-semibold text-ink-700">Before you send it</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          <li>Recommended length: one page for limited experience, one to two pages for most professionals.</li>
          <li>Review the ATS &amp; Job Match step if you're applying to a specific vacancy.</li>
          <li>Double-check contact details — this is how employers will reach you.</li>
        </ul>
      </div>
    </div>
  );
}
