import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { SectionHeader } from '../common/SectionHeader';

// COMMENT: Dữ liệu mẫu, giữ nguyên
const jobs = [
  // ... (giữ nguyên dữ liệu mẫu)
];

const FeaturedJobs = () => {
  return (
    // REPLACED: Section với màu nền muted, tạo sự tương phản
    <section className="py-20 bg-green-50/50">
      <div className="container">
        <SectionHeader 
          badgeText="⭐ Việc làm nổi bật"
          title={<>Cơ hội nghề nghiệp <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">hàng đầu</span></>}
          description="Khám phá những vị trí chất lượng từ các công ty uy tín, với mức lương hấp dẫn và môi trường chuyên nghiệp."
        />

        {/* REPLACED: Jobs Grid với layout responsive và style card mới */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {jobs.slice(0, 6).map((job) => (
            <Card key={job.id} className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-background">
              {job.featured && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-green-600 text-white px-3 py-1 shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" /> Nổi bật
                  </Badge>
                </div>
              )}
              
              <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-4">
                <Avatar className="h-14 w-14 rounded-xl border-2 border-green-200">
                  <AvatarImage src={job.logo} alt={job.company} />
                  <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 text-lg font-bold rounded-xl">{job.company.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-green-700 transition-colors">{job.title}</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium">{job.company}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50">
                  <Heart className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" /> 
                    <span className="font-medium truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-2 text-success flex-shrink-0" /> 
                    <span className="truncate">{job.salary}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" /> 
                    <span>{job.posted}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" /> 
                    <span className="font-medium truncate">{job.type}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="font-normal text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-3 flex justify-end items-center bg-transparent">
                <Button variant="ghost" className="p-0 h-auto font-semibold text-green-700 group-hover:translate-x-1 transition-all duration-300 hover:text-green-800">
                  Xem chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="px-8 py-3 border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg">
            Xem tất cả việc làm
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
