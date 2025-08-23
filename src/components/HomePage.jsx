import { useState } from 'react'
import Header from './layout/Header'
import HeroSection from './sections/HeroSection'
import StatsSection from './sections/StatsSection'
import PopularCategories from './sections/PopularCategories'
import FeaturedJobs from './sections/FeaturedJobs'
import TopCompanies from './sections/TopCompanies'
import Testimonials from './sections/Testimonials'
import Footer from './layout/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <PopularCategories />
      <FeaturedJobs />
      <TopCompanies />
      <Testimonials />
      <Footer />
    </div>
  )
}

export default HomePage
