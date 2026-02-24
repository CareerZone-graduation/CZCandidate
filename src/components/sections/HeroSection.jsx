import { Search, MapPin, Sparkles, TrendingUp, Users, Building2, ChevronRight, Briefcase, UserCheck } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import HomeSearchAutocomplete from "../common/HomeSearchAutocomplete";

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const autocompleteRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleHeroSearch = (query) => {
    const searchParams = new URLSearchParams();
    searchParams.set('query', query);
    searchParams.set('page', '1');
    searchParams.set('size', '10');

    if (location.trim()) {
      searchParams.set('province', location.trim());
    }

    navigate(`/jobs/search?${searchParams.toString()}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const currentQuery = autocompleteRef.current?.getValue();
    if (currentQuery?.trim()) {
      handleHeroSearch(currentQuery.trim());
    }
  };

  // Stats data
  const stats = [
    { icon: Building2, value: "10,000+", label: "Công ty đối tác" },
    { icon: Users, value: "500,000+", label: "Ứng viên tin tưởng" },
    { icon: TrendingUp, value: "50,000+", label: "Việc làm mới/tháng" },
  ];

  return (
    <section className="hero-section relative flex items-start justify-center -mt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden hero-bg-gradient">
        {/* Animated gradient orbs */}
        <div
          className="hero-orb hero-orb-1"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        />
        <div
          className="hero-orb hero-orb-2"
          style={{
            transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`
          }}
        />
        <div
          className="hero-orb hero-orb-3"
          style={{
            transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * -0.4}px)`
          }}
        />

        {/* Floating particles */}
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="hero-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 hero-grid-pattern opacity-[0.03] dark:opacity-[0.02]" />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">


          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => window.open(import.meta.env.VITE_RECRUITER_FE_URL || 'http://localhost:4000/', '_blank')}
              className="hero-action-btn hero-action-btn--outline"
            >
              <Briefcase className="w-4 h-4" />
              <span>Đăng tuyển</span>
            </button>
            <button
              className="hero-action-btn hero-action-btn--solid"
            >
              <UserCheck className="w-4 h-4" />
              <span>Ứng tuyển</span>
            </button>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-10 space-y-3">
            <h1 className="hero-title">
              <span className="block hero-title-shimmer">
                Tìm kiếm công việc
              </span>
              <span className="hero-title-gradient">
                định hình tương lai của bạn
              </span>
            </h1>
          </div>

          {/* Search Box */}
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



        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
