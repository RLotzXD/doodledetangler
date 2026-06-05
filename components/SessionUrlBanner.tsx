'use client';

import { useState } from 'react';

interface Props {
  url: string;
}

export default function SessionUrlBanner({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-b border-[var(--border)] bg-green-50 px-6 py-3">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold text-green-700 mb-2">✓ Session URL Generated</p>
        <p className="text-xs text-green-600 mb-2">Share this link to access your results on desktop:</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 text-xs px-2 py-1 border border-green-300 bg-white font-[family-name:var(--font-mono)] truncate"
          />
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 border border-green-400 text-green-700 hover:bg-green-100 whitespace-nowrap"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-green-600 mt-2">Teams notification sent to your account</p>
      </div>
    </div>
  );
}
