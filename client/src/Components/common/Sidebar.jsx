import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { getMenuByRole } from '../../Config/MenuConfig';
import { useAuth } from '../../Context/AuthContext';
import LogoS from '../../assets/LogoS.png';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Reactive: reads from AuthContext which is updated immediately after login
  const { user } = useAuth();

  // Normalize role_name to lowercase to match MenuConfig keys
  const currentRole = user?.role_name?.trim().toLowerCase();

  // Return empty menu if no session or unrecognized role
  const menuItems = currentRole ? getMenuByRole(currentRole) : [];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#032B1D] text-white flex flex-col p-2 select-none transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Logo & Toggle Header */}
      <div
        className={`px-2 py-2 flex items-center border-b border-white/10 mb-2 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'
          }`}
      >
        {/* Logo Container */}
        {!isCollapsed && (
          <Link to="/" className="block overflow-hidden transition-all duration-300">
            <img
              src={LogoS}
              alt="Property Care Pakistan"
              className="    h-28 w-auto max-w-[160px] object-contain transition-all duration-300"
            />
          </Link>
        )}

        {/* Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={isCollapsed ? item.title : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${isCollapsed ? 'px-0 justify-center' : 'px-3 justify-start'
                    } ${isActive
                      ? 'bg-[#104D36] text-white font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {IconComponent && (
                    <IconComponent className="w-5 h-5 flex-shrink-0 stroke-[1.75]" />
                  )}
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
