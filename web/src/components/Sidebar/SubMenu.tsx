import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuItem } from '@/types/sidebar';
import { cn } from '@/lib/utils';

interface SubMenuProps {
  items: MenuItem[];
  isExpanded: boolean;
  isActive: boolean;
}

export const SubMenu: React.FC<SubMenuProps> = ({ items, isExpanded, isActive }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isSubItemActive = (item: MenuItem): boolean => {
    return item.path ? location.pathname === item.path : false;
  };

  const handleSubItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className={cn(
      "overflow-hidden transition-all duration-300 ease-in-out",
      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
    )}>
      <div className="ml-6 mt-1 space-y-1">
        {items.map((subItem) => (
          <button
            key={subItem.id}
            onClick={() => handleSubItemClick(subItem)}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ease-in-out group",
              "hover:bg-slate-800 hover:text-slate-50",
              isSubItemActive(subItem)
                ? "bg-slate-700 text-white"
                : "text-slate-400"
            )}
          >
            <subItem.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{subItem.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
