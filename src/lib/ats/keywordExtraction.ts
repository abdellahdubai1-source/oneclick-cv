import { PROFESSION_LIST } from '@/lib/cv/professionProfiles';

/**
 * Lightweight, dependency-free keyword/skill extraction from free-text job
 * descriptions. This is intentionally heuristic (no NLP library) — good
 * enough to power "estimated" ATS/match scoring (spec §14/§16 both stress
 * these are *estimates*, never guarantees).
 */

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below
   between both but by can't cannot could couldn't did didn't do does doesn't doing don't down during each
   few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers
   herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me
   more most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own
   same shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them
   themselves then there there's these they they'd they'll they're they've this those through to too under
   until up very was wasn't we we'd we'll we're we've were weren't what what's when when's where where's
   which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours
   yourself yourselves will etc using use used join joining team role work working across strong excellent
   ability able years year experience preferred required must plus`
    .split(/\s+/)
    .filter(Boolean),
);

// A broad built-in skills glossary compiled from every profession profile plus common cross-industry terms —
// used to recognise multi-word skill phrases that a naive word-frequency count would miss.
const KNOWN_SKILLS = Array.from(
  new Set(
    PROFESSION_LIST.flatMap((p) => [...p.suggestedSkills, ...p.suggestedSoftSkills]).concat([
      'Microsoft Excel',
      'Microsoft Office',
      'Project Management',
      'Communication Skills',
      'Problem Solving',
      'Time Management',
      'Customer Service',
      'Team Leadership',
      'Data Analysis',
      'UAE Labour Law',
      'Arabic',
      'English',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe Premiere Pro',
      'CapCut',
      'Video Editing',
      'Scriptwriting',
      'Content Strategy',
      'Content Calendar',
      'Short-form Video',
      'On-camera Presentation',
      'Teleprompter',
      'AI Tools',
      'Product Demos',
      'Software Walkthroughs',
      'Social Media Content',
    ]),
  ),
).sort((a, b) => b.length - a.length); // longest-first so multi-word phrases match before their substrings

export interface ExtractedKeywords {
  /** Skill phrases recognised from the built-in glossary. */
  knownSkills: string[];
  /** High-frequency significant words not already covered by knownSkills — treated as generic keywords. */
  freeKeywords: string[];
  /** Lines that look like explicit requirements ("must have", "required", bullet points, etc.). */
  requirementLines: string[];
  /** Lines that look like "nice to have" / preferred items. */
  preferredLines: string[];
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'");
}

export function extractKeywords(jobText: string): ExtractedKeywords {
  const normalisedText = normalise(jobText);

  const knownSkills = KNOWN_SKILLS.filter((skill) => normalisedText.includes(skill.toLowerCase()));

  const words = normalisedText
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const frequency = new Map<string, number>();
  for (const word of words) frequency.set(word, (frequency.get(word) ?? 0) + 1);

  const freeKeywords = Array.from(frequency.entries())
    .filter(([word, count]) => count >= 2 && !knownSkills.some((s) => s.toLowerCase().includes(word)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word]) => word);

  const lines = jobText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const requirementLines = lines.filter((l) =>
    /^[-•*]|must have|required|requirements?:|minimum of|at least \d+ years?/i.test(l),
  );
  const preferredLines = lines.filter((l) => /preferred|nice to have|bonus|advantageous|plus if/i.test(l));

  return { knownSkills, freeKeywords, requirementLines, preferredLines };
}
