import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

interface SalesOrder {
  id: string;
  sales_order_id?: string;
  quotation_id?: string;
  quotationId?: string;
  customer_name?: string;
  customerName?: string;
  company: string;
  project: string;
  equipment?: string[];
  items?: any[];
  total_amount?: number;
  totalAmount?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'pending_contract_approval' | 'processing' | 'completed';
  created_at?: string;
  createdDate?: string;
  stock_checked?: boolean;
  stockChecked?: boolean;
  stock_available?: boolean;
  stockAvailable?: boolean;
  notes?: string;
}

const SalesOrderManagementModule = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockCheckResults, setStockCheckResults] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }

      console.log('Fetching sales orders...');
      const response = await fetch('http://localhost:8000/api/sales/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched sales orders:', data);
        setSalesOrders(data);
      } else {
        console.error('Failed to fetch sales orders:', response.status);
        sonnerToast.error('Failed to load sales orders');
      }
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      sonnerToast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };


  const handleCheckStock = async (salesOrderId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Checking stock for sales order:', salesOrderId);

      const response = await fetch(`http://localhost:8000/api/sales/orders/${salesOrderId}/check-stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const isAvailable = result.stock_available;

        console.log('Stock check result:', result);

        setStockCheckResults({ ...stockCheckResults, [salesOrderId]: isAvailable });

        // Update the sales order in state - match by sales_order_id
        setSalesOrders(salesOrders.map(order => {
          const orderSalesId = order.sales_order_id || order.quotationId;
          return orderSalesId === salesOrderId
            ? { ...order, stockChecked: true, stock_checked: true, stockAvailable: isAvailable, stock_available: isAvailable }
            : order;
        }));

        sonnerToast.success(
          isAvailable ? '✅ All items are in stock!' : '⚠️ Some items are out of stock'
        );
      } else {
        const errorText = await response.text();
        console.error('Failed to check stock:', errorText);
        sonnerToast.error(`Failed to check stock: ${errorText}`);
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      sonnerToast.error('Failed to check stock');
    }
  };

  const handleCreateContract = async (order: SalesOrder) => {
    const salesOrderId = order.sales_order_id || order.quotationId || order.id;
    
    // Check if stock has been checked
    if (!(order.stockChecked || order.stock_checked)) {
      sonnerToast.error('⚠️ Please check stock availability before creating contract');
      return;
    }

    // Check if order status is approved
    if (order.status !== 'approved') {
      if (order.status === 'pending_contract_approval') {
        sonnerToast.info('ℹ️ Contract request is already pending admin approval');
      } else if (order.status === 'pending_approval') {
        sonnerToast.warning('⚠️ Sales order is pending approval. Please wait for approval before creating contract.');
      } else {
        sonnerToast.warning(`⚠️ Cannot create contract. Order status must be "approved" (current: ${order.status.replace('_', ' ')})`);
      }
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      console.log('Creating contract request for sales order:', salesOrderId);
      
      const response = await fetch(`http://localhost:8000/api/sales/orders/${salesOrderId}/create-contract`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Create contract result:', result);
        
        // Update the sales order status in state - match by sales_order_id
        setSalesOrders(salesOrders.map(o => {
          const oSalesId = o.sales_order_id || o.quotationId;
          return oSalesId === salesOrderId ? { ...o, status: 'pending_contract_approval' as const } : o;
        }));
        
        sonnerToast.success(`✅ Contract request ${result.contract_id} sent to Admin for approval!`);
      } else {
        const errorText = await response.text();
        console.error('Failed to create contract:', errorText);
        sonnerToast.error(`Failed to create contract: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      sonnerToast.error('Failed to create contract');
    }
  };

  const getStatusColor = (status: SalesOrder['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending_approval': return 'default';
      case 'approved': return 'default';
      case 'pending_contract_approval': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: SalesOrder['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending_approval': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sales Order Management</h3>
          <p className="text-sm text-muted-foreground">
            Sales orders are automatically created when Admin approves quotations. Check stock and create contracts for fulfillment.
          </p>
        </div>
        <Button onClick={fetchSalesOrders} variant="outline">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Orders</CardTitle>
          <CardDescription>Track sales orders from creation to fulfillment</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading sales orders...</p>
            </div>
          ) : salesOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sales Orders</h3>
              <p className="text-muted-foreground mb-4">
                Sales orders are created when quotations are approved by Admin.
              </p>
              <p className="text-sm text-muted-foreground">
                Once a quotation is approved in the Admin Contract Oversight module, it will appear here. Check stock and create contracts to proceed with fulfillment.
              </p>
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
                {salesOrders.map((order) => {
                  const displayId = order.sales_order_id || order.quotationId || order.id;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{displayId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName || order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.company}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.project}</TableCell>
                      <TableCell className="font-semibold">${(order.totalAmount || order.total_amount)?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.stockChecked || order.stock_checked ? (
                            <Badge variant={(order.stockAvailable || order.stock_available) ? 'default' : 'destructive'}>
                              {(order.stockAvailable || order.stock_available) ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not Checked</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!(order.stockChecked || order.stock_checked) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckStock(displayId)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Check Stock
                            </Button>
                          )}
                          <Button
                            variant={order.status === 'pending_contract_approval' ? 'secondary' : 'default'}
                            size="sm"
                            onClick={() => handleCreateContract(order)}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            {order.status === 'pending_contract_approval' ? 'Contract Pending' : 'Create Contract'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesOrderManagementModule;