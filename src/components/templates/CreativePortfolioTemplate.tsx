import type { TemplateProps } from './types';
import { Avatar, ExperienceDateRange, sectionLabel, useVisibleSections } from './shared';

const LEFT_SECTIONS = new Set(['skills', 'languages', 'projects']);

/**
 * Creative Portfolio — modern editorial layout with a large photo on the
 * left, strong professional title and project emphasis. Suitable for
 * designers, marketers, photographers and content creators.
 */
export default function CreativePortfolioTemplate({ cv, color, mode = 'preview' }: TemplateProps) {
  const lang = cv.meta.language;
  const rtl = lang === 'ar';
  const sections = useVisibleSections(cv);
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;
  const leftSections = sections.filter((s) => LEFT_SECTIONS.has(s));
  const rightSections = sections.filter((s) => !LEFT_SECTIONS.has(s));

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="grid min-h-a4 w-full grid-cols-[38%_62%] bg-white font-sans text-ink-900">
      <div className="flex flex-col" style={{ background: color.primaryTint }}>
        <Avatar
          src={photoSrc}
          shape="rectangle"
          sizeClass={mode === 'print' ? 'w-full h-72' : 'w-full h-48'}
          alt={cv.personal.fullName || 'Profile photo'}
        />
        <div className="space-y-5 px-6 py-6">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight" style={{ color: color.primaryDark }}>
              {cv.personal.fullName || 'Your Name'}
            </h1>
            <p className="mt-1 text-[13px] font-semibold uppercase tracking-wide" style={{ color: color.primary }}>
              {cv.personal.professionalTitle || 'Professional Title'}
            </p>
          </div>

          <div className="space-y-1 text-[11.5px] leading-relaxed text-ink-700">
            {cv.personal.phone && <p>{cv.personal.phone}</p>}
            {cv.personal.email && <p className="break-words">{cv.personal.email}</p>}
            {(cv.personal.city || cv.personal.country) && (
              <p>{[cv.personal.city, cv.personal.country].filter(Boolean).join(', ')}</p>
            )}
            {cv.personal.portfolioUrl && <p className="break-words font-medium" style={{ color: color.primary }}>{cv.personal.portfolioUrl}</p>}
            {cv.personal.linkedInUrl && <p className="break-words">{cv.personal.linkedInUrl}</p>}
          </div>

          {leftSections.map((section) => (
            <div key={section}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: color.primary }}>
                {sectionLabel(section, lang)}
              </p>
              {section === 'skills' && (
                <div className="flex flex-wrap gap-1.5">
                  {[...cv.skills.technical, ...cv.skills.soft].map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{ background: color.primary, color: color.onPrimary }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
              {section === 'languages' && (
                <div className="space-y-0.5 text-[11.5px] text-ink-700">
                  {cv.languages.map((l) => (
                    <p key={l.id}>
                      {l.name} — <span className="capitalize">{l.proficiency}</span>
                    </p>
                  ))}
                </div>
              )}
              {section === 'projects' && (
                <div className="space-y-3">
                  {cv.projects.map((p) => (
                    <div key={p.id}>
                      <p className="text-[12.5px] font-semibold text-ink-900">{p.name}</p>
                      <p className="text-[11.5px] leading-relaxed text-ink-700">{p.description}</p>
                      {p.technologies.length > 0 && (
                        <p className="mt-0.5 text-[10.5px] font-medium" style={{ color: color.primary }}>
                          {p.technologies.join(' · ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 px-8 py-8">
        {rightSections.map((section) => (
          <section key={section} className="break-inside-avoid">
            <h2 className="mb-2 text-[15px] font-extrabold" style={{ color: color.primaryDark }}>
              {sectionLabel(section, lang)}
            </h2>
            {section === 'summary' && (
              <p className="text-[13px] leading-relaxed text-ink-700">{cv.summary}</p>
            )}
            {section === 'experience' && (
              <div className="space-y-4">
                {cv.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: color.primary }}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[13.5px] font-bold text-ink-900">{exp.jobTitle}</h3>
                      <span className="text-[11px] text-ink-500">
                        <ExperienceDateRange
                          start={exp.startDate}
                          end={exp.endDate}
                          current={exp.currentlyWorking}
                          lang={lang}
                        />
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-500">{exp.companyName}</p>
                    {(exp.responsibilities.length > 0 || exp.achievements.length > 0) && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-ink-700">
                        {exp.responsibilities.map((r, i) => (
                          <li key={`r-${i}`}>{r}</li>
                        ))}
                        {exp.achievements.map((a, i) => (
                          <li key={`a-${i}`} className="font-medium text-ink-900">
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {section === 'education' && (
              <div className="space-y-2.5">
                {cv.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="text-[13px] font-semibold text-ink-900">{edu.qualification}</h3>
                    <p className="text-[11.5px] text-ink-600">
                      {edu.institution} ·{' '}
                      <ExperienceDateRange start={edu.startDate} end={edu.endDate} current={edu.currentlyStudying} lang={lang} />
                    </p>
                  </div>
                ))}
              </div>
            )}
            {section === 'certifications' && (
              <ul className="space-y-1 text-[12.5px] text-ink-700">
                {cv.certifications.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium text-ink-900">{c.name}</span> — {c.issuingOrganization}
                  </li>
                ))}
              </ul>
            )}
            {section === 'references' && (
              <div className="grid grid-cols-2 gap-3 text-[11.5px] text-ink-700">
                {cv.references.map((r) => (
                  <div key={r.id}>
                    <p className="font-medium text-ink-900">{r.name}</p>
                    <p>{r.jobTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
