import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getSpeakerStats } from '../api/bookService';

function SpeakerReportModal({ bookId, bookTitle, isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded color palette based on the app's theme (supports up to 16 speakers)
  const COLORS = [
    '#A37A59', // clay
    '#4F3C2B', // darkbrown
    '#8B6F47', // medium brown
    '#6B5444', // dark clay
    '#9DC4A1', // medium sage
    '#7BA884', // darker sage
    '#C49A6C', // light clay
    '#5D4A3A', // chocolate
    '#B8956F', // tan
    '#4A6B56', // forest green
    '#D4A574', // sand
    '#3E3328', // espresso
    '#A8C9B0', // mint sage
    '#8E7963', // taupe
    '#5B7C68', // sage green
    '#C8A882'  // beige
  ];

  useEffect(() => {
    if (isOpen && bookId) {
      fetchStats();
    }
  }, [isOpen, bookId]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getSpeakerStats(bookId);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch speaker stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-darkbrown bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-cream rounded-3xl shadow-warm-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b-2 border-clay border-opacity-20 px-8 py-6 rounded-t-3xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-serif text-3xl font-bold text-darkbrown mb-2">
                Speaker Statistics
              </h2>
              <p className="font-sans text-base text-darkbrown opacity-70">
                {bookTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-clay hover:bg-opacity-10 rounded-full transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-sage border-t-clay rounded-full animate-spin mb-4" />
              <p className="font-sans text-darkbrown opacity-70">Loading statistics...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6">
              <p className="font-sans text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {stats && !loading && (
            <>
              {/* Pie Chart */}
              <div className="mb-8">
                <ResponsiveContainer width="100%" height={stats.speakers.length > 6 ? 400 : 350}>
                  <PieChart>
                    <Pie
                      data={stats.speakers}
                      cx="50%"
                      cy="50%"
                      labelLine={stats.speakers.length <= 6}
                      label={stats.speakers.length <= 6 ? ({ speaker, percentage }) => `${speaker}: ${percentage}%` : false}
                      outerRadius={stats.speakers.length > 6 ? 130 : 120}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="speaker"
                    >
                      {stats.speakers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FAF7F2', 
                        border: '2px solid #A37A59',
                        borderRadius: '12px',
                        fontFamily: 'Inter, sans-serif',
                        color: '#4F3C2B',
                        fontWeight: '600'
                      }}
                      formatter={(value, name, props) => [
                        `${value}% (${formatDuration(props.payload.duration)})`,
                        props.payload.speaker
                      ]}
                    />
                    <Legend 
                      wrapperStyle={{ fontFamily: 'Inter, sans-serif', color: '#4F3C2B' }}
                      formatter={(value) => <span style={{ color: '#4F3C2B', fontWeight: '500' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {stats.speakers.length > 6 && (
                  <p className="text-center font-sans text-sm text-darkbrown opacity-70 mt-2">
                    Hover over the chart for details • See breakdown below
                  </p>
                )}
              </div>

              {/* Statistics Table */}
              <div className="bg-sage bg-opacity-30 rounded-2xl p-6">
                <h3 className="font-serif text-2xl font-semibold text-darkbrown mb-4">
                  Detailed Breakdown
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {stats.speakers.map((speaker, index) => (
                    <div 
                      key={speaker.speaker}
                      className="bg-cream rounded-xl p-4 flex items-center justify-between hover:shadow-warm transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div 
                          className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-darkbrown border-opacity-20"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="min-w-0">
                          <p className="font-serif text-lg font-bold text-darkbrown">
                            {speaker.speaker}
                          </p>
                          <p className="font-sans text-sm text-darkbrown opacity-80">
                            {speaker.segmentCount} {speaker.segmentCount === 1 ? 'segment' : 'segments'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-sans text-xl font-bold text-clay">
                          {speaker.percentage}%
                        </p>
                        <p className="font-sans text-sm text-darkbrown opacity-80">
                          {formatDuration(speaker.duration)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Duration */}
                <div className="mt-6 pt-4 border-t-2 border-clay border-opacity-20">
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-xl font-semibold text-darkbrown">
                      Total Duration
                    </p>
                    <p className="font-sans text-xl font-bold text-clay">
                      {formatDuration(stats.totalDuration)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-cream border-t-2 border-clay border-opacity-20 px-8 py-4 rounded-b-3xl">
          <button
            onClick={onClose}
            className="btn btn-primary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpeakerReportModal;

