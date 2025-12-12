import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBook, fetchSegments, getAudioUrl } from '../api/bookService';
import { useAudiobook } from '../context/AudiobookContext';
import useAudioSync from '../hooks/useAudioSync';
import SentenceList from './SentenceList';
import AudioControls from './AudioControls';

function AudiobookPlayer() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { loadBook, togglePlay, previousSegment, nextSegment } = useAudiobook();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize audio sync
  useAudioSync();

  useEffect(() => {
    loadBookData();
  }, [bookId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        previousSegment();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextSegment();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, previousSegment, nextSegment]);

  const loadBookData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch book metadata and segments in parallel
      const [book, segments] = await Promise.all([
        fetchBook(bookId),
        fetchSegments(bookId)
      ]);

      // Get audio URL
      const audioUrl = getAudioUrl(bookId);

      // Load into context
      loadBook(book, segments, audioUrl);

    } catch (err) {
      console.error('Failed to load book:', err);
      setError(err.message || 'Failed to load audiobook');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-sage mx-auto mb-6" />
          <p className="font-sans text-lg text-darkbrown opacity-70">Loading audiobook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="max-w-md w-full text-center card p-10">
          <svg
            className="w-20 h-20 mx-auto text-red-500 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="font-serif text-2xl font-semibold text-darkbrown mb-3">
            Failed to load audiobook
          </h2>
          <p className="font-sans text-darkbrown opacity-70 mb-8">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={loadBookData} className="btn btn-primary">
              Try again
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-clay/10 sticky top-0 z-20">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/app')}
                className="p-2 hover:bg-dark/5 rounded-full transition-all duration-200 text-dark/60 hover:text-dark"
                aria-label="Back to library"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="font-medium text-xl text-dark tracking-tight">
                  {useAudiobook().currentBook?.title || 'Audiobook'}
                </h1>
                <p className="text-sm text-dark/40 font-mono">
                  {useAudiobook().segments?.length || 0} SEGMENTS
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main player layout - side by side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sentence list (Main Content) */}
        <div className="flex-1 relative">
          <SentenceList />
        </div>

        {/* Right: Audio controls (Sidebar) */}
        <div className="w-[360px] border-l border-clay/10 bg-white z-10 shadow-subtle">
          <AudioControls />
        </div>
      </div>
    </div>
  );
}

export default AudiobookPlayer;

