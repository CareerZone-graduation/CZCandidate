import { useSelector } from 'react-redux';
import HeroSection from './sections/HeroSection';
import RecommendedJobs from './sections/RecommendedJobs';
import FeaturedJobs from './sections/FeaturedJobs';
import PopularCategories from './sections/PopularCategories';
import TopCompanies from './sections/TopCompanies';
import TrendingCompanies from './sections/TrendingCompanies';
import Testimonials from './sections/Testimonials';
import CareerGuideSection from './sections/CareerGuideSection';
import NewsletterSection from './sections/NewsletterSection';
import StatsSection from './sections/StatsSection';
import HowItWorks from './sections/HowItWorks';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <HeroSection />
      <StatsSection />
      {isAuthenticated && <RecommendedJobs />}
      <FeaturedJobs />
      <HowItWorks />
      <PopularCategories />
      <TopCompanies />
      <TrendingCompanies limit={6} showHeader={true} variant="grid" />
      <Testimonials />
      <CareerGuideSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage;
