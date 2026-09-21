import { Link } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import Logo3 from '../assets/IMAGEEEEEEEEEEEEEEEEEEEE.png';

const Navbar = () => {
  return (
    <nav className="w-full bg-transparent py-2 z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-1 w-full flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/">
          <img src={Logo3} alt="Property Care Pakistan" className="h-12 md:h-16 object-contain" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-8 text-xs font-bold text-black tracking-wider uppercase">
        <div className="relative py-1">
          <Link to="/" className="hover:text-[#063B29] transition-colors">HOME</Link>
          <span className="absolute bottom-0 left-0 w-full h-[2px] "></span>
        </div>
        <Link to="/about" className="cursor-pointer text-black hover:text-[#063B29] transition-colors">ABOUT US</Link>
        <Link to="/services" className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors">
          <span>SERVICES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </Link>
        <Link to="/properties" className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors">
          <span>PROPERTIES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </Link>
        <Link to="/resources" className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors">
          <span>RESOURCES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </Link>
        <Link to="/contact" className="cursor-pointer text-black hover:text-[#063B29] transition-colors">CONTACT US</Link>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center space-x-6">
        <Search className="w-4.5 h-4.5 text-[#063B29] cursor-pointer stroke-[2.5]" />
        <Link to="/login" className="bg-[#063B29] text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-md uppercase">
          LOGIN / SIGN UP
        </Link>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
