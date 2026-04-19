const ProgressIndicator = ({ total, answered, currentIndex, onJump }) => {
  return (
    <div className="grid grid-cols-10 gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const isAnswered = answered.has(i);
        return (
          <button
            key={i}
            className={`h-8 rounded border text-xs ${i === currentIndex ? 'bg-slate-900 text-white' : isAnswered ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}`}
            onClick={() => onJump(i)}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;
