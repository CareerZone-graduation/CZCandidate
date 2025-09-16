import { Search, Briefcase } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const HeroSection = () => {
  return (
    // Professional Hero Section với thiết kế clean và hiện đại
    <section className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 h-screen flex items-center justify-center text-white -mt-16">
      {/* Clean background overlay */}
      <div className="absolute inset-0 bg-black/5"></div>
      
      <div className="container relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Tiêu đề chính - Professional typography */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
            Tìm kiếm cơ hội nghề nghiệp,
            <br />
            <span className="text-green-100 font-light">định hình tương lai</span>
          </h1>
          
          {/* Mô tả - Clean và súc tích */}
          <p className="text-xl text-green-50 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            Khám phá hàng ngàn cơ hội việc làm chất lượng từ các công ty hàng đầu. 
            Tìm công việc phù hợp với kỹ năng và đam mê của bạn ngay hôm nay.
          </p>
          
          {/* Professional Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Job Title Input */}
              <div className="relative md:col-span-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Vị trí công việc, kỹ năng, công ty..."
                  className="h-14 pl-12 text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white rounded-xl"
                />
              </div>
              
              {/* Location Input */}
              <div className="relative md:col-span-3">
                <Input
                  type="text"
                  placeholder="Địa điểm"
                  className="h-14 text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white rounded-xl"
                />
              </div>
              
              {/* Search Button */}
              <Button 
                size="lg" 
                className="h-14 md:col-span-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm việc làm
              </Button>
            </div>
            
            {/* Popular searches - Clean design */}
            <div className="mt-6 text-center">
              <span className="text-gray-600 text-sm font-medium mr-4">Tìm kiếm phổ biến:</span>
              <div className="inline-flex flex-wrap gap-2 mt-2">
                {['Frontend', 'Marketing', 'Data Science', 'UI/UX', 'Project Manager'].map((term, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-green-50 hover:text-green-700 rounded-full transition-colors duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
