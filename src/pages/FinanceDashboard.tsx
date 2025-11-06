import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoicesModule } from '@/components/finance/InvoicesModule';
import { PaymentsModule } from '@/components/finance/PaymentsModule';
import { FinanceReportsModule } from '@/components/finance/FinanceReportsModule';
import { DepositPenaltyModule } from '@/components/finance/DepositPenaltyModule';
import { ApprovalWorkflowModule } from '@/components/finance/ApprovalWorkflowModule';

const FinanceDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role && role !== 'finance' && role !== 'admin') {
      const rolePath = role === 'super_admin' ? '/super-admin' : `/${role}`;
      navigate(rolePath);
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/finance/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch finance dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && (role === 'finance' || role === 'admin')) {
      fetchDashboardData();
    }
  }, [user, role]);

  useEffect(() => {
    // Listen for finance tab change events from sidebar
    const handleFinanceTabChange = (event: any) => {
      if (event.detail && ['overview', 'invoices', 'payments', 'deposits', 'approvals', 'reports'].includes(event.detail)) {
        setActiveTab(event.detail);
      }
    };

    window.addEventListener('financeTabChange', handleFinanceTabChange);

    return () => {
      window.removeEventListener('financeTabChange', handleFinanceTabChange);
    };
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout role="finance">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance Dashboard</h2>
          <p className="text-muted-foreground">
            Manage invoices, payments, and financial reporting
          </p>
        </div>

        <div className="border-b">
          <nav className="flex space-x-4 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'invoices'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'payments'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'deposits'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'approvals'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Approvals
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reports'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Reports
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardData.totalRevenue?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-success">+{dashboardData.revenueGrowth || 0}%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Outstanding
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardData.outstandingAmount?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across {dashboardData.outstandingInvoices || 0} invoices</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Profit Margin
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.profitMargin || 0}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Average this month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Approval
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.pendingApprovals || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Invoices to review</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">Unable to load finance dashboard data. Please check your connection.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {dashboardData?.recentInvoices && dashboardData.recentInvoices.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest billing and payment activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>VAT (5%)</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.customer}</TableCell>
                          <TableCell className="text-sm">{invoice.date}</TableCell>
                          <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">${invoice.vat}</TableCell>
                          <TableCell className="font-semibold">${(invoice.amount + invoice.vat).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Recent Invoices</h3>
                    <p className="text-muted-foreground">No invoice data available at this time.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {dashboardData?.contractProfitability && dashboardData.contractProfitability.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Profitability</CardTitle>
                    <CardDescription>Revenue vs Vendor Cost Analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.contractProfitability.map((item) => (
                          <TableRow key={item.contract}>
                            <TableCell className="font-medium">{item.contract}</TableCell>
                            <TableCell>${item.revenue.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">${item.cost.toLocaleString()}</TableCell>
                            <TableCell className="font-semibold text-success">{item.margin}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deposit Tracking</CardTitle>
                    <CardDescription>Customer deposits and refunds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.depositTracking.map((deposit, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold">{deposit.customer}</p>
                            <p className="text-sm text-muted-foreground">
                              Held: ${deposit.held.toLocaleString()} | Pending: ${deposit.pending.toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={deposit.status === 'refund_due' ? 'destructive' : 'default'}>
                            {deposit.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Financial Data</h3>
                    <p className="text-muted-foreground">No contract profitability or deposit data available.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'invoices' && <InvoicesModule />}
        {activeTab === 'payments' && <PaymentsModule />}
        {activeTab === 'deposits' && <DepositPenaltyModule />}
        {activeTab === 'approvals' && <ApprovalWorkflowModule />}
        {activeTab === 'reports' && <FinanceReportsModule />}
      </div>
    </DashboardLayout>
  );
};

export default FinanceDashboard;
