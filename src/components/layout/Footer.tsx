import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/builder', label: 'CV Builder' },
      { href: '/templates', label: 'Templates' },
      { href: '/cover-letter', label: 'Cover Letter Generator' },
      { href: '/job-match', label: 'Match CV to a Job' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/privacy', label: 'Privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">1C</span>
              OneClick CV
            </Link>
            <p className="mt-3 max-w-sm text-sm text-ink-500">
              Professional CVs. Smarter applications. Built for UAE job seekers — premium templates, AI writing
              suggestions and honest ATS guidance.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-ink-900">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-500 hover:text-ink-800">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400">© {new Date().getFullYear()} OneClick CV. All rights reserved.</p>
          <p className="text-xs text-ink-400">Made for job seekers across the UAE</p>
        </div>
      </div>
    </footer>
  );
}
