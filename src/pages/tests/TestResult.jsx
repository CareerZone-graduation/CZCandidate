import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as service from '@/services/testAssignmentService';

const TestResult = () => {
  const { assignmentId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    service.getAssignmentResult(assignmentId)
      .then((res) => setResult(res.data?.data))
      .catch(() => toast.error('Không thể tải kết quả bài test'));
  }, [assignmentId]);

  if (!result) return <div className="p-6">Đang tải...</div>;

  const answersMap = new Map((result.answers || []).map((a) => [a.questionId, a]));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white border rounded-lg p-6 space-y-3">
        <h1 className="text-xl font-semibold">Kết quả bài test: {result.test?.name}</h1>
        <p>Điểm: <strong>{result.result?.score}</strong> / {result.result?.totalScore}</p>
        <p>Kết quả: <strong className={result.result?.passed ? 'text-emerald-600' : 'text-red-600'}>{result.result?.passed ? 'Đạt' : 'Không đạt'}</strong></p>
        <p>Thời gian làm bài: {result.timeSpent} giây</p>
        <Link to="/dashboard/applications" className="inline-block mt-2 px-3 py-2 border rounded bg-slate-100 hover:bg-slate-200">Quay về hồ sơ ứng tuyển</Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Chi tiết bài làm</h2>
        {(result.test?.questions || []).map((q, idx) => {
          const ans = answersMap.get(q._id);
          return (
            <div key={q._id} className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <p className="font-medium">Câu {idx + 1}: {q.question}</p>
                <span className={`text-sm font-medium ${ans?.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                  {ans?.scoreEarned || 0} / {q.score} điểm
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {(q.options || []).map((opt) => {
                  const isSelected = ans?.selectedOptionId === opt._id;
                  const isCorrect = opt.isCorrect;
                  
                  let optionClass = "flex items-center gap-2 p-2 border rounded";
                  if (isCorrect) {
                    optionClass += " bg-emerald-50 border-emerald-200 text-emerald-800";
                  } else if (isSelected && !isCorrect) {
                    optionClass += " bg-red-50 border-red-200 text-red-800";
                  } else {
                    optionClass += " bg-slate-50 border-slate-200 text-slate-600";
                  }

                  return (
                    <div key={opt._id} className={optionClass}>
                      <input type="radio" disabled checked={isSelected} className="accent-current" />
                      <span className={isCorrect ? 'font-medium' : ''}>
                        {opt.text} {isCorrect && ' ✓'} {isSelected && !isCorrect && ' ✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestResult;
