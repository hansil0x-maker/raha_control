import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  PackageSearch, 
  LogOut, 
  Settings,
  Menu
} from 'lucide-react';
import { APP_NAME } from '../constants';

interface SidebarProps {
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'نظرة عامة', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'الصيدليات', icon: <Building2 size={20} />, path: '/pharmacies' },
    { name: 'طلبات السوق', icon: <PackageSearch size={20} />, path: '/market-demand' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-200 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    lg:translate-x-0 lg:static lg:inset-0
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 tracking-tight">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
                ر
              </div>
              <span>راحة <span className="text-gray-900 font-normal">كونترول</span></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              القائمة الرئيسية
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="opacity-75 group-hover:opacity-100">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 space-y-1">
             <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              النظام
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
              <Settings size={20} className="opacity-75" />
              الإعدادات
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
            >
              <LogOut size={20} className="opacity-75" />
              تسجيل خروج
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;