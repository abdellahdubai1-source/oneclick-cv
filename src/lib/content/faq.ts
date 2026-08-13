export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Is OneClick CV free to use?',
    answer:
      'You can build, preview and download your CV without an AI API key — the built-in fallback engine powers every AI feature by default. Suggestions from the fallback engine are always clearly labelled.',
  },
  {
    question: 'Will my CV actually pass an ATS?',
    answer:
      'We give you an estimated ATS readiness score, not a guarantee — no tool can promise that, because every employer uses different systems and criteria. Follow the Minimal ATS template and the formatting guidance in the ATS Checker to maximise compatibility.',
  },
  {
    question: 'Does OneClick CV store my personal data?',
    answer:
      'Your CV content and photos are stored in your browser, on your device, by default. See our Privacy page for exactly what is (and isn\'t) sent to a server, and when.',
  },
  {
    question: 'Can I use OneClick CV in Arabic?',
    answer:
      'Bilingual English/Arabic support with right-to-left layout is part of our roadmap architecture (language and direction are already modelled throughout the CV data), with full UI translation and RTL template rendering planned for a follow-up release.',
  },
  {
    question: 'What happens when I paste a job link?',
    answer:
      'Our server fetches the public page with strict security checks, extracts the likely vacancy content, and shows it to you to confirm or correct before it is used for anything. Pages that require login or JavaScript rendering can\'t be read automatically — you can paste the description instead.',
  },
  {
    question: 'Will tailoring my CV to a job invent experience I don\'t have?',
    answer:
      'No. Tailoring only ever reorders, rewords or emphasises information already on your CV, and any new skill suggestion always asks you to confirm you genuinely have it before adding it.',
  },
  {
    question: 'Can I switch templates without losing my information?',
    answer:
      'Yes — templates are purely a presentation layer. Your data is stored separately and stays intact when you switch templates, colours, or reorder sections.',
  },
  {
    question: 'What file formats can I download?',
    answer:
      'A true A4, selectable-text PDF matching your chosen template, and an ATS-friendly DOCX with a clean, standard structure regardless of which visual template you picked.',
  },
];
