import type { TemplateProps } from './types';
import { Avatar, ContactLine, ExperienceDateRange, sectionLabel, useVisibleSections } from './shared';

/**
 * Executive UAE — premium corporate appearance, dark navy header, elegant
 * typography, balanced single-column content, medium circular photo top-right.
 * Suitable for managers, administrators and corporate professionals.
 */
export default function ExecutiveUAETemplate({ cv, color, mode = 'preview' }: TemplateProps) {
  const lang = cv.meta.language;
  const rtl = lang === 'ar';
  const sections = useVisibleSections(cv);
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="flex min-h-a4 w-full flex-col bg-white font-serif text-ink-900"
      style={{ fontFamily: rtl ? 'var(--font-noto-arabic)' : undefined }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between gap-6 px-10 py-8"
        style={{ background: `linear-gradient(135deg, ${color.primary}, ${color.primaryDark})`, color: color.onPrimary }}
      >
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-semibold tracking-wide">{cv.personal.fullName || 'Your Name'}</h1>
          <p className="mt-1 text-base font-light tracking-wide opacity-90">
            {cv.personal.professionalTitle || 'Professional Title'}
          </p>
          <div className="mt-3 h-px w-16" style={{ background: color.onPrimary, opacity: 0.5 }} />
          <div className="mt-3">
            <ContactLine
              items={[
                cv.personal.phone,
                cv.personal.email,
                [cv.personal.city, cv.personal.country].filter(Boolean).join(', '),
                cv.personal.linkedInUrl,
                cv.personal.portfolioUrl,
              ]}
            />
          </div>
        </div>
        {photoSrc !== undefined && (
          <Avatar
            src={photoSrc}
            shape="circle"
            sizeClass={mode === 'print' ? 'w-28 h-28' : 'w-20 h-20'}
            ringColor="rgba(255,255,255,0.5)"
            alt={cv.personal.fullName || 'Profile photo'}
          />
        )}
      </header>

      <div className="flex-1 space-y-6 px-10 py-8">
        {sections.map((section) => (
          <section key={section} className="break-inside-avoid">
            <h2
              className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: color.primary }}
            >
              {sectionLabel(section, lang)}
            </h2>
            <div className="h-[2px] w-10 mb-3" style={{ background: color.primary }} />
            {renderSection(cv, section, lang)}
          </section>
        ))}

        {sections.length === 0 && (
          <p className="text-sm italic text-ink-400">
            Add your professional summary, experience and skills to see your CV come together here.
          </p>
        )}
      </div>
    </div>
  );
}

function renderSection(cv: TemplateProps['cv'], section: string, lang: 'en' | 'ar') {
  switch (section) {
    case 'summary':
      return <p className="text-[13px] leading-relaxed text-ink-700">{cv.summary}</p>;
    case 'experience':
      return (
        <div className="space-y-5">
          {cv.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-[14px] font-semibold text-ink-900">
                  {exp.jobTitle} <span className="font-normal text-ink-500">· {exp.companyName}</span>
                </h3>
                <span className="text-[11px] text-ink-500">
                  <ExperienceDateRange start={exp.startDate} end={exp.endDate} current={exp.currentlyWorking} lang={lang} />
                </span>
              </div>
              {exp.location && <p className="text-[11px] text-ink-400">{exp.location}</p>}
              {(exp.responsibilities.length > 0 || exp.achievements.length > 0) && (
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-ink-700">
                  {exp.responsibilities.map((r, i) => (
                    <li key={`r-${i}`}>{r}</li>
                  ))}
                  {exp.achievements.map((a, i) => (
                    <li key={`a-${i}`} className="font-medium text-ink-800">
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    case 'education':
      return (
        <div className="space-y-3">
          {cv.education.map((edu) => (
            <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <div>
                <h3 className="text-[13.5px] font-semibold text-ink-900">{edu.qualification}</h3>
                <p className="text-[12px] text-ink-600">
                  {edu.institution}
                  {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}
                </p>
              </div>
              <span className="text-[11px] text-ink-500">
                <ExperienceDateRange start={edu.startDate} end={edu.endDate} current={edu.currentlyStudying} lang={lang} />
              </span>
            </div>
          ))}
        </div>
      );
    case 'skills':
      return (
        <div className="grid grid-cols-2 gap-6">
          {cv.skills.technical.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Technical</p>
              <p className="text-[12.5px] leading-relaxed text-ink-700">
                {cv.skills.technical.map((s) => s.name).join('  ·  ')}
              </p>
            </div>
          )}
          {cv.skills.soft.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Soft skills</p>
              <p className="text-[12.5px] leading-relaxed text-ink-700">
                {cv.skills.soft.map((s) => s.name).join('  ·  ')}
              </p>
            </div>
          )}
        </div>
      );
    case 'languages':
      return (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-ink-700">
          {cv.languages.map((l) => (
            <span key={l.id}>
              {l.name} <span className="text-ink-400">— {l.proficiency}</span>
            </span>
          ))}
        </div>
      );
    case 'certifications':
      return (
        <ul className="space-y-1 text-[12.5px] text-ink-700">
          {cv.certifications.map((c) => (
            <li key={c.id}>
              <span className="font-medium text-ink-900">{c.name}</span> — {c.issuingOrganization}
              {c.issueDate ? ` (${c.issueDate})` : ''}
            </li>
          ))}
        </ul>
      );
    case 'projects':
      return (
        <div className="space-y-2">
          {cv.projects.map((p) => (
            <div key={p.id}>
              <h3 className="text-[13px] font-semibold text-ink-900">{p.name}</h3>
              <p className="text-[12.5px] text-ink-700">{p.description}</p>
              {p.technologies.length > 0 && (
                <p className="mt-0.5 text-[11px] text-ink-500">{p.technologies.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      );
    case 'references':
      return (
        <div className="grid grid-cols-2 gap-4 text-[12px] text-ink-700">
          {cv.references.map((r) => (
            <div key={r.id}>
              <p className="font-medium text-ink-900">{r.name}</p>
              <p className="text-ink-500">
                {r.jobTitle}
                {r.companyName ? `, ${r.companyName}` : ''}
              </p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}
