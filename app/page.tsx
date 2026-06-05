'use client';

import { useReducer, useCallback, useEffect, useState } from 'react';
import { AppState, AppAction, Idea, Tweet, SavedDeck } from '@/lib/types';
import { getTemplate } from '@/lib/templates';
import { encodeSessionData, decodeSessionData, getSessionUrl, sendToTeams } from '@/lib/session';
import InputForm from '@/components/InputForm';
import ProcessingOverlay from '@/components/ProcessingOverlay';
import IdeaReview from '@/components/IdeaReview';
import TweetsReview from '@/components/TweetsReview';
import DeckViewer from '@/components/DeckViewer';
import SaveLoadBar from '@/components/SaveLoadBar';

const initialState: AppState = {
  step: 'input',
  files: [],
  notesText: '',
  briefText: '',
  briefFile: null,
  outputFormat: 'ideacards',
  templateId: 'generic',
  ideas: [],
  tweets: [],
  error: null,
  processingPhase: null,
  detectedBrief: null,
  currentSlide: 0,
  viewMode: 'horizontal',
  sessionUrl: null,
};

let idCounter = 0;

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_FILES':
      return { ...state, files: [...state.files, ...action.files], error: null };
    case 'REMOVE_FILE':
      return { ...state, files: state.files.filter((_, i) => i !== action.index) };
    case 'SET_NOTES':
      return { ...state, notesText: action.text, error: null };
    case 'SET_BRIEF_TEXT':
      return { ...state, briefText: action.text };
    case 'SET_BRIEF_FILE':
      return { ...state, briefFile: action.file };
    case 'SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.format };
    case 'SET_TEMPLATE':
      return { ...state, templateId: action.templateId };
    case 'START_PROCESSING':
      return { ...state, step: 'processing', error: null, processingPhase: 'uploading' };
    case 'SET_PROCESSING_PHASE':
      return { ...state, processingPhase: action.phase };
    case 'SET_IDEAS':
      return { ...state, step: 'review', ideas: action.ideas, processingPhase: null };
    case 'TOGGLE_IDEA':
      return {
        ...state,
        ideas: state.ideas.map((i) =>
          i.id === action.id ? { ...i, selected: !i.selected } : i
        ),
      };
    case 'REMOVE_IDEA':
      return { ...state, ideas: state.ideas.filter((i) => i.id !== action.id) };
    case 'ADD_IDEA':
      return {
        ...state,
        ideas: [
          ...state.ideas,
          {
            id: `manual-${++idCounter}`,
            headline: action.headline,
            subheader: action.subheader,
            insight: '',
            mechanic: '',
            userJourney: '',
            score: 0,
            reasoning: 'Manually added',
            selected: true,
          },
        ],
      };
    case 'EDIT_IDEA':
      return {
        ...state,
        ideas: state.ideas.map((i) =>
          i.id === action.id
            ? {
                ...i,
                headline: action.headline,
                subheader: action.subheader,
                insight: action.insight ?? i.insight,
                mechanic: action.mechanic ?? i.mechanic,
                userJourney: action.userJourney ?? i.userJourney,
              }
            : i
        ),
      };
    case 'REORDER_IDEAS': {
      const ideas = [...state.ideas];
      const [moved] = ideas.splice(action.fromIndex, 1);
      ideas.splice(action.toIndex, 0, moved);
      return { ...state, ideas };
    }
    case 'GENERATE_DECK':
      return { ...state, step: 'deck', currentSlide: 0 };
    case 'SET_ERROR':
      return { ...state, step: 'input', error: action.error, processingPhase: null };
    case 'BACK_TO_INPUT':
      return { ...state, step: 'input' };
    case 'BACK_TO_REVIEW':
      return { ...state, step: 'review' };
    case 'SET_DETECTED_BRIEF':
      return { ...state, detectedBrief: action.brief };
    case 'ACCEPT_DETECTED_BRIEF':
      return { ...state, briefText: state.detectedBrief || state.briefText, detectedBrief: null };
    case 'SET_CURRENT_SLIDE':
      return { ...state, currentSlide: action.index };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    case 'LOAD_DECK':
      return {
        ...state,
        ideas: action.deck.ideas,
        templateId: action.deck.templateId,
        briefText: action.deck.briefText,
        step: 'review',
      };
    case 'SET_TWEETS':
      return { ...state, step: 'tweets', tweets: action.tweets, processingPhase: null };
    case 'TOGGLE_TWEET':
      return {
        ...state,
        tweets: state.tweets.map((t) =>
          t.id === action.id ? { ...t, selected: !t.selected } : t
        ),
      };
    case 'REMOVE_TWEET':
      return { ...state, tweets: state.tweets.filter((t) => t.id !== action.id) };
    case 'ADD_TWEET':
      return {
        ...state,
        tweets: [
          ...state.tweets,
          {
            id: `manual-${++idCounter}`,
            text: action.text,
            selected: true,
          },
        ],
      };
    case 'EDIT_TWEET':
      return {
        ...state,
        tweets: state.tweets.map((t) =>
          t.id === action.id ? { ...t, text: action.text } : t
        ),
      };
    case 'REORDER_TWEETS': {
      const tweets = [...state.tweets];
      const [moved] = tweets.splice(action.fromIndex, 1);
      tweets.splice(action.toIndex, 0, moved);
      return { ...state, tweets };
    }
    case 'SET_SESSION_URL':
      return { ...state, sessionUrl: action.url };
    default:
      return state;
  }
}

const STORAGE_KEY = 'deckbuilder_state';
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;

function saveToStorage(state: AppState) {
  try {
    const serializable = {
      notesText: state.notesText,
      briefText: state.briefText,
      outputFormat: state.outputFormat,
      templateId: state.templateId,
      ideas: state.ideas,
      tweets: state.tweets,
      step: state.step === 'processing' ? 'input' : state.step,
      viewMode: state.viewMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {}
}

function loadFromStorage(): Partial<AppState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

async function parseApiResponse(res: Response): Promise<{ data: unknown; rawText: string }> {
  const rawText = await res.text();

  if (!rawText) {
    return { data: null, rawText: '' };
  }

  try {
    return { data: JSON.parse(rawText), rawText };
  } catch {
    return { data: null, rawText };
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      if (saved.notesText) dispatch({ type: 'SET_NOTES', text: saved.notesText });
      if (saved.briefText) dispatch({ type: 'SET_BRIEF_TEXT', text: saved.briefText });
      if (saved.templateId) dispatch({ type: 'SET_TEMPLATE', templateId: saved.templateId });
      if (saved.ideas && saved.ideas.length > 0) {
        dispatch({ type: 'SET_IDEAS', ideas: saved.ideas });
      }
      if (saved.tweets && saved.tweets.length > 0) {
        dispatch({ type: 'SET_TWEETS', tweets: saved.tweets });
      }
      if (saved.viewMode) dispatch({ type: 'SET_VIEW_MODE', mode: saved.viewMode as 'scroll' | 'horizontal' });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    if (sessionParam) {
      const decoded = decodeSessionData(sessionParam);
      if (decoded) {
        if (decoded.ideas?.length > 0) dispatch({ type: 'SET_IDEAS', ideas: decoded.ideas });
        if (decoded.tweets?.length > 0) dispatch({ type: 'SET_TWEETS', tweets: decoded.tweets });
        if (decoded.briefText) dispatch({ type: 'SET_BRIEF_TEXT', text: decoded.briefText });
        if (decoded.notesText) dispatch({ type: 'SET_NOTES', text: decoded.notesText });
        dispatch({ type: 'SET_SESSION_URL', url: window.location.href });
      }
    }
  }, [hydrated]);

  const handleBuildDeck = useCallback(async () => {
    const totalUploadBytes = state.files.reduce((sum, file) => sum + file.size, 0)
      + (state.briefFile?.size || 0);

    if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
      const maxMb = (MAX_TOTAL_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      dispatch({
        type: 'SET_ERROR',
        error: `Upload too large for hosted deployment. Please keep total files under ${maxMb}MB or upload fewer files.`,
      });
      return;
    }

    dispatch({ type: 'START_PROCESSING' });

    try {
      const formData = new FormData();
      formData.append('notesText', state.notesText);
      formData.append('briefText', state.briefText);

      for (const file of state.files) {
        formData.append('files', file);
      }

      if (state.briefFile) {
        formData.append('briefFile', state.briefFile);
      }

      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'uploading' });

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'extracting' });

      const { data, rawText } = await parseApiResponse(res);
      const payload = data as { error?: string; detectedBrief?: string; ideas?: Array<{ headline: string; subheader: string; insight?: string; mechanic?: string; userJourney?: string; score: number; reasoning: string }> } | null;

      if (!res.ok) {
        dispatch({
          type: 'SET_ERROR',
          error:
            payload?.error
            || rawText
            || `Analysis failed (${res.status})`,
        });
        return;
      }

      if (!payload || !Array.isArray(payload.ideas)) {
        dispatch({
          type: 'SET_ERROR',
          error: rawText || 'Unexpected response from analyze API',
        });
        return;
      }

      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'scoring' });

      if (payload.detectedBrief) {
        dispatch({ type: 'SET_DETECTED_BRIEF', brief: payload.detectedBrief });
      }

      const ideas: Idea[] = payload.ideas.map(
        (idea: { headline: string; subheader: string; insight?: string; mechanic?: string; userJourney?: string; score: number; reasoning: string }) => ({
          id: `ai-${++idCounter}`,
          headline: idea.headline,
          subheader: idea.subheader,
          insight: idea.insight || '',
          mechanic: idea.mechanic || '',
          userJourney: idea.userJourney || '',
          score: idea.score,
          reasoning: idea.reasoning,
          selected: true,
        })
      );

      dispatch({ type: 'SET_IDEAS', ideas });

      const sessionData = encodeSessionData(ideas, state.tweets, state.briefText, state.notesText);
      const sessionUrl = getSessionUrl(sessionData);
      dispatch({ type: 'SET_SESSION_URL', url: sessionUrl });
      await sendToTeams(sessionUrl, true, state.tweets.length > 0);
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        error: err instanceof Error ? err.message : 'Network error',
      });
    }
  }, [state.notesText, state.briefText, state.files, state.briefFile]);

  const handleBuildTweets = useCallback(async () => {
    const totalUploadBytes = state.files.reduce((sum, file) => sum + file.size, 0)
      + (state.briefFile?.size || 0);

    if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
      const maxMb = (MAX_TOTAL_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      dispatch({
        type: 'SET_ERROR',
        error: `Upload too large for hosted deployment. Please keep total files under ${maxMb}MB or upload fewer files.`,
      });
      return;
    }

    dispatch({ type: 'START_PROCESSING' });

    try {
      const formData = new FormData();
      formData.append('notesText', state.notesText);
      formData.append('briefText', state.briefText);

      for (const file of state.files) {
        formData.append('files', file);
      }

      if (state.briefFile) {
        formData.append('briefFile', state.briefFile);
      }

      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'uploading' });

      const res = await fetch('/api/tweets', {
        method: 'POST',
        body: formData,
      });

      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'extracting' });

      const { data, rawText } = await parseApiResponse(res);
      const payload = data as { tweets?: Array<{ text: string }> } | null;

      if (!res.ok) {
        dispatch({
          type: 'SET_ERROR',
          error:
            payload?.tweets === undefined
            ? rawText
            : `Tweets generation failed (${res.status})`,
        });
        return;
      }

      if (!payload || !Array.isArray(payload.tweets)) {
        dispatch({
          type: 'SET_ERROR',
          error: rawText || 'Unexpected response from tweets API',
        });
        return;
      }

      const tweets: Tweet[] = payload.tweets.map(
        (tweet: { text: string }) => ({
          id: `ai-${++idCounter}`,
          text: tweet.text,
          selected: true,
        })
      );

      dispatch({ type: 'SET_TWEETS', tweets });

      const sessionData = encodeSessionData(state.ideas, tweets, state.briefText, state.notesText);
      const sessionUrl = getSessionUrl(sessionData);
      dispatch({ type: 'SET_SESSION_URL', url: sessionUrl });
      await sendToTeams(sessionUrl, state.ideas.length > 0, true);
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        error: err instanceof Error ? err.message : 'Network error',
      });
    }
  }, [state.notesText, state.briefText, state.files, state.briefFile]);

  const handleGenerateDeck = useCallback(() => {
    dispatch({ type: 'GENERATE_DECK' });
  }, []);

  const template = getTemplate(state.templateId);
  const selectedIdeas = state.ideas.filter((i) => i.selected);

  if (!hydrated) return null;

  return (
    <main className="min-h-screen">
      {state.step === 'input' && (
        <InputForm state={state} dispatch={dispatch} onBuildDeck={handleBuildDeck} onBuildTweets={handleBuildTweets} />
      )}

      {state.step === 'processing' && (
        <ProcessingOverlay phase={state.processingPhase} />
      )}

      {state.step === 'review' && (
        <>
          {state.detectedBrief && (
            <div className="max-w-3xl mx-auto px-6 pt-6">
              <div className="border border-blue-300 bg-blue-50 p-4 mb-4">
                <p className="text-xs font-bold text-blue-700 mb-1">Brief detected in your input:</p>
                <p className="text-xs text-blue-600 mb-2">{state.detectedBrief}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch({ type: 'ACCEPT_DETECTED_BRIEF' })}
                    className="text-xs border border-blue-400 px-2 py-1 text-blue-700 hover:bg-blue-100"
                  >
                    Use as brief
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_DETECTED_BRIEF', brief: '' })}
                    className="text-xs text-blue-400 hover:text-blue-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          <IdeaReview
            ideas={state.ideas}
            dispatch={dispatch}
            onGenerateDeck={handleGenerateDeck}
            onBack={() => dispatch({ type: 'BACK_TO_INPUT' })}
            briefText={state.briefText}
            notesText={state.notesText}
            sessionUrl={state.sessionUrl}
          />
          <SaveLoadBar ideas={state.ideas} templateId={state.templateId} briefText={state.briefText} dispatch={dispatch} />
        </>
      )}

      {state.step === 'tweets' && (
        <TweetsReview
          tweets={state.tweets}
          dispatch={dispatch}
          onBack={() => dispatch({ type: 'BACK_TO_INPUT' })}
          briefText={state.briefText}
          notesText={state.notesText}
          sessionUrl={state.sessionUrl}
        />
      )}

      {state.step === 'deck' && (
        <DeckViewer
          ideas={selectedIdeas}
          template={template}
          dispatch={dispatch}
          currentSlide={state.currentSlide}
          viewMode={state.viewMode}
          onBack={() => dispatch({ type: 'BACK_TO_REVIEW' })}
          briefText={state.briefText}
          notesText={state.notesText}
        />
      )}
    </main>
  );
}
