'use client';

import { ProcessingPhase } from '@/lib/types';

interface Props {
  phase: ProcessingPhase | null;
}

const PHASE_LABELS: Record<ProcessingPhase, { label: string; description: string; progress: number }> = {
  uploading: { label: 'Uploading', description: 'Sending files to the server...', progress: 20 },
  transcribing: { label: 'Transcribing', description: 'Converting audio and images to text...', progress: 40 },
  extracting: { label: 'Extracting Ideas', description: 'Finding creative ideas in your input...', progress: 65 },
  scoring: { label: 'Scoring', description: 'Rating ideas against the brief...', progress: 85 },
  done: { label: 'Done', description: 'Preparing results...', progress: 100 },
};

export default function ProcessingOverlay({ phase }: Props) {
  const current = phase ? PHASE_LABELS[phase] : PHASE_LABELS.uploading;

  return (
    <div className="fixed inset-0 bg-[var(--background)] flex items-center justify-center z-50">
      <div className="text-center w-80">
        <div className="inline-block w-8 h-8 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold mb-1">{current.label}</p>
        <p className="text-xs text-[var(--muted)] mb-4">{current.description}</p>

        <div className="w-full h-1 bg-[var(--border)] overflow-hidden">
          <div
            className="h-full bg-[var(--foreground)] transition-all duration-700 ease-out"
            style={{ width: `${current.progress}%` }}
          />
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">{current.progress}%</p>
      </div>
    </div>
  );
}
