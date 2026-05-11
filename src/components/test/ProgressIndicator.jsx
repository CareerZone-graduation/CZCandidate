const ProgressIndicator = ({ total, answered, currentIndex, onJump }) => {
  const answeredCount = answered.size;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Tổng quan bài làm</span>
        <span className="text-slate-500">
          <span className={`font-semibold ${answeredCount === total ? 'text-emerald-600' : 'text-blue-600'}`}>
            {answeredCount}
          </span>
          <span className="text-slate-400"> / {total} câu đã trả lời</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${answeredCount === total ? 'bg-emerald-500' : 'bg-blue-500'}`}
          style={{ width: `${(answeredCount / total) * 100}%` }}
        />
      </div>

      {/* Grid of question buttons */}
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const isAnswered = answered.has(i);
          const isCurrent = i === currentIndex;
          return (
            <button
              key={i}
              title={isAnswered ? 'Đã trả lời' : 'Chưa trả lời'}
              className={`w-8 h-8 rounded-md text-xs font-semibold border transition-all ${
                isCurrent
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110'
                  : isAnswered
                  ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white border-slate-300 text-slate-500 hover:border-slate-500'
              }`}
              onClick={() => onJump(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Đang làm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Đã trả lời
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block" /> Chưa trả lời
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
