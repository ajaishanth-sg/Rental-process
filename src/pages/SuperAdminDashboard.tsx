import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  FileText,
  BarChart3,
  UserCheck,
  Settings,
  Building2,
  Shield,
  Sparkles,
  ChevronDown,
  Warehouse,
  UserCircle,
  ChevronRight,
  Calendar,
  ClipboardList,
  Wallet,
  Briefcase,
  Target,
  TrendingUp,
  MessageSquare,
  Receipt,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import API_CONFIG from '@/config/api';

// Import Overview Module
import { SuperAdminOverviewModule } from '@/components/superadmin/SuperAdminOverviewModule';

// Import Admin Modules
import { CRMModule } from '@/components/admin/CRMModule';
import { HRModule } from '@/components/admin/HRModule';
import { SalesModule } from '@/components/admin/SalesModule';
import { UserManagementModule } from '@/components/admin/UserManagementModule';
import { ContractOversightModule } from '@/components/admin/ContractOversightModule';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { InventoryModule } from '@/components/admin/InventoryModule';
import { DispatchModule } from '@/components/admin/DispatchModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { CustomerModule } from '@/components/admin/CustomerModule';
import { ContractsModule } from '@/components/admin/ContractsModule';
import { WorkOrdersModule } from '@/components/admin/WorkOrdersModule';
import { EventManagementModule } from '@/components/admin/EventManagementModule';
import { SettingsModule } from '@/components/admin/SettingsModule';
import { EquipmentCatalogModule } from '@/components/admin/EquipmentCatalogModule';
import { WarehouseOrdersModule } from '@/components/admin/WarehouseOrdersModule';
import { VendorModule } from '@/components/admin/VendorModule';
import { MasterDataModule } from '@/components/admin/MasterDataModule';
import { InvoicesModule as AdminInvoicesModule } from '@/components/admin/InvoicesModule';

// Import Sales Modules
import EnquiryManagementModule from '@/components/sales/EnquiryManagementModule';
import QuotationManagementModule from '@/components/sales/QuotationManagementModule';
import SalesOrderManagementModule from '@/components/sales/SalesOrderManagementModule';
import SalesCrmModule from '@/components/sales/SalesCrmModule';
import CustomerCommunicationModule from '@/components/sales/CustomerCommunicationModule';

// Import Finance Modules
import { InvoicesModule } from '@/components/finance/InvoicesModule';
import { PaymentsModule } from '@/components/finance/PaymentsModule';
import { FinanceReportsModule } from '@/components/finance/FinanceReportsModule';
import { DepositPenaltyModule } from '@/components/finance/DepositPenaltyModule';
import { ApprovalWorkflowModule } from '@/components/finance/ApprovalWorkflowModule';
import { VendorCostModule } from '@/components/finance/VendorCostModule';

// Import Customer Modules
import { RentalsModule } from '@/components/customer/RentalsModule';
import { InvoicesModule as CustomerInvoicesModule } from '@/components/customer/InvoicesModule';
import { ProfileModule } from '@/components/customer/ProfileModule';
import { RentalsModule as ReturnRequestsModule } from '@/components/customer/ReturnRequestsModule';
import { ReportsModule as CustomerReportsModule } from '@/components/customer/ReportsModule';

const SuperAdminDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('overview');
  const [activeSubModule, setActiveSubModule] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || role !== 'super_admin')) {
      navigate('/auth');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (role === 'super_admin') {
      fetchSuperAdminData();
    }
  }, [role]);

  useEffect(() => {
    // Handle hash-based navigation
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const parts = hash.split('/');
      setActiveModule(parts[0]);
      if (parts[1]) {
        setActiveSubModule(parts[1]);
      }
    }

    // Listen for module changes
    const handleModuleChange = (e: CustomEvent) => {
      const moduleId = e.detail;
      const parts = moduleId.split('/');
      setActiveModule(parts[0]);
      if (parts[1]) {
        setActiveSubModule(parts[1]);
      } else {
        setActiveSubModule(null);
      }
    };
    window.addEventListener('superAdminModuleChange', handleModuleChange as EventListener);
    return () => {
      window.removeEventListener('superAdminModuleChange', handleModuleChange as EventListener);
    };
  }, []);

  const fetchSuperAdminData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const [dashboardRes, salesRes, financeRes, warehouseRes] = await Promise.all([
        fetch(`${API_CONFIG.ADMIN.DASHBOARD}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_CONFIG.SALES.DASHBOARD}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_CONFIG.FINANCE.DASHBOARD}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_CONFIG.WAREHOUSE.DASHBOARD}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      const dashboardData = dashboardRes?.ok ? await dashboardRes.json() : null;
      const salesData = salesRes?.ok ? await salesRes.json() : null;
      const financeData = financeRes?.ok ? await financeRes.json() : null;
      const warehouseData = warehouseRes?.ok ? await warehouseRes.json() : null;

      setDashboardData({
        admin: dashboardData,
        sales: salesData,
        finance: financeData,
        warehouse: warehouseData,
      });
    } catch (error) {
      console.error('Error fetching super admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleModuleSelect = (moduleId: string, subModuleId?: string) => {
    if (subModuleId) {
      setActiveModule(moduleId);
      setActiveSubModule(subModuleId);
      window.location.hash = `${moduleId}/${subModuleId}`;
      window.dispatchEvent(new CustomEvent('superAdminModuleChange', { detail: `${moduleId}/${subModuleId}` }));
      // Dispatch submodule change event for the module
      window.dispatchEvent(new CustomEvent(`${moduleId}TabChange`, { detail: subModuleId }));
    } else {
      setActiveModule(moduleId);
      setActiveSubModule(null);
      window.location.hash = moduleId;
      window.dispatchEvent(new CustomEvent('superAdminModuleChange', { detail: moduleId }));
    }
  };

  // Navigation structure with all modules and their internal tabs
  const navigationStructure = [
    {
      role: 'Admin',
      icon: Shield,
      modules: [
        {
          id: 'admin-crm',
          name: 'CRM Management',
          component: 'CRMModule',
          tabs: [
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'leads', name: 'Leads', icon: UserCheck },
            { id: 'customers', name: 'Customers', icon: Building2 },
            { id: 'pipeline', name: 'Sales Pipeline', icon: TrendingUp },
            { id: 'performance', name: 'Performance', icon: BarChart3 },
          ],
        },
        {
          id: 'admin-hr',
          name: 'HR Management',
          component: 'HRModule',
          tabs: [
            { id: 'employees', name: 'Employees', icon: Users },
            { id: 'attendance', name: 'Attendance', icon: Calendar },
            { id: 'leave', name: 'Leave', icon: ClipboardList },
            { id: 'payroll', name: 'Payroll', icon: Wallet },
            { id: 'recruitment', name: 'Recruitment', icon: Briefcase },
            { id: 'documents', name: 'Documents', icon: FileText },
          ],
        },
        {
          id: 'admin-sales',
          name: 'Sales Management',
          component: 'SalesModule',
          tabs: [
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'crm', name: 'CRM', icon: UserCheck },
            { id: 'enquiries', name: 'Enquiries', icon: MessageSquare },
            { id: 'quotations', name: 'Quotations', icon: FileText },
            { id: 'sales-orders', name: 'Sales Orders', icon: ShoppingCart },
            { id: 'contracts', name: 'Contracts', icon: FileText },
            { id: 'customers', name: 'Customers', icon: Building2 },
            { id: 'communication', name: 'Communication', icon: MessageSquare },
            { id: 'reports', name: 'Reports', icon: BarChart3 },
          ],
        },
        {
          id: 'admin-users',
          name: 'Users & Roles',
          component: 'UserManagementModule',
        },
        {
          id: 'admin-contracts',
          name: 'Contracts',
          component: 'ContractsModule',
        },
        {
          id: 'admin-contract-oversight',
          name: 'Contract Oversight',
          component: 'ContractOversightModule',
        },
        {
          id: 'admin-finance',
          name: 'Finance',
          component: 'FinanceModule',
          tabs: [
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'invoices', name: 'Invoices', icon: Receipt },
            { id: 'payments', name: 'Payments', icon: CreditCard },
            { id: 'deposits', name: 'Deposits & Penalties', icon: DollarSign },
            { id: 'approvals', name: 'Approval Workflow', icon: AlertTriangle },
            { id: 'reports', name: 'Reports', icon: BarChart3 },
          ],
        },
        {
          id: 'admin-inventory',
          name: 'Inventory',
          component: 'InventoryModule',
          tabs: [
            { id: 'overview', name: 'Overview', icon: LayoutDashboard },
            { id: 'sales-orders', name: 'Sales Orders', icon: ShoppingCart },
            { id: 'dispatch', name: 'Dispatch', icon: Truck },
            { id: 'returns', name: 'Returns', icon: Package },
            { id: 'stock', name: 'Stock', icon: Package },
          ],
        },
        {
          id: 'admin-dispatch',
          name: 'Dispatch',
          component: 'DispatchModule',
        },
        {
          id: 'admin-reports',
          name: 'Reports',
          component: 'ReportsModule',
        },
        {
          id: 'admin-customers',
          name: 'Customers',
          component: 'CustomerModule',
        },
        {
          id: 'admin-workorders',
          name: 'Work Orders',
          component: 'WorkOrdersModule',
        },
        {
          id: 'admin-events',
          name: 'Events',
          component: 'EventManagementModule',
        },
        {
          id: 'admin-settings',
          name: 'Settings',
          component: 'SettingsModule',
        },
        {
          id: 'admin-equipment',
          name: 'Equipment Catalog',
          component: 'EquipmentCatalogModule',
        },
        {
          id: 'admin-warehouse-orders',
          name: 'Warehouse Orders',
          component: 'WarehouseOrdersModule',
        },
        {
          id: 'admin-vendor',
          name: 'Vendor Management',
          component: 'VendorModule',
        },
        {
          id: 'admin-master-data',
          name: 'Master Data',
          component: 'MasterDataModule',
          tabs: [
            { id: 'uom', name: 'Unit of Measurement', icon: Settings },
            { id: 'rates', name: 'Rate Management', icon: DollarSign },
            { id: 'currency', name: 'Currency', icon: DollarSign },
            { id: 'vat', name: 'VAT Configuration', icon: FileText },
          ],
        },
        {
          id: 'admin-invoices',
          name: 'Invoices',
          component: 'AdminInvoicesModule',
        },
      ],
    },
    {
      role: 'Sales',
      icon: ShoppingCart,
      modules: [
        {
          id: 'sales-enquiries',
          name: 'Enquiries',
          component: 'EnquiryManagementModule',
        },
        {
          id: 'sales-quotations',
          name: 'Quotations',
          component: 'QuotationManagementModule',
        },
        {
          id: 'sales-orders',
          name: 'Sales Orders',
          component: 'SalesOrderManagementModule',
        },
        {
          id: 'sales-crm',
          name: 'CRM',
          component: 'SalesCrmModule',
        },
        {
          id: 'sales-communication',
          name: 'Customer Communication',
          component: 'CustomerCommunicationModule',
        },
      ],
    },
    {
      role: 'Warehouse',
      icon: Warehouse,
      modules: [
        {
          id: 'warehouse-orders',
          name: 'Sales Orders',
          component: 'WarehouseOrdersModule',
        },
        {
          id: 'warehouse-dispatch',
          name: 'Dispatch',
          component: 'DispatchModule',
        },
        {
          id: 'warehouse-returns',
          name: 'Returns',
          component: null,
        },
        {
          id: 'warehouse-stock',
          name: 'Stock Management',
          component: 'InventoryModule',
        },
        {
          id: 'warehouse-reports',
          name: 'Reports',
          component: 'ReportsModule',
        },
      ],
    },
    {
      role: 'Finance',
      icon: DollarSign,
      modules: [
        {
          id: 'finance-invoices',
          name: 'Invoices',
          component: 'InvoicesModule',
        },
        {
          id: 'finance-payments',
          name: 'Payments',
          component: 'PaymentsModule',
        },
        {
          id: 'finance-deposits',
          name: 'Deposits & Penalties',
          component: 'DepositPenaltyModule',
        },
        {
          id: 'finance-approvals',
          name: 'Approval Workflow',
          component: 'ApprovalWorkflowModule',
        },
        {
          id: 'finance-reports',
          name: 'Reports',
          component: 'FinanceReportsModule',
        },
        {
          id: 'finance-vendor-costs',
          name: 'Vendor Costs',
          component: 'VendorCostModule',
        },
      ],
    },
    {
      role: 'Customer',
      icon: UserCircle,
      modules: [
        {
          id: 'customer-rentals',
          name: 'My Rentals',
          component: 'RentalsModule',
        },
        {
          id: 'customer-invoices',
          name: 'Invoices & Payments',
          component: 'CustomerInvoicesModule',
        },
        {
          id: 'customer-returns',
          name: 'Return Requests',
          component: 'ReturnRequestsModule',
        },
        {
          id: 'customer-reports',
          name: 'Reports',
          component: 'CustomerReportsModule',
        },
        {
          id: 'customer-profile',
          name: 'Profile',
          component: 'ProfileModule',
        },
      ],
    },
  ];

  // Dispatch tab change events when submodule changes
  useEffect(() => {
    if (activeSubModule && activeModule) {
      // Dispatch tab change event for the module
      window.dispatchEvent(new CustomEvent(`${activeModule}TabChange`, { detail: activeSubModule }));
    }
  }, [activeModule, activeSubModule]);

  const renderModule = () => {
    switch (activeModule) {
      case 'overview':
        return <SuperAdminOverviewModule dashboardData={dashboardData} loading={loadingData} />;
      
      // Admin Modules
      case 'admin-crm':
        return <CRMModule />;
      case 'admin-hr':
        return <HRModule />;
      case 'admin-sales':
        return <SalesModule />;
      case 'admin-users':
        return <UserManagementModule />;
      case 'admin-contracts':
        return <ContractsModule />;
      case 'admin-contract-oversight':
        return <ContractOversightModule />;
      case 'admin-finance':
        return <FinanceModule />;
      case 'admin-inventory':
        return <InventoryModule />;
      case 'admin-dispatch':
        return <DispatchModule />;
      case 'admin-reports':
        return <ReportsModule />;
      case 'admin-customers':
        return <CustomerModule />;
      case 'admin-workorders':
        return <WorkOrdersModule />;
      case 'admin-events':
        return <EventManagementModule />;
      case 'admin-settings':
        return <SettingsModule />;
      case 'admin-equipment':
        return <EquipmentCatalogModule />;
      case 'admin-warehouse-orders':
        return <WarehouseOrdersModule />;
      case 'admin-vendor':
        return <VendorModule />;
      case 'admin-master-data':
        return <MasterDataModule />;
      case 'admin-invoices':
        return <AdminInvoicesModule />;
      
      // Sales Modules
      case 'sales-enquiries':
        return <EnquiryManagementModule />;
      case 'sales-quotations':
        return <QuotationManagementModule />;
      case 'sales-orders':
        return <SalesOrderManagementModule />;
      case 'sales-crm':
        return <SalesCrmModule />;
      case 'sales-communication':
        return <CustomerCommunicationModule />;
      
      // Warehouse Modules
      case 'warehouse-orders':
        return <WarehouseOrdersModule />;
      case 'warehouse-dispatch':
        return <DispatchModule />;
      case 'warehouse-returns':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Warehouse Returns</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Returns management is available in the Inventory module.</p>
              </CardContent>
            </Card>
            <InventoryModule />
          </div>
        );
      case 'warehouse-stock':
        return <InventoryModule />;
      case 'warehouse-reports':
        return <ReportsModule />;
      
      // Finance Modules
      case 'finance-invoices':
        return <InvoicesModule />;
      case 'finance-payments':
        return <PaymentsModule />;
      case 'finance-deposits':
        return <DepositPenaltyModule />;
      case 'finance-approvals':
        return <ApprovalWorkflowModule />;
      case 'finance-reports':
        return <FinanceReportsModule />;
      case 'finance-vendor-costs':
        return <VendorCostModule />;
      
      // Customer Modules
      case 'customer-rentals':
        return <RentalsModule />;
      case 'customer-invoices':
        return <CustomerInvoicesModule />;
      case 'customer-returns':
        return <ReturnRequestsModule />;
      case 'customer-reports':
        return <CustomerReportsModule />;
      case 'customer-profile':
        return <ProfileModule />;
      
      default:
        return <SuperAdminOverviewModule dashboardData={dashboardData} loading={loadingData} />;
    }
  };

  if (loading || !user || role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  SYSTEM ADMIN
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Super Admin Dashboard</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Complete system oversight and management across all modules
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              <span>Full Access</span>
            </div>
          </Badge>
        </div>

        {/* Active Module Display */}
        <div className="min-h-[600px]">
          {renderModule()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
