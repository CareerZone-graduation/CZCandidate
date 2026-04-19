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
    } catch {
      toast.error('Không thể tải bài test');
      navigate('/dashboard');
    }
  }, [assignmentId, navigate]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

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
      if (!a) return;
      if (a.selectedOptionId) set.add(i);
    });
    return set;
  }, [questions, answers]);

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

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const confirm = window.confirm('Bạn chắc chắn muốn nộp bài?');
    if (!confirm) return;

    setSubmitting(true);
    try {
      for (const q of questions) {
        const a = answers[q._id];
        if (!a) continue;
        await service.saveAnswer(assignmentId, {
          questionId: q._id,
          selectedOptionId: a.selectedOptionId
        });
      }

      const spent = (assignment.test.duration * 60) - Math.max(timeLeft, 0);
      await service.submitAssignment(assignmentId, { timeSpent: spent });
      toast.success('Nộp bài thành công');
      navigate(`/tests/${assignmentId}/result`);
    } catch {
      toast.error('Không thể nộp bài');
    } finally {
      setSubmitting(false);
    }
  }, [assignment, answers, assignmentId, navigate, questions, submitting, timeLeft]);

  const handleTimeout = useCallback(() => {
    if (submitting) return;
    handleSubmit();
  }, [handleSubmit, submitting]);

  if (!assignment) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{assignment.test.name}</h1>
          <p className="text-sm text-slate-500">Điểm qua: {assignment.test.passingScore} / Tổng điểm: {assignment.test.totalScore}</p>
        </div>
        <TestTimer seconds={timeLeft} onTimeout={handleTimeout} />
      </div>

      <ProgressIndicator
        total={questions.length}
        answered={answeredIndices}
        currentIndex={index}
        onJump={setIndex}
      />

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          answer={answers[currentQuestion._id]}
          onAnswerChange={updateAnswer}
        />
      )}

      <div className="flex justify-between">
        <button className="px-3 py-2 border rounded" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>Câu trước</button>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded" disabled={index === questions.length - 1} onClick={() => setIndex((i) => i + 1)}>Câu tiếp</button>
          <button className="px-3 py-2 border rounded bg-slate-900 text-white" onClick={handleSubmit} disabled={submitting}>Nộp bài</button>
        </div>
      </div>
    </div>
  );
};

export default TestTaking;
