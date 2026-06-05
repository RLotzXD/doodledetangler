'use client';

import { useState } from 'react';
import { AppState, AppAction } from '@/lib/types';
import MultimodalInput from './MultimodalInput';
import BriefInput from './BriefInput';
import OutputFormatSelect from './OutputFormatSelect';
import TemplateSelect from './TemplateSelect';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  onBuildDeck: () => void;
  onBuildTweets: () => void;
}

export default function InputForm({ state, dispatch, onBuildDeck, onBuildTweets }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const hasInput = state.files.length > 0 || state.notesText.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold mb-1">Doodle Detangler</h1>
          <p className="text-xs text-[var(--muted)]">
            Turn rough ideas into presentation decks
          </p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs border border-[var(--border)] px-2 py-1 hover:border-[var(--foreground)] shrink-0"
        >
          {showHelp ? 'Hide help' : 'How to use'}
        </button>
      </div>

      {showHelp && (
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4 mb-6 text-xs space-y-2">
          <p className="font-bold">Quick guide:</p>
          <ol className="list-decimal list-inside space-y-1 text-[var(--muted)]">
            <li>Upload a meeting recording, whiteboard photo, or paste your notes below</li>
            <li>Optionally add the client brief (if it&apos;s not already in the meeting input)</li>
            <li>Choose a brand template for the visual style</li>
            <li>Click &quot;Build Deck&quot; — AI will extract and score ideas from your input</li>
            <li>Review the ideas, remove/add/reorder as needed</li>
            <li>Generate your deck and download as PDF or PowerPoint</li>
          </ol>
          <p className="text-[var(--muted)]">
            <strong>Supported inputs:</strong> Audio (mp3, wav, m4a), Images (jpg, png), Documents (pdf, docx, txt)
          </p>
        </div>
      )}

      <MultimodalInput
        files={state.files}
        notesText={state.notesText}
        dispatch={dispatch}
      />

      <BriefInput
        briefText={state.briefText}
        briefFile={state.briefFile}
        dispatch={dispatch}
      />

      <OutputFormatSelect
        outputFormat={state.outputFormat}
        dispatch={dispatch}
      />

      <TemplateSelect
        templateId={state.templateId}
        dispatch={dispatch}
      />

      {state.error && (
        <div className="border border-red-400 bg-red-50 text-red-700 text-xs p-3 mb-4">
          <p className="font-bold mb-1">Something went wrong</p>
          <p>{state.error}</p>
          {state.error.includes('20MB') && (
            <p className="mt-1 text-red-500">Try a smaller file or compress it before uploading.</p>
          )}
          {state.error.includes('Network') && (
            <p className="mt-1 text-red-500">Check your internet connection and try again.</p>
          )}
        </div>
      )}

      <button
        onClick={onBuildDeck}
        disabled={!hasInput}
        className={`w-full py-3 text-sm font-bold border-2 transition-colors ${
          hasInput
            ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] hover:bg-transparent hover:text-[var(--foreground)]'
            : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
        }`}
      >
        Build Deck
      </button>

      <button
        onClick={onBuildTweets}
        disabled={!hasInput}
        className={`w-full py-3 text-sm font-bold border-2 transition-colors mt-2 ${
          hasInput
            ? 'border-[var(--foreground)] bg-transparent text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
            : 'border-[var(--border)] text-[var(--muted)] cursor-not-allowed'
        }`}
      >
        Ideas in Tweets
      </button>
    </div>
  );
}
