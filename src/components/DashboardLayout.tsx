import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ShoppingCart,
  Search,
  Bell,
  Sun,
  Cloud,
  Droplets,
  Wind,
  ChevronDown,
  Zap,
  RefreshCw,
  Grid3x3,
  ChevronRight,
  Shield,
  Warehouse,
  UserCircle,
  Calendar,
  ClipboardList,
  Wallet,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Receipt,
  CreditCard,
  AlertTriangle,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
}

// Super Admin navigation structure with all modules
const superAdminMenuStructure = [
  {
    role: 'Admin',
    icon: Shield,
    modules: [
      { id: 'admin-crm', name: 'CRM Management', icon: UserCheck, hasTabs: true },
      { id: 'admin-hr', name: 'HR Management', icon: Users, hasTabs: true },
      { id: 'admin-sales', name: 'Sales Management', icon: ShoppingCart, hasTabs: true },
      { id: 'admin-users', name: 'Users & Roles', icon: Users },
      { id: 'admin-contracts', name: 'Contracts', icon: FileText },
      { id: 'admin-contract-oversight', name: 'Contract Oversight', icon: FileText },
      { id: 'admin-finance', name: 'Finance', icon: DollarSign, hasTabs: true },
      { id: 'admin-inventory', name: 'Inventory', icon: Package, hasTabs: true },
      { id: 'admin-dispatch', name: 'Dispatch', icon: Truck },
      { id: 'admin-reports', name: 'Reports', icon: BarChart3 },
      { id: 'admin-customers', name: 'Customers', icon: Building2 },
      { id: 'admin-workorders', name: 'Work Orders', icon: FileText },
      { id: 'admin-events', name: 'Events', icon: Calendar },
      { id: 'admin-settings', name: 'Settings', icon: Settings },
      { id: 'admin-equipment', name: 'Equipment Catalog', icon: Package },
      { id: 'admin-warehouse-orders', name: 'Warehouse Orders', icon: Truck },
      { id: 'admin-vendor', name: 'Vendor Management', icon: Building2 },
      { id: 'admin-master-data', name: 'Master Data', icon: Settings, hasTabs: true },
      { id: 'admin-invoices', name: 'Invoices', icon: Receipt },
    ],
  },
  {
    role: 'Sales',
    icon: ShoppingCart,
    modules: [
      { id: 'sales-enquiries', name: 'Enquiries', icon: MessageSquare },
      { id: 'sales-quotations', name: 'Quotations', icon: FileText },
      { id: 'sales-orders', name: 'Sales Orders', icon: ShoppingCart },
      { id: 'sales-crm', name: 'CRM', icon: UserCheck },
      { id: 'sales-communication', name: 'Customer Communication', icon: MessageSquare },
    ],
  },
  {
    role: 'Warehouse',
    icon: Warehouse,
    modules: [
      { id: 'warehouse-orders', name: 'Sales Orders', icon: Truck },
      { id: 'warehouse-dispatch', name: 'Dispatch', icon: Truck },
      { id: 'warehouse-returns', name: 'Returns', icon: Package },
      { id: 'warehouse-stock', name: 'Stock Management', icon: Package },
      { id: 'warehouse-reports', name: 'Reports', icon: BarChart3 },
    ],
  },
  {
    role: 'Finance',
    icon: DollarSign,
    modules: [
      { id: 'finance-invoices', name: 'Invoices', icon: Receipt },
      { id: 'finance-payments', name: 'Payments', icon: CreditCard },
      { id: 'finance-deposits', name: 'Deposits & Penalties', icon: DollarSign },
      { id: 'finance-approvals', name: 'Approval Workflow', icon: AlertTriangle },
      { id: 'finance-reports', name: 'Reports', icon: BarChart3 },
      { id: 'finance-vendor-costs', name: 'Vendor Costs', icon: DollarSign },
    ],
  },
  {
    role: 'Customer',
    icon: UserCircle,
    modules: [
      { id: 'customer-rentals', name: 'My Rentals', icon: Package },
      { id: 'customer-invoices', name: 'Invoices & Payments', icon: Receipt },
      { id: 'customer-returns', name: 'Return Requests', icon: Package },
      { id: 'customer-reports', name: 'Reports', icon: BarChart3 },
      { id: 'customer-profile', name: 'Profile', icon: UserCircle },
    ],
  },
];

const roleMenuItems = {
  super_admin: [
    { title: 'Overview', icon: LayoutDashboard, path: '/super-admin', tab: 'overview' },
  ],
  admin: [
    { title: 'Overview', icon: LayoutDashboard, path: '/admin', tab: 'overview' },
    { title: 'CRM', icon: UserCheck, path: '/admin', tab: 'crm' },
    { title: 'HR', icon: Users, path: '/admin', tab: 'hr' },
    { title: 'Sales', icon: ShoppingCart, path: '/admin', tab: 'sales' },
    { title: 'Users & Roles', icon: Users, path: '/admin', tab: 'users' },
    { title: 'Contract Oversight', icon: FileText, path: '/admin', tab: 'contract-oversight' },
    { title: 'Inventory', icon: Package, path: '/admin', tab: 'inventory' },
    { title: 'Finance', icon: DollarSign, path: '/admin', tab: 'finance' },
    { title: 'Customers', icon: Users, path: '/admin', tab: 'customers' },
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
    { title: 'CRM', icon: UserCheck, path: '/sales', tab: 'crm' },
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
  const { signOut, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const menuItems = roleMenuItems[role as keyof typeof roleMenuItems] || [];
  const [activeItem, setActiveItem] = useState('overview');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Admin': true,
    'Sales': true,
    'Warehouse': true,
    'Finance': true,
    'Customer': true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMenuClick = (item: any) => {
    const tabId = item.tab || item.id || 'overview';
    setActiveItem(tabId);
    if (role === 'super_admin') {
      navigate('/super-admin');
      setTimeout(() => {
        if (item.tab && item.tab.includes('/')) {
          const [moduleId, subModuleId] = item.tab.split('/');
          window.location.hash = `${moduleId}/${subModuleId}`;
          window.dispatchEvent(new CustomEvent('superAdminModuleChange', { detail: `${moduleId}/${subModuleId}` }));
        } else {
          window.location.hash = tabId;
          window.dispatchEvent(new CustomEvent('superAdminModuleChange', { detail: tabId }));
        }
      }, 100);
    } else if (role === 'admin' && item.tab) {
      navigate('/admin');
      setTimeout(() => {
        window.location.hash = item.tab;
        window.dispatchEvent(new CustomEvent('tabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'sales' && item.tab) {
      navigate('/sales');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('salesTabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'warehouse' && item.tab) {
      navigate('/warehouse');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('warehouseTabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'finance' && item.tab) {
      navigate('/finance');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('financeTabChange', { detail: item.tab }));
      }, 100);
    } else if (role === 'customer' && item.tab) {
      navigate('/customer');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('customerTabChange', { detail: item.tab }));
      }, 100);
    } else {
      navigate(item.path);
    }
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveItem(hash);
    }
  }, []);

  return (
    <Sidebar className={cn(collapsed ? 'w-14' : 'w-64', 'bg-[#1e3a5f] border-r border-[#2a4a6f]')}>
      <SidebarContent>
        <div className="p-4 flex items-center gap-3 border-b border-[#2a4a6f]">
          <div className="p-2 bg-yellow-400 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-yellow-900" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-white text-sm">Scaffolding Rental Process</h2>
              <p className="text-xs text-gray-300">System</p>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Overview */}
                {menuItems.map((item) => {
                  const isActive = activeItem === item.tab;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          'w-full justify-start',
                          isActive && 'bg-[#2a4a6f] text-white',
                          !isActive && 'text-gray-300 hover:bg-[#2a4a6f]/50 hover:text-white'
                        )}
                      >
                        <button
                          onClick={() => handleMenuClick(item)}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {/* Super Admin: All Modules by Role */}
                {role === 'super_admin' && !collapsed && (
                  <>
                    {superAdminMenuStructure.map((roleGroup) => {
                      const RoleIcon = roleGroup.icon;
                      const isOpen = openSections[roleGroup.role] ?? true;
                      
                      return (
                        <Collapsible key={roleGroup.role} open={isOpen} onOpenChange={(open) => toggleSection(roleGroup.role)}>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="w-full justify-between text-gray-300 hover:bg-[#2a4a6f]/50 hover:text-white">
                                <div className="flex items-center gap-3">
                                  <RoleIcon className="h-4 w-4" />
                                  <span className="flex-1 text-left font-semibold">{roleGroup.role}</span>
                                </div>
                                <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {roleGroup.modules.map((module) => {
                                  const ModuleIcon = module.icon;
                                  const moduleId = module.id;
                                  const isModuleActive = activeItem === moduleId || activeItem.startsWith(moduleId);
                                  
                                  return (
                                    <SidebarMenuSubItem key={module.id}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isModuleActive}
                                        className={cn(
                                          isModuleActive && 'bg-[#2a4a6f] text-white',
                                          !isModuleActive && 'text-gray-400 hover:bg-[#2a4a6f]/30 hover:text-white'
                                        )}
                                      >
                                        <button
                                          onClick={() => {
                                            setActiveItem(moduleId);
                                            handleMenuClick({ tab: moduleId, path: '/super-admin' });
                                          }}
                                          className="flex items-center gap-2 w-full"
                                        >
                                          <ModuleIcon className="h-3.5 w-3.5" />
                                          <span className="text-xs">{module.name}</span>
                                        </button>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    })}
                  </>
                )}

                {/* Collapsed view for super admin */}
                {role === 'super_admin' && collapsed && (
                  <>
                    {superAdminMenuStructure.map((roleGroup) => {
                      const RoleIcon = roleGroup.icon;
                      return (
                        <SidebarMenuItem key={roleGroup.role}>
                          <SidebarMenuButton
                            className="w-full justify-center text-gray-300 hover:bg-[#2a4a6f]/50 hover:text-white"
                            title={roleGroup.role}
                          >
                            <RoleIcon className="h-4 w-4" />
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>

        <div className="mt-auto p-4 border-t border-[#2a4a6f]">
          <Button
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700"
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
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: 30,
    condition: 'Clear sky',
    location: 'Riyadh الرياض',
    humidity: 65,
    wind: 16,
    country: 'Saudi Arabia',
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Demo notifications data with state management
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Contract Approved',
      message: 'Contract RC-2025-056 has been approved and is ready for dispatch',
      time: '5 minutes ago',
      type: 'success',
      read: false,
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of AED 12,500 received from ABC Construction LLC',
      time: '23 minutes ago',
      type: 'info',
      read: false,
    },
    {
      id: '3',
      title: 'Low Stock Alert',
      message: 'Scaffolding Frame quantity is below threshold (15 units remaining)',
      time: '1 hour ago',
      type: 'warning',
      read: false,
    },
    {
      id: '4',
      title: 'Equipment Return Scheduled',
      message: 'Equipment return scheduled for Contract RC-2025-042 on 2025-11-10',
      time: '2 hours ago',
      type: 'info',
      read: true,
    },
    {
      id: '5',
      title: 'New Enquiry Received',
      message: 'New enquiry from Modern Builders for Modular Scaffolding',
      time: '3 hours ago',
      type: 'info',
      read: true,
    },
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role={role} />
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b bg-white flex items-center justify-between px-6 gap-4 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search Anything"
                  className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-96">
                    <div className="divide-y">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => {
                              markAsRead(notification.id);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  !notification.read ? 'bg-blue-600' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        markAllAsRead();
                        setNotificationsOpen(false);
                      }}
                      disabled={unreadCount === 0}
                    >
                      Mark all as read
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Weather Widget */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">{weather.temp}°C</div>
                      <div className="text-gray-600">{weather.location}</div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-gray-600 ml-1" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="end">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Weather</h3>
                      <Badge className="bg-green-500 text-white text-xs">Live</Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Sun className="h-8 w-8 text-yellow-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-600 mb-1">LOCATION {weather.location}</div>
                          <div className="text-3xl font-bold text-gray-900">{weather.temp}°C</div>
                          <div className="text-sm text-gray-600">{weather.condition}</div>
                        </div>
                      </div>
                      <div className="space-y-2 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-700">Humidity {weather.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Wind className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Wind {weather.wind} km/h</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-xs font-medium text-gray-600 mb-2">CHANGE LOCATION</div>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                          value={weather.location}
                          onChange={(e) => {
                            const locations: Record<string, { location: string; temp: number; condition: string; humidity: number; wind: number; country: string }> = {
                              'Riyadh الرياض': { location: 'Riyadh الرياض', temp: 30, condition: 'Clear sky', humidity: 65, wind: 16, country: 'Saudi Arabia' },
                              'Dubai': { location: 'Dubai', temp: 35, condition: 'Sunny', humidity: 60, wind: 18, country: 'UAE' },
                              'Abu Dhabi': { location: 'Abu Dhabi', temp: 33, condition: 'Partly cloudy', humidity: 58, wind: 15, country: 'UAE' },
                              'Sharjah': { location: 'Sharjah', temp: 32, condition: 'Clear sky', humidity: 62, wind: 17, country: 'UAE' },
                            };
                            const selected = locations[e.target.value] || locations['Riyadh الرياض'];
                            setWeather(selected);
                          }}
                        >
                          <option value="Riyadh الرياض">Saudi Arabia - Riyadh</option>
                          <option value="Dubai">UAE - Dubai</option>
                          <option value="Abu Dhabi">UAE - Abu Dhabi</option>
                          <option value="Sharjah">UAE - Sharjah</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Profile */}
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-xs hidden lg:block">
                  <div className="font-semibold text-gray-900">{user?.email || 'user@example.com'}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </div>

              {/* Refresh Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  // Dispatch refresh events for all modules
                  console.log('Manual refresh triggered from header button');
                  window.dispatchEvent(new CustomEvent('refreshLeads'));
                  window.dispatchEvent(new CustomEvent('refreshEnquiries'));
                  window.dispatchEvent(new CustomEvent('refreshAll'));
                  // Trigger a custom event that all modules can listen to
                  const event = new CustomEvent('globalRefresh', { 
                    detail: { timestamp: new Date().toISOString() } 
                  });
                  window.dispatchEvent(event);
                }}
                title="Refresh all data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Time */}
              <div className="text-xs font-mono text-gray-600 hidden xl:block">
                {formatTime(currentTime)}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 bg-gray-50 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
