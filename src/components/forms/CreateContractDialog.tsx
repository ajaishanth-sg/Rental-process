import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle } from 'lucide-react';

export const CreateContractDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customer: '',
    project: '',
    location: '',
    startDate: '',
    endDate: '',
    equipment: '',
    depositAmount: '',
    monthlyRate: '',
    terms: '',
    specialConditions: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save to database
    console.log('Creating contract:', formData);
    toast({
      title: 'Contract Created',
      description: `Contract for ${formData.customer} has been created successfully.`,
    });
    setOpen(false);
    setFormData({
      customer: '',
      project: '',
      location: '',
      startDate: '',
      endDate: '',
      equipment: '',
      depositAmount: '',
      monthlyRate: '',
      terms: '',
      specialConditions: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Rental Contract</DialogTitle>
          <DialogDescription>Fill in the details to create a new rental contract</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={formData.customer} onValueChange={(val) => setFormData({ ...formData, customer: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abc">ABC Construction LLC</SelectItem>
                  <SelectItem value="xyz">XYZ Builders</SelectItem>
                  <SelectItem value="elite">Elite Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project Name</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                placeholder="Downtown Tower"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Site Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Dubai Marina"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment Type</Label>
            <Select value={formData.equipment} onValueChange={(val) => setFormData({ ...formData, equipment: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scaffolding">Aluminum Scaffolding Frame</SelectItem>
                <SelectItem value="steel">Steel Scaffolding System</SelectItem>
                <SelectItem value="mobile">Mobile Scaffold Tower</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Deposit Amount (AED)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                placeholder="5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyRate">Monthly Rate (AED)</Label>
              <Input
                id="monthlyRate"
                type="number"
                value={formData.monthlyRate}
                onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                placeholder="2500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Contract Terms</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Standard rental terms and conditions..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialConditions">Special Conditions</Label>
            <Textarea
              id="specialConditions"
              value={formData.specialConditions}
              onChange={(e) => setFormData({ ...formData, specialConditions: e.target.value })}
              placeholder="Any special conditions or requirements..."
              rows={2}
            />
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Draft
              </Button>
              <Button type="button" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Send for Approval
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Contract</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
