import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, FileText, Package, Loader2, User, Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Enquiry {
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
  assigned_salesperson_id?: string;
  assigned_salesperson_name?: string;
  is_rental_order?: boolean;
  // Legacy fields
  contract_number?: string;
  project_name?: string;
  equipment_type?: string;
  start_date?: string;
  end_date?: string;
}

export const SalesModule = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      console.log('Admin: Fetching all enquiries from /api/admin/enquiries');
      const response = await fetch('http://localhost:8000/api/admin/enquiries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Admin enquiries response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Admin enquiries data received:', data.length, 'items');
        setEnquiries(data || []);
      } else {
        // If admin endpoint doesn't exist, try sales endpoint as fallback
        console.log('Admin endpoint not available, trying sales endpoint');
        const salesResponse = await fetch('http://localhost:8000/api/sales/enquiries', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (salesResponse.ok) {
          const data = await salesResponse.json();
          console.log('Sales enquiries data received:', data.length, 'items');
          setEnquiries(data || []);
        } else {
          console.error('Failed to fetch enquiries:', salesResponse.status);
          toast.error('Failed to load enquiries');
        }
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      submitted_by_customer: 'secondary',
      quotation_created: 'default',
      quotation_sent: 'default',
      approved: 'default',
      rejected: 'destructive',
      converted_to_order: 'default',
      pending: 'secondary',
      active: 'default',
    };

    const formattedStatus = status.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return (
      <Badge variant={variants[status] || 'outline'}>
        {formattedStatus}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Sales & Enquiries</h3>
        <p className="text-sm text-muted-foreground">View all customer enquiries and rental requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enquiries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enquiries.filter(e => e.status === 'submitted_by_customer' || e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quotations Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enquiries.filter(e => e.status === 'quotation_created' || e.status === 'quotation_sent').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Converted to Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enquiries.filter(e => e.status === 'converted_to_order' || e.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Enquiries ({enquiries.length})</CardTitle>
          <CardDescription>
            Customer rental enquiries and requests from all sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enquiries.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Enquiries Yet</p>
              <p className="text-muted-foreground">
                Waiting for customers to create enquiries and rental orders
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enquiry ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Delivery Location</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">
                        {enquiry.enquiry_id || enquiry.contract_number || enquiry.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{enquiry.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{enquiry.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{enquiry.equipment_name || enquiry.equipment_type || 'N/A'}</p>
                      </TableCell>
                      <TableCell>{enquiry.quantity || 1}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {enquiry.delivery_location || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {enquiry.expected_delivery_date 
                          ? new Date(enquiry.expected_delivery_date).toLocaleDateString()
                          : enquiry.start_date 
                          ? new Date(enquiry.start_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                      <TableCell className="text-sm">
                        {enquiry.assigned_salesperson_name || (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedEnquiry(enquiry)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Enquiry Details - {enquiry.enquiry_id || enquiry.id.slice(0, 8)}</DialogTitle>
                              <DialogDescription>
                                Complete information about this customer enquiry
                              </DialogDescription>
                            </DialogHeader>
                            {selectedEnquiry && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      Customer Name
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedEnquiry.customer_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      Email
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedEnquiry.customer_email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Equipment</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedEnquiry.equipment_name || selectedEnquiry.equipment_type || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Quantity</label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedEnquiry.quantity || 1}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Expected Delivery
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedEnquiry.expected_delivery_date 
                                        ? new Date(selectedEnquiry.expected_delivery_date).toLocaleDateString()
                                        : 'N/A'
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Rental Duration</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedEnquiry.rental_duration_days || 'N/A'} {selectedEnquiry.rental_duration_days ? 'days' : ''}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      Delivery Location
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedEnquiry.delivery_location || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedEnquiry.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Assigned Salesperson</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedEnquiry.assigned_salesperson_name || (
                                        <span className="italic">Unassigned</span>
                                      )}
                                    </p>
                                  </div>
                                  {selectedEnquiry.special_instructions && (
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium">Special Instructions</label>
                                      <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                                        {selectedEnquiry.special_instructions}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <label className="text-sm font-medium">Created At</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedEnquiry.created_at 
                                        ? new Date(selectedEnquiry.created_at).toLocaleString()
                                        : 'N/A'
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Last Updated</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedEnquiry.updated_at 
                                        ? new Date(selectedEnquiry.updated_at).toLocaleString()
                                        : 'N/A'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

