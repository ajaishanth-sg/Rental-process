import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const CustomerModule = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', crNumber: '', vatNumber: '', creditLimit: '', depositAmount: ''
  });

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch customers',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while fetching customers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cr_number: formData.crNumber,
          vat_number: formData.vatNumber,
          credit_limit: parseInt(formData.creditLimit),
          deposit_amount: parseInt(formData.depositAmount)
        })
      });

      if (response.ok) {
        toast({
          title: 'Customer Added',
          description: `${formData.name} has been added successfully.`,
        });
        setOpen(false);
        setFormData({ name: '', email: '', phone: '', crNumber: '', vatNumber: '', creditLimit: '', depositAmount: '' });
        fetchCustomers(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to add customer',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while adding customer',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/admin/customers/${editingCustomer.customer_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          name: editingCustomer.name,
          email: editingCustomer.email,
          phone: editingCustomer.phone,
          cr_number: editingCustomer.cr_number,
          vat_number: editingCustomer.vat_number,
          credit_limit: editingCustomer.credit_limit,
          deposit_amount: editingCustomer.deposit_amount
        })
      });

      if (response.ok) {
        toast({
          title: 'Customer Updated',
          description: `${editingCustomer.name} has been updated successfully.`,
        });
        setEditDialogOpen(false);
        setEditingCustomer(null);
        fetchCustomers(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to update customer',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while updating customer',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (customerId: string, name: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Customer Deleted',
          description: `${name} has been removed.`,
        });
        fetchCustomers(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to delete customer',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while deleting customer',
        variant: 'destructive'
      });
    }
  };

  const handleApproveCustomer = async (customer: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/customers/${customer.customer_id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Customer Approved',
          description: `${customer.name} has been approved for business operations.`,
        });
        fetchCustomers(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to approve customer',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while approving customer',
        variant: 'destructive'
      });
    }
  };

  const handleRejectCustomer = async (customer: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/customers/${customer.customer_id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Customer Rejected',
          description: `${customer.name} has been rejected and removed.`,
        });
        fetchCustomers(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to reject customer',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while rejecting customer',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Management</h3>
          <p className="text-sm text-muted-foreground">Manage customer accounts and credit limits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Enter customer details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crNumber">CR Number</Label>
                  <Input id="crNumber" value={formData.crNumber} onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input id="vatNumber" value={formData.vatNumber} onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit (AED)</Label>
                  <Input id="creditLimit" type="number" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount (AED)</Label>
                <Input id="depositAmount" type="number" value={formData.depositAmount} onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add Customer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer details</DialogDescription>
            </DialogHeader>
            {editingCustomer && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Company Name</Label>
                    <Input id="edit-name" value={editingCustomer.name} onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" type="email" value={editingCustomer.email} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input id="edit-phone" value={editingCustomer.phone} onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-crNumber">CR Number</Label>
                    <Input id="edit-crNumber" value={editingCustomer.cr_number} onChange={(e) => setEditingCustomer({ ...editingCustomer, cr_number: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-vatNumber">VAT Number</Label>
                    <Input id="edit-vatNumber" value={editingCustomer.vat_number} onChange={(e) => setEditingCustomer({ ...editingCustomer, vat_number: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-creditLimit">Credit Limit (AED)</Label>
                    <Input id="edit-creditLimit" type="number" value={editingCustomer.credit_limit} onChange={(e) => setEditingCustomer({ ...editingCustomer, credit_limit: parseInt(e.target.value) })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-depositAmount">Deposit Amount (AED)</Label>
                  <Input id="edit-depositAmount" type="number" value={editingCustomer.deposit_amount} onChange={(e) => setEditingCustomer({ ...editingCustomer, deposit_amount: parseInt(e.target.value) })} required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Update Customer</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading customers...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>CR Number</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.cr_number}</TableCell>
                    <TableCell>AED {customer.credit_limit?.toLocaleString() || '0'}</TableCell>
                    <TableCell>AED {customer.deposit_amount?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      <Badge variant={customer.approval_status === 'approved' ? 'default' : 'outline'}>
                        {customer.approval_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {customer.approval_status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" title="Approve Customer" onClick={() => handleApproveCustomer(customer)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Reject Customer" onClick={() => handleRejectCustomer(customer)}>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" title="Edit Customer" onClick={() => handleEdit(customer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Customer" onClick={() => handleDelete(customer.customer_id, customer.name)}>
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};
