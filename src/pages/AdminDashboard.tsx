import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Users,
  Truck,
  Building2,
  CheckCircle2,
  Activity,
  Sun,
  Droplets,
  Wind,
  TrendingUp,
  Clock,
  XCircle,
  Package,
  FileText,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { CustomerModule } from '@/components/admin/CustomerModule';
import { UserManagementModule } from '@/components/admin/UserManagementModule';
import { EventManagementModule } from '@/components/admin/EventManagementModule';
import { ReportsModule } from '@/components/admin/ReportsModule';
import { SettingsModule } from '@/components/admin/SettingsModule';
import { ContractsModule } from '@/components/admin/ContractsModule';
import { ContractOversightModule } from '@/components/admin/ContractOversightModule';
import { WorkOrdersModule } from '@/components/admin/WorkOrdersModule';
import { DispatchModule } from '@/components/admin/DispatchModule';
import { InventoryModule } from '@/components/admin/InventoryModule';
import { FinanceModule } from '@/components/admin/FinanceModule';
import { CRMModule } from '@/components/admin/CRMModule';
import { HRModule } from '@/components/admin/HRModule';
import { SalesModule } from '@/components/admin/SalesModule';

const StatCard = ({ title, value, icon: Icon, trend, trendText, iconBg }: any) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</CardTitle>
        <div className={`p-3 rounded-lg ${iconBg || 'bg-green-100'}`}>
          <Icon className={`h-6 w-6 ${iconBg?.includes('green') ? 'text-green-600' : iconBg?.includes('blue') ? 'text-blue-600' : iconBg?.includes('orange') ? 'text-orange-600' : 'text-gray-600'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>{trendText || `+${trend}% vs last month`}</span>
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
  const [weather, setWeather] = useState({
    temp: 30,
    condition: 'Clear sky',
    location: 'Riyadh الرياض',
    humidity: 65,
    wind: 16,
    country: 'Saudi Arabia',
  });

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'crm', 'hr', 'sales', 'customers', 'users', 'events', 'contracts', 'contract-oversight', 'inventory', 'finance', 'workorders', 'dispatch', 'reports', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }

    const handleTabChange = (event: any) => {
      if (event.detail && ['overview', 'crm', 'hr', 'sales', 'customers', 'users', 'events', 'contracts', 'contract-oversight', 'inventory', 'finance', 'workorders', 'dispatch', 'reports', 'settings'].includes(event.detail)) {
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

  const approvalData = [
    { name: 'Approved', value: 15, color: '#10b981' },
    { name: 'Pending', value: 3, color: '#f59e0b' },
    { name: 'Rejected', value: 1, color: '#ef4444' },
  ];

  const departments = [
    { name: 'Sales Operations', status: 'All systems operational', icon: CheckCircle2, color: 'text-green-600' },
    { name: 'CRM Operations', status: 'All systems operational', icon: CheckCircle2, color: 'text-green-600' },
    { name: 'Finance Operations', status: 'All systems operational', icon: CheckCircle2, color: 'text-green-600' },
    { name: 'Warehouse Operations', status: 'All systems operational', icon: CheckCircle2, color: 'text-green-600' },
    { name: 'Dispatch Operations', status: 'All systems operational', icon: CheckCircle2, color: 'text-green-600' },
    { name: 'HR Operations', status: 'All systems operational', icon: CheckCircle2, color: 'text-green-600' },
  ];

  if (loading || loadingStats) {
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
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening today</p>
              </div>
              <Badge className="bg-green-500 text-white px-3 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Live data
                </div>
              </Badge>
            </div>

            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Equipment"
                value={stats?.totalEquipment || 245}
                icon={Package}
                trend={12.5}
                trendText="+12.5% vs last month"
                iconBg="bg-blue-100"
              />
              <StatCard
                title="Active Contracts"
                value={stats?.activeContracts || 38}
                icon={FileText}
                trend={8.2}
                trendText="+8.2% vs last month"
                iconBg="bg-green-100"
              />
              <StatCard
                title="Total Customers"
                value={stats?.totalCustomers || 156}
                icon={Users}
                trend={15.3}
                trendText="+15.3% vs last month"
                iconBg="bg-purple-100"
              />
              <StatCard
                title="Monthly Revenue"
                value={`AED ${(stats?.monthlyRevenue || 485000).toLocaleString()}`}
                icon={DollarSign}
                trend={22.4}
                trendText="+22.4% vs last month"
                iconBg="bg-orange-100"
              />
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Approval Status Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Approval Status</CardTitle>
                  <CardDescription>Distribution of approval requests this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={approvalData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {approvalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-900">
                          19
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {approvalData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weather Widget */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold">Weather</CardTitle>
                  <Badge className="bg-green-500 text-white text-xs">Live</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-6 w-6 text-yellow-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">LOCATION {weather.location}</div>
                        <div className="text-3xl font-bold text-gray-900">{weather.temp}°C</div>
                        <div className="text-sm text-gray-600">{weather.condition}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-700">Humidity {weather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Wind {weather.wind} km/h</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">CHANGE LOCATION</div>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option>{weather.country}</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Departmental Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Departmental Overview</CardTitle>
                <CardDescription>Current status across all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <dept.icon className={`h-5 w-5 ${dept.color}`} />
                        <div>
                          <div className="font-semibold text-gray-900">{dept.name}</div>
                          <div className="text-sm text-gray-600">{dept.status}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'crm' && <CRMModule />}
        {activeTab === 'hr' && <HRModule />}
        {activeTab === 'sales' && <SalesModule />}
        {activeTab === 'customers' && <CustomerModule />}
        {activeTab === 'users' && <UserManagementModule />}
        {activeTab === 'events' && <EventManagementModule />}
        {activeTab === 'contracts' && <ContractsModule />}
        {activeTab === 'contract-oversight' && <ContractOversightModule />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'finance' && <FinanceModule />}
        {activeTab === 'workorders' && <WorkOrdersModule />}
        {activeTab === 'dispatch' && <DispatchModule />}
        {activeTab === 'reports' && <ReportsModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
