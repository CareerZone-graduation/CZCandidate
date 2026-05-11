import { useEffect } from 'react';

const format = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const TestTimer = ({ seconds, onTimeout }) => {
  useEffect(() => {
    if (seconds <= 0) onTimeout();
  }, [seconds, onTimeout]);

  const safe = Math.max(seconds, 0);
  const isWarning = safe <= 300; // 5 phút
  const isCritical = safe <= 60; // 1 phút

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-base transition-colors ${
        isCritical
          ? 'bg-red-100 border border-red-400 text-red-600'
          : isWarning
          ? 'bg-orange-100 border border-orange-400 text-orange-600'
          : 'bg-white border text-slate-700'
      }`}
    >
      <svg
        className={`w-4 h-4 ${isCritical ? 'animate-pulse' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {format(safe)}
    </div>
  );
};

export default TestTimer;
