import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuItem } from '@/types/sidebar';
import { MenuItemProps } from '@/types/sidebar';
import { SubMenu } from './SubMenu';
import { cn } from '@/lib/utils';

export const MenuItemComponent: React.FC<MenuItemProps> = ({
  item,
  isActive,
  isCollapsed,
  isExpanded,
  onToggle,
  onClick
}) => {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group",
          "hover:bg-slate-800 hover:text-slate-50",
          isActive 
            ? "bg-slate-700 text-white border-l-3 border-white" 
            : "text-slate-300",
          isCollapsed && "justify-center px-2"
        )}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <item.icon className={cn(
            "h-5 w-5 flex-shrink-0",
            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-50"
          )} />
          
          {!isCollapsed && (
            <>
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </div>

        {!isCollapsed && hasChildren && (
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            isExpanded ? "rotate-180" : "rotate-0"
          )} />
        )}
      </button>

      {hasChildren && !isCollapsed && (
        <SubMenu 
          items={item.children!} 
          isExpanded={isExpanded}
          isActive={isActive}
        />
      )}
    </div>
  );
};
