import HeroSection from './sections/HeroSection';
import PopularCategories from './sections/PopularCategories';
import TopCompanies from './sections/TopCompanies';
import Testimonials from './sections/Testimonials';
import CareerGuideSection from './sections/CareerGuideSection';
import NewsletterSection from './sections/NewsletterSection';
import NewsletterBanner from './sections/NewsletterBanner';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-full">
      <HeroSection />
      <PopularCategories />
      <TopCompanies />
      <NewsletterBanner />
      <CareerGuideSection />
      <Testimonials />
      <NewsletterSection />
    </div>
  );
};

export default HomePage
