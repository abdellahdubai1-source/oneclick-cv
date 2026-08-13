import type { CVDocument, CVSectionId, TemplateId } from '@/lib/cv/types';
import type { TemplateProps } from './types';
import { Avatar, ExperienceDateRange, sectionLabel, useVisibleSections } from './shared';

const SIDE_SECTIONS = new Set<CVSectionId>(['skills', 'languages', 'certifications', 'references']);

function weight(cv: CVDocument) {
  return cv.summary.length / 100 + cv.experience.length * 2.5 + cv.experience.reduce((n, e) => n + e.responsibilities.length + e.achievements.length, 0) + cv.education.length * 1.4 + cv.projects.length * 1.5;
}

function density(cv: CVDocument) {
  const n = weight(cv);
  return n < 12 ? 'cv-roomy' : n > 23 ? 'cv-tight' : 'cv-normal';
}

function Contact({ cv, stacked = false }: { cv: CVDocument; stacked?: boolean }) {
  const items = [cv.personal.phone, cv.personal.email, [cv.personal.city, cv.personal.country].filter(Boolean).join(', '), cv.personal.linkedInUrl, cv.personal.portfolioUrl].filter(Boolean);
  return stacked ? <div className="space-y-1.5">{items.map((item) => <p key={item} className="break-words">{item}</p>)}</div> : <p>{items.join('  |  ')}</p>;
}

function SkillList({ cv, bars = false, columns = false }: { cv: CVDocument; bars?: boolean; columns?: boolean }) {
  const skills = [...cv.skills.technical, ...cv.skills.soft];
  return <div className={columns ? 'grid grid-cols-2 gap-x-8 gap-y-1' : 'space-y-1'}>{skills.map((s, i) => bars ? (
    <div key={s.id} className="mb-2"><span>{s.name}</span><div className="mt-1 h-[3px] bg-black/10"><div className="h-full bg-current" style={{ width: `${92 - (i % 4) * 10}%` }} /></div></div>
  ) : <p key={s.id}>•&nbsp;&nbsp;{s.name}</p>)}</div>;
}

function SideSection({ cv, section, bars = false }: { cv: CVDocument; section: CVSectionId; bars?: boolean }) {
  if (section === 'skills') return <SkillList cv={cv} bars={bars} />;
  if (section === 'languages') return <div className="space-y-1">{cv.languages.map((l) => <p key={l.id}>{l.name}: <span className="capitalize">{l.proficiency}</span></p>)}</div>;
  if (section === 'certifications') return <div className="space-y-2">{cv.certifications.map((c) => <div key={c.id}><p className="font-semibold">{c.name}</p><p className="opacity-70">{c.issuingOrganization}</p></div>)}</div>;
  if (section === 'references') return <div className="space-y-2">{cv.references.map((r) => <div key={r.id}><p className="font-semibold">{r.name}</p><p>{[r.jobTitle, r.companyName, r.phone, r.email].filter(Boolean).join(' · ')}</p></div>)}</div>;
  return null;
}

function MainSection({ cv, section, timeline = false }: { cv: CVDocument; section: CVSectionId; timeline?: boolean }) {
  const lang = cv.meta.language;
  if (section === 'summary') return <p className="cv-body">{cv.summary}</p>;
  if (section === 'experience') return <div className="cv-entry-list">{cv.experience.map((exp) => (
    <article key={exp.id} className={timeline ? 'relative border-l border-current/60 pl-5 before:absolute before:-left-[5px] before:top-1 before:h-2 before:w-2 before:rounded-full before:bg-current' : ''}>
      <div className="flex items-baseline justify-between gap-4"><h3 className="cv-entry-title">{exp.jobTitle}</h3><span className="cv-date"><ExperienceDateRange start={exp.startDate} end={exp.endDate} current={exp.currentlyWorking} lang={lang} /></span></div>
      <p className="cv-meta">{exp.companyName}{exp.location ? ` — ${exp.location}` : ''}</p>
      <ul className="cv-bullets">{[...exp.responsibilities, ...exp.achievements].map((x, i) => <li key={i}>{x}</li>)}</ul>
    </article>
  ))}</div>;
  if (section === 'education') return <div className="cv-entry-list">{cv.education.map((edu) => <article key={edu.id} className={timeline ? 'relative border-l border-current/60 pl-5 before:absolute before:-left-[5px] before:top-1 before:h-2 before:w-2 before:rounded-full before:bg-current' : ''}><div className="flex items-baseline justify-between gap-4"><h3 className="cv-entry-title">{edu.qualification}</h3><span className="cv-date"><ExperienceDateRange start={edu.startDate} end={edu.endDate} current={edu.currentlyStudying} lang={lang} /></span></div><p className="cv-meta">{edu.institution}{edu.location ? ` — ${edu.location}` : ''}</p></article>)}</div>;
  if (section === 'skills') return <SkillList cv={cv} columns />;
  if (section === 'languages') return <p className="cv-body">{cv.languages.map((l) => `${l.name} (${l.proficiency})`).join('  ·  ')}</p>;
  if (section === 'certifications') return <ul className="cv-bullets">{cv.certifications.map((c) => <li key={c.id}>{c.name} — {c.issuingOrganization}</li>)}</ul>;
  if (section === 'projects') return <div className="cv-entry-list">{cv.projects.map((p) => <article key={p.id}><h3 className="cv-entry-title">{p.name}</h3><p className="cv-body">{p.description}</p></article>)}</div>;
  if (section === 'references') return <p className="cv-body">{cv.references.map((r) => `${r.name}${r.jobTitle ? `, ${r.jobTitle}` : ''}`).join('  |  ')}</p>;
  return null;
}

function Heading({ children, variant }: { children: React.ReactNode; variant: TemplateId }) {
  if (variant === 'blue-line-ats') return <div className="cv-blue-heading"><span /> <h2>{children}</h2> <span /></div>;
  return <h2 className="cv-section-title">{children}</h2>;
}

function SidebarLayout({ cv, variant, mode }: { cv: CVDocument; variant: TemplateId; mode: 'preview' | 'print' }) {
  const sections = useVisibleSections(cv);
  const side = sections.filter((s) => SIDE_SECTIONS.has(s));
  const main = sections.filter((s) => !SIDE_SECTIONS.has(s));
  const compact = variant === 'compact-dark-sidebar';
  const gold = variant === 'executive-black-gold';
  const timeline = variant === 'monochrome-timeline';
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;
  return <div dir={cv.meta.language === 'ar' ? 'rtl' : 'ltr'} className={`cv-page cv-sidebar-page ${density(cv)} cv-${variant}`}>
    <aside className="cv-sidebar">
      <Avatar src={photoSrc} shape="circle" sizeClass={compact ? 'h-24 w-24' : timeline ? 'h-28 w-28' : 'h-36 w-36'} ringColor="#fff" alt={cv.personal.fullName || 'Profile photo'} />
      {!gold && <div className="cv-side-identity"><h1>{cv.personal.fullName || 'Your Name'}</h1><p>{cv.personal.professionalTitle || 'Professional Title'}</p></div>}
      {timeline && cv.summary && <div className="cv-side-block"><h2>About Me</h2><p>{cv.summary}</p></div>}
      <div className="cv-side-block"><h2>Contact</h2><Contact cv={cv} stacked /></div>
      {side.map((s) => <div className="cv-side-block" key={s}><h2>{sectionLabel(s, cv.meta.language)}</h2><SideSection cv={cv} section={s} bars={timeline} /></div>)}
    </aside>
    <main className="cv-main">
      {gold && <header className="cv-gold-header"><h1>{cv.personal.fullName || 'Your Name'}</h1><p>{cv.personal.professionalTitle || 'Professional Title'}</p>{cv.summary && <p className="cv-body">{cv.summary}</p>}</header>}
      {timeline && <header className="cv-timeline-header"><div><h1>{cv.personal.fullName || 'Your Name'}</h1><p>{cv.personal.professionalTitle || 'Professional Title'}</p></div><Contact cv={cv} stacked /></header>}
      {main.map((s) => <section className="cv-section" key={s}>{!(gold && s === 'summary') && !(timeline && s === 'summary') && <><Heading variant={variant}>{sectionLabel(s, cv.meta.language)}</Heading><MainSection cv={cv} section={s} timeline={timeline} /></>}</section>)}
    </main>
  </div>;
}

function GreenLayout({ cv }: { cv: CVDocument }) {
  const sections = useVisibleSections(cv); const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;
  const greenSide = new Set<CVSectionId>(['skills', 'languages', 'certifications']);
  const side = sections.filter((s) => greenSide.has(s)); const main = sections.filter((s) => !greenSide.has(s));
  return <div className={`cv-page cv-green-page ${density(cv)}`}><aside><Avatar src={photoSrc} shape="circle" sizeClass="h-28 w-28" ringColor="#bbf7c3" alt={cv.personal.fullName || 'Profile photo'} /><h1>{cv.personal.fullName || 'Your Name'}</h1><p className="cv-green-title">{cv.personal.professionalTitle || 'Professional Title'}</p><div className="cv-green-contact"><h2>Contact</h2><Contact cv={cv} stacked /></div>{side.map((s) => <div key={s} className="cv-green-side"><h2>{sectionLabel(s, cv.meta.language)}</h2><SideSection cv={cv} section={s} bars={s === 'skills'} /></div>)}</aside><main>{main.map((s) => <section className="cv-section" key={s}><Heading variant="minimal-green-designer">{s === 'summary' ? 'Professional Summary' : sectionLabel(s, cv.meta.language)}</Heading><MainSection cv={cv} section={s} /></section>)}</main></div>;
}

function AtsLayout({ cv, variant }: { cv: CVDocument; variant: 'classic-ats-professional' | 'elegant-minimal-ats' | 'blue-line-ats' }) {
  const sections = useVisibleSections(cv);
  return <div className={`cv-page cv-ats-page ${density(cv)} cv-${variant}`}><header><h1>{cv.personal.fullName || 'Your Name'}</h1><p className="cv-ats-title">{cv.personal.professionalTitle || 'Professional Title'}</p><div className="cv-ats-contact"><Contact cv={cv} /></div></header><main>{sections.map((s) => <section className="cv-section" key={s}><Heading variant={variant}>{s === 'summary' && variant === 'blue-line-ats' ? 'Summary Statement' : sectionLabel(s, cv.meta.language)}</Heading><MainSection cv={cv} section={s} /></section>)}</main></div>;
}

export default function ReferenceTemplate({ cv, mode = 'preview' }: TemplateProps) {
  const id = cv.template.templateId;
  if (id === 'minimal-green-designer') return <GreenLayout cv={cv} />;
  if (id === 'classic-ats-professional' || id === 'elegant-minimal-ats' || id === 'blue-line-ats') return <AtsLayout cv={cv} variant={id} />;
  return <SidebarLayout cv={cv} variant={id} mode={mode} />;
}
