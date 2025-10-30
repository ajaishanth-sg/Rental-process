import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const vendorCostsData = [
  { id: 'VC-2025-001', contractId: 'RC-2025-001', vendor: 'ABC Equipment Suppliers', invoiceAmount: 8200, description: 'Excavator rental', date: '2025-01-15' },
  { id: 'VC-2025-002', contractId: 'RC-2025-002', vendor: 'XYZ Machinery Ltd', invoiceAmount: 5800, description: 'Bulldozer rental', date: '2025-02-01' },
  { id: 'VC-2025-003', contractId: 'RC-2025-003', vendor: 'Elite Construction Equipment', invoiceAmount: 9800, description: 'Crane rental', date: '2025-01-20' },
  { id: 'VC-2025-004', contractId: 'RC-2025-004', vendor: 'Modern Equipment Co', invoiceAmount: 4500, description: 'Loader rental', date: '2025-03-01' },
];

export const VendorCostModule = () => {
  const [vendorCosts, setVendorCosts] = useState(vendorCostsData);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contractId: '', vendor: '', invoiceAmount: '', description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCost = {
      id: `VC-2025-${(vendorCosts.length + 1).toString().padStart(3, '0')}`,
      contractId: formData.contractId,
      vendor: formData.vendor,
      invoiceAmount: parseFloat(formData.invoiceAmount),
      description: formData.description,
      date: new Date().toISOString().split('T')[0]
    };
    setVendorCosts([...vendorCosts, newCost]);
    toast({
      title: 'Vendor Cost Added',
      description: `Vendor invoice for ${formData.vendor} has been recorded.`,
    });
    setOpen(false);
    setFormData({ contractId: '', vendor: '', invoiceAmount: '', description: '' });
  };

  const handleViewMarginReport = (contractId: string) => {
    toast({
      title: 'Margin Report',
      description: `Generating margin report for contract ${contractId}`,
    });
  };

  // Calculate margin for each contract
  const getContractMargin = (contractId: string) => {
    const customerRevenue = {
      'RC-2025-001': 12500,
      'RC-2025-002': 8900,
      'RC-2025-003': 15200,
      'RC-2025-004': 6750,
    }[contractId] || 0;

    const vendorCost = vendorCosts
      .filter(cost => cost.contractId === contractId)
      .reduce((sum, cost) => sum + cost.invoiceAmount, 0);

    const margin = customerRevenue - vendorCost;
    const marginPercent = customerRevenue > 0 ? ((margin / customerRevenue) * 100).toFixed(1) : '0';

    return { revenue: customerRevenue, cost: vendorCost, margin, marginPercent };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vendor Cost Tracking</h3>
          <p className="text-sm text-muted-foreground">Track vendor invoices and analyze profit margins</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Vendor Invoice</DialogTitle>
              <DialogDescription>Record vendor purchase invoice for rental contract</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractId">Contract ID</Label>
                  <Input id="contractId" value={formData.contractId} onChange={(e) => setFormData({ ...formData, contractId: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input id="vendor" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceAmount">Invoice Amount (AED)</Label>
                  <Input id="invoiceAmount" type="number" value={formData.invoiceAmount} onChange={(e) => setFormData({ ...formData, invoiceAmount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add Vendor Invoice</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Margin Comparison Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract ID</TableHead>
              <TableHead>Customer Revenue</TableHead>
              <TableHead>Vendor Cost</TableHead>
              <TableHead>Profit Margin</TableHead>
              <TableHead>Margin %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {['RC-2025-001', 'RC-2025-002', 'RC-2025-003', 'RC-2025-004'].map((contractId) => {
              const marginData = getContractMargin(contractId);
              return (
                <TableRow key={contractId}>
                  <TableCell className="font-medium">{contractId}</TableCell>
                  <TableCell>AED {marginData.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">AED {marginData.cost.toLocaleString()}</TableCell>
                  <TableCell className={`font-semibold ${marginData.margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                    AED {marginData.margin.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={marginData.margin >= 0 ? 'default' : 'destructive'}>
                      {marginData.marginPercent}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewMarginReport(contractId)}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Vendor Costs Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cost ID</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Invoice Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendorCosts.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell className="font-medium">{cost.id}</TableCell>
                <TableCell>{cost.contractId}</TableCell>
                <TableCell>{cost.vendor}</TableCell>
                <TableCell>{cost.description}</TableCell>
                <TableCell className="font-semibold">AED {cost.invoiceAmount.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{cost.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};