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
}

export function extractJobPageContent(html: string): ExtractedPage {
  const $ = cheerio.load(html);

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

  return { title: title.slice(0, 200), text: cleaned.slice(0, 20000) };
}
