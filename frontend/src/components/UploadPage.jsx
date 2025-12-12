import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks, uploadBook, subscribeToStatus } from '../api/bookService';
import BooksList from './BooksList';
import { useAudiobook } from '../context/AudiobookContext';

function UploadPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const { clearBook } = useAudiobook();

  // Load books on mount and clear any playing audio
  useEffect(() => {
    clearBook();
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchBooks();
      console.log('📚 Loaded books from API:', data);
      data.forEach(book => {
        console.log(`Book: ${book.title}, Duration: ${book.duration}, Type: ${typeof book.duration}`);
      });
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
      setError('Failed to load books. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError(null);
    setUploading(true);
    setProcessingStatus({ status: 'uploading', progress: 'Uploading file...' });

    try {
      // Upload file
      const result = await uploadBook(file);
      const { bookId } = result;

      setUploading(false);
      setProcessingStatus({
        status: 'processing',
        progress: 'Processing started...',
        bookId
      });

      // Subscribe to status updates
      const unsubscribe = subscribeToStatus(
        bookId,
        (statusData) => {
          setProcessingStatus({
            status: statusData.status,
            progress: statusData.progress,
            error: statusData.error,
            bookId
          });

          // Reload books when complete
          if (statusData.status === 'completed') {
            loadBooks();
            setTimeout(() => {
              setProcessingStatus(null);
            }, 3000);
          }

          // Clear on failure after delay
          if (statusData.status === 'failed') {
            setTimeout(() => {
              setProcessingStatus(null);
            }, 5000);
          }
        },
        (error) => {
          console.error('SSE error:', error);
          setProcessingStatus(null);
          setError('Lost connection to server. Please refresh to see status.');
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please try again.');
      setUploading(false);
      setProcessingStatus(null);
    }
  };

  const handleBookDeleted = (bookId) => {
    setBooks(books.filter(b => b.book_id !== bookId));
  };

  const handleBookUpdated = () => {
    // Reload books to get the latest data
    loadBooks();
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-clay/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-dark/5 rounded-full transition-all duration-200 text-dark/60 hover:text-dark"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="font-medium text-2xl text-dark tracking-tight">
                  Your Library
                </h1>
                <p className="text-sm text-dark/40">
                  Manage and listen to your audiobooks
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/manage')}
              className="btn btn-secondary text-sm px-4 py-2 rounded-full"
            >
              Manage Books
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Upload section */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
              ${dragActive
                ? 'border-clay bg-sage/10 scale-[1.01]'
                : 'border-clay/20 hover:border-clay/40 hover:bg-white/50'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center pointer-events-none">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors
                ${dragActive ? 'bg-clay text-white' : 'bg-clay/10 text-clay'}
              `}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <h3 className="font-serif text-2xl font-medium text-dark mb-2">
                {uploading ? 'Uploading...' : 'Upload New Book'}
              </h3>
              <p className="text-dark/40 max-w-sm mx-auto leading-relaxed">
                Drag and drop your PDF here, or click to browse. <br />
                <span className="text-xs uppercase tracking-widest opacity-70">Max 50MB</span>
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Processing status */}
          {processingStatus && (
            <div className={`
              mt-6 p-6 rounded-xl border shadow-subtle transition-all duration-500
              ${processingStatus.status === 'failed'
                ? 'bg-red-50 border-red-100'
                : 'bg-white border-clay/10'
              }
            `}>
              <div className="flex items-center gap-4">
                {processingStatus.status === 'processing' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-clay" />
                )}
                {processingStatus.status === 'completed' && (
                  <div className="w-5 h-5 rounded-full bg-sage-dark flex items-center justify-center text-white">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm font-medium ${processingStatus.status === 'failed' ? 'text-red-600' : 'text-dark'
                      }`}>
                      {processingStatus.status === 'uploading' && 'Uploading file...'}
                      {processingStatus.status === 'processing' && 'Generating audio...'}
                      {processingStatus.status === 'completed' && 'Ready to listen!'}
                      {processingStatus.status === 'failed' && 'Processing failed'}
                    </p>
                    <span className="text-xs font-mono text-dark/40 uppercase">
                      {processingStatus.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-dark/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${processingStatus.status === 'failed' ? 'bg-red-400' : 'bg-clay'
                        }`}
                      style={{
                        width: processingStatus.status === 'completed' ? '100%' :
                          processingStatus.status === 'uploading' ? '30%' : '70%'
                      }}
                    />
                  </div>

                  {processingStatus.error && (
                    <p className="text-xs text-red-500 mt-2">{processingStatus.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Books list */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-medium text-dark tracking-tight">Your Collection</h2>
            <div className="h-px flex-1 bg-clay/10"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-clay" />
            </div>
          ) : (
            <BooksList books={books} onBookDeleted={handleBookDeleted} onBookUpdated={handleBookUpdated} />
          )}
        </div>
      </main>
    </div>
  );
}

export default UploadPage;

