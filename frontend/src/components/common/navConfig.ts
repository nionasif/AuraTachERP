import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Briefcase,
  FolderKanban,
  TrendingUp,
  Server,
  Package,
  Receipt,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  Activity,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { ViewType } from '../../types/erp';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  view: ViewType;
  /** other views that should keep this item highlighted (sub-pages) */
  alsoActive?: ViewType[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, view: 'DASHBOARD' },
      { label: 'My Tasks', icon: CheckSquare, view: 'MY_TASKS' },
    ],
  },
  {
    title: 'People',
    items: [{ label: 'Employees', icon: Users, view: 'STAFF' }],
  },
  {
    title: 'Business',
    items: [
      { label: 'Customers (CRM)', icon: Briefcase, view: 'CRM' },
      { label: 'Projects', icon: FolderKanban, view: 'ECOMMERCE' },
      { label: 'Sales & Service', icon: TrendingUp, view: 'POS' },
      { label: 'Finance', icon: Receipt, view: 'REPORT' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'IT Assets', icon: Server, view: 'STORING', alsoActive: ['DAMAGE', 'SHOPPING_BAG'] },
      { label: 'Procurement', icon: Package, view: 'RECEIVE', alsoActive: ['REQUISITION', 'TRANSFER'] },
      { label: 'Help Desk', icon: LifeBuoy, view: 'REPAIR' },
      { label: 'Reports', icon: BarChart3, view: 'BI_TOOLS' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users & Roles', icon: ShieldCheck, view: 'ADMIN' },
      { label: 'Activity Log', icon: Activity, view: 'AUDIT' },
      { label: 'Settings', icon: Settings, view: 'SETUP' },
    ],
  },
];

export const VIEW_TITLES: Record<ViewType, string> = {
  DASHBOARD: 'Dashboard',
  MY_TASKS: 'My Tasks',
  STAFF: 'Employees',
  CRM: 'Customers (CRM)',
  ECOMMERCE: 'Projects',
  POS: 'Sales & Service',
  STORING: 'IT Assets',
  RECEIVE: 'Procurement',
  REPORT: 'Finance',
  REPAIR: 'Help Desk',
  BI_TOOLS: 'Reports',
  ADMIN: 'Users & Roles',
  AUDIT: 'Activity Log',
  SETUP: 'Settings',
  TRANSFER: 'Procurement · Transfers',
  REQUISITION: 'Procurement · Requisitions',
  DAMAGE: 'IT Assets · Repairs',
  SHOPPING_BAG: 'IT Assets · Consumables',
};
