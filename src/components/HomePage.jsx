import HeroSection from './sections/HeroSection';
import PopularCategories from './sections/PopularCategories';
import FeaturedJobs from './sections/FeaturedJobs';
import TopCompanies from './sections/TopCompanies';
import Testimonials from './sections/Testimonials';
import JobSearchSection from './sections/JobSearchSection';
import JobCategoriesSection from './sections/JobCategoriesSection';
import CareerGuideSection from './sections/CareerGuideSection';
import NewsletterSection from './sections/NewsletterSection';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-full">
      <HeroSection />
      <JobSearchSection />
      <PopularCategories />
      <FeaturedJobs />
      <JobCategoriesSection />
      <TopCompanies />
      <CareerGuideSection />
      <Testimonials />
      <NewsletterSection />
    </div>
  );
};

export default HomePage
