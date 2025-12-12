import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAudiobook } from '../context/AudiobookContext';

function LandingPage() {
  const navigate = useNavigate();
  const { clearBook } = useAudiobook();

  // Stop any playing audio when landing on homepage
  useEffect(() => {
    clearBook();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        {/* Abstract Swiss Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-sage/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-clay/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-dark/5 text-dark/60 text-sm font-medium tracking-wide mb-8 uppercase">
              Story Sage AI
            </span>
            <h1 className="font-sans text-6xl md:text-8xl font-medium text-dark mb-8 tracking-tightest leading-[0.95]">
              Stories found in <br />
              <span className="font-serif italic text-clay-dark">nature's quiet.</span>
            </h1>
            <p className="font-sans text-xl text-dark/60 mb-12 max-w-2xl mx-auto leading-relaxed text-balance">
              Transform your documents into calm, lifelike audiobooks.
              Experience reading through the wisdom of sound.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/app')}
                className="btn btn-primary text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
              >
                Start Listening
              </button>
              <button
                onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-ghost text-lg px-8 py-4"
              >
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid - Swiss Style */}
      <section className="py-32 px-6 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="w-12 h-12 border border-clay/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-sage/20 transition-colors">
                <span className="font-serif text-xl text-clay">01</span>
              </div>
              <h3 className="text-2xl font-medium text-dark mb-4 tracking-tight">Upload</h3>
              <p className="text-dark/60 leading-relaxed">
                Drag and drop your PDF documents. We handle the processing instantly and securely.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="w-12 h-12 border border-clay/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-sage/20 transition-colors">
                <span className="font-serif text-xl text-clay">02</span>
              </div>
              <h3 className="text-2xl font-medium text-dark mb-4 tracking-tight">Generate</h3>
              <p className="text-dark/60 leading-relaxed">
                Our AI synthesizes natural, calming narration that feels human and grounded.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="w-12 h-12 border border-clay/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-sage/20 transition-colors">
                <span className="font-serif text-xl text-clay">03</span>
              </div>
              <h3 className="text-2xl font-medium text-dark mb-4 tracking-tight">Listen</h3>
              <p className="text-dark/60 leading-relaxed">
                Immerse yourself in the story with our distraction-free, minimalist player.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-2xl p-12 md:p-20 shadow-float relative overflow-hidden">
            {/* Decorative leaf pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 leaf-pattern opacity-20" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-medium text-dark mb-6 tracking-tightest">
                  Experience <br />
                  <span className="font-serif italic text-clay">clarity.</span>
                </h2>
                <p className="text-lg text-dark/60 mb-8 leading-relaxed">
                  Listen to a sample to hear the difference. Clean, crisp, and naturally paced narration designed for retention and peace.
                </p>
                <button
                  onClick={() => navigate('/app')}
                  className="btn btn-secondary rounded-full px-8"
                >
                  Try it yourself
                </button>
              </div>

              <div className="bg-cream rounded-xl p-8 border border-clay/10 shadow-card">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-sage/30 rounded-lg flex items-center justify-center text-clay">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-dark">The Silent Forest</h4>
                    <p className="text-sm text-dark/50">Sample Chapter</p>
                  </div>
                </div>

                {/* Fake Player UI */}
                <div className="space-y-4">
                  <div className="h-1 bg-dark/5 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-clay rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-dark/40 font-mono">
                    <span>04:20</span>
                    <span>12:45</span>
                  </div>
                  <div className="flex justify-center gap-6 pt-2">
                    <button className="p-2 text-dark/40 hover:text-dark transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="w-12 h-12 bg-dark text-cream rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-subtle">
                      <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <button className="p-2 text-dark/40 hover:text-dark transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;

