import { Search, Briefcase, User, MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const HeroSection = () => {
  return (
    // Professional Hero với nền gradient sáng như hình
    <section className="relative bg-gradient-to-r from-green-600 via-green-500 to-blue-800 h-[67vh] flex items-center justify-center -mt-16">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      
      <div className="container relative z-10 pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white hover:bg-gray-50 text-green-600 font-bold text-lg px-10 py-5 rounded-full shadow-2xl border-0 transform hover:scale-105 transition-all duration-300 min-w-[180px]"
            >
              <Briefcase className="mr-3 h-6 w-6" />
              Đăng tuyển
            </Button>
            
            <Button 
              variant="outline"
              size="lg" 
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-lg px-10 py-5 rounded-full border-2 border-white/40 shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[180px] backdrop-blur-sm"
            >
              <User className="mr-3 h-6 w-6" />
              Ứng tuyển
            </Button>
          </div>
          
          <h1 className="text-3xl sm:text-3xl lg:text-6xl font-black mb-4 leading-tight tracking-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,.35)] text-balance">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-lime-200">
              Tìm kiếm công việc
            </span>
            <br />
            <span className="text-2xl sm:text-2xl lg:text-5xl">
              định hình tương lai của bạn
            </span>
          </h1>
          
          
          <div className="backdrop-blur-md rounded-3xl shadow-2xl p-6 max-w-5xl mx-auto border border-gray-200 bg-white/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Job Title Input - Dài hơn */}
              <div className="relative lg:col-span-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Vị trí công việc, kỹ năng, công ty..."
                  className="h-12 pl-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 bg-white rounded-xl font-medium placeholder:text-gray-400 text-gray-900"
                />
              </div>
              
              {/* Location Input - Ngắn hơn */}
              <div className="relative lg:col-span-3">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Địa điểm"
                  className="h-12 pl-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 bg-white rounded-xl font-medium placeholder:text-gray-400 text-gray-900"
                />
              </div>
              
              {/* Search Button - Đổi màu tương tự nút "Xem tất cả công ty" */}
              <Button
                size="lg"
                className="h-12 lg:col-span-3 bg-gradient-to-r from-green-600 via-green-500 to-blue-800 text-white font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
            </div>
          </div>
          <div className="mt-16"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;