import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PreferencesSection } from '@/components/profile/PreferencesSection';
import * as profileService from '@/services/profileService';
import { Briefcase } from 'lucide-react';

const WorkPreferences = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch profile data
  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const response = await profileService.getMyProfile();
      return response.data;
    },
    enabled: isAuthenticated
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences) => profileService.updateProfilePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = error.response?.data?.message || error.message;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Điều kiện làm việc
          </h1>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-destructive mb-4 bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Có lỗi xảy ra</h3>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <Button onClick={() => refetch()} size="lg">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Điều kiện làm việc
        </h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật mức lương, địa điểm và ngành nghề mong muốn để nhận gợi ý việc làm phù hợp
        </p>
      </div>

      {/* Preferences Section */}
      <PreferencesSection
        profile={profile}
        onUpdate={(data) => updatePreferencesMutation.mutateAsync(data)}
      />
    </div>
  );
};

export default WorkPreferences;
