import type { AISuggestRequest } from '@/lib/cv/schema';
import type { AIProvider, AISuggestionResult } from './providerInterface';
import { PROFESSION_PROFILES, type ProfessionId } from '@/lib/cv/professionProfiles';

/**
 * High-quality, profession-based fallback engine (spec §13).
 *
 * This is what powers the entire AI Suggestion Assistant and Cover-Letter
 * Generator when no AI_PROVIDER is configured — the app must feel complete
 * without any API key. It is deliberately template-driven rather than
 * "smart": it never invents employers, qualifications, years of experience,
 * certifications, metrics or achievements (spec §11) — it only rephrases,
 * structures and suggests *categories* of content the user must confirm or
 * fill in themselves.
 */

function resolveProfession(id?: string): ProfessionId {
  if (id && id in PROFESSION_PROFILES) return id as ProfessionId;
  return 'custom';
}

function titleCaseFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stripFillerWords(text: string): string {
  return text
    .replace(/\b(very|really|just|actually|basically|kind of|sort of)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

class FallbackProvider implements AIProvider {
  readonly name = 'fallback';

  async suggest(request: AISuggestRequest): Promise<AISuggestionResult> {
    const profession = resolveProfession(request.context?.profession);
    const profile = PROFESSION_PROFILES[profession];

    switch (request.action) {
      case 'create_summary':
        return this.createSummary(request, profile.id);
      case 'suggest':
        return this.suggestGeneric(request, profile.id);
      case 'improve':
      case 'make_professional':
        return this.improveText(request);
      case 'fix_grammar':
        return this.fixGrammar(request);
      case 'make_shorter':
        return this.makeShorter(request);
      case 'add_skills':
        return this.addSkills(request, profile.id);
      case 'generate_achievements':
        return this.generateAchievements(request, profile.id);
      case 'improve_job_description':
        return this.improveResponsibility(request, profile.id);
      default:
        return {
          suggestedText: request.text,
          reason: 'No changes suggested.',
          source: 'fallback',
        };
    }
  }

  private createSummary(request: AISuggestRequest, professionId: ProfessionId): AISuggestionResult {
    const profile = PROFESSION_PROFILES[professionId];
    const title = request.context?.professionalTitle?.trim() || 'professional';
    const years = request.context?.yearsOfExperience;
    const yearsPhrase = years && years > 0 ? `${years}+ years of experience` : 'hands-on experience';
    const skills =
      request.context?.existingSkills && request.context.existingSkills.length > 0
        ? request.context.existingSkills.slice(0, 5)
        : profile.suggestedSkills.slice(0, 4);
    const industryPhrase = request.context?.industry ? ` within the ${request.context.industry} sector` : '';
    const target = request.context?.targetJob?.positionTitle?.trim();
    const targetPhrase = target && target.toLowerCase() !== title.toLowerCase()
      ? ` Well positioned to contribute in ${target} opportunities`
      : ' Well positioned to contribute in relevant opportunities';

    const suggestedText =
      `${titleCaseFirst(title)} with ${yearsPhrase}${industryPhrase}, bringing practical capability in ${skills.join(', ')}. ` +
      `Experienced in supporting ${profile.themes.slice(0, 3).join(', ')}, with a strong focus on ${profile.themes.slice(3, 5).join(' and ')}. ` +
      `Known for ${profile.valuePropositions[0]} and for approaching each assignment with professionalism, accuracy and consistent attention to detail. ` +
      `Combines clear communication, dependable teamwork and an adaptable working style to understand business needs and deliver high-quality work.${targetPhrase}, particularly where the candidate's verified skills align with the role's priorities.`;

    return {
      suggestedText,
      reason: `A complete professional summary tailored to your title and the ${profile.label} profile, using qualitative strengths without inventing metrics.`,
      source: 'fallback',
    };
  }

  private suggestGeneric(request: AISuggestRequest, professionId: ProfessionId): AISuggestionResult {
    if (request.field === 'summary') return this.createSummary(request, professionId);
    if (request.field === 'skills') return this.addSkills(request, professionId);
    if (request.field === 'achievement') return this.generateAchievements(request, professionId);
    return this.improveResponsibility(request, professionId);
  }

  private improveText(request: AISuggestRequest): AISuggestionResult {
    const base = stripFillerWords(request.text);
    if (!base) {
      return { suggestedText: '', reason: 'Add some text first, then try again.', source: 'fallback' };
    }
    const improved = titleCaseFirst(base).replace(/\.?\s*$/, '.');
    return {
      suggestedText: improved,
      reason: 'Removed filler words, tightened phrasing and applied consistent sentence casing/punctuation.',
      source: 'fallback',
    };
  }

  private fixGrammar(request: AISuggestRequest): AISuggestionResult {
    let text = request.text.trim();
    text = text.replace(/\s+([.,;:!?])/g, '$1');
    text = text.replace(/([.!?])([A-Za-z])/g, '$1 $2');
    text = text.replace(/\bi\b/g, 'I');
    text = text.replace(/^([a-z])/, (m) => m.toUpperCase());
    if (text && !/[.!?]$/.test(text)) text += '.';
    return {
      suggestedText: text,
      reason: 'Applied basic grammar and punctuation corrections (spacing, capitalisation, sentence-ending punctuation).',
      source: 'fallback',
    };
  }

  private makeShorter(request: AISuggestRequest): AISuggestionResult {
    const sentences = request.text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const target = Math.max(1, Math.ceil(sentences.length * 0.6));
    const shortened = sentences.slice(0, target).join(' ');
    return {
      suggestedText: shortened || request.text,
      reason: `Reduced from ${sentences.length} to ${target} sentence(s) while keeping the strongest points first.`,
      source: 'fallback',
    };
  }

  private addSkills(request: AISuggestRequest, professionId: ProfessionId): AISuggestionResult {
    const profile = PROFESSION_PROFILES[professionId];
    const existing = new Set((request.context?.existingSkills ?? []).map((s) => s.toLowerCase()));
    const candidates = [...profile.suggestedSkills, ...profile.suggestedSoftSkills].filter(
      (s) => !existing.has(s.toLowerCase()),
    );
    return {
      suggestedText: candidates.join(', '),
      suggestedItems: candidates.slice(0, 10),
      reason: `Common skills for ${profile.label} roles that aren't already on your CV. Only add a skill if you genuinely have it.`,
      source: 'fallback',
    };
  }

  private generateAchievements(request: AISuggestRequest, professionId: ProfessionId): AISuggestionResult {
    const profile = PROFESSION_PROFILES[professionId];
    const verbs = profile.achievementVerbs;
    const templates = [
      `${verbs[0]} key ${profile.themes[0]} activities while maintaining consistent quality and professional standards.`,
      `${verbs[1]} day-to-day work related to ${profile.themes[1]}, helping tasks progress efficiently and accurately.`,
      `${verbs[2]} service delivery through careful attention to ${profile.themes[2]} and timely follow-up.`,
      `${verbs[3]} effectively with colleagues and stakeholders to support ${profile.themes[3] ?? 'team objectives'}.`,
    ];
    return {
      suggestedText: templates.join('\n'),
      suggestedItems: templates,
      reason: `Complete achievement-style statements tailored to ${profile.label}, written without fabricated numbers or placeholders.`,
      source: 'fallback',
    };
  }

  private improveResponsibility(request: AISuggestRequest, professionId: ProfessionId): AISuggestionResult {
    const profile = PROFESSION_PROFILES[professionId];
    const base = stripFillerWords(request.text);
    if (!base) {
      const statements = profile.themes.slice(0, 4).map((theme, index) => {
        const verb = profile.achievementVerbs[index % profile.achievementVerbs.length];
        return `${verb} ${theme} activities with consistent attention to quality, accuracy and timely completion.`;
      });
      return {
        suggestedText: statements.join('\n'),
        suggestedItems: statements,
        reason: `Professional responsibility statements tailored to ${profile.label}.`,
        source: 'fallback',
      };
    }
    const verb = profile.achievementVerbs[Math.floor(Math.random() * profile.achievementVerbs.length)];
    const startsWithVerb = /^[A-Z][a-z]+ed\b|^[A-Z][a-z]+d\b/.test(base);
    const rewritten = startsWithVerb ? titleCaseFirst(base) : `${verb} ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
    return {
      suggestedText: rewritten.replace(/\.?\s*$/, '.'),
      reason: `Rewritten to start with a strong action verb common in ${profile.label} roles, in professional UAE-job-market wording.`,
      source: 'fallback',
    };
  }
}

export const fallbackProvider = new FallbackProvider();
