'use client';

import { useState } from 'react';

interface Props {
  prompt: string;
  onClose: () => void;
}

export default function ExportPromptModal({ prompt: initialPrompt, onClose }: Props) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [copied, setCopied] = useState(false);

  function handleCopyToClipboard() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadAsText() {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deck-builder-prompt.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] max-w-2xl w-full max-h-[90vh] flex flex-col rounded">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold">Export Prompt for Deck Builder Agent</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 p-6 font-mono text-xs bg-[var(--surface)] border-0 focus:outline-none resize-none overflow-auto"
        />

        <div className="flex gap-2 p-6 border-t border-[var(--border)]">
          <button
            onClick={handleCopyToClipboard}
            className={`flex-1 py-2 text-sm border transition-colors ${
              copied
                ? 'border-green-500 text-green-500 bg-green-50/10'
                : 'border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
            }`}
          >
            {copied ? '✓ Copied to Clipboard' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownloadAsText}
            className="flex-1 py-2 text-sm border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
          >
            Download as .txt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
