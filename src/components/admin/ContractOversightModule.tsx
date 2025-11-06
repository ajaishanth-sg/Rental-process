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
  start_date?: string;
  end_date?: string;
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
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                {/* Professional Quotation Header */}
                                <div className="border-b-2 border-primary pb-4 mb-6">
                                  <div className="flex items-start justify-between">
                                    {/* Company Logo and Details */}
                                    <div className="flex items-start gap-4">
                                      <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center border-2 border-primary/20">
                                        <FileText className="h-10 w-10 text-primary" />
                                      </div>
                                      <div>
                                        <h2 className="text-2xl font-bold text-primary mb-1">QUOTATION</h2>
                                        <p className="text-sm text-muted-foreground font-medium">Equipment Rental Services</p>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                          <p>123 Business Street, Dubai, UAE</p>
                                          <p>Tel: +971 4 XXX XXXX | Email: info@company.ae</p>
                                          <p>Website: www.company.ae</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Quotation Info */}
                                    <div className="text-right">
                                      <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                                        <p className="text-xs text-muted-foreground mb-1">Quotation Number</p>
                                        <p className="text-lg font-bold text-primary">{quotation.quotation_id}</p>
                                      </div>
                                      <div className="mt-3 text-xs text-muted-foreground">
                                        <p><span className="font-medium">Date:</span> {quotation.createdDate || new Date().toLocaleDateString()}</p>
                                        <p><span className="font-medium">Valid Until:</span> {quotation.validUntil || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Quotation Body */}
                                <div className="space-y-6">
                                  {/* Customer Information Section */}
                                  <div className="border rounded-lg p-4 bg-muted/30">
                                    <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Bill To:</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-semibold text-foreground mb-1">{quotation.customerName || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">{quotation.company || 'N/A'}</p>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        <p className="mb-1"><span className="font-medium">Status:</span> {getStatusBadge(quotation.status)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Project Details Section */}
                                  <div className="border rounded-lg p-4">
                                    <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Project Details</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-start py-2 border-b">
                                        <span className="text-sm font-medium text-muted-foreground">Project Name:</span>
                                        <span className="text-sm font-semibold text-right">{quotation.project || 'N/A'}</span>
                                      </div>
                                      {quotation.enquiry_id && (
                                        <div className="flex justify-between items-start py-2 border-b">
                                          <span className="text-sm font-medium text-muted-foreground">Enquiry Reference:</span>
                                          <span className="text-sm font-semibold text-right">{quotation.enquiry_id}</span>
                                        </div>
                                      )}
                                      {quotation.rental_id && (
                                        <div className="flex justify-between items-start py-2 border-b">
                                          <span className="text-sm font-medium text-muted-foreground">Rental ID:</span>
                                          <span className="text-sm font-semibold text-right">{quotation.rental_id}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Financial Summary */}
                                  <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Quotation Amount</p>
                                        <p className="text-3xl font-bold text-primary">${quotation.totalAmount.toLocaleString()}</p>
                                      </div>
                                      <div className="text-right">
                                        <Badge variant={quotation.status === 'sent' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                          {quotation.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Information */}
                                  <div className="border rounded-lg p-4 bg-muted/20">
                                    <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Additional Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <p className="font-medium text-muted-foreground mb-1">Quotation Status</p>
                                        <p className="text-sm">{quotation.status}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-muted-foreground mb-1">Created Date</p>
                                        <p className="text-sm">{quotation.createdDate || new Date().toLocaleDateString()}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-muted-foreground mb-1">Valid Until</p>
                                        <p className="text-sm">{quotation.validUntil || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Footer Note */}
                                  <div className="text-xs text-muted-foreground text-center border-t pt-4 mt-6">
                                    <p className="font-medium mb-2">Thank you for your business!</p>
                                    <p>This quotation is valid until the date specified above. Please contact us for any questions or clarifications.</p>
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
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                {/* Professional Contract Header */}
                                <div className="border-b-2 border-primary pb-4 mb-6">
                                  <div className="flex items-start justify-between">
                                    {/* Company Logo and Details */}
                                    <div className="flex items-start gap-4">
                                      <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center border-2 border-primary/20">
                                        <FileText className="h-10 w-10 text-primary" />
                                      </div>
                                      <div>
                                        <h2 className="text-2xl font-bold text-primary mb-1">CONTRACT</h2>
                                        <p className="text-sm text-muted-foreground font-medium">Equipment Rental Agreement</p>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                          <p>123 Business Street, Dubai, UAE</p>
                                          <p>Tel: +971 4 XXX XXXX | Email: info@company.ae</p>
                                          <p>Website: www.company.ae</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Contract Info */}
                                    <div className="text-right">
                                      <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                                        <p className="text-xs text-muted-foreground mb-1">Contract Number</p>
                                        <p className="text-lg font-bold text-primary">{contract.contract_id}</p>
                                      </div>
                                      <div className="mt-3 text-xs text-muted-foreground">
                                        <p><span className="font-medium">Sales Order:</span> {contract.sales_order_id || 'N/A'}</p>
                                        <p><span className="font-medium">Status:</span> {contract.status || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Contract Body */}
                                <div className="space-y-6">
                                  {/* Customer Information Section */}
                                  <div className="border rounded-lg p-4 bg-muted/30">
                                    <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Contract Parties:</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1 font-medium">Customer Name:</p>
                                        <p className="text-sm font-semibold text-foreground mb-2">{contract.customer_name || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground mb-1 font-medium">Company:</p>
                                        <p className="text-xs text-foreground">{contract.company || 'N/A'}</p>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        <p className="mb-1"><span className="font-medium">Contract Status:</span></p>
                                        <div className="mb-3">{getStatusBadge(contract.status)}</div>
                                        <p className="mb-1"><span className="font-medium">Created:</span> {contract.created_at ? new Date(contract.created_at).toLocaleDateString() : 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Project Details Section */}
                                  <div className="border rounded-lg p-4">
                                    <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Project Details</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-start py-2 border-b">
                                        <span className="text-sm font-medium text-muted-foreground">Project Name:</span>
                                        <span className="text-sm font-semibold text-right">{contract.project || 'N/A'}</span>
                                      </div>
                                      {contract.sales_order_id && (
                                        <div className="flex justify-between items-start py-2 border-b">
                                          <span className="text-sm font-medium text-muted-foreground">Sales Order ID:</span>
                                          <span className="text-sm font-semibold text-right">{contract.sales_order_id}</span>
                                        </div>
                                      )}
                                      {contract.start_date && (
                                        <div className="flex justify-between items-start py-2 border-b">
                                          <span className="text-sm font-medium text-muted-foreground">Start Date:</span>
                                          <span className="text-sm font-semibold text-right">{new Date(contract.start_date).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      {contract.end_date && (
                                        <div className="flex justify-between items-start py-2 border-b">
                                          <span className="text-sm font-medium text-muted-foreground">End Date:</span>
                                          <span className="text-sm font-semibold text-right">{new Date(contract.end_date).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Stock Information Section */}
                                  {contract.stock_checked && (
                                    <div className="border rounded-lg p-4 bg-muted/20">
                                      <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Stock Status</h3>
                                      <div className="flex items-center gap-3">
                                        <Badge variant={contract.stock_available ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                                          {contract.stock_available ? '✓ In Stock' : '✗ Out of Stock'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          Stock verification {contract.stock_available ? 'completed and available' : 'completed - stock unavailable'}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Financial Summary */}
                                  <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Contract Amount</p>
                                        <p className="text-3xl font-bold text-primary">${contract.total_amount?.toLocaleString() || '0'}</p>
                                      </div>
                                      <div className="text-right">
                                        <Badge 
                                          variant={
                                            contract.status === 'approved' ? 'default' : 
                                            contract.status === 'rejected' ? 'destructive' : 
                                            'secondary'
                                          } 
                                          className="text-sm px-3 py-1"
                                        >
                                          {contract.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Information */}
                                  <div className="border rounded-lg p-4 bg-muted/20">
                                    <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Contract Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <p className="font-medium text-muted-foreground mb-1">Contract ID</p>
                                        <p className="text-sm">{contract.contract_id || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-muted-foreground mb-1">Sales Order ID</p>
                                        <p className="text-sm">{contract.sales_order_id || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-muted-foreground mb-1">Contract Status</p>
                                        <p className="text-sm">{contract.status?.replace('_', ' ').toUpperCase() || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-muted-foreground mb-1">Created Date</p>
                                        <p className="text-sm">{contract.created_at ? new Date(contract.created_at).toLocaleDateString() : 'N/A'}</p>
                                      </div>
                                      {contract.start_date && (
                                        <div>
                                          <p className="font-medium text-muted-foreground mb-1">Start Date</p>
                                          <p className="text-sm">{new Date(contract.start_date).toLocaleDateString()}</p>
                                        </div>
                                      )}
                                      {contract.end_date && (
                                        <div>
                                          <p className="font-medium text-muted-foreground mb-1">End Date</p>
                                          <p className="text-sm">{new Date(contract.end_date).toLocaleDateString()}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Footer Note */}
                                  <div className="text-xs text-muted-foreground text-center border-t pt-4 mt-6">
                                    <p className="font-medium mb-2">Contract Agreement</p>
                                    <p>This contract is subject to approval and terms and conditions. Please review all details carefully before approval.</p>
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

