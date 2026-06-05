# DoodleDetangler

An AI-powered tool that transforms meeting recordings, photos, and notes into structured ideas and social media content.

## Features

### 📸 Multimodal Input
- Upload audio recordings, whiteboard photos, documents, or PDFs
- Add meeting notes or ideas as text
- Mobile camera capture for on-the-go photo uploads
- Support for: audio files, images, PDFs, text documents

### 💡 Ideas Extraction
- AI analyzes your input and extracts key ideas
- Each idea includes: headline, subheader, insight, mechanic, user journey, score, and reasoning
- Edit, delete, reorder, or manually add ideas
- Select which ideas to include in your deck

### 🐦 Tweets Generation
- Extract one-liner selling points from your input
- Create social media-ready content automatically
- Edit, delete, reorder, or manually add tweets

### 🎨 Deck Generation
- Create branded presentation decks from selected ideas
- Multiple design templates available
- Export deck slides with branding
- Supports customizable templates with colors and fonts

### 📤 Export Options
- **Export as Agent Prompt**: Generate structured prompts for deck-building AI agents
- **Save/Load Sessions**: Persist your work locally via localStorage
- **Share Sessions**: Generate shareable URLs with encoded session data
  - Share with teammates across devices
  - Access results on desktop after mobile input capture
  - URL-encoded Base64 session data for portability

### 🔐 Session Sharing
- Generate unique shareable session URLs
- Access results on any device via shared URL
- Session data includes: ideas, tweets, brief, notes, timestamp
- No cloud storage required — data encoded in URL

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.local with your API keys
# Required: GEMINI_API_KEY, TEAM_PASSWORD

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Generative AI API key | Yes |
| `TEAM_PASSWORD` | Password for team login | Yes |

### Build & Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
npx vercel deploy --prod
```

## Usage

1. **Input Phase**: Upload files and/or add meeting notes
2. **Processing**: AI analyzes your input (uploading, extracting, scoring)
3. **Review Ideas**: Edit, select, and reorder extracted ideas
4. **Review Tweets**: Edit, select, and reorder extracted tweets
5. **Generate Deck**: Create branded slides from selected ideas
6. **Export**: Share as agent prompt or save session locally

### Sharing Sessions
- After generating ideas/tweets, a shareable URL is displayed
- Copy and share the URL to access results on any device
- Session data is encoded in the URL parameter

## Tech Stack

- **Framework**: Next.js 16.2.6 with Turbopack
- **Language**: TypeScript
- **UI**: React 19 with Tailwind CSS 4
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **Storage**: Browser localStorage + URL-based sessions
- **Deployment**: Vercel

## Architecture

- `/app/page.tsx` - Main app with reducer-based state management
- `/app/api/*` - Server-side API endpoints (analyze, tweets, login)
- `/components/*` - React components for UI
- `/lib/*` - Utilities (types, session encoding, export prompts, templates)

## Key Features Implementation

### State Management
- React `useReducer` for complex app state
- localStorage for session persistence
- URL parameters for session sharing

### Session Encoding
- Base64 encoding of JSON session data
- URL parameter with encoded data
- Automatic restoration on load

### API Integration
- Multipart file upload to `/api/analyze`
- Text extraction from various file types
- AI-powered idea generation and scoring
- Tweets generation from input

## Live Demo

**Production**: https://doodledetangler.vercel.app

## License

Private project

## Contact

For questions or feedback, contact the development team.
