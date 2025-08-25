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
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Những con số ấn tượng
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            CareerZone đã kết nối thành công hàng ngàn ứng viên với các cơ hội việc làm tuyệt vời.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
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
