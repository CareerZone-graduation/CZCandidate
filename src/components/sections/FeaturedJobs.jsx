import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Star, BookmarkIcon, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';

const jobs = [
  { 
    id: 1, 
    title: 'Senior Frontend Developer', 
    company: 'TechCorp Vietnam', 
    location: 'Hà Nội', 
    salary: '25-35 triệu', 
    type: 'Full-time', 
    logo: 'https://randomuser.me/api/portraits/men/41.jpg', 
    tags: ['ReactJS', 'TypeScript', 'Next.js'], 
    featured: true,
    posted: '2 ngày trước' 
  },
  { 
    id: 2, 
    title: 'Marketing Manager', 
    company: 'Digital Agency', 
    location: 'TP.HCM', 
    salary: '20-30 triệu', 
    type: 'Full-time', 
    logo: 'https://randomuser.me/api/portraits/women/67.jpg', 
    tags: ['Digital Marketing', 'SEO', 'Social Media'], 
    featured: false,
    posted: '3 ngày trước' 
  },
  { 
    id: 3, 
    title: 'UI/UX Designer', 
    company: 'Creative Studio', 
    location: 'Đà Nẵng', 
    salary: '15-25 triệu', 
    type: 'Full-time', 
    logo: 'https://randomuser.me/api/portraits/men/32.jpg', 
    tags: ['Figma', 'Adobe XD', 'Sketch'], 
    featured: false,
    posted: '1 ngày trước' 
  },
  { 
    id: 4, 
    title: 'Backend Developer', 
    company: 'StartupXYZ', 
    location: 'Remote', 
    salary: '22-32 triệu', 
    type: 'Remote', 
    logo: 'https://randomuser.me/api/portraits/women/44.jpg', 
    tags: ['Node.js', 'MongoDB', 'AWS'], 
    featured: true,
    posted: '5 ngày trước' 
  },
  { 
    id: 5, 
    title: 'Data Analyst', 
    company: 'BigData Corp', 
    location: 'Hà Nội', 
    salary: '18-28 triệu', 
    type: 'Full-time', 
    logo: 'https://randomuser.me/api/portraits/men/59.jpg', 
    tags: ['Python', 'SQL', 'Power BI'], 
    featured: false,
    posted: '1 tuần trước' 
  },
  { 
    id: 6, 
    title: 'Product Manager', 
    company: 'InnovateTech', 
    location: 'TP.HCM', 
    salary: '30-45 triệu', 
    type: 'Full-time', 
    logo: 'https://randomuser.me/api/portraits/women/29.jpg', 
    tags: ['Product Strategy', 'Agile', 'Analytics'], 
    featured: true,
    posted: '4 ngày trước' 
  },
];

const FeaturedJobs = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium text-primary border-primary/30 bg-background mb-4">
            ⭐ Việc làm nổi bật
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cơ hội nghề nghiệp <span className="text-gradient-primary">hàng đầu</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những vị trí việc làm chất lượng cao từ các công ty uy tín, 
            với mức lương hấp dẫn và môi trường làm việc chuyên nghiệp.
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {jobs.slice(0, 6).map((job) => (
            <Card key={job.id} className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-background">
              <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-4">
                <Avatar className="h-14 w-14 rounded-xl border-2 border-primary/10">
                  <img src={job.logo} alt={job.company} className="object-cover" />
                </Avatar>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium">{job.company}</CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-primary" /> 
                    <span className="font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2 text-success" /> 
                    <span className="font-semibold text-success">{job.salary}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-info" /> 
                    <span>{job.posted}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="font-normal text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4 flex justify-between items-center bg-muted/20">
                <Badge 
                  variant={job.type === 'Remote' ? 'outline' : 'secondary'} 
                  className={`px-3 py-1 font-medium ${job.type === 'Remote' ? 'border-info text-info' : ''}`}
                >
                  <Briefcase className="h-3 w-3 mr-1" /> 
                  {job.type}
                </Badge>
                <Button variant="ghost" className="p-0 h-auto font-semibold text-primary group-hover:translate-x-1 transition-all duration-300 hover:text-primary">
                  Chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
              
              {job.featured && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-gradient-primary text-primary-foreground px-3 py-1 shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" /> Nổi bật
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-lg">
            Xem tất cả việc làm
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
