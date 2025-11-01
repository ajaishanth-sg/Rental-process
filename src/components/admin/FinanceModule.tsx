import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, FileText, CreditCard, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

const invoicesData = [
  { id: 'INV-2025-001', customer: 'ABC Construction LLC', contract: 'RC-2025-001', amount: 12500, vatAmount: 625, totalAmount: 13125, currency: 'AED', status: 'paid', dueDate: '2025-02-15', paidDate: '2025-01-20' },
  { id: 'INV-2025-002', customer: 'XYZ Builders', contract: 'RC-2025-002', amount: 8900, vatAmount: 445, totalAmount: 9345, currency: 'AED', status: 'pending', dueDate: '2025-02-20', paidDate: null },
  { id: 'INV-2025-003', customer: 'Elite Construction', contract: 'RC-2025-003', amount: 15200, vatAmount: 760, totalAmount: 15960, currency: 'AED', status: 'overdue', dueDate: '2025-01-25', paidDate: null },
];

const paymentsData = [
  { id: 'PAY-2025-001', invoiceId: 'INV-2025-001', customer: 'ABC Construction LLC', amount: 13125, currency: 'AED', method: 'Bank Transfer', date: '2025-01-20', status: 'completed', reference: 'BT-123456' },
  { id: 'PAY-2025-002', invoiceId: 'INV-2025-002', customer: 'XYZ Builders', amount: 5000, currency: 'AED', method: 'Cheque', date: '2025-01-22', status: 'pending', reference: 'CHQ-789012' },
  { id: 'PAY-2025-003', invoiceId: 'INV-2025-003', customer: 'Elite Construction', amount: 15960, currency: 'AED', method: 'Cash', date: '2025-01-18', status: 'completed', reference: 'CASH-345678' },
];

const depositsData = [
  { id: 'DEP-2025-001', customer: 'ABC Construction LLC', amount: 2500, currency: 'AED', type: 'Security Deposit', date: '2025-01-15', status: 'held', returnDate: null },
  { id: 'DEP-2025-002', customer: 'XYZ Builders', amount: 1800, currency: 'AED', type: 'Security Deposit', date: '2025-02-01', status: 'held', returnDate: null },
  { id: 'DEP-2025-003', customer: 'Modern Builders', amount: 2000, currency: 'AED', type: 'Damage Deposit', date: '2025-01-10', status: 'returned', returnDate: '2025-01-25' },
];

export const FinanceModule = () => {
  const [invoices, setInvoices] = useState(invoicesData);
  const [payments, setPayments] = useState(paymentsData);
  const [deposits, setDeposits] = useState(depositsData);
  const [activeTab, setActiveTab] = useState('invoices');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      paid: 'default',
      pending: 'outline',
      overdue: 'destructive',
      completed: 'default',
      held: 'secondary',
      returned: 'outline',
    };
    return variants[status] || 'outline';
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, any> = {
      'Bank Transfer': CreditCard,
      'Cheque': FileText,
      'Cash': DollarSign,
    };
    const IconComponent = icons[method] || DollarSign;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleApprovePayment = (payment: any) => {
    const updatedPayment = { ...payment, status: 'completed' };
    setPayments(payments.map(p => p.id === payment.id ? updatedPayment : p));

    // Update corresponding invoice status
    const invoice = invoices.find(inv => inv.id === payment.invoiceId);
    if (invoice) {
      const updatedInvoice = { ...invoice, status: 'paid', paidDate: new Date().toISOString().split('T')[0] };
      setInvoices(invoices.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
    }

    toast({
      title: 'Payment Approved',
      description: `Payment ${payment.id} has been approved and processed.`,
    });
  };

  const handleRejectPayment = (payment: any) => {
    setPayments(payments.filter(p => p.id !== payment.id));
    toast({
      title: 'Payment Rejected',
      description: `Payment ${payment.id} has been rejected.`,
    });
  };

  const handleApproveLossDamage = (deposit: any) => {
    const updatedDeposit = { ...deposit, status: 'returned', returnDate: new Date().toISOString().split('T')[0] };
    setDeposits(deposits.map(d => d.id === deposit.id ? updatedDeposit : d));
    toast({
      title: 'Deposit Returned',
      description: `Deposit ${deposit.id} has been approved for return.`,
    });
  };

  const getOverdueInvoices = () => {
    return invoices.filter(inv => inv.status === 'overdue');
  };

  const getPendingPayments = () => {
    return payments.filter(pay => pay.status === 'pending');
  };

  const getTotalRevenue = () => {
    return invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Finance Monitoring</h3>
        <p className="text-sm text-muted-foreground">Track invoices, payments, deposits, and VAT transactions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">AED {getTotalRevenue().toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Overdue Invoices</p>
              <p className="text-2xl font-bold text-red-600">{getOverdueInvoices().length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-blue-600">{getPendingPayments().length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Active Deposits</p>
              <p className="text-2xl font-bold text-purple-600">{deposits.filter(d => d.status === 'held').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'invoices'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'payments'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'deposits'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Deposits
        </button>
      </div>

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.contract}</TableCell>
                    <TableCell>AED {invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>AED {invoice.vatAmount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">AED {invoice.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className={new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-medium' : ''}>
                      {invoice.dueDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
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
                  <TableHead>Reference</TableHead>
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
                        {getPaymentMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{payment.reference}</TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'pending' && (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Approve Payment"
                            onClick={() => handleApprovePayment(payment)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Reject Payment"
                            onClick={() => handleRejectPayment(payment)}
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

      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deposit ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deposit Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-medium">{deposit.id}</TableCell>
                    <TableCell>{deposit.customer}</TableCell>
                    <TableCell>{deposit.type}</TableCell>
                    <TableCell className="font-semibold">AED {deposit.amount.toLocaleString()}</TableCell>
                    <TableCell>{deposit.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{deposit.returnDate || '-'}</TableCell>
                    <TableCell className="text-right">
                      {deposit.status === 'held' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Approve Deposit Return"
                          onClick={() => handleApproveLossDamage(deposit)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
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
            <DialogTitle>Payment Approval</DialogTitle>
            <DialogDescription>Review payment details before approval</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment ID</Label>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label>Invoice ID</Label>
                  <p className="font-medium">{selectedPayment.invoiceId}</p>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p className="font-medium">{selectedPayment.customer}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">AED {selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Method</Label>
                  <p className="font-medium">{selectedPayment.method}</p>
                </div>
                <div>
                  <Label>Reference</Label>
                  <p className="font-medium">{selectedPayment.reference}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleApprovePayment(selectedPayment);
                  setApprovalDialogOpen(false);
                }}>
                  Approve Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};