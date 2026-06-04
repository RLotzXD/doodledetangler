'use client';

import { useCallback } from 'react';
import { AppAction } from '@/lib/types';

interface Props {
  briefText: string;
  briefFile: File | null;
  dispatch: React.Dispatch<AppAction>;
}

export default function BriefInput({ briefText, briefFile, dispatch }: Props) {
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      dispatch({ type: 'SET_BRIEF_FILE', file });
      e.target.value = '';
    },
    [dispatch]
  );

  return (
    <div className="mb-6">
      <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--muted)]">
        2. Client Brief (optional if mentioned in input)
      </label>

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => document.getElementById('brief-file-input')?.click()}
          className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)] transition-colors"
        >
          Upload Brief
        </button>
        {briefFile && (
          <span className="text-xs flex items-center gap-1 text-[var(--muted)]">
            📄 {briefFile.name}
            <button
              onClick={() => dispatch({ type: 'SET_BRIEF_FILE', file: null })}
              className="hover:text-[var(--foreground)]"
            >
              ×
            </button>
          </span>
        )}
        <input
          id="brief-file-input"
          type="file"
          accept=".pdf,.txt,.doc,.docx,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <textarea
        value={briefText}
        onChange={(e) => dispatch({ type: 'SET_BRIEF_TEXT', text: e.target.value })}
        placeholder="Or describe the brief here..."
        className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] text-sm font-[family-name:var(--font-mono)] resize-y min-h-[80px] focus:outline-none focus:border-[var(--foreground)]"
      />
    </div>
  );
}
