import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isCollapsed, onToggle }) => {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
      {!isCollapsed && (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-sm">FF</span>
          </div>
          <span className="text-white font-semibold text-lg">Forge Fitness</span>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
};
