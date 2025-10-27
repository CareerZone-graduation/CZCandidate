// Test component để verify profileCompleteness display
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const ProfileCompletenessTest = ({ profile }) => {
  const data = profile?.profileCompleteness;

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="text-lg">
          {'✓ Profile Completeness'}
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
      </CardContent>
    </Card>
  );
};
