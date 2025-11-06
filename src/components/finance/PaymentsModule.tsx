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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          {/* Professional Document Layout */}
          <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Blue Vertical Stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-700 to-blue-600"></div>
            
            {/* Document Content */}
            <div className="ml-8 pr-8 py-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-wide">Payment Client Information Sheet</h2>
              </div>

              {viewingPayment && (
                <div className="space-y-8 bg-white rounded-lg shadow-lg p-8">
                  {/* CLIENT INFORMATION Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 uppercase mb-6 pb-2 border-b-2 border-gray-300">
                      Client Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column - Client Details */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Client Name:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {viewingPayment.customer || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Payment ID:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {viewingPayment.id}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Invoice ID:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {viewingPayment.invoiceId || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Payment Date:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {new Date(viewingPayment.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Payment Status:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900 capitalize">
                            {viewingPayment.status}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Payment Details */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Payment Method:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900 capitalize">
                            {viewingPayment.method.replace('_', ' ')}
                          </div>
                        </div>
                        {viewingPayment.reference && (
                          <div className="flex items-start gap-3">
                            <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Reference No.:</Label>
                            <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                              {viewingPayment.reference}
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Transaction ID:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {viewingPayment.reference || viewingPayment.id || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Currency:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {viewingPayment.currency || 'AED'}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Payment Year:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {new Date(viewingPayment.date).getFullYear()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT BREAKDOWN Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 uppercase mb-6 pb-2 border-b-2 border-gray-300">
                      Payment Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                      {/* Left Column - Summary of Charges */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Total Amount:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-bold text-gray-900">
                            AED {viewingPayment.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Processing Fee:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            AED {((viewingPayment.amount || 0) * 0.02).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Adjustments:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            AED 0.00
                          </div>
                        </div>
                        <div className="flex items-start gap-3 border-t-2 border-gray-400 pt-3">
                          <Label className="text-sm font-bold text-gray-900 min-w-[140px]">Total Due:</Label>
                          <div className="flex-1 border-2 border-gray-400 rounded px-3 py-2 bg-gray-50 text-sm font-bold text-gray-900">
                            AED {((viewingPayment.amount || 0) * 1.02).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Payment History */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Payment 1:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            AED {viewingPayment.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Payment 2:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            AED 0.00
                          </div>
                        </div>
                        <div className="flex items-start gap-3 border-t-2 border-gray-400 pt-3">
                          <Label className="text-sm font-bold text-gray-900 min-w-[140px]">Balance Due:</Label>
                          <div className="flex-1 border-2 border-gray-400 rounded px-3 py-2 bg-gray-50 text-sm font-bold text-gray-900">
                            AED {((viewingPayment.amount || 0) * 0.02).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TRANSACTION DETAILS Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 uppercase mb-6 pb-2 border-b-2 border-gray-300">
                      Transaction Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[120px]">Method:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900 capitalize">
                            {viewingPayment.method.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[120px]">Status:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900 capitalize">
                            {viewingPayment.status}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[120px]">Date:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900">
                            {new Date(viewingPayment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      {viewingPayment.reference && (
                        <div className="flex items-start gap-3">
                          <Label className="text-sm font-semibold text-gray-700 min-w-[140px]">Transaction Reference:</Label>
                          <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm font-medium text-gray-900 font-mono">
                            {viewingPayment.reference}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-300">
                    <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => window.print()}>
                      Print
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
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