# OneClick CV

**Professional CVs. Smarter applications.**

A premium CV and cover-letter builder for UAE job seekers: guided CV builder, six genuinely different templates, a
touch-friendly photo editor, an AI writing assistant (with a fully working offline fallback engine), a profession-based
cover-letter generator, an estimated ATS/job-match checker, and a secure public job-link analyser — all exportable to
true A4, selectable-text PDF and ATS-friendly DOCX.

---

## 1. Feature summary

- **CV Builder** — an 11-step guided flow (Personal → Summary → Experience → Education → Skills & Languages →
  Certifications → UAE Details → Template → ATS & Job Match → Review → Download) with autosave, validation, live A4
  preview, and add/edit/duplicate/reorder/delete for every repeatable section.
- **Six templates** — Executive UAE, Modern Professional, Minimal ATS, Creative Portfolio, Hospitality UAE, Technical
  Professional. Each has a genuinely different structure, spacing system and photo treatment — not one layout
  recoloured six times. Seven accent colour presets. Switching templates/colours never loses data.
- **Photo editor** — upload, crop, zoom, rotate, replace, remove, enable/disable, reset. Built with `react-easy-crop`
  and a canvas-based export step that never stretches or distorts the source image.
- **AI Suggestion Assistant** — Suggest / Improve / Make professional / Fix grammar / Make shorter / Add relevant
  skills / Generate achievements / Improve job description / Create summary. Every suggestion shows original text,
  suggested text, a reason, and lets you edit-before-applying, apply, or reject. Works completely offline via a
  profession-based **fallback engine** (18 profession profiles) when no AI provider key is configured — the fallback
  never invents employers, qualifications, experience, certifications or metrics; it leaves clearly editable
  placeholders instead.
- **Cover Letter Generator** — 17 built-in professions plus "Custom", 4 tones, and genuinely distinct output per
  profession (a Cleaning letter never mentions digital marketing; a Web Design letter leads with UX and responsive
  design). Editable, copyable, downloadable as PDF.
- **ATS Checker** — paste a job description and get an estimated 0–100 score (Strong / Good / Needs improvement /
  Low, per the product spec's bands), grouped feedback (strong matches, missing keywords, missing requirements,
  formatting issues, content improvements, recommended skills), and an ATS plain-text reading-order preview. Adding a
  recommended skill always asks "do you genuinely have this skill?" first.
- **Match CV to a Job** — paste a public vacancy URL, paste a description, or upload a `.txt` file. URLs are fetched
  **server-side with SSRF protections** (private/reserved/loopback/link-local/metadata-IP blocking, DNS
  re-validation on every redirect hop, timeouts, size limits, content-type allow-list, no cookies/credentials).
  Extracted data is always shown for you to confirm/correct before comparison. Requirement-by-requirement matching
  (Confirmed / Possible / Not found / Needs confirmation) and one-click "Create tailored CV copy" that **never**
  overwrites your master CV.
- **PDF & DOCX export** — true A4, selectable text (not a rasterised image), correct reading order, descriptive
  filenames (`Firstname-Lastname-Role-CV.pdf`, `Firstname-Lastname-Cover-Letter.pdf`). DOCX always uses one clean,
  ATS-friendly structure regardless of the chosen visual template.
- **Draft management & privacy** — multiple named drafts stored in the browser's `localStorage` (autosave, rename,
  duplicate, delete-with-confirmation, restore-on-refresh). CV data and photos never touch a server unless you
  explicitly trigger an AI suggestion or job-link fetch — and a short notice explains what's sent before the first
  AI request each session.
- **Accessibility & responsiveness** — semantic HTML, labelled fields, keyboard-navigable controls, visible focus
  states, non-colour-only status indicators, mobile Edit/Preview tabs (never a squeezed side-by-side layout on
  small screens), touch-friendly photo editor.

## 2. Architecture summary

```
src/
  app/                       # Next.js App Router routes
    page.tsx                 # Landing page
    builder/                 # CV Builder (client-rendered shell + steps)
    cover-letter/             templates/  job-match/  privacy/  faq/
    api/ai/suggest            # AI suggestion route (provider-agnostic)
    api/job/extract           # Secure server-side job-link fetch + extraction
    api/job/parse-text        # Job-description text parsing
  components/
    builder/                 # Step forms, AI assistant UI, photo editor, draft manager
    templates/                # The 6 CV template React components + registry dispatcher
    preview/                  # Live A4 preview, ATS plain-text preview
    ats/                       # ATS score gauge + feedback panel
    jobmatch/                  # Match CV to a Job UI
    coverletter/                # Cover letter form/preview
    landing/  layout/  ui/
  lib/
    cv/                       # Domain types, Zod schemas, section ordering, profession profiles, defaults
    state/                     # Zustand store (cvStore) + localStorage draft manager
    templates/                 # Template registry/metadata (photo shape, layout, ATS-friendliness)
    ai/                         # Provider interface, fallback engine, Anthropic/OpenAI adapters, prompts
    ats/                         # Keyword extraction + scoring engine
    coverLetter/                  # Cover-letter generator
    job/                           # SSRF-safe URL validation, secure fetch, HTML extraction, parsing, matching
    export/                         # PDF (@react-pdf/renderer) and DOCX (docx) generation
    security/                        # Rate limiting, text sanitisation, prompt-injection heuristics
    photo/  utils/
tests/
  unit/                       # Vitest — scoring, fallback engine, cover letters, SSRF guards, schema, components
  e2e/                        # Playwright — core builder → ATS → cover letter flow
```

Design principles carried through the codebase:
- **Provider-agnostic AI** — `lib/ai/providerInterface.ts` is the only contract routes/UI depend on. The fallback
  engine, Anthropic adapter and OpenAI adapter all implement it, so adding a 4th provider never touches route or UI
  code.
- **Never invent facts** — the fallback engine and every AI prompt are instructed to leave `[bracketed placeholders]`
  rather than fabricate metrics, employers or qualifications; job-link/CV matching only ever marks a requirement
  "Confirmed" when there's real textual evidence.
- **Untrusted-by-default job content** — anything read from a URL or file is shown for user confirmation before it's
  used anywhere, and is wrapped as inert data (never instructions) before being sent to an AI provider.
- **Local-first data** — `lib/state/draftStorage.ts` is the only place CV data is persisted, and it's `localStorage`,
  not a server.

## 3. Environment variables

Copy `.env.example` to `.env.local`. **The app works with zero environment variables set** — AI features run on the
built-in fallback engine and job-link analysis works out of the box.

| Variable | Required | Purpose |
|---|---|---|
| `AI_PROVIDER` | No (`fallback` default) | `fallback` \| `anthropic` \| `openai` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Only if `AI_PROVIDER=anthropic` | Real AI suggestions via Claude |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | Only if `AI_PROVIDER=openai` | Real AI suggestions via OpenAI |
| `AI_MAX_INPUT_CHARS`, `AI_REQUEST_TIMEOUT_MS`, `AI_RATE_LIMIT_PER_MINUTE` | No | AI route limits |
| `JOB_FETCH_TIMEOUT_MS`, `JOB_FETCH_MAX_BYTES`, `JOB_FETCH_MAX_REDIRECTS`, `JOB_FETCH_RATE_LIMIT_PER_MINUTE` | No | Job-link fetch safety limits |
| `NEXT_PUBLIC_APP_URL` | Recommended for production | Used for metadata/sitemap |
| `NEXT_PUBLIC_APP_NAME` | No | Overrides the app name shown in metadata |

## 4. Setup — exact commands

> **Verification status:** dependencies were installed and the project was checked with TypeScript, ESLint,
> Vitest, and a full Next.js production build. All 33 unit tests pass and all 15 routes build successfully.
> Playwright E2E tests are included; running them requires the Playwright browser binaries described below.

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables (optional — the app works with none set)
cp .env.example .env.local

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

### Testing

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # next lint
npm run test           # vitest unit tests (ats scoring, fallback engine, cover letters, SSRF guards, schema, components)
npm run test:e2e       # playwright end-to-end (builds + starts the app automatically)
```

### Production build

```bash
npm run build
npm run start           # serves the production build on http://localhost:3000
```

### One-shot verification

```bash
npm run verify          # typecheck && lint && test && build
```

## 5. Deployment

The app is a standard Next.js 14 App Router project — deploy to **Vercel** (recommended, zero config: connect the
repo, set env vars from the table above if you want real AI, deploy), or any Node.js host that supports
`next build && next start` (Render, Railway, a Docker container, etc.). No database, no headless browser, and no
system dependencies are required — PDF/DOCX export run entirely client-side in the browser, and the job-link
fetcher uses Node's built-in `fetch`/`dns`/`net`, so nothing extra needs to be installed on the server.

```dockerfile
# Minimal reference Dockerfile (not required for Vercel)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## 6. Fonts & Arabic PDF export

To keep this build fully offline-buildable, the UI uses system font stacks (see `src/app/globals.css`) instead of
`next/font/google`, and PDF export uses `@react-pdf/renderer`'s standard embedded fonts (Helvetica/Times) instead of
a registered custom font. Both are trivial, isolated follow-ups once you have network access:

- **UI fonts**: swap the `--font-inter` / `--font-source-serif` / `--font-noto-arabic` CSS variables in
  `globals.css` for `next/font/google` imports (Inter, Source Serif 4, Noto Kufi Arabic are good matches for the
  brand direction).
- **Arabic PDF/DOCX**: standard PDF fonts don't include Arabic glyphs. Register an Arabic-capable font (e.g. Noto
  Naskh Arabic) via `Font.register()` in `lib/export/pdfPrimitives.tsx`, and reference it conditionally when
  `cv.meta.language === 'ar'`.

## 7. Honest limitations (read before shipping)

This build covers the full core product experience end-to-end, but a few things are intentionally scoped down or
left as documented follow-ups rather than silently faked:

- **Automated verification completed.** `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`
  all pass. The suite currently contains 33 passing unit tests, and the production build generates all 15 routes.
- **Bilingual English/Arabic UI + RTL** is architected (every CV has a `language` field, dates/formatting are
  language-aware, templates render with `dir={rtl ? 'rtl' : 'ltr'}`) but the UI chrome itself (buttons, labels,
  nav) is English-only for now, and there's no language switcher yet. Full translation + RTL mirroring of every
  template is the natural next milestone.
- **PDF/DOCX visual fidelity**: the 6 HTML preview templates and the 6 PDF documents are two separate
  implementations (a deliberate choice — `@react-pdf/renderer` needs its own primitives and this guarantees
  selectable text without a headless browser in production). They're closely matched but not pixel-identical; the
  DOCX export is intentionally one clean ATS-oriented structure regardless of the chosen visual template, per how
  the product spec frames DOCX.
- **Job-description file uploads**: `.txt` files are extracted automatically. PDF, DOCX and screenshot uploads are
  accepted by the UI but automatic text extraction for them isn't wired up yet (no `pdf.js`/`mammoth`/OCR
  dependency was added, to keep the dependency list lean per your instructions) — the UI clearly tells the user to
  paste the text instead, rather than silently failing or hanging.
- **Rate limiting is in-memory**, scoped to a single Node process — correct for one server instance; swap
  `lib/security/rateLimit.ts` for a shared store (Upstash Redis, Vercel KV) behind the same function signature if
  you deploy multiple instances/regions.
- **E2E tests require Playwright browsers.** The 14 desktop/mobile scenarios are provided and were discovered
  correctly, but the current environment does not include Chromium/WebKit binaries. Run `npx playwright install`
  once, then `npm run test:e2e`, on a machine or CI runner where browser downloads are allowed.

Everything else in the master spec — CV builder, 6 templates, photo editor, AI assistant with fallback engine,
cover-letter generator, ATS checker, SSRF-safe job-link analyser with CV matching and truthful tailored copies,
PDF/DOCX export, draft management, and the premium landing page — is implemented and wired end-to-end.
