import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, FileText, Package, Plus } from 'lucide-react';
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

  useEffect(() => {
    fetchRentals();
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

  const handleCreateQuotation = (rental: Rental) => {
    console.log('Create Quotation clicked for rental:', rental);
    
    const enquiryData = {
      id: rental.id,
      enquiry_id: rental.enquiry_id || rental.id,
      customer_id: rental.customer_id,
      customer_name: rental.customer_name,
      customer_email: rental.customer_email,
      equipment_name: rental.equipment_name || 'Equipment',
      quantity: rental.quantity,
      rental_duration_days: rental.rental_duration_days || 30,
      delivery_location: rental.delivery_location,
      expected_delivery_date: rental.expected_delivery_date,
      special_instructions: rental.special_instructions || '',
      status: rental.status,
      is_rental_order: true,
    };
    
    console.log('Dispatching convertToQuotation event to switch tabs');
    // First, dispatch event to switch to quotations tab
    const switchTabEvent = new CustomEvent('convertToQuotation', {
      detail: enquiryData
    });
    window.dispatchEvent(switchTabEvent);
    
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
                  <TableCell className="font-medium">{rental.enquiry_id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rental.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{rental.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{rental.equipment_name || 'N/A'}</TableCell>
                  <TableCell>{rental.equipment_name || rental.equipment_type || 'N/A'}</TableCell>
                  <TableCell>{rental.quantity}</TableCell>
                  <TableCell>{getStatusBadge(rental.status)}</TableCell>
                  <TableCell className="text-sm">{rental.expected_delivery_date ? new Date(rental.expected_delivery_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-sm">{rental.expected_delivery_date ? new Date(rental.expected_delivery_date).toLocaleDateString() : 'N/A'}</TableCell>
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