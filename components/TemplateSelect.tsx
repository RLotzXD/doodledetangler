'use client';

import { AppAction } from '@/lib/types';
import { templates } from '@/lib/templates';

interface Props {
  templateId: string;
  dispatch: React.Dispatch<AppAction>;
}

export default function TemplateSelect({ templateId, dispatch }: Props) {
  return (
    <div className="mb-6">
      <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--muted)]">
        4. Design Template
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => dispatch({ type: 'SET_TEMPLATE', templateId: t.id })}
            className={`border-2 p-3 text-left transition-colors ${
              templateId === t.id
                ? 'border-[var(--foreground)]'
                : 'border-[var(--border)] hover:border-[var(--muted)]'
            }`}
          >
            <div className="flex gap-1 mb-2">
              <div
                className="w-4 h-4 border border-[var(--border)]"
                style={{ backgroundColor: t.primaryColor }}
              />
              <div
                className="w-4 h-4 border border-[var(--border)]"
                style={{ backgroundColor: t.secondaryColor }}
              />
              <div
                className="w-4 h-4 border border-[var(--border)]"
                style={{ backgroundColor: t.accentColor }}
              />
            </div>
            <span className="text-xs">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
