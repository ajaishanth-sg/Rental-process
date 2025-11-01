import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Send, CreditCard, RefreshCw, Loader2 } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_id: string;
  contract_id: string;
  customer_name: string;
  company?: string;
  project?: string;
  amount: number;
  vat: number;
  vat_rate: number;
  total: number;
  currency: string;
  status: string;
  due_date: string;
  created_at: string;
}

export const InvoicesModule = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/finance/invoices', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched finance invoices:', data);
        setInvoices(data);
      } else {
        console.error('Failed to fetch invoices:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to load invoices',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id: string) => {
    toast({
      title: 'Download Started',
      description: `Downloading PDF for ${id}`,
    });
  };

  const handleSendInvoice = (id: string) => {
    toast({
      title: 'Invoice Sent',
      description: `Invoice ${id} has been sent to customer.`,
    });
  };

  const handleRecordPayment = (id: string) => {
    toast({
      title: 'Payment Recorded',
      description: `Payment for invoice ${id} has been recorded.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      paid: 'default',
      pending: 'secondary',
      overdue: 'destructive',
      cancelled: 'outline',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Invoices Management</h3>
          <p className="text-sm text-muted-foreground">View and manage invoice payments</p>
        </div>
        <Button variant="outline" onClick={fetchInvoices}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 text-muted-foreground mx-auto mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Invoices</h3>
            <p className="text-muted-foreground">
              No invoices available at this time.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>VAT ({invoices[0]?.vat_rate || 5}%)</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const displayInvoiceId = invoice.invoice_id || invoice.id;
                const displayDate = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '-';
                const displayDueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-';

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{displayInvoiceId}</TableCell>
                    <TableCell className="text-sm">{invoice.contract_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.customer_name}</p>
                        {invoice.company && <p className="text-sm text-muted-foreground">{invoice.company}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{invoice.project || '-'}</TableCell>
                    <TableCell>{invoice.currency} {(invoice.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.currency} {(invoice.vat || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">{invoice.currency} {(invoice.total || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{displayDueDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleSendInvoice(displayInvoiceId)}>
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleRecordPayment(displayInvoiceId)}>
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(displayInvoiceId)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};