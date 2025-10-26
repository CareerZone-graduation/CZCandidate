import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

export const SkipConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  skipType = 'step',
  currentStep 
}) => {
  const getImpactMessage = () => {
    if (skipType === 'all') {
      return {
        title: 'Bỏ qua hoàn thiện hồ sơ?',
        description: 'Nếu bỏ qua, bạn sẽ không nhận được gợi ý việc làm phù hợp. Hồ sơ chưa hoàn thiện có thể ảnh hưởng đến cơ hội tìm việc của bạn.',
        impacts: [
          'Không nhận được gợi ý việc làm cá nhân hóa',
          'Nhà tuyển dụng khó tìm thấy hồ sơ của bạn',
          'Giảm khả năng được mời phỏng vấn'
        ]
      };
    }

    // Step-specific impacts
    const stepImpacts = {
      'Thông tin cơ bản': [
        'Nhà tuyển dụng không thể liên hệ với bạn',
        'Hồ sơ thiếu thông tin cơ bản'
      ],
      'Kỹ năng & Kinh nghiệm': [
        'Không thể gợi ý việc làm phù hợp với kỹ năng',
        'Giảm độ chính xác của gợi ý việc làm'
      ],
      'Mức lương & Điều kiện': [
        'Có thể nhận gợi ý việc làm không phù hợp với mong muốn',
        'Khó lọc công việc theo điều kiện mong muốn'
      ]
    };

    return {
      title: `Bỏ qua bước "${currentStep}"?`,
      description: 'Bạn có thể hoàn thiện thông tin này sau, nhưng điều này có thể ảnh hưởng đến trải nghiệm của bạn.',
      impacts: stepImpacts[currentStep] || ['Giảm chất lượng gợi ý việc làm']
    };
  };

  const { title, description, impacts } = getImpactMessage();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>{description}</p>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="font-medium text-amber-900 dark:text-amber-100 text-sm mb-2">
                Tác động:
              </p>
              <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                {impacts.map((impact, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{impact}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Bạn có thể quay lại hoàn thiện hồ sơ bất cứ lúc nào từ trang cá nhân.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Tiếp tục hoàn thiện
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Bỏ qua
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
