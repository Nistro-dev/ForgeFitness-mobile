import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  badge?: number;
  children?: MenuItem[];
  separator?: boolean;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onClick: () => void;
}
