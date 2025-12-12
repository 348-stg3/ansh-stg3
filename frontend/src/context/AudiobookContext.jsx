import { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudiobookContext = createContext(null);

export function AudiobookProvider({ children }) {
  // Audio state
  const audioRef = useRef(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [segments, setSegments] = useState([]);
  const [audioSrc, setAudioSrc] = useState('');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Load book data
  const loadBook = (book, bookSegments, audioUrl) => {
    setCurrentBook(book);
    setSegments(bookSegments);
    setAudioSrc(audioUrl);
    setCurrentSegmentIndex(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Clear book data (stop audio when navigating away)
  const clearBook = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentBook(null);
    setSegments([]);
    setAudioSrc('');
    setCurrentSegmentIndex(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  // Playback controls
  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seekToTime = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const seekToSegment = (segmentIndex) => {
    const segment = segments.find(s => s.segment_index === segmentIndex);
    if (segment && audioRef.current) {
      audioRef.current.currentTime = segment.start_time;
      setCurrentSegmentIndex(segmentIndex);
      if (!isPlaying) {
        play();
      }
    }
  };

  const nextSegment = () => {
    if (currentSegmentIndex !== null && currentSegmentIndex < segments.length - 1) {
      seekToSegment(currentSegmentIndex + 1);
    }
  };

  const previousSegment = () => {
    if (currentSegmentIndex !== null && currentSegmentIndex > 0) {
      seekToSegment(currentSegmentIndex - 1);
    }
  };

  const changePlaybackSpeed = (speed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentSegmentIndex(null);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioSrc]);

  const value = {
    // Refs
    audioRef,

    // State
    currentBook,
    segments,
    audioSrc,
    currentSegmentIndex,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    isLoading,

    // Setters
    setCurrentSegmentIndex,

    // Actions
    loadBook,
    clearBook,
    play,
    pause,
    togglePlay,
    seekToTime,
    seekToSegment,
    nextSegment,
    previousSegment,
    changePlaybackSpeed
  };

  return (
    <AudiobookContext.Provider value={value}>
      {children}
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </AudiobookContext.Provider>
  );
}

export function useAudiobook() {
  const context = useContext(AudiobookContext);
  if (!context) {
    throw new Error('useAudiobook must be used within AudiobookProvider');
  }
  return context;
}

