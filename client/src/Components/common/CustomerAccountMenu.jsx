import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const CustomerAccountMenu = ({ theme = 'light' }) => {
  const { t } = useTranslation(['common']);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use user data or fallback
  const displayName = [
    user?.user_first_name,
    user?.user_middle_name,
    user?.user_last_name,
  ].filter(Boolean).join(' ') || 'Customer';
  
  const email = user?.email || 'customer@example.com';
  
  // Create initials
  const initials = user?.user_first_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate('/logout');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/customer/profile');
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-1 rounded-xl hover:bg-black/5 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#B8860B] focus:ring-offset-2"
      >
        <div className="text-end hidden sm:block">
          <p className="text-sm font-bold text-[#1a2b25] leading-tight">{displayName}</p>
          <p className="text-[11px] font-semibold text-[#B8860B]">{t('common:ppcMember')}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#a9b0a6] text-[#2c3e34] flex items-center justify-center font-serif font-bold text-sm tracking-wide shadow-sm border border-gray-100/50">
          {initials}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      <div className={`absolute end-0 mt-3 w-64 bg-[#FAF8F3] rounded-[16px] shadow-xl border border-[#e4d7be] overflow-hidden transition-all duration-200 origin-top-right rtl:origin-top-left ${isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
        
        {/* Header info */}
        <div className="p-4 border-b border-[#e4d7be]/50 bg-white">
          <p className="text-sm font-bold text-[#1a2b25] truncate">{displayName}</p>
          <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{email}</p>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#B8860B]/10 text-[#B8860B] uppercase tracking-wider">
            {t('common:ppcMember')}
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          <button 
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-[#1a2b25] hover:bg-[#1a2b25] hover:text-white rounded-xl transition-colors group"
          >
            <User size={16} className="text-gray-400 group-hover:text-[#e4d7be]" />
            {t('common:myProfile')}
          </button>
          
          <div className="h-px bg-gray-200/60 my-1"></div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
          >
            <LogOut size={16} className="text-gray-400 group-hover:text-red-500" />
            {t('common:logout')}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default CustomerAccountMenu;
