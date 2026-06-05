export interface Idea {
  id: string;
  headline: string;
  subheader: string;
  insight: string;
  mechanic: string;
  userJourney: string;
  score: number;
  reasoning: string;
  selected: boolean;
}

export interface Tweet {
  id: string;
  text: string;
  selected: boolean;
}

export interface BrandTemplate {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoPlaceholder: string;
}

export type OutputFormat = 'ideacards';

export type AppStep = 'input' | 'processing' | 'review' | 'tweets' | 'deck';

export type ProcessingPhase =
  | 'uploading'
  | 'transcribing'
  | 'extracting'
  | 'scoring'
  | 'done';

export interface SavedDeck {
  id: string;
  name: string;
  date: string;
  ideas: Idea[];
  templateId: string;
  briefText: string;
}

export interface AppState {
  step: AppStep;
  files: File[];
  notesText: string;
  briefText: string;
  briefFile: File | null;
  outputFormat: OutputFormat;
  templateId: string;
  ideas: Idea[];
  tweets: Tweet[];
  error: string | null;
  processingPhase: ProcessingPhase | null;
  detectedBrief: string | null;
  currentSlide: number;
  viewMode: 'scroll' | 'horizontal';
}

export type AppAction =
  | { type: 'ADD_FILES'; files: File[] }
  | { type: 'REMOVE_FILE'; index: number }
  | { type: 'SET_NOTES'; text: string }
  | { type: 'SET_BRIEF_TEXT'; text: string }
  | { type: 'SET_BRIEF_FILE'; file: File | null }
  | { type: 'SET_OUTPUT_FORMAT'; format: OutputFormat }
  | { type: 'SET_TEMPLATE'; templateId: string }
  | { type: 'START_PROCESSING' }
  | { type: 'SET_PROCESSING_PHASE'; phase: ProcessingPhase }
  | { type: 'SET_IDEAS'; ideas: Idea[] }
  | { type: 'SET_TWEETS'; tweets: Tweet[] }
  | { type: 'TOGGLE_IDEA'; id: string }
  | { type: 'REMOVE_IDEA'; id: string }
  | { type: 'ADD_IDEA'; headline: string; subheader: string }
  | { type: 'EDIT_IDEA'; id: string; headline: string; subheader: string; insight?: string; mechanic?: string; userJourney?: string }
  | { type: 'REORDER_IDEAS'; fromIndex: number; toIndex: number }
  | { type: 'TOGGLE_TWEET'; id: string }
  | { type: 'REMOVE_TWEET'; id: string }
  | { type: 'ADD_TWEET'; text: string }
  | { type: 'EDIT_TWEET'; id: string; text: string }
  | { type: 'REORDER_TWEETS'; fromIndex: number; toIndex: number }
  | { type: 'GENERATE_DECK' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'BACK_TO_INPUT' }
  | { type: 'BACK_TO_REVIEW' }
  | { type: 'SET_DETECTED_BRIEF'; brief: string }
  | { type: 'ACCEPT_DETECTED_BRIEF' }
  | { type: 'SET_CURRENT_SLIDE'; index: number }
  | { type: 'SET_VIEW_MODE'; mode: 'scroll' | 'horizontal' }
  | { type: 'LOAD_DECK'; deck: SavedDeck };
