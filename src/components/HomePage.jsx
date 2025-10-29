import HeroSection from './sections/HeroSection';
import RecommendedJobs from './sections/RecommendedJobs';
import PopularCategories from './sections/PopularCategories';
import TopCompanies from './sections/TopCompanies';
import Testimonials from './sections/Testimonials';
import CareerGuideSection from './sections/CareerGuideSection';
import NewsletterSection from './sections/NewsletterSection';
import StatsSection from './sections/StatsSection';
import HowItWorks from './sections/HowItWorks';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-full bg-background">
      <HeroSection />
      <StatsSection />
      <RecommendedJobs />
      <HowItWorks />
      <PopularCategories />
      <TopCompanies />
      <Testimonials />
      <CareerGuideSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage
