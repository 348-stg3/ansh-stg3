import { Routes, Route } from 'react-router-dom';
import { AudiobookProvider } from './context/AudiobookContext';
import LandingPage from './components/LandingPage';
import UploadPage from './components/UploadPage';
import AudiobookPlayer from './components/AudiobookPlayer';
import BookManagement from './components/BookManagement';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';

function App() {
  return (
    <ErrorBoundary>
      <AudiobookProvider>
        <div className="min-h-screen flex flex-col font-sans antialiased text-dark selection:bg-clay/30">
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<UploadPage />} />
              <Route path="/book/:bookId" element={<AudiobookPlayer />} />
              <Route path="/manage" element={<BookManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AudiobookProvider>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-darkbrown mb-2">404</h1>
        <p className="font-sans text-darkbrown opacity-70 mb-4">Page not found</p>
        <a href="/" className="btn btn-primary">
          Go home
        </a>
      </div>
    </div>
  );
}

export default App;

