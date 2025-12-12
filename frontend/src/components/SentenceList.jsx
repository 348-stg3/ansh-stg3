import { useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useAudiobook } from '../context/AudiobookContext';

function SentenceList() {
  const { segments, currentSegmentIndex, seekToSegment } = useAudiobook();
  const listRef = useRef(null);
  const itemRefs = useRef({});

  // Auto-scroll to active segment
  useEffect(() => {
    if (currentSegmentIndex !== null && listRef.current) {
      listRef.current.scrollToItem(currentSegmentIndex, 'center');
    }
  }, [currentSegmentIndex]);

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Row renderer for react-window
  const Row = ({ index, style }) => {
    const segment = segments[index];
    const isActive = currentSegmentIndex === index;

    return (
      <div
        id={`sentence-${index}`}
        style={style}
        onClick={() => seekToSegment(index)}
        className={`
          px-8 md:px-12 py-6 cursor-pointer transition-all duration-300 border-b border-clay/5
          ${isActive ? 'bg-white shadow-subtle z-10 scale-[1.01]' : 'hover:bg-white/50'}
        `}
        ref={el => itemRefs.current[index] = el}
      >
        <div className="flex items-start gap-6 max-w-3xl mx-auto">
          {/* Segment number */}
          <span className={`
            text-xs font-mono mt-1.5 flex-shrink-0 w-8 text-right
            ${isActive ? 'text-clay font-bold' : 'text-dark/20'}
          `}>
            {(index + 1).toString().padStart(2, '0')}
          </span>

          <div className="flex-1 min-w-0">
            {/* Speaker name */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`
                text-xs font-bold tracking-wider uppercase
                ${isActive ? 'text-dark' : 'text-dark/40'}
              `}>
                {segment.speaker}
              </span>
              <span className="text-xs font-mono text-dark/30">
                {formatTime(segment.start_time)}
              </span>
            </div>

            {/* Sentence text */}
            <p className={`
              font-serif text-xl leading-relaxed
              ${isActive ? 'text-dark' : 'text-dark/60'}
            `}>
              {segment.text}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full font-sans text-lg text-darkbrown opacity-60">
        No segments available
      </div>
    );
  }

  return (
    <div className="h-full bg-cream/50">
      <List
        ref={listRef}
        height={typeof window !== 'undefined' ? window.innerHeight - 85 : 800}
        itemCount={segments.length}
        itemSize={160}
        width="100%"
        className="scrollbar-thin"
      >
        {Row}
      </List>
    </div>
  );
}

export default SentenceList;

