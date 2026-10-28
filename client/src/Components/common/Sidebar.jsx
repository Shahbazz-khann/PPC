import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { customerMenu, adminMenu } from '../../Config/menuconfig';
import { LogOut, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { getToken } from '../../Services/AuthSession';

// Use existing branding assets
import LogoImg from '../../assets/Footery.png';
import LogoIcon from '../../assets/Logo.png';

const Sidebar = () => {
  const { t } = useTranslation(['common', 'admin']);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const token = getToken();
  let roles = user?.roles || [];
  let userType = user?.user_type || user?.user_type_english;
  if (token && (!roles || roles.length === 0)) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      roles = decoded.roles || [];
      if (!userType) userType = decoded.user_type;
    } catch (e) { }
  }
  const isEmployee = userType?.toLowerCase() === 'employee';
  const isAdmin = roles.some(r => r.toLowerCase() === 'admin');

  const currentMenu = isEmployee && isAdmin ? adminMenu : customerMenu;

  // Initialize state based on window size
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);
  const [openGroups, setOpenGroups] = useState({});

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

  // Auto-expand active groups
  useEffect(() => {
    const checkActive = (items, prefix = '') => {
      let foundActive = false;
      items.forEach((item, index) => {
        const id = `${prefix}${index}`;
        if (item.children) {
          const isChildActive = checkActive(item.children, id + '-');
          if (isChildActive) {
            setOpenGroups(prev => ({ ...prev, [id]: true }));
            foundActive = true;
          }
        } else if (item.path && location.pathname.startsWith(item.path)) {
          foundActive = true;
        }
      });
      return foundActive;
    };
    checkActive(currentMenu);
  }, [location.pathname, currentMenu]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleGroup = (id) => {
    setOpenGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // Auto-expand sidebar if closed and a group is clicked
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const renderMenuItems = (items, depth = 0, prefixId = '') => {
    return items.map((item, index) => {
      const id = `${prefixId}${index}`;
      const Icon = item.icon;
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = !!openGroups[id];

      // Translate text
      const text = t(item.namespace ? `${item.namespace}:${item.key}` : `common:${item.key}`);

      if (hasChildren) {
        return (
          <div key={id} className="space-y-1">
            <button
              onClick={() => toggleGroup(id)}
              title={text}
              className={`w-full group relative flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-[#003624] hover:text-white ${!isExpanded ? 'justify-center' : ''}`}
            >
              <div className="flex items-center min-w-0 flex-1">
                {Icon ? (
                  <Icon size={18} className="shrink-0" />
                ) : depth > 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-amber-400 shrink-0 transition-colors" />
                ) : null}
                <div
                  className={`flex items-center transition-all duration-300 min-w-0 flex-1 ${
                    isExpanded ? 'opacity-100 ms-2.5' : 'w-0 opacity-0 ms-0 overflow-hidden'
                  }`}
                >
                  <span className="font-medium text-[13px] leading-snug text-left rtl:text-right">{text}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="shrink-0 ms-2 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <ChevronDown size={14} />
                </div>
              )}

              {/* Tooltip for collapsed mode */}
              {!isExpanded && (
                <div className="hidden md:block absolute start-full ms-4 px-3 py-2 bg-[#001f14] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-[#003d29]">
                  {text}
                  <div className="absolute top-1/2 -start-1 -translate-y-1/2 border-[5px] border-transparent border-e-[#001f14]" />
                </div>
              )}
            </button>

            {/* Nested Children (Only show if expanded OR if sidebar is fully expanded and group is open) */}
            <div
              className={`overflow-hidden transition-all duration-300 ${isOpen && isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="pt-1 pb-2 space-y-1 relative ms-3.5 border-l border-[#00422c] ps-2">
                {renderMenuItems(item.children, depth + 1, id + '-')}
              </div>
            </div>
          </div>
        );
      }

      // Standard Link
      return (
        <NavLink
          key={id}
          to={item.path}
          title={text}
          onClick={() => window.innerWidth <= 768 && setIsExpanded(false)}
          className={({ isActive }) =>
            `group relative flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${isActive
              ? 'bg-[#00422c] text-white shadow-sm'
              : 'text-gray-300 hover:bg-[#003624] hover:text-white'
            } ${isExpanded ? 'justify-start' : 'justify-center'}`
          }
        >
          {Icon ? (
            <Icon size={18} className="shrink-0" />
          ) : depth > 0 ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-amber-400 shrink-0 transition-colors" />
          ) : null}

          <div
            className={`flex items-center transition-all duration-300 min-w-0 flex-1 ${
              isExpanded ? 'opacity-100 ms-2.5' : 'w-0 opacity-0 ms-0 overflow-hidden'
            }`}
          >
            <span
              className={`font-medium text-[13px] leading-snug text-left rtl:text-right ${
                depth > 0 && !Icon ? 'text-gray-300 group-hover:text-white' : ''
              }`}
            >
              {text}
            </span>
          </div>

          {!isExpanded && (
            <div className="hidden md:block absolute start-full ms-4 px-3 py-2 bg-[#001f14] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-[#003d29]">
              {text}
              <div className="absolute top-1/2 -start-1 -translate-y-1/2 border-[5px] border-transparent border-e-[#001f14]" />
            </div>
          )}
        </NavLink>
      );
    });
  };

  return (
    <>
      {!isExpanded && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-6 start-4 z-[60] bg-white text-[#002a1b] p-2 rounded-xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-center transition-transform hover:scale-105"
        >
          <Menu size={22} />
        </button>
      )}

      {isExpanded && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[40] backdrop-blur-sm transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`fixed md:relative flex flex-col h-screen bg-[#002a1b] text-white transition-all duration-300 z-[50] ${isExpanded
          ? 'w-72 translate-x-0'
          : 'w-72 md:w-16 -translate-x-full md:translate-x-0 rtl:translate-x-full md:rtl:translate-x-0'
          }`}
      >
        <div className="relative flex items-center h-16 border-b border-[#003d29] overflow-hidden shrink-0">
          <img
            src={LogoImg}
            alt="PPC Logo"
            className={`absolute start-3 h-9 w-auto max-w-[120px] object-contain transition-all duration-300 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
          />
          <button
            onClick={toggleSidebar}
            className={`absolute text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-[#003624] transition-all duration-300 ${isExpanded
              ? 'end-4 top-1/2 -translate-y-1/2'
              : 'hidden md:block start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2'
              }`}
            aria-label="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="flex-1 py-3 px-2.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#00422c] scrollbar-track-transparent">
          <nav className="space-y-1">
            {renderMenuItems(currentMenu)}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;