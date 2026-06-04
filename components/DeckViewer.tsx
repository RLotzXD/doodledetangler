'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Idea, BrandTemplate, AppAction } from '@/lib/types';
import IdeaCard from './IdeaCard';
import ExportBar from './ExportBar';

interface Props {
  ideas: Idea[];
  template: BrandTemplate;
  dispatch: React.Dispatch<AppAction>;
  currentSlide: number;
  viewMode: 'scroll' | 'horizontal';
  onBack: () => void;
}

export default function DeckViewer({ ideas, template, dispatch, currentSlide, viewMode, onBack }: Props) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scale, setScale] = useState(0.5);
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    function updateScale() {
      const vw = window.innerWidth;
      const padding = viewMode === 'horizontal' ? 160 : 80;
      setScale(Math.min((vw - padding) / 1920, 1));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [viewMode]);

  const goToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(ideas.length - 1, index));
    dispatch({ type: 'SET_CURRENT_SLIDE', index: clamped });
  }, [ideas.length, dispatch]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (editingField) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, goToSlide, editingField]);

  function startFieldEdit(idea: Idea, field: string) {
    setEditingField({ id: idea.id, field });
    setEditValue((idea as unknown as Record<string, string>)[field] || '');
  }

  function saveFieldEdit() {
    if (!editingField) return;
    const idea = ideas.find((i) => i.id === editingField.id);
    if (!idea) return;
    dispatch({
      type: 'EDIT_IDEA',
      id: editingField.id,
      headline: editingField.field === 'headline' ? editValue : idea.headline,
      subheader: editingField.field === 'subheader' ? editValue : idea.subheader,
      insight: editingField.field === 'insight' ? editValue : idea.insight,
      mechanic: editingField.field === 'mechanic' ? editValue : idea.mechanic,
      userJourney: editingField.field === 'userJourney' ? editValue : idea.userJourney,
    });
    setEditingField(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)]"
          >
            Back to Review
          </button>
          <span className="text-xs text-[var(--muted)]">
            {currentSlide + 1} / {ideas.length} | {template.name}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'horizontal' })}
              className={`text-xs px-2 py-1 border ${viewMode === 'horizontal' ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--border)]'}`}
            >
              Slides
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'scroll' })}
              className={`text-xs px-2 py-1 border ${viewMode === 'scroll' ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--border)]'}`}
            >
              Scroll
            </button>
          </div>
        </div>
        <ExportBar ideas={ideas} template={template} cardRefs={cardRefs} />
      </div>

      {viewMode === 'horizontal' ? (
        <div className="flex flex-1">
          {/* Thumbnail sidebar */}
          <div className="w-32 border-r border-[var(--border)] overflow-y-auto p-2 space-y-2 bg-[var(--surface)]">
            {ideas.map((idea, i) => (
              <button
                key={idea.id}
                onClick={() => goToSlide(i)}
                className={`w-full aspect-video border text-left p-1 transition-colors ${
                  i === currentSlide ? 'border-[var(--foreground)] bg-[var(--background)]' : 'border-[var(--border)] hover:border-[var(--muted)]'
                }`}
              >
                <div className="w-full h-full flex flex-col justify-center px-1 overflow-hidden">
                  <span className="text-[6px] font-bold truncate block">{idea.headline}</span>
                  <span className="text-[5px] text-[var(--muted)] truncate block">{idea.subheader}</span>
                </div>
                <span className="text-[6px] text-[var(--muted)] absolute bottom-0.5 right-1">{i + 1}</span>
              </button>
            ))}
          </div>

          {/* Main slide view */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            {/* Navigation arrows */}
            <button
              onClick={() => goToSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-[var(--border)] flex items-center justify-center text-lg hover:border-[var(--foreground)] disabled:opacity-20 disabled:cursor-not-allowed bg-[var(--surface)]"
            >
              &#8249;
            </button>
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              disabled={currentSlide === ideas.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-[var(--border)] flex items-center justify-center text-lg hover:border-[var(--foreground)] disabled:opacity-20 disabled:cursor-not-allowed bg-[var(--surface)]"
            >
              &#8250;
            </button>

            <div
              style={{
                width: 1920 * scale,
                height: 1080 * scale,
                overflow: 'hidden',
              }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <IdeaCard
                  ref={(el) => { cardRefs.current[currentSlide] = el; }}
                  idea={ideas[currentSlide]}
                  template={template}
                  index={currentSlide}
                  total={ideas.length}
                  onFieldClick={(field) => startFieldEdit(ideas[currentSlide], field)}
                />
              </div>
            </div>

            {/* Edit overlay */}
            {editingField && editingField.id === ideas[currentSlide]?.id && (
              <div className="mt-4 w-full max-w-xl">
                <div className="border border-[var(--border)] bg-[var(--surface)] p-3">
                  <label className="text-xs text-[var(--muted)] block mb-1">
                    Editing: {editingField.field}
                  </label>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full border border-[var(--border)] px-2 py-1.5 text-sm bg-[var(--background)] resize-y focus:outline-none focus:border-[var(--foreground)]"
                    rows={2}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveFieldEdit(); }
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveFieldEdit} className="text-xs border border-[var(--border)] px-2 py-1 hover:border-[var(--foreground)]">
                      Save (Enter)
                    </button>
                    <button onClick={() => setEditingField(null)} className="text-xs text-[var(--muted)]">
                      Cancel (Esc)
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-[var(--muted)] mt-3">
              Click any text on the card to edit. Use arrow keys to navigate.
            </p>
          </div>
        </div>
      ) : (
        /* Scroll mode */
        <div className="flex flex-col items-center gap-8 py-8 px-4">
          {ideas.map((idea, i) => (
            <div
              key={idea.id}
              style={{
                width: 1920 * scale,
                height: 1080 * scale,
                overflow: 'hidden',
              }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <IdeaCard
                  ref={(el) => { cardRefs.current[i] = el; }}
                  idea={idea}
                  template={template}
                  index={i}
                  total={ideas.length}
                  onFieldClick={(field) => startFieldEdit(idea, field)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
