import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ExternalLink } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const Topbar = () => {
  const { user } = useAuth();
  
  // Use user data or fallback
  const firstName = user?.firstName || 'Customer';
  const lastName = user?.lastName || '';
  
  // Create initials
  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'CU';

  return (
    <header className="h-[72px] bg-[#FAF8F3] border-b border-gray-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center justify-end px-4 sm:px-8 z-10 sticky top-0 transition-all">
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Go to Website Link */}
        <Link 
          to="/" 
          className="hidden sm:flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-[#002a1b] transition-colors group"
        >
          Go to PPC Website
          <ExternalLink size={14} className="text-gray-400 group-hover:text-[#B8860B] transition-colors" />
        </Link>
        
        {/* Notification */}
        <button className="relative p-2.5 text-gray-500 hover:text-[#1a2b25] bg-white rounded-full shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#1a2b25] leading-tight">{firstName} {lastName}</p>
            <p className="text-[11px] font-semibold text-[#B8860B]">PPC Member</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#a9b0a6] text-[#2c3e34] flex items-center justify-center font-serif font-bold text-sm tracking-wide shadow-sm border border-gray-100/50">
            {initials}
          </div>
        </div>
        
      </div>
    </header>
  );
};

export default Topbar;
