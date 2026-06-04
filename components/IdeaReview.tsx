'use client';

import { useState, useRef } from 'react';
import { Idea, AppAction } from '@/lib/types';

interface Props {
  ideas: Idea[];
  dispatch: React.Dispatch<AppAction>;
  onGenerateDeck: () => void;
  onBack: () => void;
}

export default function IdeaReview({ ideas, dispatch, onGenerateDeck, onBack }: Props) {
  const [newHeadline, setNewHeadline] = useState('');
  const [newSubheader, setNewSubheader] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHeadline, setEditHeadline] = useState('');
  const [editSubheader, setEditSubheader] = useState('');
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const selectedCount = ideas.filter((i) => i.selected).length;

  function handleAddIdea() {
    if (!newHeadline.trim()) return;
    dispatch({ type: 'ADD_IDEA', headline: newHeadline.trim(), subheader: newSubheader.trim() });
    setNewHeadline('');
    setNewSubheader('');
  }

  function startEdit(idea: Idea) {
    setEditingId(idea.id);
    setEditHeadline(idea.headline);
    setEditSubheader(idea.subheader);
  }

  function saveEdit() {
    if (editingId && editHeadline.trim()) {
      dispatch({ type: 'EDIT_IDEA', id: editingId, headline: editHeadline.trim(), subheader: editSubheader.trim() });
      setEditingId(null);
    }
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndexRef.current !== null && dragIndexRef.current !== index) {
      dispatch({ type: 'REORDER_IDEAS', fromIndex: dragIndexRef.current, toIndex: index });
    }
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Review Ideas</h1>
          <p className="text-xs text-[var(--muted)]">
            {selectedCount} of {ideas.length} ideas selected — drag to reorder
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)]"
        >
          Back
        </button>
      </div>

      <div className="space-y-2 mb-6">
        {ideas.map((idea, index) => (
          <div
            key={idea.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`border p-4 transition-colors cursor-grab active:cursor-grabbing ${
              idea.selected ? 'border-[var(--foreground)]' : 'border-[var(--border)] opacity-50'
            } ${dragOverIndex === index ? 'border-dashed border-blue-400' : ''}`}
          >
            {editingId === idea.id ? (
              <div className="space-y-2">
                <input
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full border border-[var(--border)] px-2 py-1 text-sm bg-[var(--surface)] focus:outline-none"
                  placeholder="Headline"
                />
                <textarea
                  value={editSubheader}
                  onChange={(e) => setEditSubheader(e.target.value)}
                  className="w-full border border-[var(--border)] px-2 py-1 text-sm bg-[var(--surface)] resize-y focus:outline-none"
                  placeholder="Subheader"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="text-xs border border-[var(--border)] px-2 py-1 hover:border-[var(--foreground)]">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-[var(--muted)]">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-xs text-[var(--muted)] cursor-grab">&#x2630;</span>
                  <input
                    type="checkbox"
                    checked={idea.selected}
                    onChange={() => dispatch({ type: 'TOGGLE_IDEA', id: idea.id })}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">{idea.headline}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 border shrink-0"
                      style={{
                        borderColor: idea.score >= 7 ? '#22c55e' : idea.score >= 4 ? '#eab308' : '#ef4444',
                        color: idea.score >= 7 ? '#22c55e' : idea.score >= 4 ? '#eab308' : '#ef4444',
                      }}
                    >
                      {idea.score}/10
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-1">{idea.subheader}</p>
                  {idea.insight && (
                    <p className="text-xs text-[var(--muted)] mb-1"><strong>Insight:</strong> {idea.insight}</p>
                  )}
                  {idea.mechanic && (
                    <p className="text-xs text-[var(--muted)] mb-1"><strong>Mechanic:</strong> {idea.mechanic}</p>
                  )}
                  <p className="text-xs italic text-[var(--muted)]">{idea.reasoning}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(idea)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_IDEA', id: idea.id })}
                    className="text-xs text-[var(--muted)] hover:text-red-500 px-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border border-dashed border-[var(--border)] p-4 mb-6">
        <p className="text-xs text-[var(--muted)] mb-2">Add an idea manually</p>
        <input
          value={newHeadline}
          onChange={(e) => setNewHeadline(e.target.value)}
          placeholder="Headline"
          className="w-full border border-[var(--border)] px-2 py-1.5 text-sm mb-2 bg-[var(--surface)] focus:outline-none focus:border-[var(--foreground)]"
        />
        <textarea
          value={newSubheader}
          onChange={(e) => setNewSubheader(e.target.value)}
          placeholder="Subheader (optional)"
          className="w-full border border-[var(--border)] px-2 py-1.5 text-sm mb-2 bg-[var(--surface)] resize-y focus:outline-none focus:border-[var(--foreground)]"
        />
        <button
          onClick={handleAddIdea}
          disabled={!newHeadline.trim()}
          className={`text-xs border px-3 py-1.5 ${
            newHeadline.trim()
              ? 'border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
              : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
          }`}
        >
          + Add Idea
        </button>
      </div>

      <button
        onClick={onGenerateDeck}
        disabled={selectedCount === 0}
        className={`w-full py-3 text-sm font-bold border-2 transition-colors ${
          selectedCount > 0
            ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] hover:bg-transparent hover:text-[var(--foreground)]'
            : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
        }`}
      >
        Generate Deck ({selectedCount} ideas)
      </button>
    </div>
  );
}
