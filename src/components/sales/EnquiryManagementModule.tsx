import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText, Package, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Rental {
    id: string;
    enquiry_id: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    equipment_name: string;
    quantity: number;
    rental_duration_days?: number;
    delivery_location: string;
    expected_delivery_date: string;
    special_instructions?: string;
    status: string;
    enquiry_date?: string;
    created_at?: string;
    updated_at?: string;
    is_rental_order?: boolean;
    // Legacy fields from rental for backward compatibility
    contract_number?: string;
    project_name?: string;
    equipment_type?: string;
    unit?: string;
    start_date?: string;
    end_date?: string;
}

const EnquiryManagementModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [createEnquiryDialogOpen, setCreateEnquiryDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_id: '',
    equipment_name: '',
    quantity: 1,
    rental_duration_days: 30,
    delivery_location: '',
    expected_delivery_date: '',
    special_instructions: '',
    assigned_salesperson_name: user?.name || '',
  });

  useEffect(() => {
    fetchRentals();
    
    // Listen for enquiry creation/update events
    const handleEnquiryUpdate = () => {
      console.log('Enquiry update event detected, refreshing enquiries...');
      fetchRentals();
    };
    
    // Listen for custom events
    window.addEventListener('enquiryCreated', handleEnquiryUpdate);
    window.addEventListener('refreshEnquiries', handleEnquiryUpdate);
    window.addEventListener('leadCreated', handleEnquiryUpdate); // Leads can be created from enquiries
    window.addEventListener('globalRefresh', handleEnquiryUpdate); // Global refresh from header
    window.addEventListener('refreshAll', handleEnquiryUpdate); // Refresh all event
    
    // Periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      if (!loading) {
        fetchRentals();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('enquiryCreated', handleEnquiryUpdate);
      window.removeEventListener('refreshEnquiries', handleEnquiryUpdate);
      window.removeEventListener('leadCreated', handleEnquiryUpdate);
      window.removeEventListener('globalRefresh', handleEnquiryUpdate);
      window.removeEventListener('refreshAll', handleEnquiryUpdate);
      clearInterval(refreshInterval);
    };
  }, [user]);

  const fetchRentals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      console.log('Fetching sales enquiries from /api/sales/enquiries');
      const response = await fetch('http://localhost:8000/api/sales/enquiries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Sales enquiries response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Sales enquiries data received:', data.length, 'items');
        setRentals(data || []);
      } else {
        console.error('Failed to fetch enquiries:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to load enquiries',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enquiries',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnquiry = async () => {
    // Validate form
    if (!enquiryForm.customer_name || !enquiryForm.customer_email || !enquiryForm.equipment_name || !enquiryForm.delivery_location || !enquiryForm.expected_delivery_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive',
        });
        return;
      }

      // Create enquiry data
      const enquiryData = {
        customer_name: enquiryForm.customer_name,
        customer_email: enquiryForm.customer_email,
        customer_id: enquiryForm.customer_id || '',
        equipment_name: enquiryForm.equipment_name,
        quantity: enquiryForm.quantity,
        rental_duration_days: enquiryForm.rental_duration_days,
        delivery_location: enquiryForm.delivery_location,
        expected_delivery_date: enquiryForm.expected_delivery_date,
        special_instructions: enquiryForm.special_instructions || '',
        assigned_salesperson_name: enquiryForm.assigned_salesperson_name || user?.name || '',
        status: 'submitted_by_customer',
      };

      // Call API to create enquiry - using admin endpoint since sales role should also create enquiries
      const response = await fetch('http://localhost:8000/api/admin/enquiries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create enquiry' }));
        throw new Error(errorData.detail || 'Failed to create enquiry');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Enquiry created successfully',
      });
      
      // Reset form and close dialog
      setEnquiryForm({
        customer_name: '',
        customer_email: '',
        customer_id: '',
        equipment_name: '',
        quantity: 1,
        rental_duration_days: 30,
        delivery_location: '',
        expected_delivery_date: '',
        special_instructions: '',
        assigned_salesperson_name: user?.name || '',
      });
      setCreateEnquiryDialogOpen(false);
      
      // Refresh enquiries list
      await fetchRentals();
    } catch (error: any) {
      console.error('Error creating enquiry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create enquiry',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateQuotation = (rental: Rental) => {
    console.log('Create Quotation clicked for rental:', rental);
    
    const enquiryData = {
      id: rental.id,
      enquiry_id: rental.enquiry_id || rental.contract_number || rental.id,
      customer_id: rental.customer_id,
      customer_name: rental.customer_name,
      customer_email: rental.customer_email,
      equipment_name: rental.equipment_name || rental.equipment_type || 'Equipment',
      quantity: rental.quantity,
      rental_duration_days: rental.rental_duration_days || 30,
      delivery_location: rental.delivery_location,
      expected_delivery_date: rental.expected_delivery_date || rental.start_date,
      special_instructions: rental.special_instructions || '',
      status: rental.status,
      is_rental_order: rental.is_rental_order !== undefined ? rental.is_rental_order : true,
    };
    
    console.log('Dispatching convertToQuotation event to switch tabs');
    // Dispatch event to switch to quotations tab and open quotation form
    const switchTabEvent = new CustomEvent('convertToQuotation', {
      detail: enquiryData
    });
    window.dispatchEvent(switchTabEvent);
    
    // Also dispatch the openQuotationFromEnquiry event for backwards compatibility
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openQuotationFromEnquiry', {
        detail: enquiryData
      }));
    }, 100);
    
    toast({
      title: 'Opening Quotation Form',
      description: `Creating quotation for ${rental.customer_name}`
    });
  };



  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      extended: 'secondary',
      returned: 'secondary',
      closed: 'destructive',
      pending_approval: 'secondary',
      draft: 'secondary',
      expiring_soon: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Enquiries from Customer Rental Orders</h3>
            <p className="text-sm text-muted-foreground">View and manage rental enquiries from customers</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Enquiries...</CardTitle>
            <CardDescription>Fetching rental orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Rendering EnquiryManagementModule with', rentals.length, 'rentals');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Rental Enquiries</h3>
          <p className="text-sm text-muted-foreground">View rental orders from customers and create quotations</p>
        </div>
        <Dialog open={createEnquiryDialogOpen} onOpenChange={setCreateEnquiryDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateEnquiryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Enquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Enquiry</DialogTitle>
              <DialogDescription>
                Create a new customer enquiry for equipment rental
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name <span className="text-red-500">*</span></Label>
                <Input
                  id="customer_name"
                  value={enquiryForm.customer_name || ''}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              {/* Customer Email */}
              <div className="space-y-2">
                <Label htmlFor="customer_email">Customer Email <span className="text-red-500">*</span></Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={enquiryForm.customer_email || ''}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, customer_email: e.target.value })}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              {/* Equipment */}
              <div className="space-y-2">
                <Label htmlFor="equipment_name">Equipment Name <span className="text-red-500">*</span></Label>
                <Input
                  id="equipment_name"
                  value={enquiryForm.equipment_name || ''}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, equipment_name: e.target.value })}
                  placeholder="e.g., Scaffolding - Steel Frame"
                  required
                />
              </div>

              {/* Quantity and Rental Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={enquiryForm.quantity}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rental_duration_days">Rental Duration (Days) <span className="text-red-500">*</span></Label>
                  <Input
                    id="rental_duration_days"
                    type="number"
                    min="1"
                    value={enquiryForm.rental_duration_days}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, rental_duration_days: parseInt(e.target.value) || 30 })}
                    required
                  />
                </div>
              </div>

              {/* Delivery Location */}
              <div className="space-y-2">
                <Label htmlFor="delivery_location">Delivery Location <span className="text-red-500">*</span></Label>
                <Input
                  id="delivery_location"
                  value={enquiryForm.delivery_location || ''}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, delivery_location: e.target.value })}
                  placeholder="Enter delivery address"
                  required
                />
              </div>

              {/* Expected Delivery Date */}
              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">Expected Delivery Date <span className="text-red-500">*</span></Label>
                <Input
                  id="expected_delivery_date"
                  type="date"
                  value={enquiryForm.expected_delivery_date || ''}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, expected_delivery_date: e.target.value })}
                  required
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={enquiryForm.special_instructions || ''}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, special_instructions: e.target.value })}
                  placeholder="Any special requirements or instructions..."
                  rows={3}
                />
              </div>

              {/* Assigned Salesperson */}
              <div className="space-y-2">
                <Label htmlFor="assigned_salesperson_name">Assigned Salesperson (Optional)</Label>
                <Input
                  id="assigned_salesperson_name"
                  value={enquiryForm.assigned_salesperson_name || ''}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, assigned_salesperson_name: e.target.value })}
                  placeholder="Enter salesperson name"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateEnquiryDialogOpen(false);
                    setEnquiryForm({
                      customer_name: '',
                      customer_email: '',
                      customer_id: '',
                      equipment_name: '',
                      quantity: 1,
                      rental_duration_days: 30,
                      delivery_location: '',
                      expected_delivery_date: '',
                      special_instructions: '',
                      assigned_salesperson_name: user?.name || '',
                    });
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateEnquiry} disabled={creating || !enquiryForm.customer_name || !enquiryForm.customer_email || !enquiryForm.equipment_name || !enquiryForm.delivery_location || !enquiryForm.expected_delivery_date}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Enquiry
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rental Enquiries ({rentals.length})</CardTitle>
          <CardDescription>
            Rental orders submitted by customers - Click "Create Quotation" to convert to quotation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rentals.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Rental Enquiries Yet</p>
              <p className="text-muted-foreground mb-4">
                Waiting for customers to create rental orders
              </p>
              <p className="text-sm text-muted-foreground">
                Customers can create rental orders from their dashboard under "My Rentals"
              </p>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-medium">{rental.enquiry_id || rental.contract_number || rental.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rental.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{rental.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{rental.project_name || 'N/A'}</TableCell>
                  <TableCell>{rental.equipment_name || rental.equipment_type || 'N/A'}</TableCell>
                  <TableCell>{rental.quantity} {rental.unit ? rental.unit : ''}</TableCell>
                  <TableCell>{getStatusBadge(rental.status)}</TableCell>
                  <TableCell className="text-sm">{rental.start_date || rental.expected_delivery_date ? new Date(rental.start_date || rental.expected_delivery_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-sm">{rental.end_date ? new Date(rental.end_date).toLocaleDateString() : rental.expected_delivery_date && rental.rental_duration_days ? new Date(new Date(rental.expected_delivery_date).getTime() + (rental.rental_duration_days * 24 * 60 * 60 * 1000)).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Enquiry Details - {rental.enquiry_id}</DialogTitle>
                            <DialogDescription>
                              Complete information about this enquiry
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Customer Name</label>
                                <p className="text-sm text-muted-foreground">{rental.customer_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">{getStatusBadge(rental.status)}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Equipment</label>
                                <p className="text-sm text-muted-foreground">{rental.equipment_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Quantity</label>
                                <p className="text-sm text-muted-foreground">{rental.quantity}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Expected Delivery Date</label>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {rental.expected_delivery_date ? new Date(rental.expected_delivery_date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Rental Duration</label>
                                <p className="text-sm text-muted-foreground">{rental.rental_duration_days || 'N/A'} days</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Delivery Location</label>
                              <p className="text-sm text-muted-foreground">{rental.delivery_location}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Special Instructions</label>
                              <p className="text-sm text-muted-foreground">{rental.special_instructions || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Enquiry Date</label>
                              <p className="text-sm text-muted-foreground">{rental.enquiry_date ? new Date(rental.enquiry_date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateQuotation(rental)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Quotation
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

export default EnquiryManagementModule;