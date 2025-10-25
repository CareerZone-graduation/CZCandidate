// Test component để verify profileCompleteness display
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const ProfileCompletenessTest = ({ profile }) => {
  console.log('=== ProfileCompletenessTest ===');
  console.log('Full profile:', profile);
  console.log('profileCompleteness:', profile?.profileCompleteness);
  
  // If no profile completeness, show mock data
  const mockData = {
    hasBasicInfo: true,
    hasSkills: true,
    hasCV: false,
    hasExperience: false,
    hasEducation: false,
    percentage: 55
  };

  const data = profile?.profileCompleteness || mockData;
  const isMock = !profile?.profileCompleteness;

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="text-lg">
          {isMock ? '⚠️ TEST: Profile Completeness (Mock Data)' : '✓ Profile Completeness'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-600 mb-2">
            {data.percentage}%
          </div>
          <Progress value={data.percentage} className="h-3" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Has Basic Info:</span>
            <span className="font-bold">{data.hasBasicInfo ? '✓' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Has Skills (≥3):</span>
            <span className="font-bold">{data.hasSkills ? '✓' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Has CV:</span>
            <span className="font-bold">{data.hasCV ? '✓' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Has Experience:</span>
            <span className="font-bold">{data.hasExperience ? '✓' : '✗'}</span>
          </div>
          <div className="flex justify-between">
            <span>Has Education:</span>
            <span className="font-bold">{data.hasEducation ? '✓' : '✗'}</span>
          </div>
        </div>

        {isMock && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>⚠️ Using mock data!</strong><br/>
              Backend không trả về profileCompleteness.<br/>
              Check console logs để debug.
            </p>
          </div>
        )}

        {!isMock && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded border border-emerald-200">
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              <strong>✓ Backend data OK!</strong><br/>
              profileCompleteness đang hoạt động.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
