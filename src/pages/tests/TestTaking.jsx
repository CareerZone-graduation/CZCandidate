import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as service from '@/services/testAssignmentService';
import TestTimer from '@/components/test/TestTimer';
import QuestionCard from '@/components/test/QuestionCard';
import ProgressIndicator from '@/components/test/ProgressIndicator';

const TestTaking = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignment = useCallback(async () => {
    try {
      const res = await service.getAssignment(assignmentId);
      const data = res.data?.data;
      setAssignment(data);

      const mapped = {};
      (data.answers || []).forEach((a) => { mapped[a.questionId] = a; });
      setAnswers(mapped);

      const durationSec = (data.test?.duration || 0) * 60;
      setTimeLeft(durationSec);

      if (data.status === 'PENDING') {
        await service.startAssignment(assignmentId);
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === 'Bài test đã được nộp') {
        navigate(`/tests/${assignmentId}/result`, { replace: true });
      } else {
        toast.error(msg || 'Không thể tải bài test');
        navigate('/dashboard');
      }
    }
  }, [assignmentId, navigate]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  // Đếm ngược thời gian
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save mỗi 10 giây
  useEffect(() => {
    if (!assignment) return;
    const saveTimer = setInterval(async () => {
      const currentQuestion = assignment.test.questions[index];
      const current = answers[currentQuestion?._id];
      if (!currentQuestion || !current) return;
      try {
        await service.saveAnswer(assignmentId, {
          questionId: currentQuestion._id,
          selectedOptionId: current.selectedOptionId
        });
      } catch {
        // giữ im lặng để không spam toast autosave
      }
    }, 10000);
    return () => clearInterval(saveTimer);
  }, [assignment, answers, index, assignmentId]);

  const questions = assignment?.test?.questions || [];
  const currentQuestion = questions[index];

  const answeredIndices = useMemo(() => {
    const set = new Set();
    questions.forEach((q, i) => {
      const a = answers[q._id];
      if (a?.selectedOptionId) set.add(i);
    });
    return set;
  }, [questions, answers]);

  const unansweredCount = questions.length - answeredIndices.size;
  const allAnswered = unansweredCount === 0;

  const updateAnswer = (patch) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        questionId: currentQuestion._id,
        ...prev[currentQuestion._id],
        ...patch,
      },
    }));
  };

  const handleSubmit = useCallback(async (isTimeout = false) => {
    if (submitting) return;

    // Validate: phải trả lời hết câu hỏi (trừ khi hết giờ tự động nộp)
    if (!isTimeout && !allAnswered) {
      // Tìm câu chưa trả lời đầu tiên để nhảy đến
      const firstUnanswered = questions.findIndex((q) => !answers[q._id]?.selectedOptionId);
      toast.warning(`Bạn còn ${unansweredCount} câu chưa trả lời. Vui lòng hoàn thành tất cả các câu trước khi nộp bài.`);
      if (firstUnanswered !== -1) setIndex(firstUnanswered);
      return;
    }

    const confirm = window.confirm(
      isTimeout
        ? 'Hết giờ! Bài làm của bạn sẽ được nộp tự động.'
        : `Bạn chắc chắn muốn nộp bài? ${allAnswered ? 'Bạn đã trả lời đầy đủ tất cả các câu.' : ''}`
    );
    if (!confirm) return;

    setSubmitting(true);
    try {
      // Gửi tất cả câu trả lời trong 1 request duy nhất
      const allAnswers = questions
        .map((q) => answers[q._id])
        .filter((a) => a?.selectedOptionId)
        .map((a) => ({ questionId: a.questionId, selectedOptionId: a.selectedOptionId }));

      const spent = (assignment.test.duration * 60) - Math.max(timeLeft, 0);
      await service.submitAssignment(assignmentId, { timeSpent: spent, answers: allAnswers });
      toast.success('Nộp bài thành công!');
      navigate(`/tests/${assignmentId}/result`);
    } catch {
      toast.error('Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }, [assignment, answers, allAnswered, unansweredCount, assignmentId, navigate, questions, submitting, timeLeft]);

  const handleTimeout = useCallback(() => {
    if (submitting) return;
    handleSubmit(true);
  }, [handleSubmit, submitting]);

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar cố định */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-800 truncate max-w-xs">{assignment.test.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Điểm qua: <span className="font-medium text-slate-700">{assignment.test.passingScore}</span>
              {' / '}Tổng điểm: <span className="font-medium text-slate-700">{assignment.test.totalScore}</span>
            </p>
          </div>
          <TestTimer seconds={timeLeft} onTimeout={handleTimeout} />
        </div>
      </header>

      {/* Nội dung chính */}
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {/* Bảng điều hướng câu hỏi */}
        <ProgressIndicator
          total={questions.length}
          answered={answeredIndices}
          currentIndex={index}
          onJump={setIndex}
        />

        {/* Thẻ câu hỏi */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion._id]}
            index={index}
            total={questions.length}
            onAnswerChange={updateAnswer}
          />
        )}

        {/* Điều hướng + nộp bài */}
        <div className="flex items-center justify-between gap-3">
          {/* Nút Câu trước */}
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            ← Câu trước
          </button>

          {/* Cảnh báo câu chưa trả lời */}
          {!allAnswered && (
            <p className="text-xs text-amber-600 font-medium text-center flex-1">
              Còn {unansweredCount} câu chưa trả lời
            </p>
          )}

          <div className="flex gap-2">
            {/* Nút Câu tiếp */}
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={index === questions.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Câu tiếp →
            </button>

            {/* Nút Nộp bài */}
            <button
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${allAnswered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-700 hover:bg-slate-800 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang nộp...
                </>
              ) : (
                <>
                  {allAnswered ? '✓' : ''} Nộp bài
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestTaking;
