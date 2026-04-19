const QuestionCard = ({ question, answer, onAnswerChange }) => {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <h2 className="font-medium">{question.question}</h2>
      <p className="text-xs text-slate-500">Điểm: {question.score}</p>

      <div className="space-y-2">
        {(question.options || []).map((opt) => (
          <label key={opt._id} className="flex items-center gap-2">
            <input
              type="radio"
              checked={answer?.selectedOptionId === opt._id}
              onChange={() => onAnswerChange({ selectedOptionId: opt._id })}
            />
            <span>{opt.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
