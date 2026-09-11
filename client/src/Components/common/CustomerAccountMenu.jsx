import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const CustomerAccountMenu = ({ theme = 'light' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use user data or fallback
  const firstName = 'Ahmad';
  const lastName = user?.lastName || '';
  const email = user?.email || 'customer@example.com';
  
  // Create initials
  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'CU';

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
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-[#1a2b25] leading-tight">{firstName} {lastName}</p>
          <p className="text-[11px] font-semibold text-[#B8860B]">PPC Member</p>
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
      <div className={`absolute right-0 mt-3 w-64 bg-[#FAF8F3] rounded-[16px] shadow-xl border border-[#e4d7be] overflow-hidden transition-all duration-200 origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
        
        {/* Header info */}
        <div className="p-4 border-b border-[#e4d7be]/50 bg-white">
          <p className="text-sm font-bold text-[#1a2b25] truncate">{firstName} {lastName}</p>
          <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{email}</p>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#B8860B]/10 text-[#B8860B] uppercase tracking-wider">
            PPC Member
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          <button 
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-[#1a2b25] hover:bg-[#1a2b25] hover:text-white rounded-xl transition-colors group"
          >
            <User size={16} className="text-gray-400 group-hover:text-[#e4d7be]" />
            My Profile
          </button>
          
          <div className="h-px bg-gray-200/60 my-1"></div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
          >
            <LogOut size={16} className="text-gray-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default CustomerAccountMenu;
