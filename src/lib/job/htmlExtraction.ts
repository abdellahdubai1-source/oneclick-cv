import 'server-only';
import * as cheerio from 'cheerio';

/**
 * Extracts the likely vacancy content from a raw HTML page (spec §15),
 * stripping navigation, adverts, cookie banners, footers and other noise.
 * cheerio parses HTML without executing any scripts, so this is safe to
 * run on untrusted, attacker-controlled markup.
 */

const NOISE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'iframe',
  'svg',
  'nav',
  'footer',
  'header',
  'form',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[aria-hidden="true"]',
  '.cookie',
  '.cookies',
  '.cookie-banner',
  '.gdpr',
  '.consent',
  '.advert',
  '.advertisement',
  '.ads',
  '.ad',
  '.sidebar',
  '.newsletter',
  '.social-share',
  '.breadcrumbs',
  '.site-header',
  '.site-footer',
];

const MAIN_CONTENT_SELECTORS = [
  'main',
  'article',
  '[role="main"]',
  '.job-description',
  '.job-details',
  '.job-posting',
  '.vacancy',
  '#job-description',
  '#jobDescriptionText',
];

export interface ExtractedPage {
  title: string;
  text: string;
  structuredJob: StructuredJobData | null;
}

export interface StructuredJobData {
  positionTitle: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  requiredExperience: string;
  education: string;
  certifications: string[];
  languages: string[];
  deadline: string;
}

function asText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(', ');
  return '';
}

function htmlToText(value: unknown): string {
  const html = asText(value);
  if (!html) return '';
  const $ = cheerio.load(`<main>${html}</main>`);
  $('br').replaceWith('\n');
  $('li').each((_, element) => {
    $(element).prepend('• ').append('\n');
  });
  $('p,h1,h2,h3,h4,h5,h6,div,section').each((_, element) => {
    $(element).append('\n');
  });
  return $('main')
    .text()
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function listFrom(value: unknown): string[] {
  return asText(value).split(/[,;\n•|]/).map((item) => item.trim()).filter(Boolean).slice(0, 30);
}

function findJobPosting(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const type = record['@type'];
  if (type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))) return record;
  return findJobPosting(record['@graph']);
}

function organisationName(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  return asText((value as Record<string, unknown>).name);
}

function locationText(value: unknown): string {
  const locations = Array.isArray(value) ? value : [value];
  const parts = locations.flatMap((location) => {
    if (!location || typeof location !== 'object') return [];
    const record = location as Record<string, unknown>;
    const address = record.address && typeof record.address === 'object'
      ? record.address as Record<string, unknown>
      : record;
    return [address.addressLocality, address.addressRegion, address.addressCountry].map(asText).filter(Boolean);
  });
  return Array.from(new Set(parts)).join(', ');
}

function extractStructuredJob($: cheerio.CheerioAPI): StructuredJobData | null {
  for (const element of $('script[type="application/ld+json"]').toArray()) {
    try {
      const parsed = JSON.parse($(element).text());
      const job = findJobPosting(parsed);
      if (!job) continue;
      const description = htmlToText(job.description);
      return {
        positionTitle: asText(job.title),
        company: organisationName(job.hiringOrganization),
        location: locationText(job.jobLocation) || asText(job.jobLocationType),
        employmentType: asText(job.employmentType),
        description,
        responsibilities: listFrom(job.responsibilities || job.jobResponsibilities),
        // qualifications is often the entire requirements paragraph, not a
        // machine-readable skill list. Let the normal keyword parser inspect
        // that text instead of presenting the paragraph as one giant skill.
        skills: listFrom(job.skills),
        requiredExperience: htmlToText(job.experienceRequirements),
        education: htmlToText(job.educationRequirements),
        certifications: listFrom(job.qualifications).filter((item) => /certif|licen[cs]e/i.test(item)),
        languages: listFrom(job.inLanguage),
        deadline: asText(job.validThrough),
      };
    } catch {
      // Invalid JSON-LD is common; continue to the next block/page-text fallback.
    }
  }
  return null;
}

export function extractJobPageContent(html: string): ExtractedPage {
  const $ = cheerio.load(html);

  // Read schema.org JobPosting data before removing scripts. Career sites
  // often render little useful server HTML but still expose this canonical,
  // vacancy-specific payload for search engines.
  const structuredJob = extractStructuredJob($);

  for (const selector of NOISE_SELECTORS) {
    $(selector).remove();
  }

  const title = $('title').first().text().trim() || $('h1').first().text().trim();

  let contentRoot = $();
  for (const selector of MAIN_CONTENT_SELECTORS) {
    const match = $(selector);
    if (match.length > 0) {
      contentRoot = match;
      break;
    }
  }
  if (contentRoot.length === 0) contentRoot = $('body');

  const text = contentRoot
    .find('h1,h2,h3,h4,p,li,dt,dd,span,div')
    .addBack()
    .contents()
    .filter((_, el) => el.type === 'text')
    .map((_, el) => $(el).text())
    .get()
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');

  const cleaned = text.replace(/\n{3,}/g, '\n\n').trim();

  return { title: title.slice(0, 200), text: cleaned.slice(0, 20000), structuredJob };
}
