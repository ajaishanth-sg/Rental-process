import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Calendar, Download, FileText, User, AlertCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RentalsModule } from '@/components/customer/RentalsModule';
import { InvoicesModule } from '@/components/customer/InvoicesModule';
import { ProfileModule } from '@/components/customer/ProfileModule';
import { RentalsModule as ReturnRequestsModule } from '@/components/customer/ReturnRequestsModule';
import { ReportsModule } from '@/components/customer/ReportsModule';

const CustomerDashboard = () => {
   const { user, role, loading } = useAuth();
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState('overview');
   const [dashboardData, setDashboardData] = useState(null);
   const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Check for hash in URL to set active tab
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'rentals', 'invoices', 'returns', 'reports', 'profile'].includes(hash)) {
      setActiveTab(hash);
    }

    // Listen for custom tab change events from sidebar
    const handleTabChange = (event: any) => {
      if (event.detail && ['overview', 'rentals', 'invoices', 'returns', 'reports', 'profile'].includes(event.detail)) {
        setActiveTab(event.detail);
      }
    };

    window.addEventListener('customerTabChange', handleTabChange);

    return () => {
      window.removeEventListener('customerTabChange', handleTabChange);
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role && role !== 'customer' && role !== 'admin') {
      const rolePath = role === 'super_admin' ? '/super-admin' : `/${role}`;
      navigate(rolePath);
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/customers/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch customer dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && (role === 'customer' || role === 'admin')) {
      fetchDashboardData();
    }
  }, [user, role]);

  if (loading) return null;

  return (
    <DashboardLayout role="customer">
      <div className="space-y-6">
        

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : dashboardData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Rentals
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.activeRentals || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently rented</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Outstanding Balance
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardData.outstandingBalance?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">{dashboardData.balanceDueText || 'No outstanding balance'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Next Return
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.nextReturnDays || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground mt-1">{dashboardData.nextReturnDate || 'No upcoming returns'}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">Unable to load dashboard data. Please check your connection.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest transactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.detail}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'rentals' && <RentalsModule />}
        {activeTab === 'invoices' && <InvoicesModule />}
        {activeTab === 'returns' && <ReturnRequestsModule />}
        {activeTab === 'reports' && <ReportsModule />}
        {activeTab === 'profile' && <ProfileModule />}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
