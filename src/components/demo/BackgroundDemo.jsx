import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardFooter, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase,
  Settings,
  Palette,
  Activity
} from 'lucide-react';

/**
 * Demo component showcasing the animated background with various card types
 */
const BackgroundDemo = () => {
  const [selectedDensity, setSelectedDensity] = useState('medium');
  const [selectedSpeed, setSelectedSpeed] = useState('normal');
  const [selectedIntensity, setSelectedIntensity] = useState('subtle');

  const jobCards = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Vietnam",
      location: "Ho Chi Minh City",
      salary: "$2000 - $3000",
      type: "Full-time",
      posted: "2 days ago",
      skills: ["React", "TypeScript", "Tailwind CSS"],
      rating: 4.8
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Design Studio",
      location: "Hanoi",
      salary: "$1500 - $2500",
      type: "Remote",
      posted: "1 day ago",
      skills: ["Figma", "Adobe XD", "Prototyping"],
      rating: 4.9
    },
    {
      id: 3,
      title: "Backend Engineer",
      company: "StartupXYZ",
      location: "Da Nang",
      salary: "$1800 - $2800",
      type: "Hybrid",
      posted: "3 days ago",
      skills: ["Node.js", "MongoDB", "AWS"],
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient-primary">
            Animated Background Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the new animated background with noise particles and subtle gradients. 
            Cards are enhanced with backdrop blur effects for better visual separation.
          </p>
        </div>

        {/* Controls Section */}
        <EnhancedCard className="max-w-4xl mx-auto">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Background Controls
            </EnhancedCardTitle>
            <EnhancedCardDescription>
              Adjust the animated background settings to see different effects
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Particle Density</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((density) => (
                    <Button
                      key={density}
                      variant={selectedDensity === density ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDensity(density)}
                      className="capitalize"
                    >
                      {density}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Animation Speed</label>
                <div className="flex gap-2">
                  {['slow', 'normal', 'fast'].map((speed) => (
                    <Button
                      key={speed}
                      variant={selectedSpeed === speed ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSpeed(speed)}
                      className="capitalize"
                    >
                      {speed}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Gradient Intensity</label>
                <div className="flex gap-2">
                  {['subtle', 'medium', 'strong'].map((intensity) => (
                    <Button
                      key={intensity}
                      variant={selectedIntensity === intensity ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedIntensity(intensity)}
                      className="capitalize"
                    >
                      {intensity}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Card Comparison Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Standard Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Standard Cards</h2>
            <div className="space-y-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                  <CardDescription>
                    This is a regular card without background enhancements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Standard cards may not have optimal contrast against the animated background.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Enhanced Cards</h2>
            <div className="space-y-4">
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Enhanced Card</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Enhanced cards with backdrop blur and better contrast
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm text-muted-foreground">
                    Enhanced cards provide better visual separation from the animated background.
                  </p>
                </EnhancedCardContent>
              </EnhancedCard>

              <EnhancedCard variant="glass">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Glass Variant</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Glass morphism effect with subtle transparency
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm text-muted-foreground">
                    The glass variant creates a modern, translucent appearance.
                  </p>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </div>
        </div>

        {/* Job Cards Demo */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Job Cards Example</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCards.map((job) => (
              <EnhancedCard key={job.id} variant="interactive">
                <EnhancedCardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <EnhancedCardTitle className="text-lg">{job.title}</EnhancedCardTitle>
                      <EnhancedCardDescription className="font-medium text-primary">
                        {job.company}
                      </EnhancedCardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{job.rating}</span>
                    </div>
                  </div>
                </EnhancedCardHeader>
                
                <EnhancedCardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {job.posted}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {job.type}
                  </Badge>
                </EnhancedCardContent>
                
                <EnhancedCardFooter>
                  <Button className="w-full btn-gradient">
                    Apply Now
                  </Button>
                </EnhancedCardFooter>
              </EnhancedCard>
            ))}
          </div>
        </div>

        {/* Performance Info */}
        <EnhancedCard className="max-w-2xl mx-auto">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Features
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Automatic performance monitoring and adjustment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Respects reduced motion preferences</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Responsive particle density based on screen size</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Automatic pause when tab is not visible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Theme-aware particle colors</span>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default BackgroundDemo;