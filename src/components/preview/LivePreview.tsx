'use client';

import { useState } from 'react';
import type { CVDocument } from '@/lib/cv/types';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { cn } from '@/lib/utils/cn';

/**
 * Live A4 preview (spec §21).
 *
 * Desktop: rendered inline, scaled to fit its column, sitting beside the
 * editor. Mobile: hidden behind an explicit "Preview" tab so the form never
 * has to squeeze next to the A4 page (which would overflow on small
 * screens) — the parent step component is responsible for the tab toggle;
 * this component just renders the page and offers a zoom control.
 */
export default function LivePreview({ cv, className }: { cv: CVDocument; className?: string }) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
        <p className="text-xs font-medium text-ink-500">Live preview · A4</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 text-ink-500 transition hover:bg-ink-50 disabled:opacity-40"
            onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
            disabled={zoom <= 0.4}
          >
            −
          </button>
          <span className="w-10 text-center text-xs tabular-nums text-ink-500">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 text-ink-500 transition hover:bg-ink-50 disabled:opacity-40"
            onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}
            disabled={zoom >= 1.5}
          >
            +
          </button>
          <button
            type="button"
            className="ml-1 rounded-md border border-ink-200 px-2 py-1 text-[11px] text-ink-500 transition hover:bg-ink-50"
            onClick={() => setZoom(1)}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-ink-50 px-4 py-6 sm:px-8">
        <div
          className="mx-auto origin-top shadow-a4 transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, width: '210mm' }}
        >
          <div
            id="cv-preview-surface"
            className="overflow-hidden rounded-sm"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <TemplateRenderer cv={cv} mode="preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
