import { Search, Briefcase, User, MapPin } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import HomeSearchAutocomplete from "../common/HomeSearchAutocomplete";

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const autocompleteRef = useRef(null);

  /**
   * Handle search from hero section
   */
  const handleHeroSearch = (query) => {
    const searchParams = new URLSearchParams();
    searchParams.set('query', query);
    searchParams.set('page', '1');
    searchParams.set('size', '10');
    
    // Add location if provided
    if (location.trim()) {
      searchParams.set('province', location.trim());
    }
    
    navigate(`/jobs/search?${searchParams.toString()}`);
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const currentQuery = autocompleteRef.current?.getValue();
    if (currentQuery?.trim()) {
      handleHeroSearch(currentQuery.trim());
    }
  };
  return (
    // Professional Hero với nền gradient sáng như hình
    <section className="relative bg-gradient-to-r from-green-100 via-green-200 to-blue-200 dark:from-green-900/30 dark:via-green-800/30 dark:to-blue-900/30 h-[67vh] flex items-center justify-center -mt-16">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="container relative z-10 pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <Button
    size="lg"
    className="bg-card hover:bg-muted text-primary font-bold text-lg px-10 py-5 rounded-full shadow-2xl border-0 transform hover:scale-105 transition-all duration-300 min-w-[180px]"
    onClick={() => window.open(import.meta.env.VITE_RECRUITER_FE_URL || 'http://localhost:4000/', '_blank')}
  >
    <Briefcase className="mr-3 h-6 w-6" />
    Đăng tuyển
  </Button>

  <Button
    variant="outline"
    size="lg"
    className="bg-gradient-to-r from-green-300 via-green-400 to-blue-500 dark:from-green-600 dark:via-green-500 dark:to-blue-600 hover:opacity-90 text-white font-bold text-lg px-10 py-5 rounded-full border-2 border-white/40 dark:border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[180px] backdrop-blur-sm"
  >
    <User className="mr-3 h-6 w-6" />
    Ứng tuyển
  </Button>
</div>

         <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-gradient-primary shimmer-text">Tìm kiếm công việc</span>
              <br />
              <span className="shimmer-text-dark">định hình tương lai của bạn</span>
            </h1>

          <div className="backdrop-blur-md rounded-3xl shadow-2xl p-6 max-w-5xl mx-auto border border-border bg-card/80">
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Job Title Input with Autocomplete - Dài hơn */}
              <div className="relative lg:col-span-6">
                <HomeSearchAutocomplete
                  ref={autocompleteRef}
                  placeholder="Vị trí công việc, kỹ năng, công ty..."
                  className="w-full"
                  onSearch={handleHeroSearch}
                  inputProps={{
                    className: "h-12 pl-12 text-base border-2 border-input focus:border-primary focus:ring-4 focus:ring-primary/20 bg-background rounded-xl font-medium placeholder:text-muted-foreground text-foreground"
                  }}
                />
              </div>

              {/* Location Input - Ngắn hơn */}
              <div className="relative lg:col-span-3">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Địa điểm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 pl-12 text-base border-2 border-input focus:border-primary focus:ring-4 focus:ring-primary/20 bg-background rounded-xl font-medium placeholder:text-muted-foreground text-foreground"
                />
              </div>

              {/* Search Button - Đổi màu tương tự nút "Xem tất cả công ty" */}
              <Button
                type="submit"
                size="lg"
                className={"bg-gradient-primary text-white hover:opacity-90 h-12 w-full lg:col-span-3 rounded-xl font-semibold text-lg"}
              >
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
            </form>
          </div>
          <div className="mt-16"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
