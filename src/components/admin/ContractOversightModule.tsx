import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, FileText, Eye, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Quotation {
  id: string;
  quotation_id: string;
  customerName: string;
  company: string;
  project: string;
  totalAmount: number;
  status: string;
  createdDate: string;
  validUntil: string;
  enquiry_id?: string;
  rental_id?: string;
}

interface SalesOrder {
  id: string;
  sales_order_id: string;
  customer_name: string;
  company: string;
  project: string;
  total_amount: number;
  status: string;
  stock_checked: boolean;
  stock_available: boolean;
  quotation_id: string;
  created_at: string;
}

interface Contract {
  id: string;
  contract_id: string;
  sales_order_id: string;
  customer_name: string;
  company: string;
  project: string;
  total_amount: number;
  status: string;
  stock_checked: boolean;
  stock_available: boolean;
  created_at: string;
}

export const ContractOversightModule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Fetch quotations pending approval
      const quotationsResponse = await fetch('http://localhost:8000/api/admin/quotations/pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (quotationsResponse.ok) {
        const data = await quotationsResponse.json();
        setQuotations(data);
      }

      // Fetch sales orders pending approval
      const ordersResponse = await fetch('http://localhost:8000/api/admin/sales-orders/pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (ordersResponse.ok) {
        const data = await ordersResponse.json();
        setSalesOrders(data);
      }

      // Fetch contracts pending approval
      const contractsResponse = await fetch('http://localhost:8000/api/admin/contracts/pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (contractsResponse.ok) {
        const data = await contractsResponse.json();
        setContracts(data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuotation = async (quotationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/quotations/${quotationId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Quotation approved successfully and sent to Sales Orders');
        fetchData();
      } else {
        toast.error('Failed to approve quotation');
      }
    } catch (error) {
      console.error('Error approving quotation:', error);
      toast.error('Failed to approve quotation');
    }
  };

  const handleRejectQuotation = async (quotationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/quotations/${quotationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Quotation rejected');
        fetchData();
      } else {
        toast.error('Failed to reject quotation');
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      toast.error('Failed to reject quotation');
    }
  };

  const handleApproveContract = async (contractId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Approving contract:', contractId);

      const response = await fetch(`http://localhost:8000/api/admin/contracts/${contractId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Contract approval result:', result);

        // Show success message with action buttons using sonner's action feature
        toast.success(
          `✅ Contract Approved! Invoice ${result.invoice_id} created and sent to warehouse. Click below to view in Finance or Sales dashboard.`,
          {
            duration: 10000,
            action: {
              label: 'View in Finance',
              onClick: () => {
                navigate('/finance');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('financeTabChange', { detail: 'invoices' }));
                }, 100);
              },
            },
          }
        );

        // Also show a secondary toast for Sales navigation
        setTimeout(() => {
          toast.info('💼 View contract in Sales Dashboard', {
            duration: 8000,
            action: {
              label: 'Go to Sales',
              onClick: () => {
                navigate('/sales');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('salesTabChange', { detail: 'contracts' }));
                }, 100);
              },
            },
          });
        }, 500);

        fetchData();
      } else {
        const errorText = await response.text();
        console.error('Failed to approve contract:', errorText);
        toast.error(`Failed to approve contract: ${errorText}`);
      }
    } catch (error) {
      console.error('Error approving contract:', error);
      toast.error('Failed to approve contract. Please check your connection.');
    }
  };

  const handleRejectContract = async (contractId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/contracts/${contractId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.error(`❌ Contract ${contractId} rejected. Sales order status reverted to approved.`, {
          duration: 5000,
        });
        fetchData();
      } else {
        const errorText = await response.text();
        console.error('Failed to reject contract:', errorText);
        toast.error(`Failed to reject contract: ${errorText}`);
      }
    } catch (error) {
      console.error('Error rejecting contract:', error);
      toast.error('Failed to reject contract. Please check your connection.');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      sent: 'default',
      approved: 'default',
      rejected: 'destructive',
      pending_approval: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contract Oversight</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Contract Oversight</h3>
        <p className="text-sm text-muted-foreground">Review and approve quotations and sales orders</p>
      </div>

      <Tabs defaultValue="enquiries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enquiries">Enquiries / Quotations</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="orders">Sales Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="enquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quotations Pending Approval</CardTitle>
              <CardDescription>Review and approve or reject quotations sent by sales team</CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quotations pending approval</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">{quotation.quotation_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{quotation.customerName}</p>
                            <p className="text-sm text-muted-foreground">{quotation.company}</p>
                          </div>
                        </TableCell>
                        <TableCell>{quotation.project}</TableCell>
                        <TableCell className="font-semibold">${quotation.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                        <TableCell className="text-sm">{quotation.validUntil}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedItem(quotation)}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Quotation Details - {quotation.quotation_id}</DialogTitle>
                                  <DialogDescription>Review quotation details</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Customer</label>
                                      <p className="text-sm text-muted-foreground">{quotation.customerName}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Company</label>
                                      <p className="text-sm text-muted-foreground">{quotation.company}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Project</label>
                                      <p className="text-sm text-muted-foreground">{quotation.project}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Total Amount</label>
                                      <p className="text-lg font-semibold">${quotation.totalAmount.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveQuotation(quotation.quotation_id)}
                              disabled={quotation.status !== 'sent'}
                            >
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectQuotation(quotation.quotation_id)}
                              disabled={quotation.status !== 'sent'}
                            >
                              <XCircle className="h-3 w-3 mr-1 text-red-600" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contracts Pending Approval</CardTitle>
              <CardDescription>Review and approve contract requests from sales team</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contracts pending approval</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract ID</TableHead>
                      <TableHead>Sales Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Stock Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contract_id}</TableCell>
                        <TableCell className="text-sm">{contract.sales_order_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contract.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{contract.company}</p>
                          </div>
                        </TableCell>
                        <TableCell>{contract.project}</TableCell>
                        <TableCell className="font-semibold">${contract.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {contract.stock_checked ? (
                            <Badge variant={contract.stock_available ? 'default' : 'destructive'}>
                              {contract.stock_available ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not Checked</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedItem(contract)}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Contract Details - {contract.contract_id}</DialogTitle>
                                  <DialogDescription>Review contract details</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Contract ID</label>
                                      <p className="text-sm text-muted-foreground">{contract.contract_id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Sales Order ID</label>
                                      <p className="text-sm text-muted-foreground">{contract.sales_order_id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Customer</label>
                                      <p className="text-sm text-muted-foreground">{contract.customer_name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Company</label>
                                      <p className="text-sm text-muted-foreground">{contract.company}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Project</label>
                                      <p className="text-sm text-muted-foreground">{contract.project}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Total Amount</label>
                                      <p className="text-lg font-semibold">${contract.total_amount.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveContract(contract.contract_id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                              {contract.status === 'approved' ? 'Approved' : 'Approve'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectContract(contract.contract_id)}
                            >
                              <XCircle className="h-3 w-3 mr-1 text-red-600" />
                              {contract.status === 'rejected' ? 'Rejected' : 'Reject'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Orders</CardTitle>
              <CardDescription>View approved sales orders ready for warehouse processing</CardDescription>
            </CardHeader>
            <CardContent>
              {salesOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sales orders available</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SO ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Stock Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.sales_order_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.company}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.project}</TableCell>
                        <TableCell className="font-semibold">${order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {order.stock_checked ? (
                            <Badge variant={order.stock_available ? 'default' : 'destructive'}>
                              {order.stock_available ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not Checked</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractOversightModule;

