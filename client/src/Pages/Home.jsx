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
  return (
    <div>
      <Hero />
      <PropertySearch />
      <FeaturedProperties />
       <AISection />
      <Categories />
      <Services />
      <HowItWorks />
      <WhyChooseUs />
      <Footer />
    </div>
  );
};

export default Home;
