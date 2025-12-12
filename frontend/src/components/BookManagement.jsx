import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks, createBook, updateBook, deleteBook } from '../api/bookService';

/**
 * BookManagement Component
 * 
 * Demonstrates CRUD operations and filtering/reporting capabilities for the demo.
 * 
 * Features:
 * - INSERT: Create new books manually
 * - UPDATE: Edit book titles
 * - DELETE: Remove books
 * - FILTER: Filter by duration range, segment count range, date range, and title
 * - REPORT: Display filtered results with statistics
 * - DYNAMIC UI: All dropdowns and lists are built from database data
 */
function BookManagement() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    minDuration: '',
    maxDuration: '',
    minSegments: '',
    maxSegments: '',
    startDate: '',
    endDate: '',
    title: ''
  });

  // Form state for creating new book
  const [newBook, setNewBook] = useState({
    title: '',
    duration: '',
    total_segments: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load all books on mount
  useEffect(() => {
    loadBooks();
  }, []);

  // Apply filters whenever filters or books change
  useEffect(() => {
    applyFilters();
  }, [filters, books]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const allBooks = await fetchBooks();
      setBooks(allBooks);
      setFilteredBooks(allBooks);
    } catch (error) {
      console.error('Failed to load books:', error);
      alert('Failed to load books: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      // Build filter object (only include non-empty values)
      const activeFilters = {};
      if (filters.minDuration) activeFilters.minDuration = filters.minDuration;
      if (filters.maxDuration) activeFilters.maxDuration = filters.maxDuration;
      if (filters.minSegments) activeFilters.minSegments = filters.minSegments;
      if (filters.maxSegments) activeFilters.maxSegments = filters.maxSegments;
      if (filters.startDate) activeFilters.startDate = filters.startDate;
      if (filters.endDate) activeFilters.endDate = filters.endDate;
      if (filters.title) activeFilters.title = filters.title;

      const filtered = await fetchBooks(activeFilters);
      setFilteredBooks(filtered);
    } catch (error) {
      console.error('Failed to apply filters:', error);
      alert('Failed to apply filters: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!newBook.title.trim()) {
      alert('Title is required');
      return;
    }

    setLoading(true);
    try {
      const bookData = {
        title: newBook.title,
        duration: newBook.duration ? parseFloat(newBook.duration) : undefined,
        total_segments: newBook.total_segments ? parseInt(newBook.total_segments) : undefined
      };

      await createBook(bookData);
      setNewBook({ title: '', duration: '', total_segments: '' });
      setShowCreateForm(false);
      await loadBooks(); // Reload to show new book
      alert('Book created successfully!');
    } catch (error) {
      console.error('Failed to create book:', error);
      alert('Failed to create book: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async (bookId) => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateBook(bookId, { title: editTitle });
      setEditingId(null);
      await loadBooks(); // Reload to show updated book
      alert('Book updated successfully!');
    } catch (error) {
      console.error('Failed to update book:', error);
      alert('Failed to update book: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteBook(bookId);
      await loadBooks(); // Reload to remove deleted book
      alert('Book deleted successfully!');
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Failed to delete book: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics for filtered books
  const stats = filteredBooks.length > 0 ? {
    total: filteredBooks.length,
    avgDuration: filteredBooks.reduce((sum, b) => sum + (b.duration || 0), 0) / filteredBooks.length,
    avgSegments: filteredBooks.reduce((sum, b) => sum + (b.total_segments || 0), 0) / filteredBooks.length,
    totalDuration: filteredBooks.reduce((sum, b) => sum + (b.duration || 0), 0)
  } : null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-clay/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app')}
                className="p-2 hover:bg-dark/5 rounded-full transition-all duration-200 text-dark/60 hover:text-dark"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="font-medium text-2xl text-dark tracking-tight">
                  Library Management
                </h1>
                <p className="text-sm text-dark/40">
                  Organize and filter your collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* INSERT Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-dark tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-clay"></span>
              Add New Book
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`
                btn text-sm px-4 py-2 rounded-full transition-all
                ${showCreateForm ? 'bg-dark/5 text-dark' : 'btn-primary'}
              `}
            >
              {showCreateForm ? 'Cancel' : '+ Create Book'}
            </button>
          </div>

          {showCreateForm && (
            <div className="card p-8 animate-fade-in bg-white">
              <form onSubmit={handleCreateBook} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                    Title <span className="text-clay">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="input text-lg"
                    placeholder="Enter book title"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={newBook.duration}
                      onChange={(e) => setNewBook({ ...newBook, duration: e.target.value })}
                      className="input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                      Total Segments
                    </label>
                    <input
                      type="number"
                      value={newBook.total_segments}
                      onChange={(e) => setNewBook({ ...newBook, total_segments: e.target.value })}
                      className="input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Creating...' : 'Create Book'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* FILTER Section */}
        <section>
          <h2 className="text-lg font-medium text-dark tracking-tight flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-sage-dark"></span>
            Filter & Search
          </h2>

          <div className="card p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.title}
                    onChange={(e) => handleFilterChange('title', e.target.value)}
                    className="input pl-10"
                    placeholder="Search by title..."
                  />
                  <svg className="w-5 h-5 text-dark/30 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                  Duration Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minDuration}
                    onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                    className="input text-sm"
                    placeholder="Min"
                    min="0"
                  />
                  <input
                    type="number"
                    value={filters.maxDuration}
                    onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                    className="input text-sm"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                  Segments Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minSegments}
                    onChange={(e) => handleFilterChange('minSegments', e.target.value)}
                    className="input text-sm"
                    placeholder="Min"
                    min="0"
                  />
                  <input
                    type="number"
                    value={filters.maxSegments}
                    onChange={(e) => handleFilterChange('maxSegments', e.target.value)}
                    className="input text-sm"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/40 uppercase tracking-widest mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    minDuration: '',
                    maxDuration: '',
                    minSegments: '',
                    maxSegments: '',
                    startDate: '',
                    endDate: '',
                    title: ''
                  });
                }}
                className="text-sm text-clay hover:text-clay-dark underline decoration-1 underline-offset-4 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </section>

        {/* REPORT Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-dark tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dark"></span>
              Results
            </h2>
            {stats && (
              <span className="text-sm text-dark/40 font-mono">
                {stats.total} BOOKS FOUND
              </span>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl border border-clay/10 shadow-subtle">
                <div className="text-xs font-bold text-dark/30 uppercase tracking-widest mb-2">Total Books</div>
                <div className="text-3xl font-serif text-dark">{stats.total}</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-clay/10 shadow-subtle">
                <div className="text-xs font-bold text-dark/30 uppercase tracking-widest mb-2">Avg Duration</div>
                <div className="text-3xl font-serif text-dark">
                  {formatDuration(stats.avgDuration)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-clay/10 shadow-subtle">
                <div className="text-xs font-bold text-dark/30 uppercase tracking-widest mb-2">Avg Segments</div>
                <div className="text-3xl font-serif text-dark">
                  {Math.round(stats.avgSegments)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-clay/10 shadow-subtle">
                <div className="text-xs font-bold text-dark/30 uppercase tracking-widest mb-2">Total Time</div>
                <div className="text-3xl font-serif text-dark">
                  {formatDuration(stats.totalDuration)}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-clay/10 shadow-subtle overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-clay mx-auto mb-4" />
                <div className="text-dark/40 text-sm">Loading library...</div>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-dark/40 mb-2">No books match your criteria.</div>
                <button
                  onClick={() => setFilters({ minDuration: '', maxDuration: '', minSegments: '', maxSegments: '', startDate: '', endDate: '', title: '' })}
                  className="text-clay hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-clay/10 bg-cream/30">
                      <th className="text-left py-4 px-6 text-xs font-bold text-dark/40 uppercase tracking-widest">Title</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-dark/40 uppercase tracking-widest">Duration</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-dark/40 uppercase tracking-widest">Segments</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-dark/40 uppercase tracking-widest">Created</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-dark/40 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-clay/5">
                    {filteredBooks.map((book) => (
                      <tr key={book.book_id} className="hover:bg-sage/5 transition-colors group">
                        <td className="py-4 px-6">
                          {editingId === book.book_id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="input py-1 text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateBook(book.book_id)}
                                className="p-1 text-sage-dark hover:text-dark"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditTitle('');
                                }}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="font-medium text-dark">{book.title}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-sm text-dark/60">
                          {formatDuration(book.duration)}
                        </td>
                        <td className="py-4 px-6 font-mono text-sm text-dark/60">
                          {book.total_segments || 0}
                        </td>
                        <td className="py-4 px-6 text-sm text-dark/60">
                          {formatDate(book.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingId !== book.book_id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(book.book_id);
                                    setEditTitle(book.title);
                                  }}
                                  className="text-xs font-medium text-dark/40 hover:text-clay uppercase tracking-wider"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(book.book_id)}
                                  className="text-xs font-medium text-red-400 hover:text-red-600 uppercase tracking-wider"
                                  disabled={loading}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default BookManagement;

