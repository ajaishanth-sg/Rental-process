import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, CreditCard, Receipt, Eye } from 'lucide-react';

const paymentsData = [
  { id: 'PAY-2025-001', invoiceId: 'INV-2025-001', customer: 'ABC Construction LLC', amount: 12500, method: 'bank_transfer', date: '2025-01-16', status: 'completed' },
  { id: 'PAY-2025-002', invoiceId: 'INV-2025-002', customer: 'XYZ Builders', amount: 4450, method: 'credit_card', date: '2025-02-03', status: 'completed' },
  { id: 'PAY-2025-003', invoiceId: 'INV-2025-003', customer: 'Elite Construction', amount: 7600, method: 'bank_transfer', date: '2025-01-25', status: 'pending' },
  { id: 'PAY-2025-004', invoiceId: 'INV-2025-004', customer: 'Modern Builders', amount: 6750, method: 'cash', date: '2025-03-02', status: 'completed' },
];

export const PaymentsModule = () => {
  const [payments, setPayments] = useState(paymentsData);
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    invoiceId: '', customer: '', amount: '', method: 'bank_transfer', reference: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment = {
      id: `PAY-2025-${(payments.length + 1).toString().padStart(3, '0')}`,
      invoiceId: formData.invoiceId,
      customer: formData.customer,
      amount: parseFloat(formData.amount),
      method: formData.method,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      reference: formData.reference
    };
    setPayments([...payments, newPayment]);
    toast({
      title: 'Payment Recorded',
      description: `Payment of AED ${formData.amount} has been recorded successfully.`,
    });
    setOpen(false);
    setFormData({ invoiceId: '', customer: '', amount: '', method: 'bank_transfer', reference: '' });
  };

  const handleView = (payment: any) => {
    setViewingPayment(payment);
    setViewDialogOpen(true);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Receipt className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payments Management</h3>
          <p className="text-sm text-muted-foreground">Track and manage customer payments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>Record a customer payment</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Invoice ID</Label>
                  <Input id="invoiceId" value={formData.invoiceId} onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Input id="customer" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (AED)</Label>
                  <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={formData.method} onValueChange={(val) => setFormData({ ...formData, method: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference/Transaction ID</Label>
                <Input id="reference" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Record Payment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Payment information and transaction details</DialogDescription>
          </DialogHeader>
          {viewingPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Payment ID</Label>
                  <p className="text-sm text-muted-foreground">{viewingPayment.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Invoice ID</Label>
                  <p className="text-sm text-muted-foreground">{viewingPayment.invoiceId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm text-muted-foreground">{viewingPayment.customer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm text-muted-foreground">AED {viewingPayment.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p className="text-sm text-muted-foreground capitalize">{viewingPayment.method.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-muted-foreground">{viewingPayment.date}</p>
                </div>
              </div>
              {viewingPayment.reference && (
                <div>
                  <Label className="text-sm font-medium">Reference</Label>
                  <p className="text-sm text-muted-foreground">{viewingPayment.reference}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.invoiceId}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell className="font-semibold">AED {payment.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.method)}
                    <span className="text-sm capitalize">{payment.method.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{payment.date}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleView(payment)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};