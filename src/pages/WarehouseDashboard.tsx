import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, AlertCircle, FileText, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DispatchEquipmentDialog } from '@/components/forms/DispatchEquipmentDialog';
import { AddRemoveEquipmentDialog } from '@/components/forms/AddRemoveEquipmentDialog';
import { WarehouseOrdersModule } from '@/components/admin/WarehouseOrdersModule';
import { useToast } from '@/hooks/use-toast';

const WarehouseDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [equipmentData, setEquipmentData] = useState([]);
  const [dispatchData, setDispatchData] = useState([]);
  const [returnsData, setReturnsData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [reportsData, setReportsData] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role && role !== 'warehouse' && role !== 'admin') {
      navigate(`/${role}`);
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    // Listen for warehouse tab change events from sidebar
    const handleWarehouseTabChange = (event: any) => {
      if (event.detail && ['overview', 'sales-orders', 'dispatch', 'returns', 'stock', 'reports'].includes(event.detail)) {
        setActiveTab(event.detail);
      }
    };

    window.addEventListener('warehouseTabChange', handleWarehouseTabChange);

    return () => {
      window.removeEventListener('warehouseTabChange', handleWarehouseTabChange);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/warehouse/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch warehouse dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    const fetchEquipmentData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/equipment/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setEquipmentData(data);
        }
      } catch (error) {
        console.error('Failed to fetch equipment data:', error);
      }
    };

    const fetchDispatchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/warehouse/dispatch', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDispatchData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dispatch data:', error);
      }
    };

    const fetchReturnsData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/warehouse/returns', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setReturnsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch returns data:', error);
      }
    };

    const fetchStockData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/warehouse/stock', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStockData(data);
        }
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
      }
    };

    const fetchReportsData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/warehouse/reports', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setReportsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      }
    };

    if (user && (role === 'warehouse' || role === 'admin')) {
      fetchDashboardData();
      fetchEquipmentData();
      fetchDispatchData();
      fetchReturnsData();
      fetchStockData();
      fetchReportsData();
    }
  }, [user, role]);

  // Listen for stock data refresh events
  useEffect(() => {
    const handleStockDataRefresh = () => {
      const fetchStockData = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/warehouse/stock', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setStockData(data);
          }
        } catch (error) {
          console.error('Failed to fetch stock data:', error);
        }
      };
      fetchStockData();
    };

    window.addEventListener('stockDataRefresh', handleStockDataRefresh);

    return () => {
      window.removeEventListener('stockDataRefresh', handleStockDataRefresh);
    };
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout role="warehouse">
      <div className="space-y-6">
        

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Dispatch
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.pendingDispatch || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Orders ready for delivery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expected Returns
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.expectedReturns || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Due this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Low Stock Items
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{dashboardData?.lowStockItems || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
                <CardDescription>Real-time inventory overview</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>On Rent</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentData.length > 0 ? equipmentData.slice(0, 5).map((item) => {
                      const utilization = Math.round((item.quantity_rented / item.quantity_total) * 100);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item_code}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-success font-semibold">{item.quantity_available}</TableCell>
                          <TableCell className="text-primary font-semibold">{item.quantity_rented}</TableCell>
                          <TableCell>{item.quantity_total}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${utilization}%` }} />
                              </div>
                              <span className="text-sm">{utilization}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No equipment data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pending Dispatch</CardTitle>
                      <CardDescription>Orders ready for delivery</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SO ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispatchData.length > 0 ? dispatchData.slice(0, 5).map((dispatch) => (
                        <TableRow key={dispatch.id}>
                          <TableCell className="font-medium">{dispatch.sales_order_id}</TableCell>
                          <TableCell>{dispatch.customer_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">${dispatch.total_amount?.toLocaleString()}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setActiveTab('dispatch');
                                toast({ title: 'View Dispatch', description: `Viewing dispatch details for ${dispatch.sales_order_id}` });
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            <p className="text-muted-foreground">No pending dispatches</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Dispatches appear here after processing sales orders
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expected Returns</CardTitle>
                  <CardDescription>Equipment due back this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contract</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnsData.length > 0 ? returnsData.map((returns) => (
                        <TableRow key={returns.id}>
                          <TableCell className="font-medium">{returns.contract_id}</TableCell>
                          <TableCell>{returns.customer_id}</TableCell>
                          <TableCell className="text-sm">{new Date(returns.return_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {returns.condition || 'pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No expected returns available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'dispatch' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Management</CardTitle>
                  <CardDescription>Dispatched sales orders ready for delivery</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SO ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dispatch Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatchData.length > 0 ? dispatchData.map((dispatch) => (
                    <TableRow key={dispatch.id}>
                      <TableCell className="font-medium">{dispatch.sales_order_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dispatch.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{dispatch.company}</p>
                        </div>
                      </TableCell>
                      <TableCell>{dispatch.project}</TableCell>
                      <TableCell className="font-semibold">${dispatch.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={dispatch.status === 'delivered' ? 'default' : 'secondary'}>
                          {dispatch.status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {dispatch.dispatch_date ? new Date(dispatch.dispatch_date).toLocaleDateString() : 'Pending'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast({ title: 'DO Generated', description: `Delivery Order generated for ${dispatch.sales_order_id}` })}
                          >
                            Create DO
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast({ title: 'Delivery Marked', description: `Order ${dispatch.sales_order_id} marked as delivered` })}
                          >
                            Mark Delivered
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast({ title: 'DO Printed', description: `Delivery Order printed for ${dispatch.sales_order_id}` })}
                          >
                            Print DO
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No dispatch orders available</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Orders will appear here after warehouse clicks "Dispatch" in the Sales Orders tab
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'returns' && (
          <Card>
            <CardHeader>
              <CardTitle>Return Management</CardTitle>
              <CardDescription>Early Return Notes, Inspection Notes, and Damage Recording</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Missing/Damaged</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsData.length > 0 ? returnsData.map((returns) => (
                    <TableRow key={returns.id}>
                      <TableCell className="font-medium">{returns.contract_id}</TableCell>
                      <TableCell>{returns.customer_id}</TableCell>
                      <TableCell className="text-sm">{new Date(returns.return_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {returns.condition || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{returns.quantity} items</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">None</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast({ title: 'Early Return Note', description: `Early return note created for ${returns.contract_id}` })}
                          >
                            Add Return
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast({ title: 'Inspection Note', description: `Return inspection note created for ${returns.contract_id}` })}
                          >
                            Inspect
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast({ title: 'Damage Recorded', description: `Missing/damaged items recorded for ${returns.contract_id}` })}
                          >
                            Record Damage
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => toast({ title: 'Return Approved', description: `Return approved for ${returns.contract_id}` })}
                          >
                            Approve Return
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No return requests available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'sales-orders' && <WarehouseOrdersModule />}

        {activeTab === 'stock' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Control</CardTitle>
                  <CardDescription>Item Master View with real-time stock status</CardDescription>
                </div>
                {role === 'warehouse' || role === 'admin' ? <AddRemoveEquipmentDialog /> : null}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Under Maintenance</TableHead>
                    <TableHead>On Rent</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.length > 0 ? stockData.map((item) => {
                    const utilization = Math.round((item.quantity_rented / item.quantity_total) * 100);
                    const status = item.quantity_available < 10 ? 'critical' : item.quantity_available < 50 ? 'low' : 'good';
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_code}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-success font-semibold">{item.quantity_available}</TableCell>
                        <TableCell className="text-warning font-semibold">0</TableCell>
                        <TableCell className="text-muted-foreground font-semibold">{item.quantity_maintenance}</TableCell>
                        <TableCell className="text-primary font-semibold">{item.quantity_rented}</TableCell>
                        <TableCell>{item.quantity_total}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${utilization}%` }} />
                            </div>
                            <span className="text-sm">{utilization}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status === 'critical' ? 'destructive' : status === 'low' ? 'secondary' : 'default'}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast({ title: 'View Stock', description: `Viewing stock for ${item.item_code}` })}
                            >
                              View Stock
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast({ title: 'Update Quantity', description: `Updating quantity for ${item.item_code}` })}
                            >
                              Update Quantity
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast({ title: 'Add Adjustment', description: `Adding adjustment for ${item.item_code}` })}
                            >
                              Add Adjustment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-4">
                        No stock data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">Stock Adjustment & Audit</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toast({ title: 'Adjustment Added', description: 'Stock adjustment added and auto-updated after inspection' })}
                  >
                    Add Adjustment
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => toast({ title: 'Sent for Review', description: 'Adjustment sent for finance review' })}
                  >
                    Send for Finance Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reports' && (
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Reports</CardTitle>
              <CardDescription>Stock utilization and damaged/missing item summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Stock Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportsData?.stockUtilization || 0}%</div>
                    <p className="text-xs text-muted-foreground">Average across all items</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Damaged Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{reportsData?.damagedItems || 0}</div>
                    <p className="text-xs text-muted-foreground">Items requiring repair</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Missing Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">{reportsData?.missingItems || 0}</div>
                    <p className="text-xs text-muted-foreground">Items not returned</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Damaged/Missing Item Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Damaged</TableHead>
                      <TableHead>Missing</TableHead>
                      <TableHead>Total Loss</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData?.damagedMissingItems && reportsData.damagedMissingItems.length > 0 ? reportsData.damagedMissingItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_code}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-destructive font-semibold">{item.quantity_damaged || 0}</TableCell>
                        <TableCell className="text-warning font-semibold">{item.quantity_missing || 0}</TableCell>
                        <TableCell className="font-semibold">{(item.quantity_damaged || 0) + (item.quantity_missing || 0)}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {item.status || 'unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No damaged or missing items
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast({ title: 'Report Generated', description: 'Stock utilization report generated' })}
                >
                  Generate Report
                </Button>
                <Button
                  variant="default"
                  onClick={() => toast({ title: 'Report Exported', description: 'Report exported as PDF' })}
                >
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
