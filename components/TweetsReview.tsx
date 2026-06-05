'use client';

import { useState, useRef } from 'react';
import { Tweet, AppAction } from '@/lib/types';
import { generateTweetsPrompt } from '@/lib/export';
import ExportPromptModal from './ExportPromptModal';
import SessionUrlBanner from './SessionUrlBanner';

interface Props {
  tweets: Tweet[];
  dispatch: React.Dispatch<AppAction>;
  onBack: () => void;
  briefText?: string;
  notesText?: string;
  sessionUrl?: string | null;
}

export default function TweetsReview({ tweets, dispatch, onBack, briefText = '', notesText = '', sessionUrl = null }: Props) {
  const [newTweet, setNewTweet] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const selectedCount = tweets.filter((t) => t.selected).length;

  function handleAddTweet() {
    if (!newTweet.trim()) return;
    dispatch({ type: 'ADD_TWEET', text: newTweet.trim() });
    setNewTweet('');
  }

  function startEdit(tweet: Tweet) {
    setEditingId(tweet.id);
    setEditText(tweet.text);
  }

  function saveEdit() {
    if (editingId && editText.trim()) {
      dispatch({ type: 'EDIT_TWEET', id: editingId, text: editText.trim() });
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
      dispatch({ type: 'REORDER_TWEETS', fromIndex: dragIndexRef.current, toIndex: index });
    }
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function exportAsText() {
    const text = tweets
      .filter((t) => t.selected)
      .map((t) => t.text)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tweets.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportAsCSV() {
    const csv = tweets
      .filter((t) => t.selected)
      .map((t) => `"${t.text.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tweets.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {sessionUrl && <SessionUrlBanner url={sessionUrl} />}
      <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Review Tweets</h1>
          <p className="text-xs text-[var(--muted)]">
            {selectedCount} of {tweets.length} tweets selected — drag to reorder
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
        {tweets.map((tweet, index) => (
          <div
            key={tweet.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`border p-3 transition-colors cursor-grab active:cursor-grabbing ${
              tweet.selected ? 'border-[var(--foreground)]' : 'border-[var(--border)] opacity-50'
            } ${dragOverIndex === index ? 'border-dashed border-blue-400' : ''}`}
          >
            {editingId === tweet.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full border border-[var(--border)] px-2 py-1 text-sm bg-[var(--surface)] resize-y focus:outline-none"
                  placeholder="Tweet"
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
                    checked={tweet.selected}
                    onChange={() => dispatch({ type: 'TOGGLE_TWEET', id: tweet.id })}
                  />
                </div>
                <p className="flex-1 text-sm">{tweet.text}</p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(tweet)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_TWEET', id: tweet.id })}
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
        <p className="text-xs text-[var(--muted)] mb-2">Add a tweet manually</p>
        <textarea
          value={newTweet}
          onChange={(e) => setNewTweet(e.target.value)}
          placeholder="Tweet (one-liner selling point)"
          className="w-full border border-[var(--border)] px-2 py-1.5 text-sm mb-2 bg-[var(--surface)] resize-y focus:outline-none focus:border-[var(--foreground)]"
        />
        <button
          onClick={handleAddTweet}
          disabled={!newTweet.trim()}
          className={`text-xs border px-3 py-1.5 ${
            newTweet.trim()
              ? 'border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
              : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
          }`}
        >
          + Add Tweet
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={exportAsText}
          disabled={selectedCount === 0}
          className={`flex-1 py-2 text-sm border transition-colors ${
            selectedCount > 0
              ? 'border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
              : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
          }`}
        >
          Download as .txt
        </button>
        <button
          onClick={exportAsCSV}
          disabled={selectedCount === 0}
          className={`flex-1 py-2 text-sm border transition-colors ${
            selectedCount > 0
              ? 'border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
              : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
          }`}
        >
          Download as .csv
        </button>
      </div>

      <button
        onClick={() => setShowExportModal(true)}
        disabled={selectedCount === 0}
        className={`w-full py-3 text-sm font-bold border-2 transition-colors mb-2 ${
          selectedCount > 0
            ? 'border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
            : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
        }`}
      >
        Export as Agent Prompt
      </button>

      <button
        onClick={onBack}
        className="w-full py-3 text-sm font-bold border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
      >
        Back to Input
      </button>

      {showExportModal && (
        <ExportPromptModal
          prompt={generateTweetsPrompt(tweets, briefText, notesText)}
          onClose={() => setShowExportModal(false)}
        />
      )}
      </div>
    </div>
  );
}
