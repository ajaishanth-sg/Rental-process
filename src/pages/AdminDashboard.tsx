import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, FileText, DollarSign, Settings as SettingsIcon, BarChart3, AlertCircle, Calendar, Database, Building, Clipboard, Truck, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { EquipmentCatalogModule } from '@/components/admin/EquipmentCatalogModule';
import { CustomerModule } from '@/components/admin/CustomerModule';
import { UserManagementModule } from '@/components/admin/UserManagementModule';
import { EventManagementModule } from '@/components/admin/EventManagementModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { SettingsModule } from '@/components/admin/SettingsModule';
import { ContractsModule } from '@/components/admin/ContractsModule';
import { ContractOversightModule } from '@/components/admin/ContractOversightModule';
import { InvoicesModule } from '@/components/admin/InvoicesModule';
import { WorkOrdersModule } from '@/components/admin/WorkOrdersModule';
import { DispatchModule } from '@/components/admin/DispatchModule';
import { MasterDataModule } from '@/components/admin/MasterDataModule';
import { InventoryModule } from '@/components/admin/InventoryModule';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { CRMModule } from '@/components/admin/CRMModule';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
  const isPositive = trend && trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color || 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${color ? 'text-primary' : 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
   const { user, role, loading } = useAuth();
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState('overview');
   const [stats, setStats] = useState(null);
   const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Check for hash in URL to set active tab
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'crm', 'equipment', 'customers', 'users', 'events', 'masterdata', 'contracts', 'contract-oversight', 'inventory', 'finance', 'invoices', 'workorders', 'dispatch', 'reports', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }

    // Listen for custom tab change events from sidebar
    const handleTabChange = (event: any) => {
      if (event.detail && ['overview', 'crm', 'equipment', 'customers', 'users', 'events', 'masterdata', 'contracts', 'contract-oversight', 'inventory', 'finance', 'invoices', 'workorders', 'dispatch', 'reports', 'settings'].includes(event.detail)) {
        setActiveTab(event.detail);
      }
    };

    window.addEventListener('tabChange', handleTabChange);

    return () => {
      window.removeEventListener('tabChange', handleTabChange);
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role && role !== 'admin') {
      navigate(`/${role}`);
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user && role === 'admin') {
      fetchStats();
    }
  }, [user, role]);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Equipment" 
                value={stats?.totalEquipment || 245} 
                icon={Package} 
                trend={12.5}
                color="bg-blue-100"
              />
              <StatCard 
                title="Active Contracts" 
                value={stats?.activeContracts || 38} 
                icon={FileText} 
                trend={8.2}
                color="bg-green-100"
              />
              <StatCard 
                title="Total Customers" 
                value={stats?.totalCustomers || 156} 
                icon={Users} 
                trend={15.3}
                color="bg-purple-100"
              />
              <StatCard 
                title="Monthly Revenue" 
                value={`AED ${(stats?.monthlyRevenue || 485000).toLocaleString()}`}
                icon={DollarSign} 
                trend={22.4}
                color="bg-orange-100"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { month: 'Aug', revenue: 320000, target: 300000 },
                      { month: 'Sep', revenue: 350000, target: 320000 },
                      { month: 'Oct', revenue: 380000, target: 350000 },
                      { month: 'Nov', revenue: 420000, target: 380000 },
                      { month: 'Dec', revenue: 450000, target: 400000 },
                      { month: 'Jan', revenue: 485000, target: 420000 },
                    ]}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `AED ${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                      <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Contract Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Status Distribution</CardTitle>
                  <CardDescription>Current contract status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: 38, color: '#10b981' },
                          { name: 'Pending', value: 12, color: '#f59e0b' },
                          { name: 'Completed', value: 156, color: '#3b82f6' },
                          { name: 'Expired', value: 8, color: '#ef4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Active', value: 38, color: '#10b981' },
                          { name: 'Pending', value: 12, color: '#f59e0b' },
                          { name: 'Completed', value: 156, color: '#3b82f6' },
                          { name: 'Expired', value: 8, color: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Equipment Utilization */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Equipment Utilization</CardTitle>
                  <CardDescription>Current equipment status and availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { category: 'Scaffolding', rented: 85, available: 42, maintenance: 8 },
                      { category: 'Formwork', rented: 65, available: 28, maintenance: 5 },
                      { category: 'Shoring', rented: 45, available: 35, maintenance: 3 },
                      { category: 'Accessories', rented: 120, available: 80, maintenance: 12 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rented" fill="#10b981" name="Rented" />
                      <Bar dataKey="available" fill="#3b82f6" name="Available" />
                      <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Today's overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Completed Today</p>
                        <p className="text-2xl font-bold text-green-600">8</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600">38</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">12</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Overdue</p>
                        <p className="text-2xl font-bold text-red-600">3</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New Contract Approved', customer: 'ABC Construction LLC', time: '5 minutes ago', type: 'success' },
                      { action: 'Equipment Dispatched', customer: 'Dubai Builders Co.', time: '23 minutes ago', type: 'info' },
                      { action: 'Payment Received', customer: 'Elite Construction', time: '1 hour ago', type: 'success' },
                      { action: 'Quotation Sent', customer: 'Modern Enterprises', time: '2 hours ago', type: 'info' },
                      { action: 'Equipment Returned', customer: 'Skyline Projects', time: '3 hours ago', type: 'success' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className={`p-2 rounded-full ${activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                          {activity.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Activity className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.customer}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>By total contract value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'ABC Construction LLC', value: 485000, contracts: 12, growth: 25 },
                      { name: 'Dubai Builders Co.', value: 425000, contracts: 10, growth: 18 },
                      { name: 'Elite Construction', value: 380000, contracts: 9, growth: 15 },
                      { name: 'Modern Enterprises', value: 320000, contracts: 8, growth: 12 },
                      { name: 'Skyline Projects', value: 285000, contracts: 7, growth: 22 },
                    ].map((customer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.contracts} contracts</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">AED {customer.value.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>{customer.growth}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'crm' && <CRMModule />}
        {activeTab === 'equipment' && <EquipmentCatalogModule />}
        {activeTab === 'customers' && <CustomerModule />}
        {activeTab === 'users' && <UserManagementModule />}
        {activeTab === 'events' && <EventManagementModule />}
        {activeTab === 'masterdata' && <MasterDataModule />}
        {activeTab === 'contracts' && <ContractsModule />}
        {activeTab === 'contract-oversight' && <ContractOversightModule />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'finance' && <FinanceModule />}
        {activeTab === 'invoices' && <InvoicesModule />}
        {activeTab === 'workorders' && <WorkOrdersModule />}
        {activeTab === 'dispatch' && <DispatchModule />}
        {activeTab === 'reports' && <ReportsModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
