import type { TemplateProps } from './types';
import { Avatar, ExperienceDateRange, sectionLabel, useVisibleSections } from './shared';

/**
 * Hospitality UAE — elegant, welcoming design with a small circular photo
 * centred above the candidate's name. Clear languages and customer-service
 * skills. Suitable for hotel, restaurant, cleaning, retail and hospitality
 * roles.
 */
export default function HospitalityUAETemplate({ cv, color, mode = 'preview' }: TemplateProps) {
  const lang = cv.meta.language;
  const rtl = lang === 'ar';
  const sections = useVisibleSections(cv);
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-a4 w-full bg-white font-sans text-ink-900">
      <header className="flex flex-col items-center px-10 pb-6 pt-9 text-center">
        <Avatar
          src={photoSrc}
          shape="circle"
          sizeClass={mode === 'print' ? 'w-28 h-28' : 'w-20 h-20'}
          ringColor={color.primary}
          alt={cv.personal.fullName || 'Profile photo'}
        />
        <h1 className="mt-3 text-2xl font-semibold tracking-wide" style={{ color: color.primaryDark }}>
          {cv.personal.fullName || 'Your Name'}
        </h1>
        <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.15em]" style={{ color: color.primary }}>
          {cv.personal.professionalTitle || 'Professional Title'}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11.5px] text-ink-600">
          {cv.personal.phone && <span>{cv.personal.phone}</span>}
          {cv.personal.email && <span>{cv.personal.email}</span>}
          {(cv.personal.city || cv.personal.country) && (
            <span>{[cv.personal.city, cv.personal.country].filter(Boolean).join(', ')}</span>
          )}
        </div>
        <div className="mt-4 h-px w-24" style={{ background: color.primary, opacity: 0.4 }} />
      </header>

      <div className="space-y-6 px-10 pb-9">
        {sections.map((section) => (
          <section key={section} className="break-inside-avoid text-center">
            <h2
              className="mb-3 inline-block border-b-2 pb-1 text-[12.5px] font-semibold uppercase tracking-[0.15em]"
              style={{ borderColor: color.primary, color: color.primary }}
            >
              {sectionLabel(section, lang)}
            </h2>
            <div className="text-left" dir={rtl ? 'rtl' : 'ltr'}>
              {section === 'summary' && (
                <p className="text-center text-[13px] leading-relaxed text-ink-700">{cv.summary}</p>
              )}
              {section === 'experience' && (
                <div className="space-y-4">
                  {cv.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="text-[13.5px] font-semibold text-ink-900">
                          {exp.jobTitle} · {exp.companyName}
                        </h3>
                        <span className="text-[11px] text-ink-500">
                          <ExperienceDateRange
                            start={exp.startDate}
                            end={exp.endDate}
                            current={exp.currentlyWorking}
                            lang={lang}
                          />
                        </span>
                      </div>
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
                      <h3 className="text-[13px] font-semibold text-ink-900">{edu.qualification}, {edu.institution}</h3>
                      <span className="text-[11px] text-ink-500">
                        <ExperienceDateRange start={edu.startDate} end={edu.endDate} current={edu.currentlyStudying} lang={lang} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {section === 'skills' && (
                <div className="flex flex-wrap justify-center gap-2">
                  {[...cv.skills.technical, ...cv.skills.soft].map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full border px-3 py-1 text-[11.5px]"
                      style={{ borderColor: color.primary, color: color.primaryDark }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
              {section === 'languages' && (
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[12.5px] text-ink-700">
                  {cv.languages.map((l) => (
                    <span key={l.id}>
                      {l.name} <span className="text-ink-400 capitalize">({l.proficiency})</span>
                    </span>
                  ))}
                </div>
              )}
              {section === 'certifications' && (
                <ul className="space-y-1 text-center text-[12.5px] text-ink-700">
                  {cv.certifications.map((c) => (
                    <li key={c.id}>
                      {c.name} — {c.issuingOrganization}
                    </li>
                  ))}
                </ul>
              )}
              {section === 'references' && (
                <div className="flex flex-wrap justify-center gap-6 text-[12px] text-ink-700">
                  {cv.references.map((r) => (
                    <div key={r.id} className="text-center">
                      <p className="font-medium text-ink-900">{r.name}</p>
                      <p>{r.jobTitle}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
