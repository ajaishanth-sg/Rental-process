import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Truck, CheckCircle, Clock } from 'lucide-react';

const dispatchData = [
  { id: 'DSP-2025-001', contractId: 'RC-2025-001', customer: 'ABC Construction LLC', project: 'Downtown Tower', equipment: 'Scaffolding Set (Complete)', quantity: 1, dispatchDate: '2025-01-16', deliveryDate: '2025-01-17', status: 'delivered', driver: 'Ahmed Al-Mansoori', vehicle: 'TRK-001' },
  { id: 'DSP-2025-002', contractId: 'RC-2025-002', customer: 'XYZ Builders', project: 'Residential Complex', equipment: 'Safety Equipment Bundle', quantity: 1, dispatchDate: '2025-02-02', deliveryDate: null, status: 'in_transit', driver: 'Mohammed Al-Rashid', vehicle: 'TRK-002' },
  { id: 'DSP-2025-003', contractId: 'RC-2025-003', customer: 'Elite Construction', project: 'Office Building', equipment: 'Mobile Platforms (x3)', quantity: 3, dispatchDate: '2025-01-21', deliveryDate: '2025-01-22', status: 'delivered', driver: 'Sultan Al-Khalidi', vehicle: 'TRK-003' },
  { id: 'DSP-2025-004', contractId: 'RC-2025-004', customer: 'Modern Builders', project: 'Mall Extension', equipment: 'Formwork Panels', quantity: 5, dispatchDate: null, deliveryDate: null, status: 'pending', driver: null, vehicle: null },
];

export const DispatchModule = () => {
  const [dispatches, setDispatches] = useState(dispatchData);
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contractId: '', customer: '', project: '', equipment: '', quantity: '', driver: '', vehicle: '', dispatchDate: '', deliveryDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Dispatch Created',
      description: `Dispatch for ${formData.customer} has been created successfully.`,
    });
    setOpen(false);
    setFormData({ contractId: '', customer: '', project: '', equipment: '', quantity: '', driver: '', vehicle: '', dispatchDate: '', deliveryDate: '' });
  };

  const handleEdit = (dispatch: any) => {
    setEditingDispatch(dispatch);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatches(dispatches.map(d => d.id === editingDispatch.id ? editingDispatch : d));
    toast({
      title: 'Dispatch Updated',
      description: `${editingDispatch.id} has been updated successfully.`,
    });
    setEditDialogOpen(false);
    setEditingDispatch(null);
  };

  const handleDelete = (id: string) => {
    setDispatches(dispatches.filter(d => d.id !== id));
    toast({
      title: 'Dispatch Deleted',
      description: `${id} has been removed.`,
    });
  };

  const handleMarkDelivered = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setDispatches(dispatches.map(d => d.id === id ? { ...d, status: 'delivered', deliveryDate: today } : d));
    toast({
      title: 'Delivery Confirmed',
      description: `${id} has been marked as delivered.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: 'outline',
      dispatched: 'secondary',
      in_transit: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Dispatch Management</h3>
          <p className="text-sm text-muted-foreground">Track equipment dispatch and delivery</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Dispatch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Dispatch</DialogTitle>
              <DialogDescription>Schedule equipment dispatch</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractId">Contract ID</Label>
                  <Input id="contractId" value={formData.contractId} onChange={(e) => setFormData({ ...formData, contractId: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Input id="customer" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input id="project" value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Input id="equipment" value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver">Driver</Label>
                  <Input id="driver" value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Input id="vehicle" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dispatchDate">Dispatch Date</Label>
                  <Input id="dispatchDate" type="date" value={formData.dispatchDate} onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Create Dispatch</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dispatch</DialogTitle>
            <DialogDescription>Update dispatch details</DialogDescription>
          </DialogHeader>
          {editingDispatch && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contractId">Contract ID</Label>
                  <Input id="edit-contractId" value={editingDispatch.contractId} onChange={(e) => setEditingDispatch({ ...editingDispatch, contractId: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customer">Customer</Label>
                  <Input id="edit-customer" value={editingDispatch.customer} onChange={(e) => setEditingDispatch({ ...editingDispatch, customer: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project">Project</Label>
                <Input id="edit-project" value={editingDispatch.project} onChange={(e) => setEditingDispatch({ ...editingDispatch, project: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment">Equipment</Label>
                <Input id="edit-equipment" value={editingDispatch.equipment} onChange={(e) => setEditingDispatch({ ...editingDispatch, equipment: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input id="edit-quantity" type="number" value={editingDispatch.quantity} onChange={(e) => setEditingDispatch({ ...editingDispatch, quantity: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver">Driver</Label>
                  <Input id="edit-driver" value={editingDispatch.driver || ''} onChange={(e) => setEditingDispatch({ ...editingDispatch, driver: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle">Vehicle</Label>
                  <Input id="edit-vehicle" value={editingDispatch.vehicle || ''} onChange={(e) => setEditingDispatch({ ...editingDispatch, vehicle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dispatchDate">Dispatch Date</Label>
                  <Input id="edit-dispatchDate" type="date" value={editingDispatch.dispatchDate || ''} onChange={(e) => setEditingDispatch({ ...editingDispatch, dispatchDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-deliveryDate">Delivery Date</Label>
                  <Input id="edit-deliveryDate" type="date" value={editingDispatch.deliveryDate || ''} onChange={(e) => setEditingDispatch({ ...editingDispatch, deliveryDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingDispatch.status} onValueChange={(val) => setEditingDispatch({ ...editingDispatch, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Update Dispatch</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispatch ID</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Dispatch Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dispatches.map((dispatch) => (
              <TableRow key={dispatch.id}>
                <TableCell className="font-medium">{dispatch.id}</TableCell>
                <TableCell>{dispatch.contractId}</TableCell>
                <TableCell>{dispatch.customer}</TableCell>
                <TableCell>{dispatch.project}</TableCell>
                <TableCell className="text-sm">{dispatch.equipment}</TableCell>
                <TableCell>{dispatch.quantity}</TableCell>
                <TableCell className="text-sm">{dispatch.driver || '-'}</TableCell>
                <TableCell className="text-sm">{dispatch.dispatchDate || '-'}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(dispatch.status)}>
                    {dispatch.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {dispatch.status !== 'delivered' && dispatch.status !== 'cancelled' && (
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleMarkDelivered(dispatch.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(dispatch)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(dispatch.id)}>
                    <Trash2 className="h-4 w-4" />
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