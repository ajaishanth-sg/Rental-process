import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AddRemoveEquipmentDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [addFormData, setAddFormData] = useState({
    itemName: '',
    itemCode: '',
    category: '',
    quantity: '',
    uom: '',
    location: '',
    remarks: '',
  });
  const [removeFormData, setRemoveFormData] = useState({
    selectedItem: '',
    reason: '',
    quantity: '',
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/equipment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_code: addFormData.itemCode,
          description: addFormData.itemName,
          category: addFormData.category,
          unit: addFormData.uom,
          daily_rate: 0, // Default rate, can be updated later
          quantity_total: parseInt(addFormData.quantity),
          quantity_available: parseInt(addFormData.quantity),
          location: addFormData.location
        })
      });

      if (response.ok) {
        toast({
          title: 'Equipment Addition Submitted',
          description: `${addFormData.itemName} addition submitted for admin approval.`,
        });
        setAddFormData({ itemName: '', itemCode: '', category: '', quantity: '', uom: '', location: '', remarks: '' });
        setOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to submit equipment addition',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit equipment addition. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/equipment/warehouse/adjust-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipment_id: removeFormData.selectedItem,
          adjustment_type: 'remove',
          quantity: parseInt(removeFormData.quantity),
          reason: removeFormData.reason,
          location: 'Warehouse Adjustment'
        })
      });

      if (response.ok) {
        toast({
          title: 'Equipment Removal Submitted',
          description: `Equipment removal submitted for admin approval.`,
        });
        setRemoveFormData({ selectedItem: '', reason: '', quantity: '' });
        setOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail) || 'Failed to submit equipment removal',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit equipment removal. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add / Remove Equipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add / Remove Equipment</DialogTitle>
          <DialogDescription>Manually adjust inventory levels (requires admin approval)</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Equipment</TabsTrigger>
            <TabsTrigger value="remove">Remove Equipment</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={addFormData.itemName}
                    onChange={(e) => setAddFormData({ ...addFormData, itemName: e.target.value })}
                    placeholder="Scaffolding Tubes"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemCode">Item Code</Label>
                  <Input
                    id="itemCode"
                    value={addFormData.itemCode}
                    onChange={(e) => setAddFormData({ ...addFormData, itemCode: e.target.value })}
                    placeholder="ST-6M"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={addFormData.category} onValueChange={(val) => setAddFormData({ ...addFormData, category: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rod">Rod</SelectItem>
                      <SelectItem value="sheet">Sheet</SelectItem>
                      <SelectItem value="pipe">Pipe</SelectItem>
                      <SelectItem value="scaffolding">Scaffolding</SelectItem>
                      <SelectItem value="formwork">Formwork</SelectItem>
                      <SelectItem value="shoring">Shoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={addFormData.quantity}
                    onChange={(e) => setAddFormData({ ...addFormData, quantity: e.target.value })}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uom">Unit of Measurement (UoM)</Label>
                  <Select value={addFormData.uom} onValueChange={(val) => setAddFormData({ ...addFormData, uom: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select UoM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="set">Set</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={addFormData.location}
                    onChange={(e) => setAddFormData({ ...addFormData, location: e.target.value })}
                    placeholder="Warehouse A - Shelf 3"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={addFormData.remarks}
                  onChange={(e) => setAddFormData({ ...addFormData, remarks: e.target.value })}
                  placeholder="e.g., Manual correction, Returned late, Found stock"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit for Approval</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="remove" className="space-y-4">
            <form onSubmit={handleRemoveSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectedItem">Select Item</Label>
                <Select value={removeFormData.selectedItem} onValueChange={(val) => setRemoveFormData({ ...removeFormData, selectedItem: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose item to remove" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ST-6M">ST-6M - Scaffolding Tubes (6m)</SelectItem>
                    <SelectItem value="BP-STD">BP-STD - Base Plates</SelectItem>
                    <SelectItem value="CP-SW">CP-SW - Couplers (Swivel)</SelectItem>
                    <SelectItem value="SH-PRO">SH-PRO - Safety Harness</SelectItem>
                    <SelectItem value="PL-8M">PL-8M - Planks (8m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={removeFormData.reason} onValueChange={(val) => setRemoveFormData({ ...removeFormData, reason: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="scrapped">Scrapped</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="removeQuantity">Quantity</Label>
                  <Input
                    id="removeQuantity"
                    type="number"
                    value={removeFormData.quantity}
                    onChange={(e) => setRemoveFormData({ ...removeFormData, quantity: e.target.value })}
                    placeholder="5"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit for Approval</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};