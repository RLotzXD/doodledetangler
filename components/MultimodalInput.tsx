'use client';

import { useCallback } from 'react';
import { AppAction } from '@/lib/types';

interface Props {
  files: File[];
  notesText: string;
  dispatch: React.Dispatch<AppAction>;
}

export default function MultimodalInput({ files, notesText, dispatch }: Props) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) dispatch({ type: 'ADD_FILES', files: dropped });
    },
    [dispatch]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length) dispatch({ type: 'ADD_FILES', files: selected });
      e.target.value = '';
    },
    [dispatch]
  );

  return (
    <div className="mb-6">
      <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--muted)]">
        1. Meeting Input
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-[var(--border)] p-6 text-center cursor-pointer hover:border-[var(--foreground)] transition-colors"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <p className="text-sm text-[var(--muted)]">
          Drop audio recordings, whiteboard photos, or documents here
        </p>
        <p className="text-xs text-[var(--muted)] mt-1">or click to browse</p>
        <input
          id="file-input"
          type="file"
          multiple
          accept="audio/*,image/*,.pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between text-xs border border-[var(--border)] px-3 py-1.5"
            >
              <span className="truncate mr-2">
                {file.type.startsWith('audio/') ? '🎙' : file.type.startsWith('image/') ? '🖼' : '📄'}{' '}
                {file.name}
              </span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_FILE', index: i })}
                className="text-[var(--muted)] hover:text-[var(--foreground)] shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={notesText}
        onChange={(e) => dispatch({ type: 'SET_NOTES', text: e.target.value })}
        placeholder="Or paste meeting notes / ideas here..."
        className="w-full mt-3 p-3 border border-[var(--border)] bg-[var(--surface)] text-sm font-[family-name:var(--font-mono)] resize-y min-h-[100px] focus:outline-none focus:border-[var(--foreground)]"
      />
    </div>
  );
}
