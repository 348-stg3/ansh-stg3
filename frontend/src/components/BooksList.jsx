import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { deleteBook, updateBook } from '../api/bookService';
import SpeakerReportModal from './SpeakerReportModal';

function BooksList({ books, onBookDeleted, onBookUpdated }) {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [updating, setUpdating] = useState(false);
  const [reportModalBook, setReportModalBook] = useState(null);

  const handleDelete = async (bookId, e) => {
    e.stopPropagation();
    setDeletingId(bookId);

    try {
      await deleteBook(bookId);
      onBookDeleted?.(bookId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete book: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (book, e) => {
    e.stopPropagation();
    setEditingId(book.book_id);
    setEditTitle(book.title);
  };

  const handleSaveTitle = async (bookId, e) => {
    e.stopPropagation();

    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    setUpdating(true);

    try {
      await updateBook(bookId, { title: editTitle });

      // Trigger refresh
      onBookUpdated?.();

      setEditingId(null);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update book: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleReportClick = (book, e) => {
    e.stopPropagation();
    setReportModalBook(book);
  };

  const formatDuration = (seconds) => {
    console.log('formatDuration called with:', seconds, 'Type:', typeof seconds);
    if (!seconds) {
      console.log('Returning 0:00 because seconds is falsy:', seconds);
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
    console.log('Formatted duration:', formatted);
    return formatted;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-sans text-lg text-darkbrown opacity-60">No audiobooks yet. Upload a PDF to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {books.map((book) => (
        <div
          key={book.book_id}
          className="group relative bg-white rounded-xl border border-clay/10 p-6 transition-all duration-300 hover:shadow-card hover:-translate-y-1 cursor-pointer"
          onClick={() => navigate(`/book/${book.book_id}`)}
        >
          {/* Delete button */}
          {showDeleteConfirm === book.book_id ? (
            <div className="absolute top-4 right-4 bg-white border border-clay/20 rounded-xl shadow-lg p-4 z-20 animate-fade-in">
              <p className="text-xs font-bold text-dark/60 uppercase tracking-widest mb-3">Delete book?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleDelete(book.book_id, e)}
                  disabled={deletingId === book.book_id}
                  className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {deletingId === book.book_id ? '...' : 'Delete'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium border border-clay/20 rounded-lg hover:bg-clay/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(book.book_id);
              }}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-red-50 text-dark/20 hover:text-red-500 rounded-full"
              title="Delete book"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {/* Book Icon */}
          <div className="w-12 h-12 rounded-lg bg-sage/20 flex items-center justify-center mb-6 text-sage-dark group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {editingId === book.book_id ? (
              <div onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle(book.book_id, e);
                    if (e.key === 'Escape') handleCancelEdit(e);
                  }}
                  className="w-full px-3 py-2 text-lg font-serif font-medium border-b-2 border-sage focus:outline-none bg-transparent"
                  autoFocus
                  disabled={updating}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => handleSaveTitle(book.book_id, e)}
                    className="text-xs font-bold text-sage-dark hover:text-dark uppercase tracking-wider"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs font-bold text-dark/40 hover:text-dark uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group/title relative">
                <h3 className="font-serif text-xl font-medium text-dark line-clamp-2 leading-tight pr-6">
                  {book.title}
                </h3>
                <button
                  onClick={(e) => handleEditClick(book, e)}
                  className="absolute top-0 right-0 opacity-0 group-hover/title:opacity-100 p-1 text-dark/20 hover:text-clay transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs font-mono text-dark/40">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(book.duration)}
              </div>
              <div className="w-1 h-1 rounded-full bg-clay/30" />
              <div>{book.total_segments} SEGS</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-6 border-t border-clay/5 flex items-center justify-between">
            <span className="text-xs font-bold text-sage-dark uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1">
              Listen Now
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>

            <button
              onClick={(e) => handleReportClick(book, e)}
              className="p-2 text-dark/20 hover:text-clay hover:bg-clay/5 rounded-full transition-colors"
              title="View Report"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Speaker Report Modal */}
      {reportModalBook && (
        <SpeakerReportModal
          bookId={reportModalBook.book_id}
          bookTitle={reportModalBook.title}
          isOpen={!!reportModalBook}
          onClose={() => setReportModalBook(null)}
        />
      )}
    </div>
  );
}

export default BooksList;

