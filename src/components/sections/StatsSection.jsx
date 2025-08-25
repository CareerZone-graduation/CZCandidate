import { Briefcase, Building, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const stats = [
  {
    number: '10,000+',
    label: 'Việc làm',
    icon: <Briefcase className="h-8 w-8 text-primary" />,
  },
  {
    number: '5,000+',
    label: 'Công ty',
    icon: <Building className="h-8 w-8 text-primary" />,
  },
  {
    number: '50,000+',
    label: 'Ứng viên',
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    number: '95%',
    label: 'Tỷ lệ thành công',
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Những con số <span className="text-gradient-primary">ấn tượng</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            CareerZone đã kết nối thành công hàng ngàn ứng viên với các cơ hội việc làm tuyệt vời.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-background group hover:-translate-y-1">
              <CardHeader>
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-gradient-primary transition-all duration-300">
                  <div className="group-hover:text-primary-foreground transition-colors duration-300">
                    {stat.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {stat.number}
                </CardTitle>
                <p className="text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
