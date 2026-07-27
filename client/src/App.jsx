
import Hero from './Components/Hero';
import PropertySearch from './Components/PropertySearch';
import Services from './Components/Services';
import AISection from './Components/AISection';
import FeaturedProperties from './Components/FeaturedProperties';
import Categories from './Components/Categories';

const App = () => {
  return (
    <div>
      <Hero />
      <PropertySearch />
       <Categories/>
      <Services/>
      <AISection/>
      <FeaturedProperties/>
     
    </div>
  );
};

export default App;