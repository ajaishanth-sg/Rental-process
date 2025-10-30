import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, FileText, CheckCircle, XCircle, Calendar, AlertTriangle, Loader2, Truck } from 'lucide-react';

interface Contract {
    id: string;
    contract_id: string;
    sales_order_id?: string;
    customer: string;
    customer_name?: string;
    project: string;
    equipment: string;
    start_date: string;
    end_date: string;
    status: string;
    amount: number;
    total_amount?: number;
    renewal_date?: string;
    approval_status: string;
    created_at: string;
    updated_at: string;
}

interface Quotation {
   id: string;
   quotation_id: string;
   customer: string;
   equipment: string;
   quantity: number;
   amount: number;
   status: string;
   created_at: string;
   updated_at: string;
}

export const ContractsModule = () => {
   const { role } = useAuth();
   const [contracts, setContracts] = useState<Contract[]>([]);
   const [loading, setLoading] = useState(true);
   const [open, setOpen] = useState(false);
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [editingContract, setEditingContract] = useState<Contract | null>(null);
   const { toast } = useToast();
   const [formData, setFormData] = useState({
     customer: '', project: '', equipment: '', startDate: '', endDate: '', amount: ''
   });
   const [quotations, setQuotations] = useState<Quotation[]>([]);
   const [loadingQuotations, setLoadingQuotations] = useState(true);
   const [activeTab, setActiveTab] = useState('contracts');

   // Fetch contracts from MongoDB
   const fetchContracts = async () => {
     try {
       const response = await fetch('http://localhost:8000/api/sales/contracts', {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         }
       });
       if (response.ok) {
         const data = await response.json();
         console.log('Fetched contracts:', data);
         setContracts(data);
       } else {
         console.error('Failed to fetch contracts');
         toast({
           title: 'Error',
           description: 'Failed to load contracts',
           variant: 'destructive',
         });
         setContracts([]);
       }
     } catch (error) {
       console.error('Error fetching contracts:', error);
       toast({
         title: 'Error',
         description: 'Failed to load contracts',
         variant: 'destructive',
       });
       setContracts([]);
     } finally {
       setLoading(false);
     }
   };

   useEffect(() => {
     fetchContracts();
   }, []);

   const fetchQuotations = async () => {
     try {
       setLoadingQuotations(true);
       const response = await fetch('http://localhost:8000/api/admin/quotations/pending', {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
         }
       });
       if (response.ok) {
         const data = await response.json();
         setQuotations(data);
       } else {
         setQuotations([]);
       }
     } catch (error) {
       console.error('Error fetching quotations:', error);
       setQuotations([]);
     } finally {
       setLoadingQuotations(false);
     }
   };

   useEffect(() => {
     fetchQuotations();
   }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/contracts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          customer: formData.customer,
          project: formData.project,
          equipment: formData.equipment,
          start_date: formData.startDate,
          end_date: formData.endDate,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        toast({
          title: 'Contract Created',
          description: `Contract for ${formData.customer} has been created successfully.`,
        });
        setOpen(false);
        setFormData({ customer: '', project: '', equipment: '', startDate: '', endDate: '', amount: '' });
        fetchContracts();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to create contract';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create contract. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    try {
      const response = await fetch(`http://localhost:8000/api/contracts/${editingContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          customer: editingContract.customer,
          project: editingContract.project,
          equipment: editingContract.equipment,
          start_date: editingContract.start_date,
          end_date: editingContract.end_date,
          amount: editingContract.amount,
          status: editingContract.status
        })
      });

      if (response.ok) {
        toast({
          title: 'Contract Updated',
          description: `${editingContract.contract_id} has been updated successfully.`,
        });
        setEditDialogOpen(false);
        setEditingContract(null);
        fetchContracts();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to update contract';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contract. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/contracts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Contract Deleted',
          description: `Contract has been removed.`,
        });
        fetchContracts();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to delete contract';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contract. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      active: 'default',
      completed: 'secondary',
      pending: 'outline',
      cancelled: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getApprovalBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      approved: 'default',
      pending: 'outline',
      rejected: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const handleApproveContract = async (contract: Contract) => {
    try {
      const contractId = contract.contract_id || contract.id;
      const response = await fetch(`http://localhost:8000/api/admin/contracts/${contractId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: '✅ Contract Approved Successfully',
          description: `${contract.contract_id} has been approved and activated. Invoice ${result.invoice_id} created for finance. Sales order sent to warehouse for dispatch.`,
        });
        fetchContracts();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to approve contract';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve contract. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectContract = async (contract: Contract) => {
    try {
      const contractId = contract.contract_id || contract.id;
      const response = await fetch(`http://localhost:8000/api/admin/contracts/${contractId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Contract Rejected',
          description: `${contract.contract_id} has been rejected.`,
        });
        fetchContracts();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to reject contract';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject contract. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleApproveQuotation = async (quotation: Quotation) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/quotations/${quotation.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Quotation Approved',
          description: `${quotation.quotation_id} has been approved.`,
        });
        fetchQuotations();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to approve quotation';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve quotation. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectQuotation = async (quotation: Quotation) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/quotations/${quotation.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Quotation Rejected',
          description: `${quotation.quotation_id} has been rejected.`,
        });
        fetchQuotations();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to reject quotation';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject quotation. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleDispatchToWarehouse = async (contract: Contract) => {
    try {
      const salesOrderId = contract.sales_order_id;
      if (!salesOrderId) {
        toast({
          title: 'Error',
          description: 'No sales order associated with this contract.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`http://localhost:8000/api/warehouse/sales-orders/${salesOrderId}/dispatch`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        toast({
          title: '✅ Sent to Warehouse',
          description: `${contract.contract_id} has been sent to warehouse for processing.`,
        });
        fetchContracts();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to dispatch to warehouse';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dispatch to warehouse. Please check your connection.',
        variant: 'destructive',
      });
    }
  };


  const isRenewalDue = (renewalDate: string | null) => {
    if (!renewalDate) return false;
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{role === 'sales' ? 'Contracts Management' : 'Contract Oversight'}</h3>
          <p className="text-sm text-muted-foreground">
            {role === 'sales' 
              ? 'View approved contracts and send to warehouse' 
              : 'Approve/reject contracts, monitor renewals, and track contract lifecycle'}
          </p>
        </div>
        <div className="flex gap-2">
          {role === 'admin' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Contract
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
              <DialogDescription>Enter contract details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Input id="customer" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input id="project" value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Input id="equipment" value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Contract Amount (AED)</Label>
                <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Create Contract</Button>
              </div>
            </form>
          </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {role === 'admin' ? (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="enquires">Enquires</TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value="contracts" className="space-y-4">
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Contract</DialogTitle>
                <DialogDescription>Update contract details</DialogDescription>
              </DialogHeader>
              {editingContract && (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-customer">Customer</Label>
                      <Input id="edit-customer" value={editingContract.customer} onChange={(e) => setEditingContract({ ...editingContract, customer: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-project">Project</Label>
                      <Input id="edit-project" value={editingContract.project} onChange={(e) => setEditingContract({ ...editingContract, project: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-equipment">Equipment</Label>
                    <Input id="edit-equipment" value={editingContract.equipment} onChange={(e) => setEditingContract({ ...editingContract, equipment: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-startDate">Start Date</Label>
                      <Input id="edit-startDate" type="date" value={editingContract.start_date} onChange={(e) => setEditingContract({ ...editingContract, start_date: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-endDate">End Date</Label>
                      <Input id="edit-endDate" type="date" value={editingContract.end_date} onChange={(e) => setEditingContract({ ...editingContract, end_date: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-amount">Contract Amount (AED)</Label>
                      <Input id="edit-amount" type="number" value={editingContract.amount} onChange={(e) => setEditingContract({ ...editingContract, amount: parseInt(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select value={editingContract.status} onValueChange={(val) => setEditingContract({ ...editingContract, status: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Update Contract</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <div className="border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No contracts found. Contracts are created when sales team converts sales orders.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract) => {
                      const displayId = contract.contract_id || contract.id;
                      const displayStartDate = contract.start_date || (contract.created_at ? new Date(contract.created_at).toLocaleDateString() : '-');
                      const displayAmount = contract.amount || contract.total_amount || 0;
                      
                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{displayId}</TableCell>
                          <TableCell>{contract.customer || contract.customer_name}</TableCell>
                          <TableCell>{contract.project}</TableCell>
                          <TableCell className="text-sm">{contract.equipment || '-'}</TableCell>
                          <TableCell className="text-sm">{displayStartDate}</TableCell>
                          <TableCell className="text-sm">{contract.end_date || '-'}</TableCell>
                          <TableCell>
                            {contract.renewal_date ? (
                              <div className="flex items-center gap-1">
                                {isRenewalDue(contract.renewal_date) && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                                <span className={`text-sm ${isRenewalDue(contract.renewal_date) ? 'text-orange-600 font-medium' : ''}`}>
                                  {contract.renewal_date}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">AED {displayAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={getApprovalBadgeVariant(contract.approval_status || 'pending')}>
                              {contract.approval_status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(contract.status || 'pending')}>
                              {contract.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {role === 'admin' && contract.approval_status === 'pending' && (
                                <>
                                  <Button variant="ghost" size="icon" title="Approve Contract" onClick={() => handleApproveContract(contract)}>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button variant="ghost" size="icon" title="Reject Contract" onClick={() => handleRejectContract(contract)}>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              {role === 'sales' && contract.approval_status === 'approved' && contract.status === 'active' && (
                                <Button variant="default" size="sm" title="Send to Warehouse" onClick={() => handleDispatchToWarehouse(contract)}>
                                  <Truck className="h-4 w-4 mr-1" />
                                  Send to Warehouse
                                </Button>
                              )}
                              {role === 'admin' && (
                                <>
                                  <Button variant="ghost" size="icon" title="Edit Contract" onClick={() => handleEdit(contract)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" title="Delete Contract" onClick={() => handleDelete(contract.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        {role === 'admin' && (
          <TabsContent value="enquires" className="space-y-4">
          <div className="border rounded-lg">
            {loadingQuotations ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No pending quotations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">{quotation.quotation_id}</TableCell>
                        <TableCell>{quotation.customer}</TableCell>
                        <TableCell>{quotation.equipment}</TableCell>
                        <TableCell>{quotation.quantity}</TableCell>
                        <TableCell className="font-semibold">AED {quotation.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{quotation.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(quotation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" title="Approve Quotation" onClick={() => handleApproveQuotation(quotation)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Reject Quotation" onClick={() => handleRejectQuotation(quotation)}>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};