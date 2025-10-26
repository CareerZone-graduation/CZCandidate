import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BasicInfoSection } from '@/components/profile/BasicInfoSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { ProfileCompletenessCard } from '@/components/profile/ProfileCompletenessCard';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { ProfileCompletenessTest } from '@/components/profile/ProfileCompletenessTest';
import * as profileService from '@/services/profileService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch profile data
  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const response = await profileService.getMyProfile();
      console.log('Profile data:', response.data);
      console.log('Profile completeness:', response.data?.profileCompleteness);
      return response.data;
    },
    enabled: isAuthenticated
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updateData) => profileService.updateProfile(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    }
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (formData) => profileService.uploadAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    }
  });



  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = error.response?.data?.message || error.message;
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-destructive mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Có lỗi xảy ra</h3>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
                <Button onClick={() => refetch()} size="lg">
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Completion Banner */}
          <ProfileCompletionBanner 
            profileCompleteness={profile?.profileCompleteness}
            profile={profile}
          />

          {/* Basic Info Section */}
          <BasicInfoSection
            profile={profile}
            onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
            onAvatarUpdate={(formData) => uploadAvatarMutation.mutateAsync(formData)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Experience & Education */}
            <div className="lg:col-span-2 space-y-6">
              <ExperienceSection
                experiences={profile?.experiences || []}
                onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
              />

              <EducationSection
                educations={profile?.educations || []}
                onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
              />
            </div>

            {/* Right Column - Completeness & Skills */}
            <div className="space-y-6">
              {/* TEST Component - Remove after debugging */}
              <ProfileCompletenessTest profile={profile} />
              
              {/* Profile Completeness Card */}
              <ProfileCompletenessCard 
                profileCompleteness={profile?.profileCompleteness}
                profile={profile}
              />

              <SkillsSection
                skills={profile?.skills || []}
                onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
