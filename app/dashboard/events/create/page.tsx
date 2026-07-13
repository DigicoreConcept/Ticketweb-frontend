'use client';

import { useEventBuilderStore } from '@/lib/store/eventBuilderStore';
import StepBasics from './_components/StepBasics';
import StepTicketing from './_components/StepTicketing';
import StepQuestions from './_components/StepQuestions';
import StepMedia from './_components/StepMedia';
import StepPreview from './_components/StepPreview';

export default function CreateEventPage() {
  const { step } = useEventBuilderStore();

  const steps = [
    { number: 1, label: 'Basics' },
    { number: 2, label: 'Ticketing' },
    { number: 3, label: 'Questions' },
    { number: 4, label: 'Media' },
    { number: 5, label: 'Preview' },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-12 w-full">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 w-full">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                  style={
                    step >= s.number
                      ? {
                          backgroundColor: 'var(--primary)',
                        }
                      : {
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }
                  }
                >
                  {step > s.number ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  className="text-xs font-semibold tracking-wider uppercase transition-colors"
                  style={{ color: step === s.number ? 'var(--primary)' : step > s.number ? 'var(--secondary)' : 'rgba(255,255,255,0.3)' }}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="h-px mx-3 mb-5" style={{
                  backgroundColor: step > s.number
                    ? 'var(--secondary)'
                    : 'rgba(255,255,255,0.1)'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div>
          {step === 1 && <StepBasics />}
          {step === 2 && <StepTicketing />}
          {step === 3 && <StepQuestions />}
          {step === 4 && <StepMedia />}
          {step === 5 && <StepPreview />}
        </div>
      </div>
    </div>
  );
}