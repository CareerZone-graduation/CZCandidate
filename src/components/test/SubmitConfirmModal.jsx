import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, FileCheck, Timer } from 'lucide-react';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const SubmitConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isTimeout,
  allAnswered,
  answeredCount,
  totalQuestions,
  timeSpentSeconds,
  submitting,
}) => {
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-lg gap-0 p-0 overflow-hidden border-slate-200 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)]"
        showCloseButton={false}
      >
        <div
          className={`relative p-6 pb-4 border-b ${
            isTimeout
              ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-100'
              : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-100'
          }`}
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-slate-900/5 to-transparent" />

          <DialogHeader className="space-y-3">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl ring-1 ring-black/5 shadow-sm ${
                isTimeout
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isTimeout ? (
                <Clock className="w-6 h-6" />
              ) : (
                <FileCheck className="w-6 h-6" />
              )}
            </div>

            <DialogTitle className="text-xl">
              {isTimeout ? 'Hết giờ làm bài!' : 'Xác nhận nộp bài'}
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500 leading-relaxed">
              {isTimeout
                ? 'Thời gian làm bài đã kết thúc. Bài làm của bạn sẽ được nộp tự động.'
                : allAnswered
                  ? 'Bạn đã hoàn thành tất cả các câu hỏi. Bạn có chắc chắn muốn nộp bài?'
                  : `Bạn còn ${unansweredCount} câu chưa trả lời. Sau khi nộp, bạn không thể tiếp tục làm bài.`
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Đã trả lời</p>
              <p className="mt-1 font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {answeredCount}/{totalQuestions}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Còn lại</p>
              <p className="mt-1 font-semibold text-slate-800">{unansweredCount} câu</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Đã làm</p>
              <p className="mt-1 font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-slate-500" />
                {formatTime(timeSpentSeconds)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Tiến độ hoàn thành</span>
              <span className="text-slate-700 font-semibold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allAnswered ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!allAnswered && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Còn <strong>{unansweredCount}</strong> câu chưa được trả lời.
                {isTimeout ? ' Hệ thống sẽ chỉ chấm điểm các câu đã trả lời.' : ''}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-5 sm:justify-between gap-2 border-t border-slate-100 pt-4">
          {!isTimeout && (
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Tiếp tục làm bài
            </Button>
          )}
          <Button
            variant={isTimeout ? 'default' : 'gradient'}
            onClick={onConfirm}
            disabled={submitting}
            className={isTimeout ? 'bg-amber-600 hover:bg-amber-700 shadow-sm hover:shadow-md' : ''}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang nộp...
              </>
            ) : (
              isTimeout ? 'Nộp bài tự động' : 'Xác nhận nộp bài'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
