import { useAudiobook } from '../context/AudiobookContext';

function AudioControls() {
  const {
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    isLoading,
    togglePlay,
    seekToTime,
    previousSegment,
    nextSegment,
    changePlaybackSpeed
  } = useAudiobook();

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    seekToTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="h-full flex flex-col p-8 bg-white">
      <div className="mb-8">
        <span className="text-xs font-bold tracking-widest text-clay uppercase">Controls</span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-12">
        {/* Play/Pause Button */}
        <div className="flex justify-center">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-24 h-24 rounded-full bg-dark text-cream flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-cream" />
            ) : isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-4">
          <div className="relative group">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-dark/10 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #2C332E 0%, #2C332E ${progress}%, rgba(44, 51, 46, 0.1) ${progress}%, rgba(44, 51, 46, 0.1) 100%)`
              }}
            />
          </div>
          <div className="flex justify-between font-mono text-xs text-dark/40">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Skip Buttons */}
        <div className="flex justify-center gap-8">
          <button
            onClick={previousSegment}
            className="p-4 rounded-full hover:bg-dark/5 transition-colors text-dark/60 hover:text-dark"
            aria-label="Previous segment"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSegment}
            className="p-4 rounded-full hover:bg-dark/5 transition-colors text-dark/60 hover:text-dark"
            aria-label="Next segment"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Speed Control */}
        <div className="space-y-4">
          <label className="block text-xs font-bold tracking-widest text-dark/40 uppercase text-center">
            Playback Speed
          </label>
          <div className="flex justify-center gap-2 flex-wrap">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => changePlaybackSpeed(speed)}
                className={`
                  w-10 h-10 rounded-full text-xs font-medium transition-all duration-200
                  ${playbackSpeed === speed
                    ? 'bg-dark text-cream shadow-subtle'
                    : 'bg-transparent text-dark/60 hover:bg-dark/5'
                  }
                `}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-auto pt-8 border-t border-clay/10 text-center">
        <p className="text-xs text-dark/30 font-medium">
          Press Space to Play/Pause
        </p>
      </div>
    </div>
  );
}

export default AudioControls;

