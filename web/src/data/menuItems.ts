import { 
  Home, 
  BarChart3, 
  Smartphone, 
  Package, 
  Users, 
  MessageSquare, 
  FileText, 
  Image,
  Settings,
  Tag,
  BookOpen,
  Warehouse,
  Truck,
  Upload,
  ChevronDown,
  ChevronRight,
  Shield,
  Calendar,
  ClipboardList,
  CalendarDays
} from 'lucide-react';
import { MenuItem } from '@/types/sidebar';

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    separator: true
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: Smartphone,
    children: [
      { id: 'mobile-categories', label: 'Catégories', icon: Tag, path: '/mobile/categories' },
      { id: 'mobile-products', label: 'Produits', icon: Package, path: '/mobile/products' },
      { id: 'mobile-planning', label: 'Planning Coach', icon: Calendar, path: '/mobile/planning' },
      { id: 'mobile-programmes', label: 'Programmes', icon: ClipboardList, path: '/mobile/programmes' },
      { id: 'mobile-evenements', label: 'Événements', icon: CalendarDays, path: '/mobile/evenements' }
    ]
  },
  {
    id: 'products',
    label: 'Produits',
    icon: Package,
    children: [
      { id: 'products-catalog', label: 'Catalogue', icon: BookOpen, path: '/products' },
      { id: 'products-stock', label: 'Stock', icon: Warehouse, path: '/products/stock' },
      { id: 'products-suppliers', label: 'Fournisseurs', icon: Truck, path: '/products/suppliers' },
      { id: 'products-import', label: 'Import/Export', icon: Upload, path: '/products/import' }
    ]
  },
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: Users,
          path: '/users'
        },
  {
    id: 'audit',
    label: 'Logs d\'Audit',
    icon: Shield,
    path: '/audit',
    separator: true
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    path: '/messages',
    badge: 3
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    path: '/documents'
  },
  {
    id: 'media',
    label: 'Médias',
    icon: Image,
    path: '/media'
  }
];
