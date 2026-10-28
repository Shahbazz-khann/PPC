import { useState } from 'react';
import Hero from '../Components/Hero';
import PropertySearch from '../Components/PropertySearch';
import Categories from '../Components/Categories';
import Services from '../Components/Services';
import AISection from '../Components/AISection';
import FeaturedProperties from '../Components/FeaturedProperties';
import HowItWorks from '../Components/HowItWorks';
import WhyChooseUs from '../Components/WhyChooseUs';
import Footer from '../Components/Footer';

const Home = () => {
  const [searchFilters, setSearchFilters] = useState(null);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    const el = document.getElementById('featured-properties-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetSearch = () => {
    setSearchFilters(null);
  };

  return (
    <div>
      <Hero />
      <PropertySearch onSearch={handleSearch} onReset={handleResetSearch} />
      <FeaturedProperties filters={searchFilters} onResetFilters={handleResetSearch} />
      <AISection />
      <Services />
      <Categories />
      <HowItWorks />
      <WhyChooseUs />
      <Footer />
    </div>
  );
};

export default Home;
