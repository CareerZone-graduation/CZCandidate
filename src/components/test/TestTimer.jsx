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

  return (
    <div className="px-3 py-2 rounded-lg border bg-white font-semibold text-sm">
      {format(Math.max(seconds, 0))}
    </div>
  );
};

export default TestTimer;
