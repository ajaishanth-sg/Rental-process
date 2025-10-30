import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Truck,
  DollarSign,
  Settings,
  LogOut,
  Building2,
  Menu,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
}

const roleMenuItems = {
  admin: [
    { title: 'Overview', icon: LayoutDashboard, path: '/admin', tab: 'overview' },
    { title: 'CRM', icon: UserCheck, path: '/admin', tab: 'crm' },
    { title: 'Users & Roles', icon: Users, path: '/admin', tab: 'users' },
    { title: 'Master Data', icon: Settings, path: '/admin', tab: 'masterdata' },
    { title: 'Contract Oversight', icon: FileText, path: '/admin', tab: 'contract-oversight' },
    { title: 'Inventory', icon: Package, path: '/admin', tab: 'inventory' },
    { title: 'Finance', icon: DollarSign, path: '/admin', tab: 'finance' },
    { title: 'Equipment', icon: Package, path: '/admin', tab: 'equipment' },
    { title: 'Customers', icon: Users, path: '/admin', tab: 'customers' },
    { title: 'Invoices', icon: DollarSign, path: '/admin', tab: 'invoices' },
    { title: 'Work Orders', icon: FileText, path: '/admin', tab: 'workorders' },
    { title: 'Dispatch', icon: Truck, path: '/admin', tab: 'dispatch' },
    { title: 'Reports', icon: BarChart3, path: '/admin', tab: 'reports' },
    { title: 'Settings', icon: Settings, path: '/admin', tab: 'settings' },
  ],
  sales: [
    { title: 'Overview', icon: LayoutDashboard, path: '/sales', tab: 'overview' },
    { title: 'Enquiries', icon: Users, path: '/sales', tab: 'enquiries' },
    { title: 'Quotations', icon: FileText, path: '/sales', tab: 'quotations' },
    { title: 'Sales Orders', icon: Package, path: '/sales', tab: 'sales-orders' },
    { title: 'Contracts', icon: FileText, path: '/sales', tab: 'contracts' },
    { title: 'Customers', icon: Users, path: '/sales', tab: 'customers' },
    { title: 'Communication', icon: Building2, path: '/sales', tab: 'communication' },
    { title: 'Reports', icon: BarChart3, path: '/sales', tab: 'reports' },
  ],
  warehouse: [
    { title: 'Overview', icon: LayoutDashboard, path: '/warehouse', tab: 'overview' },
    { title: 'Sales Orders', icon: Truck, path: '/warehouse', tab: 'sales-orders' },
    { title: 'Stock', icon: Package, path: '/warehouse', tab: 'stock' },
    { title: 'Dispatch', icon: Truck, path: '/warehouse', tab: 'dispatch' },
    { title: 'Returns', icon: Package, path: '/warehouse', tab: 'returns' },
    { title: 'Reports', icon: FileText, path: '/warehouse', tab: 'reports' },
  ],
  finance: [
    { title: 'Overview', icon: LayoutDashboard, path: '/finance', tab: 'overview' },
    { title: 'Invoices', icon: FileText, path: '/finance', tab: 'invoices' },
    { title: 'Payments', icon: DollarSign, path: '/finance', tab: 'payments' },
    { title: 'Deposits', icon: DollarSign, path: '/finance', tab: 'deposits' },
    { title: 'Approvals', icon: FileText, path: '/finance', tab: 'approvals' },
    { title: 'Reports', icon: BarChart3, path: '/finance', tab: 'reports' },
  ],
  customer: [
    { title: 'Overview', icon: LayoutDashboard, path: '/customer', tab: 'overview' },
    { title: 'My Rentals', icon: Package, path: '/customer', tab: 'rentals' },
    { title: 'Invoices & Payments', icon: DollarSign, path: '/customer', tab: 'invoices' },
    { title: 'Return Requests', icon: FileText, path: '/customer', tab: 'returns' },
    { title: 'Reports', icon: BarChart3, path: '/customer', tab: 'reports' },
    { title: 'Profile', icon: Users, path: '/customer', tab: 'profile' },
  ],
};

const AppSidebar = ({ role }: { role: string }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const menuItems = roleMenuItems[role as keyof typeof roleMenuItems] || [];

  const handleMenuClick = (item: any) => {
    if (role === 'admin' && item.tab) {
      // For admin, navigate to /admin and set the active tab
      navigate('/admin');
      // Use a timeout to ensure navigation completes before setting hash
      setTimeout(() => {
        window.location.hash = item.tab;
        // Force a re-render by triggering a custom event
        window.dispatchEvent(new CustomEvent('tabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'sales' && item.tab) {
      // For sales, navigate to /sales and set the active tab
      navigate('/sales');
      // Use a timeout to ensure navigation completes before setting hash
      setTimeout(() => {
        // Trigger tab change for sales dashboard
        window.dispatchEvent(new CustomEvent('salesTabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'warehouse' && item.tab) {
      // For warehouse, navigate to /warehouse and set the active tab
      navigate('/warehouse');
      // Use a timeout to ensure navigation completes before setting hash
      setTimeout(() => {
        // Trigger tab change for warehouse dashboard
        window.dispatchEvent(new CustomEvent('warehouseTabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'finance' && item.tab) {
      // For finance, navigate to /finance and set the active tab
      navigate('/finance');
      // Use a timeout to ensure navigation completes before setting hash
      setTimeout(() => {
        // Trigger tab change for finance dashboard
        window.dispatchEvent(new CustomEvent('financeTabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'customer' && item.tab) {
      // For customer, navigate to /customer and set the active tab
      navigate('/customer');
      // Use a timeout to ensure navigation completes before setting hash
      setTimeout(() => {
        // Trigger tab change for customer dashboard
        window.dispatchEvent(new CustomEvent('customerTabChange', { detail: item.tab }));
      }, 100);
    } else {
      navigate(item.path);
    }
  };

  return (
    <Sidebar className={cn(collapsed ? 'w-14' : 'w-64')}>
      <SidebarContent>
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
          <div className="p-2 bg-sidebar-primary rounded-lg">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">Scaffolding</h2>
              <p className="text-xs text-muted-foreground capitalize">{role} Dashboard</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleMenuClick(item)}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          <Button
            variant="destructive"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && 'Sign Out'}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={role} />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold capitalize">{role} Dashboard</h1>
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
