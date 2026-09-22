import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, ExternalLink } from 'lucide-react';
import CustomerAccountMenu from './CustomerAccountMenu';

const Topbar = () => {
  const { t, i18n } = useTranslation(['common']);

  return (
    <header className="h-[72px] bg-[#FAF8F3] border-b border-gray-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center justify-end px-4 sm:px-8 z-50 sticky top-0 transition-all">
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Language Toggle */}
        <div className="hidden sm:flex bg-white border border-gray-200 rounded-full p-1 shadow-sm items-center">
          <button 
            onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('ppc-language', 'en'); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
              i18n.language === 'en' 
                ? 'bg-[#1a2b25] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('common:english')}
          </button>
          <button 
            onClick={() => { i18n.changeLanguage('ur'); localStorage.setItem('ppc-language', 'ur'); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
              i18n.language === 'ur' 
                ? 'bg-[#1a2b25] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('common:urdu')}
          </button>
        </div>

        {/* Go to Website Link */}
        <Link 
          to="/" 
          className="hidden sm:flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-[#002a1b] transition-colors group"
        >
          {t('common:goToWebsite')}
          <ExternalLink size={14} className="text-gray-400 group-hover:text-[#B8860B] transition-colors rtl:-scale-x-100" />
        </Link>
        
        {/* Notification */}
        <button className="relative p-2.5 text-gray-500 hover:text-[#1a2b25] bg-white rounded-full shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <Bell size={18} />
          <span className="absolute top-2 end-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        
        {/* User Account Dropdown */}
        <CustomerAccountMenu />
        
      </div>
    </header>
  );
};

export default Topbar;
