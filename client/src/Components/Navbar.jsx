
import { Search, ChevronDown } from 'lucide-react';
import logoImg from '../assets/Logo.png';

const Navbar = () => {
  return (
    <nav className="w-full bg-transparent py-4 px-8 md:px-12 flex items-center justify-between z-20 relative">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logoImg} alt="Property Care Pakistan" className="h-12 md:h-20 object-contain" />
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-8 text-xs font-bold text-black tracking-wider uppercase">
        <div className="relative py-1">
          <a href="#" className="hover:text-[#063B29] transition-colors">HOME</a>
          <span className="absolute bottom-0 left-0 w-full h-[2px] "></span>
        </div>
        <div className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors">
          <span>SERVICES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </div>
        <div className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors">
          <span>PROPERTIES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </div>
        <a href="#" className="cursor-pointer text-black hover:text-[#063B29] transition-colors">ABOUT US</a>
        <div className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors">
          <span>RESOURCES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </div>
        <a href="#" className="cursor-pointer text-black hover:text-[#063B29] transition-colors">CONTACT US</a>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center space-x-6">
        <Search className="w-4.5 h-4.5 text-[#063B29] cursor-pointer stroke-[2.5]" />
        <button className="bg-[#063B29] text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-md uppercase">
          LOGIN / SIGN UP
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
