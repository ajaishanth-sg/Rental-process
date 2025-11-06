import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  FileText,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  BarChart3,
  ArrowRight,
  Truck,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import API_CONFIG from '@/config/api';

interface SuperAdminOverviewModuleProps {
  dashboardData: any;
  loading: boolean;
}

export const SuperAdminOverviewModule = ({ dashboardData, loading }: SuperAdminOverviewModuleProps) => {
  const [kpiData, setKpiData] = useState({
    totalCustomers: 0,
    totalEnquiries: 0,
    quotationsPending: 0,
    activeContracts: 0,
    totalRevenue: 0,
    equipmentRented: 0,
    equipmentAvailable: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (dashboardData) {
      // Aggregate data from all dashboards
      const adminData = dashboardData.admin || {};
      const salesData = dashboardData.sales || {};
      const financeData = dashboardData.finance || {};
      const warehouseData = dashboardData.warehouse || {};

      setKpiData({
        totalCustomers: adminData.totalCustomers || salesData.totalCustomers || 0,
        totalEnquiries: salesData.totalEnquiries || adminData.totalEnquiries || 0,
        quotationsPending: adminData.pendingApprovals || salesData.pendingQuotations || adminData.pendingQuotations || 0,
        activeContracts: adminData.activeContracts || salesData.convertedContracts || 0,
        totalRevenue: financeData.totalRevenue || adminData.totalRevenue || adminData.monthlyRevenue || 0,
        equipmentRented: warehouseData.equipmentRented || 0,
        equipmentAvailable: warehouseData.equipmentAvailable || 0,
      });

      // Generate chart data
      setChartData({
        salesTrend: [
          { month: 'Jan', sales: 45000, rentals: 32000 },
          { month: 'Feb', sales: 52000, rentals: 38000 },
          { month: 'Mar', sales: 48000, rentals: 35000 },
          { month: 'Apr', sales: 61000, rentals: 42000 },
          { month: 'May', sales: 55000, rentals: 40000 },
          { month: 'Jun', sales: 67000, rentals: 48000 },
        ],
        conversionFunnel: [
          { name: 'Enquiries', value: 150 },
          { name: 'Quotations', value: 120 },
          { name: 'Approved', value: 85 },
          { name: 'Contracts', value: 65 },
        ],
        inventoryUtilization: [
          { name: 'Rented', value: 65 },
          { name: 'Available', value: 25 },
          { name: 'Maintenance', value: 10 },
        ],
        financeSummary: [
          { name: 'Paid', value: 75 },
          { name: 'Pending', value: 25 },
        ],
      });

      // Recent activities
      setRecentActivities([
        { type: 'quotation', action: 'New quotation created', id: 'QT-2025-001', time: '2 hours ago', user: 'Sales Team' },
        { type: 'dispatch', action: 'Dispatch completed', id: 'DISP-2025-045', time: '4 hours ago', user: 'Warehouse' },
        { type: 'return', action: 'Return inspection done', id: 'RET-2025-023', time: '6 hours ago', user: 'Warehouse' },
        { type: 'payment', action: 'Payment received', id: 'PAY-2025-089', time: '8 hours ago', user: 'Finance' },
        { type: 'contract', action: 'Contract approved', id: 'RC-2025-156', time: '12 hours ago', user: 'Admin' },
      ]);
    }
  }, [dashboardData]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Key Performance Indicators</h2>
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Customers</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Enquiries</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData.totalEnquiries}</div>
              <p className="text-xs text-muted-foreground mt-1">All time enquiries</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quotations Pending</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData.quotationsPending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData.activeContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">AED {kpiData.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly revenue</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Equipment Rented</CardTitle>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData.equipmentRented}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently rented</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Equipment Available</CardTitle>
              <div className="p-2 bg-teal-100 rounded-lg">
                <Activity className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData.equipmentAvailable}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for rent</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Visual Charts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Analytics & Insights</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sales vs Rentals Trend */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Sales vs Rentals Trend</CardTitle>
              <CardDescription>Monthly revenue comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData?.salesTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Sales" 
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rentals" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Rentals" 
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enquiry to Contract Conversion Funnel */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              <CardDescription>Enquiry to contract conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData?.conversionFunnel || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inventory Utilization */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Inventory Utilization</CardTitle>
              <CardDescription>Equipment status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData?.inventoryUtilization || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(chartData?.inventoryUtilization || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Finance Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Finance Summary</CardTitle>
              <CardDescription>Paid vs Pending payments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData?.financeSummary || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(chartData?.financeSummary || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-500 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Approve Quotation</span>
                <Zap className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{kpiData.quotationsPending}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pending approvals</p>
                </div>
                <Button size="sm" variant="outline" className="group-hover:bg-purple-50 group-hover:border-purple-500">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Approve Contract</span>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{kpiData.activeContracts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                </div>
                <Button size="sm" variant="outline" className="group-hover:bg-blue-50 group-hover:border-blue-500">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Pending Invoice</span>
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Unpaid invoices</p>
                </div>
                <Button size="sm" variant="outline" className="group-hover:bg-green-50 group-hover:border-green-500">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-orange-500 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>New Customer</span>
                <Users className="h-4 w-4 text-muted-foreground group-hover:text-orange-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{kpiData.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total customers</p>
                </div>
                <Button size="sm" variant="outline" className="group-hover:bg-orange-50 group-hover:border-orange-500">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Recent Activities Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Activities</h2>
          <Badge variant="outline" className="text-xs">
            Last 24 hours
          </Badge>
        </div>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2.5 rounded-lg ${
                    activity.type === 'quotation' ? 'bg-purple-100' :
                    activity.type === 'dispatch' ? 'bg-blue-100' :
                    activity.type === 'return' ? 'bg-orange-100' :
                    activity.type === 'payment' ? 'bg-green-100' :
                    'bg-indigo-100'
                  }`}>
                    {activity.type === 'quotation' && <FileText className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'dispatch' && <Truck className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'return' && <Package className="h-4 w-4 text-orange-600" />}
                    {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                    {activity.type === 'contract' && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{activity.id}</Badge>
                      <span className="text-xs text-muted-foreground">by {activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
