import type { TemplateProps } from './types';
import { Avatar, ExperienceDateRange, sectionLabel, useVisibleSections } from './shared';

const SIDEBAR_SECTIONS = new Set(['skills', 'languages', 'certifications']);

/**
 * Modern Professional — strong two-column layout with a coloured left
 * sidebar (contact, languages, skills). Work experience on the right.
 * Large circular photo at the top of the sidebar. The reading order remains
 * deterministic and the exported DOCX is always the single-column ATS copy.
 */
export default function ModernProfessionalTemplate({ cv, color, mode = 'preview' }: TemplateProps) {
  const lang = cv.meta.language;
  const rtl = lang === 'ar';
  const sections = useVisibleSections(cv);
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;

  const sidebarSections = sections.filter((s) => SIDEBAR_SECTIONS.has(s));
  const mainSections = sections.filter((s) => !SIDEBAR_SECTIONS.has(s));

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="flex min-h-a4 w-full bg-white font-sans text-ink-900">
      {/* Sidebar */}
      <aside
        className="flex w-[36%] shrink-0 flex-col gap-6 px-6 py-9"
        style={{ background: color.primary, color: color.onPrimary }}
      >
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={photoSrc}
            shape="circle"
            sizeClass={mode === 'print' ? 'w-36 h-36' : 'w-28 h-28'}
            ringColor="rgba(255,255,255,0.8)"
            alt={cv.personal.fullName || 'Profile photo'}
          />
          <h1 className="mt-4 text-xl font-bold leading-tight tracking-tight">{cv.personal.fullName || 'Your Name'}</h1>
          <p className="mt-1 text-[12px] font-medium opacity-85">{cv.personal.professionalTitle || 'Professional Title'}</p>
        </div>

        <div>
          <p className="mb-2 border-b border-white/30 pb-1.5 text-[11px] font-bold uppercase tracking-[0.16em]">Contact</p>
          <ul className="space-y-1 text-[11.5px] leading-relaxed opacity-95">
            {cv.personal.phone && <li>{cv.personal.phone}</li>}
            {cv.personal.email && <li className="break-words">{cv.personal.email}</li>}
            {(cv.personal.city || cv.personal.country) && (
              <li>{[cv.personal.city, cv.personal.country].filter(Boolean).join(', ')}</li>
            )}
            {cv.personal.linkedInUrl && <li className="break-words">{cv.personal.linkedInUrl}</li>}
            {cv.personal.portfolioUrl && <li className="break-words">{cv.personal.portfolioUrl}</li>}
          </ul>
        </div>

        {(cv.uae.nationality || cv.uae.visaStatus || cv.uae.willingToRelocate !== undefined) && (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-75">UAE Details</p>
            <ul className="space-y-1 text-[11.5px] leading-relaxed opacity-95">
              {cv.uae.nationality && <li>Nationality: {cv.uae.nationality}</li>}
              {cv.uae.availability && <li>Availability: {cv.uae.availability}</li>}
              {cv.uae.hasUAEDrivingLicence && <li>UAE Driving Licence</li>}
              {cv.uae.willingToRelocate && <li>Willing to relocate</li>}
            </ul>
          </div>
        )}

        {sidebarSections.map((section) => (
          <div key={section}>
            <p className="mb-2 border-b border-white/30 pb-1.5 text-[11px] font-bold uppercase tracking-[0.16em]">
              {sectionLabel(section, lang)}
            </p>
            {section === 'skills' && (
              <div className="space-y-2">
                {cv.skills.technical.map((s) => (
                  <div key={s.id} className="text-[11.5px]">
                    {s.name}
                  </div>
                ))}
                {cv.skills.soft.map((s) => (
                  <div key={s.id} className="text-[11.5px] opacity-90">
                    {s.name}
                  </div>
                ))}
              </div>
            )}
            {section === 'languages' && (
              <div className="space-y-1 text-[11.5px]">
                {cv.languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span>{l.name}</span>
                    <span className="opacity-75 capitalize">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            )}
            {section === 'certifications' && (
              <ul className="space-y-1.5 text-[11.5px] leading-snug">
                {cv.certifications.map((c) => (
                  <li key={c.id}>
                    <p className="font-medium">{c.name}</p>
                    <p className="opacity-75">{c.issuingOrganization}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-6 px-8 py-10">
        {mainSections.map((section) => (
          <section key={section} className="break-inside-avoid">
            <h2
              className="mb-3 border-b pb-1.5 text-[13px] font-bold uppercase tracking-[0.08em]"
              style={{ borderColor: color.primary, color: color.primary }}
            >
              {sectionLabel(section, lang)}
            </h2>
            {section === 'summary' && <p className="text-[13px] leading-relaxed text-ink-700">{cv.summary}</p>}
            {section === 'experience' && (
              <div className="space-y-4">
                {cv.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[13.5px] font-semibold text-ink-900">{exp.jobTitle}</h3>
                      <span className="text-[11px] text-ink-500">
                        <ExperienceDateRange
                          start={exp.startDate}
                          end={exp.endDate}
                          current={exp.currentlyWorking}
                          lang={lang}
                        />
                      </span>
                    </div>
                    <p className="text-[12px] font-medium" style={{ color: color.primary }}>
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
              <div className="space-y-2.5">
                {cv.education.map((edu) => (
                  <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <div>
                      <h3 className="text-[13px] font-semibold text-ink-900">{edu.qualification}</h3>
                      <p className="text-[11.5px] text-ink-600">{edu.institution}</p>
                    </div>
                    <span className="text-[11px] text-ink-500">
                      <ExperienceDateRange
                        start={edu.startDate}
                        end={edu.endDate}
                        current={edu.currentlyStudying}
                        lang={lang}
                      />
                    </span>
                  </div>
                ))}
              </div>
            )}
            {section === 'projects' && (
              <div className="space-y-2">
                {cv.projects.map((p) => (
                  <div key={p.id}>
                    <h3 className="text-[13px] font-semibold text-ink-900">{p.name}</h3>
                    <p className="text-[12px] text-ink-700">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
            {section === 'references' && (
              <div className="grid grid-cols-2 gap-3 text-[11.5px] text-ink-700">
                {cv.references.map((r) => (
                  <div key={r.id}>
                    <p className="font-medium text-ink-900">{r.name}</p>
                    <p className="text-ink-500">{r.jobTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
