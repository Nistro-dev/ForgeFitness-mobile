import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuItem } from '@/types/sidebar';
import { menuItems } from '@/data/menuItems';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { MenuItemComponent } from './MenuItemComponent';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const savedExpanded = localStorage.getItem('sidebar:expanded');
    if (savedExpanded) {
      setExpandedItems(JSON.parse(savedExpanded));
    }
  }, []);

  const saveExpandedState = (items: string[]) => {
    setExpandedItems(items);
    localStorage.setItem('sidebar:expanded', JSON.stringify(items));
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = expandedItems.includes(itemId)
      ? expandedItems.filter(id => id !== itemId)
      : [...expandedItems, itemId];
    saveExpandedState(newExpanded);
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => child.path === location.pathname);
    }
    return false;
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpanded(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-[280px]"
    )}>
      <SidebarHeader isCollapsed={isCollapsed} onToggle={onToggle} />
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <MenuItemComponent
                item={item}
                isActive={isItemActive(item)}
                isCollapsed={isCollapsed}
                isExpanded={expandedItems.includes(item.id)}
                onToggle={() => toggleExpanded(item.id)}
                onClick={() => handleItemClick(item)}
              />
              {item.separator && index < menuItems.length - 1 && (
                <div className="my-2 border-t border-slate-800" />
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <SidebarFooter isCollapsed={isCollapsed} />
    </div>
  );
};
