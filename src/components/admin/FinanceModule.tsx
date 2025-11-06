import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, FileText, CreditCard, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Receipt, Eye, Building2, Loader2 } from 'lucide-react';
import { InvoicesModule } from '@/components/finance/InvoicesModule';
import { PaymentsModule } from '@/components/finance/PaymentsModule';
import { FinanceReportsModule } from '@/components/finance/FinanceReportsModule';
import { DepositPenaltyModule } from '@/components/finance/DepositPenaltyModule';
import { ApprovalWorkflowModule } from '@/components/finance/ApprovalWorkflowModule';

// API interfaces
interface Invoice {
  id: string;
  invoice_id?: string;
  customer_name?: string;
  customer?: string;
  contract?: string;
  amount: number;
  vat?: number;
  vatAmount?: number;
  total?: number;
  totalAmount?: number;
  currency: string;
  status: string;
  dueDate?: string;
  paidDate?: string;
  created_at?: string;
}

interface Payment {
  id: string;
  invoice_id?: string;
  invoiceId?: string;
  customer_name?: string;
  customer?: string;
  amount: number;
  currency: string;
  method: string;
  date: string;
  status: string;
  reference: string;
}

interface Deposit {
  id: string;
  customer_name?: string;
  customer?: string;
  amount: number;
  currency: string;
  type: string;
  date: string;
  status: string;
  return_date?: string;
  returnDate?: string;
}

export const FinanceModule = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/finance/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch finance dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load finance dashboard data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

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


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading finance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Finance Monitoring</h3>
        <p className="text-sm text-muted-foreground">Track invoices, payments, deposits, and VAT transactions</p>
      </div>


      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-4 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'invoices'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'payments'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'deposits'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'approvals'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reports'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold">AED {dashboardData.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Overdue Invoices</p>
                    <p className="text-2xl font-bold text-red-600">{dashboardData.outstandingInvoices || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Outstanding Amount</p>
                    <p className="text-2xl font-bold text-blue-600">AED {dashboardData.outstandingAmount?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Pending Approvals</p>
                    <p className="text-2xl font-bold text-purple-600">{dashboardData.pendingApprovals || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card p-8 rounded-lg border text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">Unable to load finance dashboard data. Please check your connection.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && <InvoicesModule />}
      {activeTab === 'payments' && <PaymentsModule />}
      {activeTab === 'deposits' && <DepositPenaltyModule />}
      {activeTab === 'approvals' && <ApprovalWorkflowModule />}
      {activeTab === 'reports' && <FinanceReportsModule />}

    </div>
  );
};