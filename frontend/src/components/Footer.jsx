function Footer() {
  return (
    <footer className="bg-clay bg-opacity-20 rounded-t-3xl mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Logo or title */}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-serif text-xl text-clay">Comforting Audiobooks</span>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="#about" 
              className="text-darkbrown hover:text-clay transition-colors duration-200"
            >
              About
            </a>
            <span className="text-clay">•</span>
            <a 
              href="#privacy" 
              className="text-darkbrown hover:text-clay transition-colors duration-200"
            >
              Privacy
            </a>
            <span className="text-clay">•</span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-darkbrown hover:text-clay transition-colors duration-200"
            >
              GitHub
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-darkbrown opacity-60">
            © {new Date().getFullYear()} Comforting Audiobooks. Made with care.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

