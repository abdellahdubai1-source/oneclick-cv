import type { TemplateProps } from './types';
import { Avatar, ExperienceDateRange, sectionLabel, useVisibleSections } from './shared';

/**
 * Minimal ATS — clean single-column layout, no sidebar, no icons, no tables,
 * standard headings, black text on white. Photo disabled by default (spec §14).
 * This is the template recommended for online applicant tracking systems.
 */
export default function MinimalATSTemplate({ cv, color, mode = 'preview' }: TemplateProps) {
  const lang = cv.meta.language;
  const rtl = lang === 'ar';
  const sections = useVisibleSections(cv);
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-a4 w-full bg-white px-10 py-9 font-sans text-black">
      <header className="flex items-start justify-between gap-4 border-b border-black pb-4">
        <div>
          <h1 className="text-2xl font-bold">{cv.personal.fullName || 'Your Name'}</h1>
          <p className="mt-0.5 text-[13px] font-medium text-ink-700">
            {cv.personal.professionalTitle || 'Professional Title'}
          </p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-800">
            {[
              cv.personal.phone,
              cv.personal.email,
              [cv.personal.city, cv.personal.country].filter(Boolean).join(', '),
              cv.personal.linkedInUrl,
              cv.personal.portfolioUrl,
            ]
              .filter(Boolean)
              .join('  |  ')}
          </p>
        </div>
        {cv.personal.photoEnabled && photoSrc && (
          <Avatar src={photoSrc} shape="square" sizeClass={mode === 'print' ? 'w-20 h-20' : 'w-14 h-14'} alt={cv.personal.fullName} />
        )}
      </header>

      {cv.personal.photoEnabled && (
        <p className="mt-2 text-[10.5px] italic text-ink-500">
          For the best ATS compatibility, we recommend using a CV without a photo unless the employer specifically
          requests one.
        </p>
      )}

      <div className="mt-5 space-y-5">
        {sections.map((section) => (
          <section key={section} className="break-inside-avoid">
            <h2 className="mb-1.5 text-[12.5px] font-bold uppercase tracking-wide text-black">
              {sectionLabel(section, lang)}
            </h2>
            {renderSection(cv, section, lang)}
          </section>
        ))}
      </div>
    </div>
  );
}

function renderSection(cv: TemplateProps['cv'], section: string, lang: 'en' | 'ar') {
  switch (section) {
    case 'summary':
      return <p className="text-[12.5px] leading-relaxed text-ink-900">{cv.summary}</p>;
    case 'experience':
      return (
        <div className="space-y-3.5">
          {cv.experience.map((exp) => (
            <div key={exp.id}>
              <p className="text-[13px] font-bold text-black">
                {exp.jobTitle}, {exp.companyName}
              </p>
              <p className="text-[11.5px] text-ink-700">
                {exp.location ? `${exp.location} — ` : ''}
                <ExperienceDateRange start={exp.startDate} end={exp.endDate} current={exp.currentlyWorking} lang={lang} />
              </p>
              {(exp.responsibilities.length > 0 || exp.achievements.length > 0) && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12px] leading-relaxed text-ink-900">
                  {exp.responsibilities.map((r, i) => (
                    <li key={`r-${i}`}>{r}</li>
                  ))}
                  {exp.achievements.map((a, i) => (
                    <li key={`a-${i}`}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    case 'education':
      return (
        <div className="space-y-2">
          {cv.education.map((edu) => (
            <div key={edu.id}>
              <p className="text-[12.5px] font-bold text-black">
                {edu.qualification}, {edu.institution}
              </p>
              <p className="text-[11.5px] text-ink-700">
                <ExperienceDateRange start={edu.startDate} end={edu.endDate} current={edu.currentlyStudying} lang={lang} />
              </p>
            </div>
          ))}
        </div>
      );
    case 'skills':
      return (
        <p className="text-[12.5px] leading-relaxed text-ink-900">
          {[...cv.skills.technical, ...cv.skills.soft].map((s) => s.name).join(', ')}
        </p>
      );
    case 'languages':
      return (
        <p className="text-[12.5px] leading-relaxed text-ink-900">
          {cv.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}
        </p>
      );
    case 'certifications':
      return (
        <ul className="space-y-0.5 pl-5 text-[12.5px] text-ink-900 list-disc">
          {cv.certifications.map((c) => (
            <li key={c.id}>
              {c.name}, {c.issuingOrganization}
              {c.issueDate ? `, ${c.issueDate}` : ''}
            </li>
          ))}
        </ul>
      );
    case 'projects':
      return (
        <div className="space-y-2">
          {cv.projects.map((p) => (
            <p key={p.id} className="text-[12.5px] text-ink-900">
              <span className="font-bold">{p.name}:</span> {p.description}
            </p>
          ))}
        </div>
      );
    case 'references':
      return (
        <p className="text-[12.5px] text-ink-900">
          {cv.references.map((r) => `${r.name}${r.jobTitle ? `, ${r.jobTitle}` : ''}`).join('  |  ')}
        </p>
      );
    default:
      return null;
  }
}
