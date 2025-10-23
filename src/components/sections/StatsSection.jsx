import { TrendingUp, Users, Building2, Briefcase } from 'lucide-react';

const stats = [
  {
    icon: <Briefcase className="h-8 w-8" />,
    value: '10,000+',
    label: 'Việc làm đang tuyển',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: <Building2 className="h-8 w-8" />,
    value: '5,000+',
    label: 'Công ty uy tín',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <Users className="h-8 w-8" />,
    value: '50,000+',
    label: 'Ứng viên đã tìm việc',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    value: '95%',
    label: 'Tỷ lệ hài lòng',
    color: 'from-orange-500 to-red-500'
  }
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center group cursor-pointer"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
