import { useEffect, useRef } from 'react';
import { useAudiobook } from '../context/AudiobookContext';

/**
 * Hook to synchronize current segment with audio playback
 * Updates currentSegmentIndex based on audio.currentTime every 100ms
 */
function useAudioSync() {
  const { audioRef, segments, currentTime, setCurrentSegmentIndex } = useAudiobook();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current || segments.length === 0) {
      return;
    }

    // Update current segment based on audio time
    const updateCurrentSegment = () => {
      const time = audioRef.current?.currentTime || currentTime;
      
      // Find the segment that contains the current time
      const activeSegment = segments.find(
        (segment) => time >= segment.start_time && time < segment.end_time
      );

      if (activeSegment) {
        setCurrentSegmentIndex(activeSegment.segment_index);
      }
    };

    // Update immediately
    updateCurrentSegment();

    // Set up interval to check every 100ms
    intervalRef.current = setInterval(updateCurrentSegment, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audioRef, segments, currentTime, setCurrentSegmentIndex]);
}

export default useAudioSync;

