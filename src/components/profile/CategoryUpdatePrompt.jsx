import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Layers, Sparkles } from 'lucide-react';

/**
 * Banner to prompt existing users without categories to update their preferences
 * Shows when user has completed profile but no categories selected
 */
export const CategoryUpdatePrompt = ({ profile, onDismiss }) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user has categories or if dismissed
  if (isDismissed || profile?.preferredCategories?.length > 0) {
    return null;
  }

  // Only show for users with some profile data (not brand new users)
  const hasProfileData = profile?.skills?.length > 0 || 
                         profile?.experiences?.length > 0 || 
                         profile?.educations?.length > 0;

  if (!hasProfileData) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleUpdateClick = () => {
    // Scroll to preferences section on profile page
    const preferencesSection = document.querySelector('[data-section="preferences"]');
    if (preferencesSection) {
      preferencesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Alert className="relative border-primary/50 bg-primary/5 mb-6">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4" />
            Cập nhật ngành nghề để nhận gợi ý việc làm phù hợp hơn!
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground mb-3">
            Chúng tôi đã thêm tính năng mới giúp bạn nhận được các gợi ý việc làm chính xác hơn. 
            Hãy cập nhật ngành nghề bạn quan tâm trong phần "Điều kiện làm việc" để tận dụng tối đa tính năng này.
          </AlertDescription>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleUpdateClick}
              className="h-8"
            >
              Cập nhật ngay
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDismiss}
              className="h-8"
            >
              Để sau
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full absolute top-3 right-3"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
