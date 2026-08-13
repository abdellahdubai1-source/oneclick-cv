/* eslint-disable jsx-a11y/alt-text -- React PDF Image is a document primitive, not a DOM image. */
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import type { CVDocument, CVSectionId } from '@/lib/cv/types';
import { COLOR_PRESETS } from '@/lib/cv/colorPresets';
import { getVisibleSections, SECTION_LABELS } from '@/lib/cv/sectionOrder';
import { FONT_FAMILY_BOLD, formatDateRangePdf, makeSharedStyles } from './pdfPrimitives';
import { cvFilename, coverLetterFilename } from './filename';
import { downloadBlob } from './downloadBlob';

type Styles = ReturnType<typeof makeSharedStyles>;

interface LayoutScale {
  sectionGap: number;
  bodySize: number;
  bodyLineHeight: number;
  entryGap: number;
}

function contentWeight(cv: CVDocument): number {
  const experienceLines = cv.experience.reduce(
    (total, exp) => total + exp.responsibilities.length + exp.achievements.length,
    0,
  );
  return (
    cv.summary.length / 90 +
    cv.experience.length * 2 +
    experienceLines * 0.8 +
    cv.education.length * 1.2 +
    cv.certifications.length +
    cv.projects.length * 1.5 +
    (cv.skills.technical.length + cv.skills.soft.length) * 0.18 +
    cv.languages.length * 0.3
  );
}

export function getPdfLayoutScale(cv: CVDocument): LayoutScale {
  const weight = contentWeight(cv);
  if (weight < 12) return { sectionGap: 17, bodySize: 10.5, bodyLineHeight: 1.58, entryGap: 11 };
  if (weight < 20) return { sectionGap: 14, bodySize: 10, bodyLineHeight: 1.5, entryGap: 9 };
  return { sectionGap: 11, bodySize: 9.25, bodyLineHeight: 1.42, entryGap: 7 };
}

function uniqueSkillNames(cv: CVDocument): string[] {
  const seen = new Set<string>();
  return [...cv.skills.technical, ...cv.skills.soft]
    .map((skill) => skill.name.trim())
    .filter((name) => {
      const key = name.toLocaleLowerCase();
      if (!name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function SectionBlock({
  cv,
  section,
  styles,
  scale,
}: {
  cv: CVDocument;
  section: CVSectionId;
  styles: Styles;
  scale: LayoutScale;
}) {
  const lang = cv.meta.language;
  return (
    <View style={{ marginBottom: scale.sectionGap }} wrap={false}>
      <Text style={styles.sectionHeading}>{SECTION_LABELS[section][lang]}</Text>
      <View style={styles.divider} />
      {section === 'summary' && (
        <Text style={{ fontSize: scale.bodySize, lineHeight: scale.bodyLineHeight, color: '#2f3444' }}>{cv.summary}</Text>
      )}
      {section === 'experience' &&
        cv.experience.map((exp) => (
          <View key={exp.id} style={{ marginBottom: scale.entryGap }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.entryTitle}>
                {exp.jobTitle} — {exp.companyName}
              </Text>
              <Text style={styles.dateRange}>
                {formatDateRangePdf(exp.startDate, exp.endDate, exp.currentlyWorking)}
              </Text>
            </View>
            {exp.location ? <Text style={styles.entryMeta}>{exp.location}</Text> : null}
            {[...exp.responsibilities, ...exp.achievements].map((line, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={{ ...styles.bulletText, fontSize: scale.bodySize - 0.5, lineHeight: scale.bodyLineHeight }}>{line}</Text>
              </View>
            ))}
          </View>
        ))}
      {section === 'education' &&
        cv.education.map((edu) => (
          <View key={edu.id} style={{ marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.entryTitle}>{edu.qualification}</Text>
              <Text style={styles.entryMeta}>
                {edu.institution}
                {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}
              </Text>
            </View>
            <Text style={styles.dateRange}>
              {formatDateRangePdf(edu.startDate, edu.endDate, edu.currentlyStudying)}
            </Text>
          </View>
        ))}
      {section === 'skills' && (
        <Text style={{ fontSize: scale.bodySize, lineHeight: scale.bodyLineHeight, color: '#2f3444' }}>
          {uniqueSkillNames(cv).join('  ·  ')}
        </Text>
      )}
      {section === 'languages' && (
        <Text style={{ fontSize: scale.bodySize, lineHeight: scale.bodyLineHeight, color: '#2f3444' }}>
          {cv.languages.map((l) => `${l.name} (${l.proficiency})`).join('  ·  ')}
        </Text>
      )}
      {section === 'certifications' &&
        cv.certifications.map((c) => (
          <Text key={c.id} style={{ fontSize: 9.5, lineHeight: 1.5, color: '#2f3444', marginBottom: 2 }}>
            {c.name} — {c.issuingOrganization}
            {c.issueDate ? ` (${c.issueDate})` : ''}
          </Text>
        ))}
      {section === 'projects' &&
        cv.projects.map((p) => (
          <View key={p.id} style={{ marginBottom: 5 }}>
            <Text style={styles.entryTitle}>{p.name}</Text>
            <Text style={{ fontSize: 9.5, color: '#2f3444', lineHeight: 1.4 }}>{p.description}</Text>
          </View>
        ))}
      {section === 'references' &&
        cv.references.map((r) => (
          <Text key={r.id} style={{ fontSize: 9.5, color: '#2f3444', marginBottom: 2 }}>
            {r.name}
            {r.jobTitle ? `, ${r.jobTitle}` : ''}
            {r.companyName ? `, ${r.companyName}` : ''}
          </Text>
        ))}
    </View>
  );
}

function ContactText({ cv, color }: { cv: CVDocument; color: string }) {
  const items = [
    cv.personal.phone,
    cv.personal.email,
    [cv.personal.city, cv.personal.country].filter(Boolean).join(', '),
    cv.personal.linkedInUrl,
    cv.personal.portfolioUrl,
  ].filter(Boolean);
  return (
    <Text style={{ fontSize: 8.5, color, lineHeight: 1.5 }}>
      {items.join('   ·   ')}
    </Text>
  );
}

const PAGE_PADDING = 34;

/** Executive UAE & Hospitality UAE share a single-column, header-led layout; Minimal ATS reuses it without the coloured header. */
function SingleColumnDocument({ cv, variant }: { cv: CVDocument; variant: 'executive' | 'ats' | 'hospitality' }) {
  const color = COLOR_PRESETS[cv.template.colorPreset];
  const styles = makeSharedStyles(color);
  const sections = getVisibleSections(cv);
  const scale = getPdfLayoutScale(cv);
  const sparse = contentWeight(cv) < 12;
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;

  const headerBg = variant === 'ats' ? '#ffffff' : color.primary;
  const nameColor = variant === 'ats' ? '#000000' : '#ffffff';
  const titleColor = variant === 'ats' ? '#42495e' : '#ffffff';
  const contactColor = variant === 'ats' ? '#2f3444' : '#ffffff';

  return (
    <Document title={cvFilename(cv.personal.fullName, cv.personal.professionalTitle, 'pdf')} author={cv.personal.fullName}>
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        <View
          style={{
            backgroundColor: headerBg,
            paddingHorizontal: PAGE_PADDING,
            paddingVertical: sparse ? 31 : 26,
            borderBottomWidth: variant === 'ats' ? 1.5 : 0,
            borderBottomColor: '#000000',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: variant === 'hospitality' ? 'center' : 'flex-start',
          }}
        >
          <View style={{ alignItems: variant === 'hospitality' ? 'center' : 'flex-start' }}>
            <Text style={{ fontFamily: FONT_FAMILY_BOLD, fontSize: sparse ? 23 : 20, color: nameColor }}>
              {cv.personal.fullName || 'Your Name'}
            </Text>
            <Text style={{ fontSize: sparse ? 12 : 11, color: titleColor, marginTop: 3 }}>
              {cv.personal.professionalTitle || 'Professional Title'}
            </Text>
            <View style={{ marginTop: 6 }}>
              <ContactText cv={cv} color={contactColor} />
            </View>
          </View>
          {photoSrc && variant !== 'ats' && (
            <Image
              src={photoSrc}
              style={{
                width: 62,
                height: 62,
                borderRadius: variant === 'hospitality' ? 31 : 31,
              }}
            />
          )}
        </View>

        {variant === 'ats' && cv.personal.photoEnabled && (
          <Text style={{ fontSize: 7.5, color: '#66708c', fontStyle: 'italic', paddingHorizontal: PAGE_PADDING, marginTop: 6 }}>
            For the best ATS compatibility, we recommend using a CV without a photo unless the employer specifically
            requests one.
          </Text>
        )}

        <View style={{ paddingHorizontal: sparse ? 40 : PAGE_PADDING, paddingTop: sparse ? 27 : 20 }}>
          {sections.map((section) => (
            <SectionBlock key={section} cv={cv} section={section} styles={styles} scale={scale} />
          ))}
        </View>
      </Page>
    </Document>
  );
}

/** Modern Professional & Technical Professional share a two-region layout (coloured rail + main content). */
function TwoRegionDocument({ cv, variant }: { cv: CVDocument; variant: 'sidebar' | 'technical' }) {
  const color = COLOR_PRESETS[cv.template.colorPreset];
  const styles = makeSharedStyles(color);
  const railSections: CVSectionId[] = variant === 'sidebar' ? ['skills', 'languages', 'certifications'] : ['skills', 'certifications', 'languages'];
  const sections = getVisibleSections(cv);
  const rail = sections.filter((s) => railSections.includes(s));
  const main = sections.filter((s) => !railSections.includes(s));
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;
  const scale = getPdfLayoutScale(cv);
  const sparse = contentWeight(cv) < 12;

  if (variant === 'sidebar') {
    return (
      <Document title={cvFilename(cv.personal.fullName, cv.personal.professionalTitle, 'pdf')} author={cv.personal.fullName}>
        <Page size="A4" style={{ ...styles.page, padding: 0, flexDirection: 'row' }}>
          <View style={{ width: '36%', backgroundColor: color.primary, padding: 22 }}>
            {photoSrc && (
              <Image src={photoSrc} style={{ width: 88, height: 88, borderRadius: 44, alignSelf: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#ffffff' }} />
            )}
            <Text style={{ fontFamily: FONT_FAMILY_BOLD, fontSize: 15, color: '#ffffff', textAlign: 'center' }}>
              {cv.personal.fullName || 'Your Name'}
            </Text>
            <Text style={{ fontSize: 9, color: '#ffffff', textAlign: 'center', marginTop: 2, marginBottom: 12 }}>
              {cv.personal.professionalTitle || 'Professional Title'}
            </Text>
            <Text style={{ fontSize: 8, color: '#ffffff', opacity: 0.8, marginBottom: 10, lineHeight: 1.6 }}>
              {[cv.personal.phone, cv.personal.email, [cv.personal.city, cv.personal.country].filter(Boolean).join(', ')]
                .filter(Boolean)
                .join('\n')}
            </Text>
            {rail.map((section) => (
              <View key={section} style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: FONT_FAMILY_BOLD, fontSize: 8.5, color: '#ffffff', textTransform: 'uppercase', marginBottom: 4 }}>
                  {SECTION_LABELS[section][cv.meta.language]}
                </Text>
                {section === 'skills' &&
                  uniqueSkillNames(cv).map((s) => (
                    <Text key={s} style={{ fontSize: sparse ? 9 : 8, color: '#ffffff', marginBottom: sparse ? 2.5 : 1.5 }}>
                      {s}
                    </Text>
                  ))}
                {section === 'languages' &&
                  cv.languages.map((l) => (
                    <Text key={l.id} style={{ fontSize: 8, color: '#ffffff', marginBottom: 1.5 }}>
                      {l.name} — {l.proficiency}
                    </Text>
                  ))}
                {section === 'certifications' &&
                  cv.certifications.map((c) => (
                    <Text key={c.id} style={{ fontSize: 8, color: '#ffffff', marginBottom: 1.5 }}>
                      {c.name}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
          <View style={{ flex: 1, padding: 26 }}>
            {main.map((section) => (
              <SectionBlock key={section} cv={cv} section={section} styles={styles} scale={scale} />
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document title={cvFilename(cv.personal.fullName, cv.personal.professionalTitle, 'pdf')} author={cv.personal.fullName}>
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: PAGE_PADDING,
            paddingVertical: 16,
            borderBottomWidth: 3,
            borderBottomColor: color.primary,
          }}
        >
          {photoSrc && <Image src={photoSrc} style={{ width: 44, height: 44, borderRadius: 8, marginRight: 10 }} />}
          <View>
            <Text style={{ fontFamily: FONT_FAMILY_BOLD, fontSize: 16 }}>{cv.personal.fullName || 'Your Name'}</Text>
            <Text style={{ fontSize: 10, color: color.primary }}>{cv.personal.professionalTitle || 'Professional Title'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={{ width: '68%', padding: sparse ? 28 : 22 }}>
            {main.map((section) => (
              <SectionBlock key={section} cv={cv} section={section} styles={styles} scale={scale} />
            ))}
          </View>
          <View style={{ width: '32%', backgroundColor: color.primaryTint, padding: 16 }}>
            {rail.map((section) => (
              <View key={section} style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: FONT_FAMILY_BOLD, fontSize: 8.5, color: color.primaryDark, textTransform: 'uppercase', marginBottom: 4 }}>
                  {SECTION_LABELS[section][cv.meta.language]}
                </Text>
                {section === 'skills' &&
                  uniqueSkillNames(cv).map((s) => (
                    <Text key={s} style={{ fontSize: sparse ? 9 : 8, color: '#2f3444', marginBottom: sparse ? 2.5 : 1.5 }}>
                      {s}
                    </Text>
                  ))}
                {section === 'certifications' &&
                  cv.certifications.map((c) => (
                    <Text key={c.id} style={{ fontSize: 8, color: '#2f3444', marginBottom: 1.5 }}>
                      {c.name}
                    </Text>
                  ))}
                {section === 'languages' &&
                  cv.languages.map((l) => (
                    <Text key={l.id} style={{ fontSize: 8, color: '#2f3444', marginBottom: 1.5 }}>
                      {l.name} — {l.proficiency}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

/** Creative Portfolio — large left photo column. */
function CreativePortfolioDocument({ cv }: { cv: CVDocument }) {
  const color = COLOR_PRESETS[cv.template.colorPreset];
  const styles = makeSharedStyles(color);
  const sections = getVisibleSections(cv);
  const leftSections: CVSectionId[] = ['skills', 'languages', 'projects'];
  const left = sections.filter((s) => leftSections.includes(s));
  const right = sections.filter((s) => !leftSections.includes(s));
  const photoSrc = cv.personal.photoEnabled ? cv.photo.processedDataUrl : null;
  const scale = getPdfLayoutScale(cv);

  return (
    <Document title={cvFilename(cv.personal.fullName, cv.personal.professionalTitle, 'pdf')} author={cv.personal.fullName}>
      <Page size="A4" style={{ ...styles.page, padding: 0, flexDirection: 'row' }}>
        <View style={{ width: '38%', backgroundColor: color.primaryTint }}>
          {photoSrc && <Image src={photoSrc} style={{ width: '100%', height: 170 }} />}
          <View style={{ padding: 16 }}>
            <Text style={{ fontFamily: FONT_FAMILY_BOLD, fontSize: 17, color: color.primaryDark }}>
              {cv.personal.fullName || 'Your Name'}
            </Text>
            <Text style={{ fontSize: 9.5, color: color.primary, marginTop: 2, marginBottom: 10 }}>
              {cv.personal.professionalTitle || 'Professional Title'}
            </Text>
            <Text style={{ fontSize: 8, color: '#42495e', lineHeight: 1.6, marginBottom: 10 }}>
              {[cv.personal.phone, cv.personal.email, [cv.personal.city, cv.personal.country].filter(Boolean).join(', ')]
                .filter(Boolean)
                .join('\n')}
            </Text>
            {left.map((section) => (
              <View key={section} style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: FONT_FAMILY_BOLD, fontSize: 8.5, color: color.primary, textTransform: 'uppercase', marginBottom: 4 }}>
                  {SECTION_LABELS[section][cv.meta.language]}
                </Text>
                {section === 'skills' &&
                  uniqueSkillNames(cv).map((s) => (
                    <Text key={s} style={{ fontSize: 8, color: '#2f3444', marginBottom: 1.5 }}>
                      {s}
                    </Text>
                  ))}
                {section === 'languages' &&
                  cv.languages.map((l) => (
                    <Text key={l.id} style={{ fontSize: 8, color: '#2f3444', marginBottom: 1.5 }}>
                      {l.name} — {l.proficiency}
                    </Text>
                  ))}
                {section === 'projects' &&
                  cv.projects.map((p) => (
                    <View key={p.id} style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize: 8.5, fontFamily: FONT_FAMILY_BOLD }}>{p.name}</Text>
                      <Text style={{ fontSize: 7.5, color: '#42495e' }}>{p.description}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: 1, padding: 22 }}>
          {right.map((section) => (
            <SectionBlock key={section} cv={cv} section={section} styles={styles} scale={scale} />
          ))}
        </View>
      </Page>
    </Document>
  );
}

export function buildCVDocument(cv: CVDocument) {
  switch (cv.template.templateId) {
    case 'classic-ats-professional':
    case 'elegant-minimal-ats':
    case 'blue-line-ats':
      return <SingleColumnDocument cv={cv} variant="ats" />;
    case 'dark-sidebar-professional':
    case 'compact-dark-sidebar':
    case 'executive-black-gold':
    case 'monochrome-timeline':
      return <TwoRegionDocument cv={cv} variant="sidebar" />;
    case 'minimal-green-designer':
      return <TwoRegionDocument cv={cv} variant="technical" />;
    default:
      return <SingleColumnDocument cv={cv} variant="ats" />;
  }
}

function CoverLetterDocument({ text }: { text: string }) {
  return (
    <Document title="Cover Letter">
      <Page size="A4" style={{ ...PAGE_STYLE_FOR_LETTER, padding: 48 }}>
        {text.split('\n').map((line, i) => (
          <Text key={i} style={{ fontSize: 10.5, lineHeight: 1.7, marginBottom: line ? 0 : 6 }}>
            {line || ' '}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

const PAGE_STYLE_FOR_LETTER = { fontFamily: 'Times-Roman', color: '#1c1f2a' };

/** Client-side PDF generation — dynamically imported so `@react-pdf/renderer` never ships in the initial bundle. */
export async function downloadCVPdf(cv: CVDocument): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const doc = buildCVDocument(cv);
  const blob = await pdf(doc).toBlob();
  downloadBlob(blob, cvFilename(cv.personal.fullName, cv.personal.professionalTitle, 'pdf'));
}

export async function downloadCoverLetterPdf(params: {
  candidateName: string;
  positionTitle: string;
  text: string;
}): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(<CoverLetterDocument text={params.text} />).toBlob();
  downloadBlob(blob, coverLetterFilename(params.candidateName));
}
/* eslint-disable jsx-a11y/alt-text -- @react-pdf/renderer Image is a PDF primitive, not a DOM img element. */
