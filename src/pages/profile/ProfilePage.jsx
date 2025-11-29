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
import { CertificatesSection } from '@/components/profile/CertificatesSection';
import { ProjectsSection } from '@/components/profile/ProjectsSection';
import { ProfileCompletenessCard } from '@/components/profile/ProfileCompletenessCard';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { CategoryUpdatePrompt } from '@/components/profile/CategoryUpdatePrompt';
import * as profileService from '@/services/profileService';
import { User } from 'lucide-react';

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
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
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
            <User className="h-6 w-6 text-primary" />
            Hồ sơ cá nhân
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
          <User className="h-6 w-6 text-primary" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin cá nhân, kinh nghiệm và học vấn của bạn
        </p>
      </div>

      {/* Top Alerts/Banners */}
      <div className="space-y-4">
        <ProfileCompletionBanner
          profileCompleteness={profile?.profileCompleteness}
          profile={profile}
        />
        <CategoryUpdatePrompt profile={profile} />
      </div>

      {/* Header Section (Basic Info) */}
      <BasicInfoSection
        profile={profile}
        onUpdate={(data) => updateProfileMutation.mutateAsync(data)}
        onAvatarUpdate={(formData) => uploadAvatarMutation.mutateAsync(formData)}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 space-y-6">
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
  );
};

export default ProfilePage;
