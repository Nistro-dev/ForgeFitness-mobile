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
  List,
  Plus,
  Tag,
  BookOpen,
  Warehouse,
  Truck,
  Upload,
  ChevronDown,
  ChevronRight
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
      { id: 'mobile-list', label: 'Liste', icon: List, path: '/mobile' },
      { id: 'mobile-create', label: 'Créer', icon: Plus, path: '/mobile/create' },
      { id: 'mobile-categories', label: 'Catégories', icon: Tag, path: '/mobile/categories' }
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
