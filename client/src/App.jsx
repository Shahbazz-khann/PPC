
import Hero from './Components/Hero';
import PropertySearch from './Components/PropertySearch';
import Services from './Components/Services';
import AISection from './Components/AISection';
import FeaturedProperties from './Components/FeaturedProperties';
import Categories from './Components/Categories';
import HowItWorks from './Components/HowItWorks';
import WhyChooseUs from './Components/WhyChooseUs';
import Footer from './Components/Footer';

const App = () => {
  return (
    <div>
      <Hero />
      <PropertySearch />
       <Categories/>
      <Services/>
      <AISection/>
      <FeaturedProperties/>
      <HowItWorks/>
      <WhyChooseUs/>
      <Footer/>
     
    </div>
  );
};

export default App;