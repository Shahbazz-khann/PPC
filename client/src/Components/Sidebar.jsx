import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { getMenuByRole, ROLES } from '../Config/MenuConfig';
import LogoS from '../assets/LogoS.png';

const Sidebar = () => {
  // Temporary role variable - easy to replace with logged-in user's role later
  const currentRole = ROLES.CUSTOMER;

  // Retrieve menu items dynamically from menuConfig.js based on role
  const menuItems = getMenuByRole(currentRole);

  return (
    <aside className="w-64 min-h-screen bg-[#032B1D] text-white flex flex-col p-4 select-none">
      {/* Logo Section */}
      <div className="px-2 py-4 mb-4 flex items-center justify-center">
        <Link to="/" className="block">
          <img src={LogoS} alt="Property Care Pakistan" className="h-16 w-auto object-contain" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#104D36] text-white font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0 stroke-[1.75]" />}
                  <span className="truncate">{item.title}</span>
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
