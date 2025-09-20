import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

/**
 * @param {{
 *  message?: string;
 *  actionText?: string;
 *  onAction?: () => void;
 * }} props
 */
export const EmptyState = ({ message = 'Không tìm thấy dữ liệu.', actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Không có gì ở đây</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{message}</p>
      {onAction && actionText && (
        <Button onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};