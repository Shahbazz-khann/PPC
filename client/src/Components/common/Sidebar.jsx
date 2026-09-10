import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { customerMenu } from '../../Config/menuconfig';
import { LogOut, Menu } from 'lucide-react';

// Use existing branding assets
import LogoImg from '../../assets/Footery.png';
import LogoIcon from '../../assets/Logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  // Initialize state based on window size
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    // Navigating to the existing /logout route 
    // which is handled by the existing <Logout /> component in Approutes
    navigate('/logout');
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Mobile Hamburger Button - visible only on small screens when collapsed */}
      {!isExpanded && (
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed top-6 left-4 z-[60] bg-white text-[#002a1b] p-2 rounded-xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-center transition-transform hover:scale-105"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Overlay for mobile when open */}
      {isExpanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-[40] backdrop-blur-sm transition-opacity" 
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:relative flex flex-col h-screen bg-[#002a1b] text-white transition-all duration-300 z-[50] ${
          isExpanded 
            ? 'w-64 translate-x-0' 
            : 'w-64 md:w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header / Logo Area */}
        <div className="relative flex items-center h-20 md:h-24 border-b border-[#003d29] overflow-hidden shrink-0">
          {/* Expanded Logo */}
          <img 
            src={LogoImg} 
            alt="PPC Logo" 
            className={`absolute left-5 h-10 md:h-12 w-auto max-w-[130px] object-contain transition-all duration-300 ${
              isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`} 
          />

          {/* Hamburger Button */}
          <button 
            onClick={toggleSidebar} 
            className={`absolute text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-[#003624] transition-all duration-300 ${
              isExpanded 
                ? 'right-4 top-1/2 -translate-y-1/2' 
                : 'hidden md:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
            aria-label="Toggle Sidebar"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#00422c] scrollbar-track-transparent">
          <nav className="space-y-1.5">
            {customerMenu.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={() => window.innerWidth <= 768 && setIsExpanded(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#00422c] text-white shadow-sm'
                        : 'text-gray-300 hover:bg-[#003624] hover:text-white'
                    } ${isExpanded ? 'justify-start' : 'justify-center'}`
                  }
                >
                  <Icon size={22} className="shrink-0" />
                  
                  {/* Text for expanded mode */}
                  <div 
                    className={`flex items-center overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'w-40 opacity-100 ml-3' : 'w-0 opacity-0 ml-0'
                    }`}
                  >
                    <span className="font-medium text-sm whitespace-nowrap">
                      {item.title}
                    </span>
                  </div>

                  {/* Tooltip for collapsed mode */}
                  {!isExpanded && (
                    <div className="hidden md:block absolute left-full ml-4 px-3 py-2 bg-[#001f14] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-[#003d29]">
                      {item.title}
                      {/* Tooltip Arrow */}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-[#001f14]" />
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Area */}
        <div className="p-3 border-t border-[#003d29] shrink-0">
          <button
            onClick={handleLogout}
            className={`group relative flex items-center w-full px-3 py-3 rounded-xl text-gray-300 hover:bg-[#003624] transition-all duration-200 ${
              isExpanded ? 'justify-start' : 'justify-center'
            }`}
          >
            <LogOut size={22} className="shrink-0 text-red-400 group-hover:text-red-300" />
            
            <div 
              className={`flex items-center overflow-hidden transition-all duration-300 ${
                isExpanded ? 'w-40 opacity-100 ml-3' : 'w-0 opacity-0 ml-0'
              }`}
            >
              <span className="font-medium text-sm whitespace-nowrap text-red-400 group-hover:text-red-300">
                Logout
              </span>
            </div>

            {/* Tooltip for collapsed mode */}
            {!isExpanded && (
              <div className="hidden md:block absolute left-full ml-4 px-3 py-2 bg-[#1a0f0f] text-red-400 text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-[#3d0f0f]">
                Logout
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-[#1a0f0f]" />
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;