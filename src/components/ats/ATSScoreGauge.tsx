import type { ATSAnalysisResult } from '@/lib/ats/scoring';

const BAND_STYLES: Record<ATSAnalysisResult['band'], { ring: string; text: string; icon: string }> = {
  strong: { ring: '#0f6b4f', text: 'text-emerald-700', icon: '✓' },
  good: { ring: '#1f43d6', text: 'text-brand-700', icon: '↗' },
  needs_improvement: { ring: '#b3901f', text: 'text-amber-700', icon: '!' },
  low: { ring: '#b3261e', text: 'text-red-700', icon: '✕' },
};

/** Score display never relies on colour alone — an icon and text label are always shown too (spec §14). */
export default function ATSScoreGauge({ result }: { result: ATSAnalysisResult }) {
  const style = BAND_STYLES[result.band];
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - result.score / 100);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#eceef1" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={style.ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink-900">{result.score}</span>
          <span className="text-[10px] text-ink-400">/ 100</span>
        </div>
      </div>
      <div>
        <p className={`flex items-center gap-1.5 text-base font-semibold ${style.text}`}>
          <span aria-hidden="true">{style.icon}</span>
          {result.bandLabel}
        </p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
          This is an estimated ATS readiness and job-match score, not a guarantee — actual results depend on the
          employer, vacancy and the specific ATS in use.
        </p>
      </div>
    </div>
  );
}
