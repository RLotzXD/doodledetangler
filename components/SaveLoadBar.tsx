'use client';

import { useState, useEffect } from 'react';
import { Idea, AppAction, SavedDeck } from '@/lib/types';

interface Props {
  ideas: Idea[];
  templateId: string;
  briefText: string;
  dispatch: React.Dispatch<AppAction>;
}

const DECKS_KEY = 'deckbuilder_saved_decks';

function getSavedDecks(): SavedDeck[] {
  try {
    const stored = localStorage.getItem(DECKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDecks(decks: SavedDeck[]) {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

export default function SaveLoadBar({ ideas, templateId, briefText, dispatch }: Props) {
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [showLoad, setShowLoad] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    setDecks(getSavedDecks());
  }, []);

  function handleSave() {
    if (!saveName.trim()) return;
    const deck: SavedDeck = {
      id: `deck-${Date.now()}`,
      name: saveName.trim(),
      date: new Date().toISOString(),
      ideas,
      templateId,
      briefText,
    };
    const updated = [deck, ...decks];
    saveDecks(updated);
    setDecks(updated);
    setSaveName('');
    setShowSave(false);
  }

  function handleLoad(deck: SavedDeck) {
    dispatch({ type: 'LOAD_DECK', deck });
    setShowLoad(false);
  }

  function handleDelete(id: string) {
    const updated = decks.filter((d) => d.id !== id);
    saveDecks(updated);
    setDecks(updated);
  }

  function handleExportJSON() {
    const data = JSON.stringify({ ideas, templateId, briefText }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deck.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.ideas) {
          const deck: SavedDeck = {
            id: `import-${Date.now()}`,
            name: file.name.replace('.json', ''),
            date: new Date().toISOString(),
            ideas: data.ideas,
            templateId: data.templateId || 'generic',
            briefText: data.briefText || '',
          };
          dispatch({ type: 'LOAD_DECK', deck });
        }
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pb-6">
      <div className="border-t border-[var(--border)] pt-4 mt-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowSave(!showSave)}
            className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)]"
          >
            Save Deck
          </button>
          <button
            onClick={() => setShowLoad(!showLoad)}
            className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)]"
          >
            Load Deck ({decks.length})
          </button>
          <button
            onClick={handleExportJSON}
            className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)]"
          >
            Export JSON
          </button>
          <label className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)] cursor-pointer">
            Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>

        {showSave && (
          <div className="mt-3 flex gap-2">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Deck name..."
              className="flex-1 border border-[var(--border)] px-2 py-1.5 text-xs bg-[var(--surface)] focus:outline-none focus:border-[var(--foreground)]"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="text-xs border border-[var(--foreground)] px-3 py-1.5 hover:bg-[var(--foreground)] hover:text-[var(--background)] disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}

        {showLoad && decks.length > 0 && (
          <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
            {decks.map((deck) => (
              <div key={deck.id} className="flex items-center justify-between border border-[var(--border)] px-3 py-1.5">
                <button onClick={() => handleLoad(deck)} className="text-xs text-left flex-1 hover:text-[var(--foreground)]">
                  <strong>{deck.name}</strong>
                  <span className="text-[var(--muted)] ml-2">
                    {deck.ideas.length} ideas | {new Date(deck.date).toLocaleDateString()}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(deck.id)}
                  className="text-xs text-[var(--muted)] hover:text-red-500 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {showLoad && decks.length === 0 && (
          <p className="text-xs text-[var(--muted)] mt-3">No saved decks yet.</p>
        )}
      </div>
    </div>
  );
}
