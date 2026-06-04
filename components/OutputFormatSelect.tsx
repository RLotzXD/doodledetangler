'use client';

import { AppAction, OutputFormat } from '@/lib/types';

interface Props {
  outputFormat: OutputFormat;
  dispatch: React.Dispatch<AppAction>;
}

export default function OutputFormatSelect({ outputFormat, dispatch }: Props) {
  return (
    <div className="mb-6">
      <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--muted)]">
        3. Output Format
      </label>
      <select
        value={outputFormat}
        onChange={(e) =>
          dispatch({ type: 'SET_OUTPUT_FORMAT', format: e.target.value as OutputFormat })
        }
        className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-[family-name:var(--font-mono)] focus:outline-none focus:border-[var(--foreground)] w-full"
      >
        <option value="ideacards">Ideacards (1920 × 1080)</option>
      </select>
      <p className="text-xs text-[var(--muted)] mt-1">More formats coming soon</p>
    </div>
  );
}
