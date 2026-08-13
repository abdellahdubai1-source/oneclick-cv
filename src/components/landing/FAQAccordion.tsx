'use client';

import { useState } from 'react';
import type { FAQItem } from '@/lib/content/faq';
import { cn } from '@/lib/utils/cn';

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-ink-900">{item.question}</span>
              <span
                className={cn('shrink-0 text-ink-400 transition-transform duration-200', open && 'rotate-45')}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {open && <p className="px-5 pb-4 text-sm leading-relaxed text-ink-600">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
