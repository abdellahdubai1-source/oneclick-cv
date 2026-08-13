'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import { BUILDER_STEPS, type BuilderStepId } from '@/lib/cv/types';
import StepNav, { STEP_LABELS } from './StepNav';
import LivePreview from '@/components/preview/LivePreview';
import DraftManagerPanel from './DraftManagerPanel';
import { cn } from '@/lib/utils/cn';

import PersonalDetailsForm from './sections/PersonalDetailsForm';
import SummaryForm from './sections/SummaryForm';
import ExperienceForm from './sections/ExperienceForm';
import EducationForm from './sections/EducationForm';
import SkillsLanguagesForm from './sections/SkillsLanguagesForm';
import CertificationsForm from './sections/CertificationsForm';
import UAEDetailsForm from './sections/UAEDetailsForm';
import TemplateStep from './sections/TemplateStep';
import ATSStep from './sections/ATSStep';
import ReviewStep from './sections/ReviewStep';
import DownloadStep from './sections/DownloadStep';

const STEP_COMPONENTS: Record<BuilderStepId, ComponentType> = {
  personal: PersonalDetailsForm,
  summary: SummaryForm,
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsLanguagesForm,
  certifications: CertificationsForm,
  uae: UAEDetailsForm,
  template: TemplateStep,
  ats: ATSStep,
  review: ReviewStep,
  download: DownloadStep,
};

function isStepComplete(step: BuilderStepId, cv: ReturnType<typeof useCVStore.getState>['cv']): boolean {
  switch (step) {
    case 'personal':
      return !!(cv.personal.fullName && cv.personal.professionalTitle && cv.personal.phone && cv.personal.email);
    case 'summary':
      return cv.summary.trim().length > 0;
    case 'experience':
      return cv.experience.length > 0;
    case 'education':
      return cv.education.length > 0;
    case 'skills':
      return cv.skills.technical.length > 0 || cv.skills.soft.length > 0;
    default:
      return false;
  }
}

export default function BuilderShell() {
  const hydrate = useCVStore((s) => s.hydrate);
  const hydrated = useCVStore((s) => s.hydrated);
  const cv = useCVStore((s) => s.cv);
  const saveStatus = useCVStore((s) => s.saveStatus);
  const saveError = useCVStore((s) => s.saveError);

  const [step, setStep] = useState<BuilderStepId>('personal');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [draftManagerOpen, setDraftManagerOpen] = useState(false);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
      </div>
    );
  }

  const currentIndex = BUILDER_STEPS.indexOf(step);
  const StepComponent = STEP_COMPONENTS[step];
  const completed = new Set(BUILDER_STEPS.filter((s) => isStepComplete(s, cv)));

  function goTo(next: BuilderStepId) {
    setStep(next);
    setMobileView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goNext() {
    const nextStep = BUILDER_STEPS[currentIndex + 1];
    if (nextStep) goTo(nextStep);
  }
  function goPrev() {
    const prevStep = BUILDER_STEPS[currentIndex - 1];
    if (prevStep) goTo(prevStep);
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{cv.meta.name}</h1>
          <SaveStatusIndicator status={saveStatus} error={saveError} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDraftManagerOpen(true)} className="btn-secondary">
            My drafts
          </button>
        </div>
      </div>

      {/* Mobile Edit/Preview tabs (spec §21/§24) */}
      <div className="mb-4 flex gap-2 rounded-xl bg-ink-100 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView('edit')}
          className={cn('flex-1 rounded-lg py-2 text-sm font-semibold transition', mobileView === 'edit' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={cn('flex-1 rounded-lg py-2 text-sm font-semibold transition', mobileView === 'preview' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')}
        >
          Preview
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,560px)]">
        <aside className={cn('lg:block', mobileView === 'preview' ? 'hidden' : 'hidden lg:block')}>
          <div className="lg:sticky lg:top-20">
            <StepNav current={step} onSelect={goTo} completed={completed} />
          </div>
        </aside>

        <section className={cn(mobileView === 'preview' ? 'hidden lg:block' : 'block')}>
          <h2 className="mb-3 text-sm font-semibold text-ink-400 lg:hidden">{STEP_LABELS[step]}</h2>
          <StepComponent />

          <div className="mt-6 flex justify-between">
            <button type="button" onClick={goPrev} disabled={currentIndex === 0} className="btn-secondary disabled:opacity-40">
              ← Back
            </button>
            {currentIndex < BUILDER_STEPS.length - 1 && (
              <button type="button" onClick={goNext} className="btn-primary">
                Continue →
              </button>
            )}
          </div>
        </section>

        <section className={cn('lg:block', mobileView === 'preview' ? 'block' : 'hidden')}>
          <div className="card overflow-hidden lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
            <LivePreview cv={cv} className="h-full" />
          </div>
        </section>
      </div>

      {draftManagerOpen && <DraftManagerPanel onClose={() => setDraftManagerOpen(false)} />}
    </div>
  );
}

function SaveStatusIndicator({ status, error }: { status: string; error: string | null }) {
  if (status === 'saving') return <p className="text-xs text-ink-400">Saving…</p>;
  if (status === 'saved') return <p className="text-xs text-emerald-600">All changes saved to this device</p>;
  if (status === 'error') return <p className="text-xs text-red-600">{error ?? 'Could not save'}</p>;
  return <p className="text-xs text-ink-400">Autosaves to this device</p>;
}
