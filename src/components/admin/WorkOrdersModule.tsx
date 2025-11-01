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
import { Plus, Edit, Trash2, FileText, CheckCircle } from 'lucide-react';

const workOrdersData = [
  { id: 'WO-2025-001', contractId: 'RC-2025-001', customer: 'ABC Construction LLC', project: 'Downtown Tower', description: 'Install scaffolding for floors 15-20', status: 'assigned', priority: 'high', dueDate: '2025-01-25', createdDate: '2025-01-15' },
  { id: 'WO-2025-002', contractId: 'RC-2025-002', customer: 'XYZ Builders', project: 'Residential Complex', description: 'Deliver and setup safety equipment', status: 'in_progress', priority: 'medium', dueDate: '2025-02-10', createdDate: '2025-02-01' },
  { id: 'WO-2025-003', contractId: 'RC-2025-003', customer: 'Elite Construction', project: 'Office Building', description: 'Mobile platform installation and testing', status: 'completed', priority: 'high', dueDate: '2025-01-30', createdDate: '2025-01-20' },
  { id: 'WO-2025-004', contractId: 'RC-2025-004', customer: 'Modern Builders', project: 'Mall Extension', description: 'Formwork assembly and installation', status: 'pending', priority: 'low', dueDate: '2025-03-15', createdDate: '2025-03-01' },
];

export const WorkOrdersModule = () => {
  const [workOrders, setWorkOrders] = useState(workOrdersData);
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contractId: '', customer: '', project: '', description: '', priority: 'medium', dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Work Order Created',
      description: `Work order for ${formData.project} has been created successfully.`,
    });
    setOpen(false);
    setFormData({ contractId: '', customer: '', project: '', description: '', priority: 'medium', dueDate: '' });
  };

  const handleEdit = (workOrder: any) => {
    setEditingWorkOrder(workOrder);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkOrders(workOrders.map(w => w.id === editingWorkOrder.id ? editingWorkOrder : w));
    toast({
      title: 'Work Order Updated',
      description: `${editingWorkOrder.id} has been updated successfully.`,
    });
    setEditDialogOpen(false);
    setEditingWorkOrder(null);
  };

  const handleDelete = (id: string) => {
    setWorkOrders(workOrders.filter(w => w.id !== id));
    toast({
      title: 'Work Order Deleted',
      description: `${id} has been removed.`,
    });
  };

  const handleComplete = (id: string) => {
    setWorkOrders(workOrders.map(w => w.id === id ? { ...w, status: 'completed' } : w));
    toast({
      title: 'Work Order Completed',
      description: `${id} has been marked as completed.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: 'outline',
      assigned: 'secondary',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
    };
    return variants[priority] || 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Work Orders Management</h3>
          <p className="text-sm text-muted-foreground">Assign and track work orders</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>Create a new work order</DialogDescription>
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
                <Label htmlFor="description">Work Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Create Work Order</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>Update work order details</DialogDescription>
          </DialogHeader>
          {editingWorkOrder && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contractId">Contract ID</Label>
                  <Input id="edit-contractId" value={editingWorkOrder.contractId} onChange={(e) => setEditingWorkOrder({ ...editingWorkOrder, contractId: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customer">Customer</Label>
                  <Input id="edit-customer" value={editingWorkOrder.customer} onChange={(e) => setEditingWorkOrder({ ...editingWorkOrder, customer: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project">Project</Label>
                <Input id="edit-project" value={editingWorkOrder.project} onChange={(e) => setEditingWorkOrder({ ...editingWorkOrder, project: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Work Description</Label>
                <Textarea id="edit-description" value={editingWorkOrder.description} onChange={(e) => setEditingWorkOrder({ ...editingWorkOrder, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editingWorkOrder.priority} onValueChange={(val) => setEditingWorkOrder({ ...editingWorkOrder, priority: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input id="edit-dueDate" type="date" value={editingWorkOrder.dueDate} onChange={(e) => setEditingWorkOrder({ ...editingWorkOrder, dueDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingWorkOrder.status} onValueChange={(val) => setEditingWorkOrder({ ...editingWorkOrder, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Update Work Order</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order ID</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell className="font-medium">{workOrder.id}</TableCell>
                <TableCell>{workOrder.contractId}</TableCell>
                <TableCell>{workOrder.project}</TableCell>
                <TableCell>{workOrder.customer}</TableCell>
                <TableCell>
                  <Badge variant={getPriorityBadgeVariant(workOrder.priority)}>
                    {workOrder.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{workOrder.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                    {workOrder.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {workOrder.status !== 'completed' && (
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleComplete(workOrder.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(workOrder)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(workOrder.id)}>
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