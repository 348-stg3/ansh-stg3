# Audiobook Frontend

React application for the audiobook player interface.

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`

## Features

- PDF upload with drag-and-drop
- Real-time SSE progress tracking
- Interactive audiobook player
- Sentence-level navigation
- Synchronized text highlighting
- Keyboard shortcuts
- Responsive design

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- React Window (virtualization)
- Context API

## Project Structure

```
src/
├── components/          # React components
│   ├── UploadPage.jsx  # Home page with upload
│   ├── BooksList.jsx   # Grid of books
│   ├── AudiobookPlayer.jsx  # Main player
│   ├── SentenceList.jsx     # Virtualized list
│   ├── AudioControls.jsx    # Playback controls
│   └── ErrorBoundary.jsx    # Error handling
├── context/
│   └── AudiobookContext.jsx # Global state
├── hooks/
│   └── useAudioSync.js      # Audio sync logic
├── api/
│   └── bookService.js       # API calls
└── index.css               # Tailwind + styles
```

## API Integration

Connects to backend at `http://localhost:5000` via Vite proxy.

See `vite.config.js` for proxy configuration.

