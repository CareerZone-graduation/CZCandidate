import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BasicInfoSection } from '@/components/profile/BasicInfoSection';
import { PreferencesSection } from '@/components/profile/PreferencesSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { CertificatesSection } from '@/components/profile/CertificatesSection';
import { ProjectsSection } from '@/components/profile/ProjectsSection';
import { ProfileCompletenessCard } from '@/components/profile/ProfileCompletenessCard';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { CategoryUpdatePrompt } from '@/components/profile/CategoryUpdatePrompt';
import * as profileService from '@/services/profileService';
import { cn } from '@/lib/utils';

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

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences) => profileService.updateProfilePreferences(preferences),
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Banner Skeleton */}
            <Skeleton className="h-64 w-full rounded-xl" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column Skeleton */}
              <div className="lg:col-span-4 space-y-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>

              {/* Right Column Skeleton */}
              <div className="lg:col-span-8 space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto text-center py-8 shadow-lg border-destructive/20">
            <CardContent>
              <div className="text-destructive mb-4 bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Có lỗi xảy ra</h3>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Button onClick={() => refetch()} size="lg" className="w-full">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent opacity-50" />
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-6 relative z-10 max-w-7xl">
        {/* Top Alerts/Banners */}
        <div className="space-y-4 mb-8">
          <ProfileCompletionBanner
            profileCompleteness={profile?.profileCompleteness}
            profile={profile}
          />
          <CategoryUpdatePrompt profile={profile} />
        </div>

        {/* Header Section (Basic Info) */}
        <div className="mb-8">
          <BasicInfoSection
            profile={profile}
            onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
            onAvatarUpdate={(formData) => uploadAvatarMutation.mutateAsync(formData)}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar (Sticky) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <ProfileCompletenessCard
                profileCompleteness={profile?.profileCompleteness}
                profile={profile}
              />

              <SkillsSection
                skills={profile?.skills || []}
                onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
              />

              <PreferencesSection
                profile={profile}
                onUpdate={(data) => updatePreferencesMutation.mutateAsync(data)}
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 space-y-8">
            <ExperienceSection
              experiences={profile?.experiences || []}
              onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
            />

            <EducationSection
              educations={profile?.educations || []}
              onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
            />

            <ProjectsSection
              projects={profile?.projects || []}
              onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
            />

            <CertificatesSection
              certificates={profile?.certificates || []}
              onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
