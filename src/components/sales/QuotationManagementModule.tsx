import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Download, Send, Edit, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuotationItem {
  id: string;
  equipment: string;
  length: number;
  breadth: number;
  sqft: number;
  ratePerSqft: number;
  subtotal: number;
  wastageCharges: number;
  cuttingCharges: number;
  total: number;
}

interface Quotation {
  id: string;
  quotation_id?: string; // For backend compatibility
  customerName: string;
  company: string;
  project: string;
  items: QuotationItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdDate: string;
  validUntil: string;
  notes: string;
}

interface Enquiry {
  id: string;
  enquiry_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  equipment_name: string;
  quantity: number;
  rental_duration_days: number;
  delivery_location: string;
  expected_delivery_date: string;
  special_instructions?: string;
  assigned_salesperson_id?: string;
  assigned_salesperson_name?: string;
  status: 'submitted_by_customer' | 'quotation_created' | 'quotation_sent' | 'approved' | 'rejected' | 'converted_to_order';
  enquiry_date: string;
  created_at: string;
  updated_at: string;
  is_rental_order?: boolean;
}

const QuotationManagementModule = () => {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Fetch quotations from backend
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }

      console.log('Fetching quotations from backend...');
      const response = await fetch('http://localhost:8000/api/sales/quotations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched quotations:', data);
        setQuotations(data);
      } else {
        console.error('Failed to fetch quotations:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to load quotations',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load quotations on mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  // Listen for events to open quotation from enquiry
  useEffect(() => {
    const handleOpenQuotationFromEnquiry = (event: any) => {
      if (event.detail) {
        handleConvertToQuotation(event.detail);
      }
    };

    window.addEventListener('openQuotationFromEnquiry', handleOpenQuotationFromEnquiry);

    return () => {
      window.removeEventListener('openQuotationFromEnquiry', handleOpenQuotationFromEnquiry);
    };
  }, []);
  const [newQuotation, setNewQuotation] = useState({
    customerName: '',
    company: '',
    project: '',
    notes: ''
  });

  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [newItem, setNewItem] = useState({
    equipment: '',
    length: 0,
    breadth: 0,
    ratePerSqft: 0,
    wastageCharges: 0,
    cuttingCharges: 0
  });

  const calculateSqft = (length: number, breadth: number) => length * breadth;
  const calculateSubtotal = (sqft: number, rate: number) => sqft * rate;
  const calculateTotal = (subtotal: number, wastage: number, cutting: number) => subtotal + wastage + cutting;

  const handleAddItem = () => {
    if (!newItem.equipment || newItem.length <= 0 || newItem.breadth <= 0 || newItem.ratePerSqft <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required item fields',
        variant: 'destructive'
      });
      return;
    }

    const sqft = calculateSqft(newItem.length, newItem.breadth);
    const subtotal = calculateSubtotal(sqft, newItem.ratePerSqft);
    const total = calculateTotal(subtotal, newItem.wastageCharges, newItem.cuttingCharges);

    const item: QuotationItem = {
      id: String(quotationItems.length + 1),
      ...newItem,
      sqft,
      subtotal,
      total
    };

    setQuotationItems([...quotationItems, item]);
    setNewItem({
      equipment: '',
      length: 0,
      breadth: 0,
      ratePerSqft: 0,
      wastageCharges: 0,
      cuttingCharges: 0
    });
  };

  const handleCreateQuotation = async () => {
    if (!newQuotation.customerName || !newQuotation.company || !newQuotation.project || quotationItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields and add at least one item',
        variant: 'destructive'
      });
      return;
    }

    const totalAmount = quotationItems.reduce((sum, item) => sum + item.total, 0);
    const quotationId = `QT-2025-${String(quotations.length + 1).padStart(3, '0')}`;
    const quotationData: Quotation = {
      id: quotationId,
      quotation_id: quotationId, // Add quotation_id for backend compatibility
      ...newQuotation,
      items: quotationItems,
      totalAmount,
      status: 'sent', // Changed from 'draft' to 'sent' - automatically send for admin approval
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 days from now
    };

    console.log('Creating quotation with data (will be sent to admin immediately):', quotationData);

    try {
      // Save quotation to backend
      const response = await fetch('http://localhost:8000/api/sales/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(quotationData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Quotation created, backend response:', result);

        // Refresh quotations list from backend
        await fetchQuotations();

        // If this quotation was created from a rental order enquiry, update the enquiry status
        if (selectedEnquiry && selectedEnquiry.is_rental_order) {
          // Update the enquiry status to quotation_created
          const statusResponse = await fetch(`http://localhost:8000/api/sales/enquiries/${selectedEnquiry.enquiry_id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({ status: 'quotation_created' }),
          });

          if (statusResponse.ok) {
            toast({
              title: 'Enquiry Updated',
              description: `Enquiry ${selectedEnquiry.enquiry_id} status updated to quotation created`
            });
          }
        }

        setNewQuotation({
          customerName: '',
          company: '',
          project: '',
          notes: ''
        });
        setQuotationItems([]);
        setSelectedEnquiry(null);
        setIsCreateDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Quotation created and sent to Admin for approval automatically!'
        });
      } else {
        const errorText = await response.text();
        toast({
          title: 'Error',
          description: `Failed to save quotation: ${errorText}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quotation. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleGeneratePDF = (quotation: Quotation) => {
    toast({
      title: 'Generate PDF',
      description: `Generating PDF for quotation ${quotation.id}`
    });
  };

  const handleSendQuotation = async (quotation: Quotation) => {
    try {
      console.log('Sending quotation:', quotation);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication required',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`http://localhost:8000/api/sales/quotations/${quotation.id}/send`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Quotation sent successfully, refreshing list');

        // Refresh quotations list from backend to get updated status
        await fetchQuotations();

        toast({
          title: 'Quotation Sent for Approval',
          description: `Quotation ${quotation.id} has been sent to Admin Contract Oversight for approval`
        });
      } else {
        const errorText = await response.text();
        toast({
          title: 'Error',
          description: `Failed to send quotation: ${errorText}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send quotation. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleEditQuotation = (quotation: Quotation) => {
    toast({
      title: 'Edit Quotation',
      description: `Editing quotation ${quotation.id}`
    });
  };

  const handleConvertToQuotation = (enquiry: Enquiry) => {
    console.log('handleConvertToQuotation called with enquiry:', enquiry);

    // Auto-fill quotation from enquiry
    setNewQuotation({
      customerName: enquiry.customer_name,
      company: enquiry.customer_name, // Could be enhanced to get company name
      project: enquiry.is_rental_order ? `Rental Order: ${enquiry.equipment_name}` : `Enquiry: ${enquiry.equipment_name}`,
      notes: enquiry.special_instructions || ''
    });

    // Create basic quotation item from enquiry
    const item: QuotationItem = {
      id: '1',
      equipment: enquiry.equipment_name,
      length: 10, // Default values, could be enhanced
      breadth: 5,
      sqft: 50,
      ratePerSqft: 25, // Default rate, should come from equipment database
      subtotal: 1250,
      wastageCharges: 50,
      cuttingCharges: 25,
      total: 1325
    };

    console.log('Setting quotation items:', [item]);
    setQuotationItems([item]);
    setSelectedEnquiry(enquiry);
    setIsCreateDialogOpen(true);

    console.log('Quotation dialog opened');

    toast({
      title: 'Quotation Form Opened',
      description: `Auto-filled quotation for ${enquiry.customer_name}`
    });
  };

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quotation Management</h3>
          <p className="text-sm text-muted-foreground">Create and manage quotations with detailed pricing</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quotation</DialogTitle>
              <DialogDescription>
                Create a detailed quotation with equipment dimensions and pricing
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={newQuotation.customerName}
                    onChange={(e) => setNewQuotation({ ...newQuotation, customerName: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={newQuotation.company}
                    onChange={(e) => setNewQuotation({ ...newQuotation, company: e.target.value })}
                    placeholder="ABC Construction LLC"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project Name *</Label>
                <Input
                  id="project"
                  value={newQuotation.project}
                  onChange={(e) => setNewQuotation({ ...newQuotation, project: e.target.value })}
                  placeholder="Skyline Tower"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Add Equipment Items</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment *</Label>
                    <Input
                      id="equipment"
                      value={newItem.equipment}
                      onChange={(e) => setNewItem({ ...newItem, equipment: e.target.value })}
                      placeholder="Scaffolding Platform"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (ft) *</Label>
                      <Input
                        id="length"
                        type="number"
                        value={newItem.length || ''}
                        onChange={(e) => setNewItem({ ...newItem, length: Number(e.target.value) })}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breadth">Breadth (ft) *</Label>
                      <Input
                        id="breadth"
                        type="number"
                        value={newItem.breadth || ''}
                        onChange={(e) => setNewItem({ ...newItem, breadth: Number(e.target.value) })}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="ratePerSqft">Rate per Sqft *</Label>
                    <Input
                      id="ratePerSqft"
                      type="number"
                      value={newItem.ratePerSqft || ''}
                      onChange={(e) => setNewItem({ ...newItem, ratePerSqft: Number(e.target.value) })}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wastageCharges">Wastage Charges</Label>
                    <Input
                      id="wastageCharges"
                      type="number"
                      value={newItem.wastageCharges || ''}
                      onChange={(e) => setNewItem({ ...newItem, wastageCharges: Number(e.target.value) })}
                      placeholder="125"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cuttingCharges">Cutting Charges</Label>
                    <Input
                      id="cuttingCharges"
                      type="number"
                      value={newItem.cuttingCharges || ''}
                      onChange={(e) => setNewItem({ ...newItem, cuttingCharges: Number(e.target.value) })}
                      placeholder="50"
                    />
                  </div>
                </div>
                <Button onClick={handleAddItem} className="mb-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>

                {quotationItems.length > 0 && (
                  <div className="border rounded-lg p-4 mb-4">
                    <h5 className="font-medium mb-2">Items Added:</h5>
                    <div className="space-y-2">
                      {quotationItems.map((item, index) => (
                        <div key={index} className="text-sm border-b pb-2">
                          <p><strong>{item.equipment}</strong></p>
                          <p>Dimensions: {item.length}ft x {item.breadth}ft = {item.sqft} sqft</p>
                          <p>Rate: ${item.ratePerSqft}/sqft, Subtotal: ${item.subtotal}</p>
                          <p>Wastage: ${item.wastageCharges}, Cutting: ${item.cuttingCharges}</p>
                          <p className="font-medium">Total: ${item.total}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newQuotation.notes}
                  onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })}
                  placeholder="Additional terms or notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuotation}>
                Create Quotation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotation List</CardTitle>
          <CardDescription>Manage quotations and track their approval status. All quotations are automatically sent to Admin for approval.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading quotations...</p>
            </div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No quotations yet</p>
              <p className="text-sm text-muted-foreground mt-2">Create a quotation from an enquiry to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quotation.customerName}</p>
                        <p className="text-sm text-muted-foreground">{quotation.company}</p>
                      </div>
                    </TableCell>
                    <TableCell>{quotation.project}</TableCell>
                    <TableCell className="font-semibold">${quotation.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(quotation.status)}>
                        {quotation.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{quotation.validUntil}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGeneratePDF(quotation)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendQuotation(quotation)}
                          disabled={quotation.status !== 'draft'}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuotation(quotation)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationManagementModule;