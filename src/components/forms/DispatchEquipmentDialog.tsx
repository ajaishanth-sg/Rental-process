import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Truck } from 'lucide-react';

export const DispatchEquipmentDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contract: '',
    equipment: '',
    quantity: '',
    driver: '',
    vehicle: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Dispatch Scheduled',
      description: 'Equipment dispatch has been scheduled successfully.',
    });
    setOpen(false);
    setFormData({ contract: '', equipment: '', quantity: '', driver: '', vehicle: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Truck className="mr-2 h-4 w-4" />
          Schedule Dispatch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Equipment Dispatch</DialogTitle>
          <DialogDescription>Prepare equipment for delivery to customer site</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract">Contract Number</Label>
            <Select value={formData.contract} onValueChange={(val) => setFormData({ ...formData, contract: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select contract" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rc-001">RC-2025-001</SelectItem>
                <SelectItem value="rc-002">RC-2025-002</SelectItem>
                <SelectItem value="rc-003">RC-2025-003</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment</Label>
            <Select value={formData.equipment} onValueChange={(val) => setFormData({ ...formData, equipment: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scaff-001">Aluminum Scaffolding Frame</SelectItem>
                <SelectItem value="scaff-002">Steel Scaffolding System</SelectItem>
                <SelectItem value="scaff-003">Mobile Scaffold Tower</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Driver Name</Label>
            <Input
              id="driver"
              value={formData.driver}
              onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
              placeholder="Ahmed Ali"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle Number</Label>
            <Input
              id="vehicle"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              placeholder="DXB-12345"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Dispatch</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
