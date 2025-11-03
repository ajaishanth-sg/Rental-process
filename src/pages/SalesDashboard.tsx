import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, TrendingUp, Plus, DollarSign, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateContractDialog } from '@/components/forms/CreateContractDialog';
import { CustomerModule } from '@/components/admin/CustomerModule';
import { ContractsModule } from '@/components/admin/ContractsModule';
import { InvoicesModule } from '@/components/admin/InvoicesModule';
import EnquiryManagementModule from '@/components/sales/EnquiryManagementModule';
import QuotationManagementModule from '@/components/sales/QuotationManagementModule';
import SalesOrderManagementModule from '@/components/sales/SalesOrderManagementModule';
import CustomerCommunicationModule from '@/components/sales/CustomerCommunicationModule';
import SalesCrmModule from '@/components/sales/SalesCrmModule';
import { useToast } from '@/hooks/use-toast';

const SalesDashboard = () => {
   const { user, role, loading } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
   const [activeTab, setActiveTab] = useState('overview');
   const [dashboardData, setDashboardData] = useState(null);
   const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role && role !== 'sales' && role !== 'admin') {
      navigate(`/${role}`);
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/sales/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch sales dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && (role === 'sales' || role === 'admin')) {
      fetchDashboardData();
    }
  }, [user, role]);

  useEffect(() => {
    // Check for hash in URL to set active tab
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'enquiries', 'quotations', 'sales-orders', 'contracts', 'customers', 'communication', 'reports', 'crm'].includes(hash)) {
      setActiveTab(hash);
    }

    // Listen for sales tab change events from sidebar
    const handleSalesTabChange = (event: any) => {
      console.log('Sales tab change event:', event.detail);
      if (event.detail && ['overview', 'contracts', 'quotations', 'customers', 'reports', 'enquiries', 'sales-orders', 'communication', 'crm'].includes(event.detail)) {
        setActiveTab(event.detail);
      }
    };

    // Listen for convert to quotation events from enquiries
    const handleConvertToQuotation = (event: any) => {
      if (event.detail) {
        setActiveTab('quotations');
        // Dispatch event to QuotationManagementModule
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openQuotationFromEnquiry', { detail: event.detail }));
        }, 100);
      }
    };

    window.addEventListener('salesTabChange', handleSalesTabChange);
    window.addEventListener('convertToQuotation', handleConvertToQuotation);

    return () => {
      window.removeEventListener('salesTabChange', handleSalesTabChange);
      window.removeEventListener('convertToQuotation', handleConvertToQuotation);
    };
  }, []);

  // Update hash when activeTab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  if (loading) return null;

  return (
    <DashboardLayout role="sales">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Dashboard</h2>
          <p className="text-muted-foreground">
            Manage rental contracts, quotations, and customer relationships
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
           <TabsList className="grid w-full grid-cols-9">
             <TabsTrigger value="overview">Overview</TabsTrigger>
             <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
             <TabsTrigger value="quotations">Quotations</TabsTrigger>
             <TabsTrigger value="sales-orders">Sales Orders</TabsTrigger>
             <TabsTrigger value="contracts">Contracts</TabsTrigger>
             <TabsTrigger value="customers">Customers</TabsTrigger>
             <TabsTrigger value="communication">Communication</TabsTrigger>
             <TabsTrigger value="reports">Reports</TabsTrigger>
             <TabsTrigger value="crm">CRM</TabsTrigger>
           </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div></div>
              <CreateContractDialog />
            </div>

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
            ) : !dashboardData ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">Unable to load sales dashboard data. Please check your connection.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Contracts
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{typeof dashboardData.activeContracts === 'number' ? dashboardData.activeContracts : (typeof dashboardData.convertedContracts === 'number' ? dashboardData.convertedContracts : 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-success">+{dashboardData.newContractsThisWeek || 0}</span> new this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Approval
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{typeof dashboardData.pendingApprovals === 'number' ? dashboardData.pendingApprovals : (typeof dashboardData.activeQuotations === 'number' ? dashboardData.activeQuotations : 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Revenue (Month)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${typeof dashboardData.monthlyRevenue === 'number' ? dashboardData.monthlyRevenue.toLocaleString() : '0'}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-success">+{typeof dashboardData.revenueGrowth === 'number' ? dashboardData.revenueGrowth : 0}%</span> vs last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Customers
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{typeof dashboardData.totalCustomers === 'number' ? dashboardData.totalCustomers : 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-success">+{typeof dashboardData.newCustomersThisMonth === 'number' ? dashboardData.newCustomersThisMonth : 0}</span> new this month
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {dashboardData?.recentContracts && dashboardData.recentContracts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Contracts</CardTitle>
                    <CardDescription>Latest rental agreements and their status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.recentContracts.map((contract, index) => (
                          <TableRow key={contract?.id || index}>
                            <TableCell className="font-medium">{contract?.id || "N/A"}</TableCell>
                            <TableCell>{contract?.customer || "N/A"}</TableCell>
                            <TableCell className="font-semibold">${contract?.amount?.toLocaleString() || "0"}</TableCell>
                            <TableCell>
                              <Badge variant={contract?.status === 'active' ? 'default' : 'secondary'}>
                                {contract?.status?.replace('_', ' ') || "unknown"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                    <CardDescription>Highest revenue generators this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.topCustomers && dashboardData.topCustomers.length > 0 ? (
                        dashboardData.topCustomers.map((customer, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-semibold">{customer?.name || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{customer?.contracts || 0} active contracts</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${customer?.revenue?.toLocaleString() || "0"}</p>
                              <p className="text-xs text-success">{customer?.trend || "N/A"}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No top customers data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {dashboardData?.pendingQuotations && dashboardData.pendingQuotations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Quotations</CardTitle>
                  <CardDescription>Awaiting customer approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quote ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.pendingQuotations.map((quote, index) => (
                        <TableRow key={quote?.id || index}>
                          <TableCell className="font-medium">{quote?.id || "N/A"}</TableCell>
                          <TableCell>{quote?.customer || "N/A"}</TableCell>
                          <TableCell>{quote?.project || "N/A"}</TableCell>
                          <TableCell className="text-sm">{quote?.equipment || "N/A"}</TableCell>
                          <TableCell className="font-semibold">${quote?.amount?.toLocaleString() || "0"}</TableCell>
                          <TableCell className="text-sm">{quote?.validUntil || "N/A"}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast({ title: 'Follow Up', description: `Following up with ${quote?.customer || "customer"}` })}
                            >
                              Follow Up
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="enquiries">
            <EnquiryManagementModule />
          </TabsContent>

          <TabsContent value="quotations">
            <QuotationManagementModule />
          </TabsContent>

          <TabsContent value="sales-orders">
            <SalesOrderManagementModule />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsModule />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerModule />
          </TabsContent>

          <TabsContent value="communication">
            <CustomerCommunicationModule />
          </TabsContent>

          <TabsContent value="crm">
            <SalesCrmModule />
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Reports</CardTitle>
                  <CardDescription>Analytics and insights for sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.salesReports ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Enquiry Conversion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{dashboardData.salesReports.enquiryConversionRate || 0}%</div>
                          <p className="text-xs text-muted-foreground">+{dashboardData.salesReports.conversionGrowth || 0}% from last month</p>
                        </CardContent>
                      </Card>
   
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Monthly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${dashboardData.salesReports.monthlyRevenue?.toLocaleString() || "0"}</div>
                          <p className="text-xs text-muted-foreground">+{dashboardData.salesReports.revenueGrowth || 0}% from last month</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Active Contracts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{dashboardData.salesReports.activeContracts || 0}</div>
                          <p className="text-xs text-muted-foreground">+{dashboardData.salesReports.newContractsThisWeek || 0} new this week</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Average Deal Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${dashboardData.salesReports.averageDealSize?.toLocaleString() || "0"}</div>
                          <p className="text-xs text-muted-foreground">+{dashboardData.salesReports.dealSizeGrowth || 0}% from last month</p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                          <CardHeader className="pb-2">
                            <Skeleton className="h-5 w-32" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {dashboardData?.salesReports?.revenueTrends ? (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Revenue chart data: {JSON.stringify(dashboardData.salesReports.revenueTrends)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No revenue trend data available</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active vs Closed Contracts Summary</CardTitle>
                    <CardDescription>Overview of contract status distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.salesReports?.contractStatusSummary && dashboardData.salesReports.contractStatusSummary.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.salesReports.contractStatusSummary.map((status, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 ${status?.color || "bg-gray-400"} rounded-full`}></div>
                              <span className="font-medium">{status?.label || "N/A"}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{status?.count || 0}</p>
                              <p className="text-sm text-muted-foreground">{status?.percentage || 0}% of total</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No contract status data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Enquiry to Contract Conversion</CardTitle>
                    <CardDescription>Track the sales funnel performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.salesReports?.conversionFunnel && dashboardData.salesReports.conversionFunnel.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.salesReports.conversionFunnel.map((stage, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{stage?.label || "N/A"}</span>
                              <span className="font-medium">{stage?.count || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${stage?.color || "bg-gray-400"}`} style={{width: `${stage?.percentage || 0}%`}}></div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Conversion Rate:</strong> {dashboardData.salesReports.overallConversionRate || 0}% (Enquiries to Contracts)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No conversion funnel data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Download Reports</CardTitle>
                  <CardDescription>Export detailed sales reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Download Excel Report
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Detailed Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SalesDashboard;

