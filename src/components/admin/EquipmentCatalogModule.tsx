import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddEquipmentDialog } from '@/components/forms/AddEquipmentDialog';
import { Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Equipment {
  id: string;
  item_code: string;
  description: string;
  category: string;
  unit: string;
  daily_rate: number;
  quantity_total: number;
  quantity_available: number;
  quantity_rented: number;
  quantity_maintenance: number;
  quantity_damaged: number;
  status: string;
  approval_status: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export const EquipmentCatalogModule = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const { toast } = useToast();

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/equipment/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      } else {
        console.error('Failed to fetch equipment');
        setEquipment([]);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();

    // Listen for equipment added events
    const handleEquipmentAdded = () => {
      fetchEquipment();
    };

    window.addEventListener('equipmentAdded', handleEquipmentAdded);

    return () => {
      window.removeEventListener('equipmentAdded', handleEquipmentAdded);
    };
  }, []);

  const handleApproveEquipment = async (item: Equipment) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/equipment/approve/${item.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Equipment Approved',
          description: `${item.description} has been approved for use.`,
        });
        fetchEquipment();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to approve equipment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve equipment',
        variant: 'destructive',
      });
    }
  };

  const handleRejectEquipment = async (item: Equipment) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/equipment/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Equipment Rejected',
          description: `${item.description} has been rejected and removed.`,
        });
        fetchEquipment();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to reject equipment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject equipment',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/equipment/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: editingItem.description,
          category: editingItem.category,
          unit: editingItem.unit,
          daily_rate: editingItem.daily_rate,
          quantity_total: editingItem.quantity_total,
          quantity_available: editingItem.quantity_available,
          location: editingItem.location
        })
      });

      if (response.ok) {
        toast({
          title: 'Equipment Updated',
          description: `${editingItem.description} has been updated successfully.`,
        });
        setEditDialogOpen(false);
        setEditingItem(null);
        fetchEquipment();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to update equipment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update equipment',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, description: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/equipment/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Equipment Deleted',
          description: `${description} has been removed from the catalog.`,
        });
        fetchEquipment();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to delete equipment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete equipment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equipment Catalog</h3>
          <p className="text-sm text-muted-foreground">Manage equipment items with approval workflows</p>
        </div>
        <AddEquipmentDialog />
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>Update equipment details</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemCode">Item Code</Label>
                  <Input
                    id="itemCode"
                    value={editingItem.item_code}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={editingItem.category} onValueChange={(val) => setEditingItem({ ...editingItem, category: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scaffolding">Scaffolding</SelectItem>
                      <SelectItem value="Formwork">Formwork</SelectItem>
                      <SelectItem value="Shoring">Shoring</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={editingItem.unit} onValueChange={(val) => setEditingItem({ ...editingItem, unit: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Set">Set</SelectItem>
                      <SelectItem value="Piece">Piece</SelectItem>
                      <SelectItem value="Unit">Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Daily Rate (AED)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    value={editingItem.daily_rate}
                    onChange={(e) => setEditingItem({ ...editingItem, daily_rate: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantityTotal">Total Quantity</Label>
                  <Input
                    id="quantityTotal"
                    type="number"
                    value={editingItem.quantity_total}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity_total: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityAvailable">Available Quantity</Label>
                <Input
                  id="quantityAvailable"
                  type="number"
                  value={editingItem.quantity_available}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity_available: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Update Equipment</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Daily Rate</TableHead>
              <TableHead>Total Qty</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_code}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>AED {item.daily_rate}</TableCell>
                <TableCell>{item.quantity_total}</TableCell>
                <TableCell>{item.quantity_available}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={item.approval_status === 'approved' ? 'default' : 'outline'}>
                    {item.approval_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {item.approval_status === 'pending' && (
                      <>
                        <Button variant="ghost" size="icon" title="Approve Equipment" onClick={() => handleApproveEquipment(item)}>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Reject Equipment" onClick={() => handleRejectEquipment(item)}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" title="Edit Equipment" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete Equipment" onClick={() => handleDelete(item.id, item.description)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
