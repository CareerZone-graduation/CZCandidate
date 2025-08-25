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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="outline" className="text-primary mb-4">Cơ hội việc làm</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Việc làm nổi bật
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Những cơ hội việc làm tốt nhất từ các công ty hàng đầu đang tìm kiếm tài năng như bạn.
            </p>
          </div>
          <div className="flex gap-2 mt-6 md:mt-0">
            <Button variant="outline" size="lg">Tìm kiếm</Button>
            <Button size="lg">Đăng việc làm</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="group hover:border-primary hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-4">
                <Avatar className="h-12 w-12 rounded-md border">
                  <img src={job.logo} alt={job.company} />
                </Avatar>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-primary" /> {job.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" /> {job.salary}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" /> {job.posted}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <Badge variant={job.type === 'Remote' ? 'outline' : 'secondary'} className="px-3 py-1">
                  <Briefcase className="h-3 w-3 mr-1" /> 
                  {job.type}
                </Badge>
                <Button variant="ghost" className="p-0 h-auto font-medium text-primary group-hover:translate-x-1 transition-transform">
                  Chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
              
              {job.featured && (
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <Badge className="bg-primary text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1 fill-white" /> Nổi bật
                    </Badge>
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-r-8 border-transparent border-t-primary transform rotate-45 translate-x-2 -translate-y-2"></div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="min-w-[200px]">
            Xem thêm việc làm <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
