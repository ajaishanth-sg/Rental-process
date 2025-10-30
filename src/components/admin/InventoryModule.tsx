import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, CheckCircle, XCircle, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const inventoryData = [
  { id: '1', itemCode: 'SCAFF-001', description: 'Aluminum Scaffolding Frame', category: 'Scaffolding', totalQty: 100, availableQty: 45, rentedQty: 50, damagedQty: 5, status: 'available', lastUpdated: '2025-01-20' },
  { id: '2', itemCode: 'FORM-001', description: 'Plywood Formwork Panel', category: 'Formwork', totalQty: 80, availableQty: 35, rentedQty: 40, damagedQty: 5, status: 'available', lastUpdated: '2025-01-19' },
  { id: '3', itemCode: 'SHORE-001', description: 'Adjustable Shoring Props', category: 'Shoring', totalQty: 150, availableQty: 0, rentedQty: 145, damagedQty: 5, status: 'rented', lastUpdated: '2025-01-18' },
  { id: '4', itemCode: 'SAFETY-001', description: 'Safety Harness Set', category: 'Safety', totalQty: 200, availableQty: 180, rentedQty: 15, damagedQty: 5, status: 'available', lastUpdated: '2025-01-20' },
];

const transactionData = [
  { id: '1', itemCode: 'SCAFF-001', type: 'dispatch', quantity: 10, reason: 'New rental contract RC-2025-001', date: '2025-01-20', approved: true, approvedBy: 'Warehouse Manager' },
  { id: '2', itemCode: 'FORM-001', type: 'return', quantity: 5, reason: 'Contract completion RC-2025-003', date: '2025-01-19', approved: true, approvedBy: 'Warehouse Manager' },
  { id: '3', itemCode: 'SHORE-001', type: 'damage', quantity: 2, reason: 'Equipment damaged during use', date: '2025-01-18', approved: false, approvedBy: null },
  { id: '4', itemCode: 'SAFETY-001', type: 'adjustment', quantity: -3, reason: 'Inventory count discrepancy', date: '2025-01-17', approved: true, approvedBy: 'Warehouse Manager' },
];

export const InventoryModule = () => {
  const [inventory, setInventory] = useState(inventoryData);
  const [transactions, setTransactions] = useState(transactionData);
  const [activeTab, setActiveTab] = useState('inventory');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      available: 'default',
      rented: 'secondary',
      maintenance: 'outline',
      damaged: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getTransactionTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      dispatch: TrendingDown,
      return: TrendingUp,
      damage: AlertTriangle,
      adjustment: Package,
    };
    const IconComponent = icons[type] || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleApproveTransaction = (transaction: any) => {
    const updatedTransaction = { ...transaction, approved: true, approvedBy: 'Admin User' };
    setTransactions(transactions.map(t => t.id === transaction.id ? updatedTransaction : t));

    // Update inventory based on transaction type
    const inventoryItem = inventory.find(item => item.itemCode === transaction.itemCode);
    if (inventoryItem) {
      let updatedItem = { ...inventoryItem };
      switch (transaction.type) {
        case 'dispatch':
          updatedItem.rentedQty += transaction.quantity;
          updatedItem.availableQty -= transaction.quantity;
          break;
        case 'return':
          updatedItem.rentedQty -= transaction.quantity;
          updatedItem.availableQty += transaction.quantity;
          break;
        case 'damage':
          updatedItem.damagedQty += transaction.quantity;
          updatedItem.availableQty -= transaction.quantity;
          break;
        case 'adjustment':
          updatedItem.availableQty += transaction.quantity;
          break;
      }
      updatedItem.lastUpdated = new Date().toISOString().split('T')[0];
      setInventory(inventory.map(item => item.id === inventoryItem.id ? updatedItem : item));
    }

    toast({
      title: 'Transaction Approved',
      description: `Transaction ${transaction.id} has been approved.`,
    });
  };

  const handleRejectTransaction = (transaction: any) => {
    setTransactions(transactions.filter(t => t.id !== transaction.id));
    toast({
      title: 'Transaction Rejected',
      description: `Transaction ${transaction.id} has been rejected.`,
    });
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.availableQty < 10 && item.availableQty > 0);
  };

  const getOutOfStockItems = () => {
    return inventory.filter(item => item.availableQty === 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Inventory & Warehouse Supervision</h3>
        <p className="text-sm text-muted-foreground">Real-time inventory tracking, transaction approvals, and warehouse management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total Items</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{getLowStockItems().length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{getOutOfStockItems().length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold text-blue-600">{transactions.filter(t => !t.approved).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'inventory'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Inventory Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'transactions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Transaction Approvals
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Rented</TableHead>
                  <TableHead>Damaged</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.itemCode}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.totalQty}</TableCell>
                    <TableCell className={item.availableQty < 10 ? 'text-orange-600 font-medium' : ''}>
                      {item.availableQty}
                    </TableCell>
                    <TableCell>{item.rentedQty}</TableCell>
                    <TableCell className="text-red-600">{item.damagedQty}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.itemCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionTypeIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`font-medium ${
                      transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </TableCell>
                    <TableCell className="text-sm">{transaction.reason}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.approved ? 'default' : 'outline'}>
                        {transaction.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.approvedBy || '-'}</TableCell>
                    <TableCell className="text-right">
                      {!transaction.approved && (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Approve Transaction"
                            onClick={() => handleApproveTransaction(transaction)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Reject Transaction"
                            onClick={() => handleRejectTransaction(transaction)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Review transaction details before approval</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Code</Label>
                  <p className="font-medium">{selectedTransaction.itemCode}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <p className={`font-medium ${
                    selectedTransaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.quantity > 0 ? '+' : ''}{selectedTransaction.quantity}
                  </p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{selectedTransaction.date}</p>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <p className="text-sm">{selectedTransaction.reason}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleApproveTransaction(selectedTransaction);
                  setApprovalDialogOpen(false);
                }}>
                  Approve Transaction
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};