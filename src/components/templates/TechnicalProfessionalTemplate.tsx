import type { TemplateProps } from './types';
import { Avatar, ExperienceDateRange, sectionLabel, useVisibleSections } from './shared';

const RIGHT_RAIL_SECTIONS = new Set(['skills', 'certifications', 'languages']);

/**
 * Technical Professional — structured technical layout with prominent
 * technical skills, projects and certifications. Small rounded-square photo
 * beside contact information. Suitable for developers, engineers,
 * technicians and IT professionals.
 */
export default function TechnicalProfessionalTemplate({ cv, color, mode = 'preview' }: TemplateProps) {
  const lang = cv.meta.language;
  const rtl = lang === 'ar';
  const sections = useVisibleSections(cv);
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;
  const railSections = sections.filter((s) => RIGHT_RAIL_SECTIONS.has(s));
  const mainSections = sections.filter((s) => !RIGHT_RAIL_SECTIONS.has(s));

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-a4 w-full bg-white font-sans text-ink-900">
      <header className="flex items-center gap-4 border-b-4 px-9 py-6" style={{ borderColor: color.primary }}>
        <Avatar
          src={photoSrc}
          shape="rounded-square"
          sizeClass={mode === 'print' ? 'w-20 h-20' : 'w-14 h-14'}
          alt={cv.personal.fullName || 'Profile photo'}
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink-900">{cv.personal.fullName || 'Your Name'}</h1>
          <p className="text-[12.5px] font-semibold" style={{ color: color.primary }}>
            {cv.personal.professionalTitle || 'Professional Title'}
          </p>
        </div>
        <div className="hidden shrink-0 text-right text-[11px] leading-relaxed text-ink-600 sm:block">
          {cv.personal.phone && <p>{cv.personal.phone}</p>}
          {cv.personal.email && <p>{cv.personal.email}</p>}
          {cv.personal.portfolioUrl && <p className="font-medium" style={{ color: color.primary }}>{cv.personal.portfolioUrl}</p>}
        </div>
      </header>

      <div className="grid grid-cols-[68%_32%]">
        <main className="space-y-5 px-9 py-7">
          {mainSections.map((section) => (
            <section key={section} className="break-inside-avoid">
              <h2
                className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide"
                style={{ color: color.primaryDark }}
              >
                <span className="inline-block h-3 w-1" style={{ background: color.primary }} />
                {sectionLabel(section, lang)}
              </h2>
              {section === 'summary' && <p className="text-[12.5px] leading-relaxed text-ink-700">{cv.summary}</p>}
              {section === 'experience' && (
                <div className="space-y-4">
                  {cv.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="text-[13px] font-semibold text-ink-900">{exp.jobTitle}</h3>
                        <span className="text-[10.5px] font-mono text-ink-500">
                          <ExperienceDateRange
                            start={exp.startDate}
                            end={exp.endDate}
                            current={exp.currentlyWorking}
                            lang={lang}
                          />
                        </span>
                      </div>
                      <p className="text-[11.5px] text-ink-500">
                        {exp.companyName}
                        {exp.location ? ` · ${exp.location}` : ''}
                      </p>
                      {(exp.responsibilities.length > 0 || exp.achievements.length > 0) && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-ink-700">
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
              )}
              {section === 'education' && (
                <div className="space-y-2">
                  {cv.education.map((edu) => (
                    <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[12.5px] font-semibold text-ink-900">
                        {edu.qualification} — {edu.institution}
                      </h3>
                      <span className="text-[10.5px] font-mono text-ink-500">
                        <ExperienceDateRange start={edu.startDate} end={edu.endDate} current={edu.currentlyStudying} lang={lang} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {section === 'projects' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {cv.projects.map((p) => (
                    <div key={p.id} className="rounded-lg border border-ink-100 p-3">
                      <h3 className="text-[12.5px] font-semibold text-ink-900">{p.name}</h3>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-700">{p.description}</p>
                      {p.technologies.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {p.technologies.map((t) => (
                            <span
                              key={t}
                              className="rounded px-1.5 py-0.5 text-[10px] font-mono"
                              style={{ background: color.primaryTint, color: color.primaryDark }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
        </main>

        <aside className="space-y-5 px-5 py-7" style={{ background: color.primaryTint }}>
          {railSections.map((section) => (
            <div key={section}>
              <h2 className="mb-2 text-[11.5px] font-bold uppercase tracking-wide" style={{ color: color.primaryDark }}>
                {sectionLabel(section, lang)}
              </h2>
              {section === 'skills' && (
                <div className="space-y-1.5">
                  {cv.skills.technical.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-ink-800">{s.name}</span>
                    </div>
                  ))}
                  {cv.skills.soft.length > 0 && (
                    <p className="mt-2 text-[10.5px] italic text-ink-500">
                      {cv.skills.soft.map((s) => s.name).join(' · ')}
                    </p>
                  )}
                </div>
              )}
              {section === 'certifications' && (
                <ul className="space-y-1.5 text-[11px] leading-snug text-ink-800">
                  {cv.certifications.map((c) => (
                    <li key={c.id}>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-ink-500">{c.issuingOrganization}</p>
                    </li>
                  ))}
                </ul>
              )}
              {section === 'languages' && (
                <div className="space-y-1 text-[11px] text-ink-800">
                  {cv.languages.map((l) => (
                    <div key={l.id} className="flex justify-between">
                      <span>{l.name}</span>
                      <span className="capitalize text-ink-500">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
