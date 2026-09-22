import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import Logo3 from '../assets/IMAGEEEEEEEEEEEEEEEEEEEE.png';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-transparent py-2 z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-1 w-full flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center shrink-0">
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
          <img src={Logo3} alt="Property Care Pakistan" className="h-12 md:h-16 object-contain" />
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs font-bold text-black tracking-wider uppercase shrink-0">
        <div className="relative py-1">
          <Link to="/" className="hover:text-[#063B29] transition-colors">HOME</Link>
          <span className="absolute bottom-0 left-0 w-full h-[2px] "></span>
        </div>
        <Link to="/about" className="cursor-pointer text-black hover:text-[#063B29] transition-colors whitespace-nowrap">ABOUT US</Link>
        <Link to="/services" className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors whitespace-nowrap">
          <span>SERVICES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </Link>
        <Link to="/properties" className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors whitespace-nowrap">
          <span>PROPERTIES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </Link>
        <Link to="/resources" className="flex items-center cursor-pointer text-black hover:text-[#063B29] transition-colors whitespace-nowrap">
          <span>RESOURCES</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
        </Link>
        <Link to="/contact" className="cursor-pointer text-black hover:text-[#063B29] transition-colors whitespace-nowrap">CONTACT US</Link>
      </div>

      {/* Desktop Right Action Items */}
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6 shrink-0">
        <Search className="w-4.5 h-4.5 text-[#063B29] cursor-pointer stroke-[2.5] shrink-0" />
        <Link to="/login" className="bg-[#063B29] text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-md uppercase whitespace-nowrap shrink-0">
          LOGIN / SIGN UP
        </Link>
      </div>

      {/* Mobile Hamburger and Search */}
      <div className="flex md:hidden items-center space-x-4">
        <Search className="w-5 h-5 text-[#063B29] cursor-pointer stroke-[2.5]" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          className="text-[#063B29] focus:outline-none p-1"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl py-6 px-4 flex flex-col md:hidden space-y-5 border-t border-gray-100 z-50">
          <div className="flex flex-col space-y-5 text-sm font-bold text-black tracking-wider uppercase">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#063B29] transition-colors block">HOME</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#063B29] transition-colors block">ABOUT US</Link>
            <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-[#063B29] transition-colors">
              <span>SERVICES</span>
              <ChevronDown className="w-4 h-4 stroke-[2]" />
            </Link>
            <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-[#063B29] transition-colors">
              <span>PROPERTIES</span>
              <ChevronDown className="w-4 h-4 stroke-[2]" />
            </Link>
            <Link to="/resources" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-[#063B29] transition-colors">
              <span>RESOURCES</span>
              <ChevronDown className="w-4 h-4 stroke-[2]" />
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#063B29] transition-colors block">CONTACT US</Link>
          </div>
          
          <div className="pt-5 border-t border-gray-100 w-full">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-[#063B29] text-white text-sm font-bold tracking-wider px-5 py-3 rounded-md uppercase text-center block w-full">
              LOGIN / SIGN UP
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
