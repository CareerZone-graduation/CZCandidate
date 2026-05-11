const QuestionCard = ({ question, answer, index, total, onAnswerChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
            Câu {index + 1} / {total}
          </p>
          <h2 className="text-base font-semibold text-slate-800 leading-relaxed">
            {question.question}
          </h2>
        </div>
        <span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2.5 py-1">
          {question.score} điểm
        </span>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {(question.options || []).map((opt, i) => {
          const isSelected = answer?.selectedOptionId === opt._id;
          const labels = ['A', 'B', 'C', 'D'];
          return (
            <label
              key={opt._id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={isSelected}
                onChange={() => onAnswerChange({ selectedOptionId: opt._id })}
              />
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  isSelected
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-slate-300 text-slate-500'
                }`}
              >
                {labels[i] || i + 1}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
