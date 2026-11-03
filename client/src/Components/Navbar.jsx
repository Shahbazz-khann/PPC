import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo3 from '../assets/IMAGEEEEEEEEEEEEEEEEEEEE.png';
import { useAuth } from '../Context/AuthContext';

const Navbar = ({ overlay = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation(['public']);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleServicesClick = (e) => {
    e.preventDefault();
    if (mobileMenuOpen) setMobileMenuOpen(false);

    if (location.pathname === '/') {
      const el = document.getElementById('our-core-services');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/#our-core-services');
    }
  };

  // When overlay=true the navbar floats over a dark background → use white text
  const linkClass = overlay
    ? 'text-white hover:text-[#C48C33] transition-colors'
    : 'text-black hover:text-[#063B29] transition-colors';

  const firstName = user?.user_first_name || user?.name || null;
  // Determine the correct dashboard route based on user type
  const isEmployee = user?.user_type?.toLowerCase() === 'employee' || user?.user_type_english?.toLowerCase() === 'employee';
  const dashboardPath = isEmployee ? '/admin/dashboard' : '/customer/dashboard';

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
      <div className={`hidden md:flex items-center space-x-6 lg:space-x-8 text-xs font-bold tracking-wider uppercase shrink-0 ${overlay ? 'text-white' : 'text-black'}`}>
        <div className="relative py-1">
          <Link to="/" className={linkClass}>{t('public:home')}</Link>
          <span className="absolute bottom-0 left-0 w-full h-[2px] "></span>
        </div>
        <Link to="/about" className={`cursor-pointer whitespace-nowrap ${linkClass}`}>{t('public:aboutUs')}</Link>
        <a
          href="/#our-core-services"
          onClick={handleServicesClick}
          className={`flex items-center cursor-pointer whitespace-nowrap ${linkClass}`}
        >
          <span>{t('public:services')}</span>
        </a>
        <Link to="/properties" className={`flex items-center cursor-pointer whitespace-nowrap ${linkClass}`}>
          <span>{t('public:properties')}</span>
        </Link>
        <Link to="/contact" className={`cursor-pointer whitespace-nowrap ${linkClass}`}>{t('public:contactUs')}</Link>
      </div>

      {/* Desktop Right Action Items */}
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6 shrink-0">
        {isAuthenticated ? (
          /* Logged-in: show Go to Dashboard button */
          <Link
            to={dashboardPath}
            className="flex items-center gap-2 bg-[#063B29] text-white text-xs font-bold tracking-wider px-4 py-2.5 rounded-md uppercase whitespace-nowrap shrink-0 hover:bg-[#0a5a3d] transition-colors"
          >
            <UserCircle2 className="w-4 h-4 shrink-0" />
            Go to Your Profile
          </Link>
        ) : (
          /* Guest: show Login / Sign Up */
          <Link to="/login" className="bg-[#063B29] text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-md uppercase whitespace-nowrap shrink-0 hover:bg-[#0a5a3d] transition-colors">
            {t('public:loginSignup')}
          </Link>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="flex md:hidden items-center">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t('public:closeMenu') : t('public:openMenu')}
          aria-expanded={mobileMenuOpen}
          className={`focus:outline-none p-1 ${overlay ? 'text-white' : 'text-[#063B29]'}`}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl py-6 px-4 flex flex-col md:hidden space-y-5 border-t border-gray-100 z-50">
          <div className="flex flex-col space-y-5 text-sm font-bold text-black tracking-wider uppercase">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#063B29] transition-colors block">{t('public:home')}</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#063B29] transition-colors block">{t('public:aboutUs')}</Link>
            <a
              href="/#our-core-services"
              onClick={handleServicesClick}
              className="flex items-center justify-between hover:text-[#063B29] transition-colors cursor-pointer"
            >
              <span>{t('public:services')}</span>
            </a>
            <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between hover:text-[#063B29] transition-colors">
              <span>{t('public:properties')}</span>
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#063B29] transition-colors block">{t('public:contactUs')}</Link>
          </div>

          {/* Bottom CTA — Dashboard if logged in, Login if guest */}
          <div className="pt-5 border-t border-gray-100 w-full">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#063B29] text-white text-sm font-bold tracking-wider px-5 py-3 rounded-md uppercase w-full hover:bg-[#0a5a3d] transition-colors"
              >
                <UserCircle2 className="w-5 h-5" />
                Go to Your Profile
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#063B29] text-white text-sm font-bold tracking-wider px-5 py-3 rounded-md uppercase text-center block w-full hover:bg-[#0a5a3d] transition-colors"
              >
                {t('public:loginSignup')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
