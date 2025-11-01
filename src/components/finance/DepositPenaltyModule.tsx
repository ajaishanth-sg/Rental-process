import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, AlertTriangle } from 'lucide-react';

const depositsData = [
  { id: 'DEP-2025-001', contractId: 'RC-2025-001', customer: 'ABC Construction LLC', amount: 5000, status: 'held', date: '2025-01-15', reconciled: false },
  { id: 'DEP-2025-002', contractId: 'RC-2025-002', customer: 'XYZ Builders', amount: 3500, status: 'held', date: '2025-02-01', reconciled: false },
  { id: 'DEP-2025-003', contractId: 'RC-2025-003', customer: 'Elite Construction', amount: 7500, status: 'held', date: '2025-01-20', reconciled: false },
  { id: 'DEP-2025-004', contractId: 'RC-2025-004', customer: 'Modern Builders', amount: 4500, status: 'refunded', date: '2025-03-01', reconciled: true },
];

const penaltiesData = [
  { id: 'PEN-2025-001', contractId: 'RC-2025-001', customer: 'ABC Construction LLC', amount: 500, reason: 'Late return', date: '2025-02-15', status: 'applied' },
  { id: 'PEN-2025-002', contractId: 'RC-2025-002', customer: 'XYZ Builders', amount: 200, reason: 'Equipment damage', date: '2025-03-01', status: 'pending' },
];

export const DepositPenaltyModule = () => {
  const [deposits, setDeposits] = useState(depositsData);
  const [penalties, setPenalties] = useState(penaltiesData);
  const [activeTab, setActiveTab] = useState('deposits');
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [penaltyDialogOpen, setPenaltyDialogOpen] = useState(false);
  const { toast } = useToast();
  const [depositFormData, setDepositFormData] = useState({
    contractId: '', customer: '', amount: ''
  });
  const [penaltyFormData, setPenaltyFormData] = useState({
    contractId: '', customer: '', amount: '', reason: ''
  });

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeposit = {
      id: `DEP-2025-${(deposits.length + 1).toString().padStart(3, '0')}`,
      contractId: depositFormData.contractId,
      customer: depositFormData.customer,
      amount: parseFloat(depositFormData.amount),
      status: 'held',
      date: new Date().toISOString().split('T')[0],
      reconciled: false
    };
    setDeposits([...deposits, newDeposit]);
    toast({
      title: 'Deposit Recorded',
      description: `Deposit of AED ${depositFormData.amount} has been recorded.`,
    });
    setDepositDialogOpen(false);
    setDepositFormData({ contractId: '', customer: '', amount: '' });
  };

  const handleApplyPenalty = (e: React.FormEvent) => {
    e.preventDefault();
    const newPenalty = {
      id: `PEN-2025-${(penalties.length + 1).toString().padStart(3, '0')}`,
      contractId: penaltyFormData.contractId,
      customer: penaltyFormData.customer,
      amount: parseFloat(penaltyFormData.amount),
      reason: penaltyFormData.reason,
      date: new Date().toISOString().split('T')[0],
      status: 'applied'
    };
    setPenalties([...penalties, newPenalty]);
    toast({
      title: 'Penalty Applied',
      description: `Penalty of AED ${penaltyFormData.amount} has been applied.`,
    });
    setPenaltyDialogOpen(false);
    setPenaltyFormData({ contractId: '', customer: '', amount: '', reason: '' });
  };

  const handleRefundDeposit = (id: string) => {
    setDeposits(deposits.map(d => d.id === id ? { ...d, status: 'refunded', reconciled: true } : d));
    toast({
      title: 'Deposit Refunded',
      description: `Deposit ${id} has been refunded.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      held: 'secondary',
      refunded: 'default',
      applied: 'destructive',
      pending: 'outline',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deposit & Penalty Management</h3>
          <p className="text-sm text-muted-foreground">Manage customer deposits and apply penalties</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'deposits' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('deposits')}
        >
          Deposits
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'penalties' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('penalties')}
        >
          Penalties
        </button>
      </div>

      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-semibold">Customer Deposits</h4>
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Customer Deposit</DialogTitle>
                  <DialogDescription>Record a deposit for a rental contract</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDeposit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractId">Contract ID</Label>
                      <Input id="contractId" value={depositFormData.contractId} onChange={(e) => setDepositFormData({ ...depositFormData, contractId: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Input id="customer" value={depositFormData.customer} onChange={(e) => setDepositFormData({ ...depositFormData, customer: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Deposit Amount (AED)</Label>
                    <Input id="amount" type="number" value={depositFormData.amount} onChange={(e) => setDepositFormData({ ...depositFormData, amount: e.target.value })} required />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Record Deposit</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deposit ID</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-medium">{deposit.id}</TableCell>
                    <TableCell>{deposit.contractId}</TableCell>
                    <TableCell>{deposit.customer}</TableCell>
                    <TableCell className="font-semibold">AED {deposit.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{deposit.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {deposit.status === 'held' && (
                        <Button variant="outline" size="sm" onClick={() => handleRefundDeposit(deposit.id)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Refund
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

      {activeTab === 'penalties' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-semibold">Applied Penalties</h4>
            <Dialog open={penaltyDialogOpen} onOpenChange={setPenaltyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Apply Penalty
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Apply Penalty</DialogTitle>
                  <DialogDescription>Apply penalty for contract violations</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleApplyPenalty} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="penalty-contractId">Contract ID</Label>
                      <Input id="penalty-contractId" value={penaltyFormData.contractId} onChange={(e) => setPenaltyFormData({ ...penaltyFormData, contractId: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="penalty-customer">Customer</Label>
                      <Input id="penalty-customer" value={penaltyFormData.customer} onChange={(e) => setPenaltyFormData({ ...penaltyFormData, customer: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="penalty-amount">Penalty Amount (AED)</Label>
                      <Input id="penalty-amount" type="number" value={penaltyFormData.amount} onChange={(e) => setPenaltyFormData({ ...penaltyFormData, amount: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Select value={penaltyFormData.reason} onValueChange={(val) => setPenaltyFormData({ ...penaltyFormData, reason: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Late return">Late return</SelectItem>
                          <SelectItem value="Equipment damage">Equipment damage</SelectItem>
                          <SelectItem value="Missing items">Missing items</SelectItem>
                          <SelectItem value="Contract violation">Contract violation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setPenaltyDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Apply Penalty</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Penalty ID</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {penalties.map((penalty) => (
                  <TableRow key={penalty.id}>
                    <TableCell className="font-medium">{penalty.id}</TableCell>
                    <TableCell>{penalty.contractId}</TableCell>
                    <TableCell>{penalty.customer}</TableCell>
                    <TableCell className="font-semibold text-destructive">AED {penalty.amount.toLocaleString()}</TableCell>
                    <TableCell>{penalty.reason}</TableCell>
                    <TableCell className="text-sm">{penalty.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(penalty.status)}>
                        {penalty.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};