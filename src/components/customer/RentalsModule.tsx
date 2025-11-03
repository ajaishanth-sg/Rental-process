// Customer Rentals Module - No Enquiries Tab (Enquiries are only for Sales role)
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, FileText, Package, Plus, MapPin, Phone, User, Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Rental {
  id: string;
  contract_number: string;
  project_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  equipment_items?: string[];
  project_type?: string;
  equipment_category?: string;
  equipment_type?: string;
  quantity?: number;
  unit?: string;
  delivery_address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  special_requirements?: string;
}

interface Equipment {
  id: string;
  item_code: string;
  description: string;
  category: string;
  unit: string;
  daily_rate: number;
  quantity_available: number;
}


export const RentalsModule = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extendForm, setExtendForm] = useState({ newEndDate: '' });
  const [orderForm, setOrderForm] = useState({
    projectName: '',
    projectType: '',
    equipmentCategory: '',
    equipmentType: '',
    quantity: 1,
    unit: 'piece',
    startDate: '',
    endDate: '',
    deliveryAddress: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    specialRequirements: '',
    termsAccepted: false
  });

  useEffect(() => {
    fetchRentals();
    fetchEquipment();
  }, [user]);

  const fetchEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/equipment/?approval_status=approved', {
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
      setLoadingEquipment(false);
    }
  };

  const fetchRentals = async () => {
    if (!user) {
      console.log('No user found, cannot fetch rentals');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      console.log('Fetching rentals for user:', user.email);
      console.log('Token present:', !!token);

      if (!token) {
        console.log('No token found, user needs to login');
        toast.error('Please log in to view your rentals');
        return;
      }

      const response = await fetch('http://localhost:8000/api/rentals/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Rentals response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Rentals data:', data);
        setRentals(data);
      } else if (response.status === 401) {
        console.error('Authentication failed - token may be invalid');
        toast.error('Authentication failed. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch rentals:', response.status, errorText);
        toast.error('Failed to load rentals');
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };


  const handleExtendRental = (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (rental) {
      setSelectedRental(rental);
      setExtendForm({ newEndDate: rental.end_date });
      setIsExtendDialogOpen(true);
    }
  };

  const handleNewOrder = () => {
    setIsOrderDialogOpen(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a rental order');
      window.location.href = '/auth';
      return;
    }

    // Validate required fields
    if (!orderForm.projectName || !orderForm.equipmentCategory || !orderForm.equipmentType ||
      !orderForm.startDate || !orderForm.endDate || !orderForm.deliveryAddress ||
      !orderForm.contactPerson || !orderForm.contactPhone || !orderForm.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!orderForm.termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const token = localStorage.getItem('auth_token');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('User:', user);

      const response = await fetch('http://localhost:8000/api/rentals/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_name: orderForm.projectName,
          project_type: orderForm.projectType,
          equipment_category: orderForm.equipmentCategory,
          equipment_type: orderForm.equipmentType,
          quantity: orderForm.quantity,
          unit: orderForm.unit,
          start_date: orderForm.startDate,
          end_date: orderForm.endDate,
          delivery_address: orderForm.deliveryAddress,
          contact_person: orderForm.contactPerson,
          contact_phone: orderForm.contactPhone,
          contact_email: orderForm.contactEmail,
          special_requirements: orderForm.specialRequirements
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const newRental = await response.json();
        console.log('New rental created:', newRental);
        toast.success('Rental order submitted successfully! Your request is pending approval.');
        setIsOrderDialogOpen(false);
        setOrderForm({
          projectName: '',
          projectType: '',
          equipmentCategory: '',
          equipmentType: '',
          quantity: 1,
          unit: 'piece',
          startDate: '',
          endDate: '',
          deliveryAddress: '',
          contactPerson: '',
          contactPhone: '',
          contactEmail: '',
          specialRequirements: '',
          termsAccepted: false
        });
        fetchRentals(); // Refresh the list
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Unknown error' };
        }
        toast.error(`Failed to submit rental order: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit rental order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental || !extendForm.newEndDate) {
      toast.error('Please select a new end date');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/rentals/${selectedRental.id}/extend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ new_end_date: extendForm.newEndDate }),
      });

      if (response.ok) {
        const updatedRental = await response.json();
        setRentals(rentals.map(r => r.id === selectedRental.id ? { ...r, ...updatedRental } : r));
        toast.success('Rental extended successfully');
        setIsExtendDialogOpen(false);
        setSelectedRental(null);
      } else {
        const errorText = await response.text();
        toast.error(`Failed to extend rental: ${errorText}`);
      }
    } catch (error) {
      console.error('Error extending rental:', error);
      toast.error('Failed to extend rental. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    // Comprehensive status mapping with appropriate badge colors
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      // Active/Success states
      active: 'default',
      approved: 'default',
      dispatched: 'default',
      completed: 'default',
      
      // Processing states
      processing: 'secondary',
      pending: 'secondary',
      pending_approval: 'secondary',
      submitted_by_customer: 'secondary',
      extended: 'secondary',
      draft: 'secondary',
      
      // Warning states
      expiring_soon: 'destructive',
      
      // Neutral states
      returned: 'outline',
      
      // Negative states
      closed: 'destructive',
      rejected: 'destructive',
      cancelled: 'destructive',
    };

    // Format status text: replace underscores with spaces and capitalize
    const formattedStatus = status.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return (
      <Badge variant={variants[status] || 'default'}>
        {formattedStatus}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Rentals</CardTitle>
          <CardDescription>Loading your rental contracts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Rentals</CardTitle>
          <CardDescription>Equipment currently on rent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Please log in to view your rentals</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Rentals</CardTitle>
              <CardDescription>Equipment currently on rent</CardDescription>
            </div>
            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Equipment Rental Request Form
                  </DialogTitle>
                  <DialogDescription>
                    Complete this form to request equipment rental for your construction project.
                    All fields marked with * are required for processing.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleOrderSubmit} className="space-y-6">
                  {/* Project Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Building className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Project Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectName">Project Name *</Label>
                        <Input
                          id="projectName"
                          value={orderForm.projectName}
                          onChange={(e) => setOrderForm({ ...orderForm, projectName: e.target.value })}
                          placeholder="e.g., Downtown Tower Construction"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectType">Project Type</Label>
                        <Select value={orderForm.projectType} onValueChange={(value) => setOrderForm({ ...orderForm, projectType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">Residential Construction</SelectItem>
                            <SelectItem value="commercial">Commercial Building</SelectItem>
                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="renovation">Renovation</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Package className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Equipment Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="equipmentCategory">Equipment Category *</Label>
                        <Select value={orderForm.equipmentCategory} onValueChange={(value) => setOrderForm({ ...orderForm, equipmentCategory: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scaffolding">Scaffolding Systems</SelectItem>
                            <SelectItem value="formwork">Formwork & Shuttering</SelectItem>
                            <SelectItem value="shoring">Shoring & Support</SelectItem>
                            <SelectItem value="safety">Safety Equipment</SelectItem>
                            <SelectItem value="tools">Construction Tools</SelectItem>
                            <SelectItem value="machinery">Heavy Machinery</SelectItem>
                            <SelectItem value="other">Other Equipment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="equipmentType">Specific Equipment *</Label>
                        <Select 
                          value={orderForm.equipmentType} 
                          onValueChange={(value) => {
                            const selectedEq = equipment.find(eq => eq.id === value);
                            setOrderForm({ 
                              ...orderForm, 
                              equipmentType: value,
                              unit: selectedEq?.unit || orderForm.unit
                            });
                          }}
                          disabled={loadingEquipment || !orderForm.equipmentCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingEquipment ? "Loading..." : "Select equipment"} />
                          </SelectTrigger>
                          <SelectContent>
                            {equipment
                              .filter(eq => eq.category === orderForm.equipmentCategory)
                              .map((eq) => (
                                <SelectItem key={eq.id} value={eq.id}>
                                  {eq.description} ({eq.item_code}) - AED {eq.daily_rate}/day - Available: {eq.quantity_available}
                                </SelectItem>
                              ))}
                            {equipment.filter(eq => eq.category === orderForm.equipmentCategory).length === 0 && !loadingEquipment && (
                              <SelectItem value="no-equipment" disabled>
                                No equipment available in this category
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={orderForm.quantity}
                          onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={orderForm.unit} onValueChange={(value) => setOrderForm({ ...orderForm, unit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="piece">Piece</SelectItem>
                            <SelectItem value="set">Set</SelectItem>
                            <SelectItem value="meter">Meter</SelectItem>
                            <SelectItem value="sqm">Square Meter</SelectItem>
                            <SelectItem value="ton">Ton</SelectItem>
                            <SelectItem value="kg">Kilogram</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Rental Period */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Rental Period</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={orderForm.startDate}
                          onChange={(e) => setOrderForm({ ...orderForm, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={orderForm.endDate}
                          onChange={(e) => setOrderForm({ ...orderForm, endDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Delivery Information</h3>
                    </div>
                    <div>
                      <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                      <Textarea
                        id="deliveryAddress"
                        value={orderForm.deliveryAddress}
                        onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                        placeholder="Complete delivery address including site name, street, city, postal code"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactPerson">Contact Person *</Label>
                        <Input
                          id="contactPerson"
                          value={orderForm.contactPerson}
                          onChange={(e) => setOrderForm({ ...orderForm, contactPerson: e.target.value })}
                          placeholder="Full name of the person to contact"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Contact Phone *</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          value={orderForm.contactPhone}
                          onChange={(e) => setOrderForm({ ...orderForm, contactPhone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="contactEmail">Contact Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={orderForm.contactEmail}
                          onChange={(e) => setOrderForm({ ...orderForm, contactEmail: e.target.value })}
                          placeholder="project@company.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Additional Information</h3>
                    </div>
                    <div>
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={orderForm.specialRequirements}
                        onChange={(e) => setOrderForm({ ...orderForm, specialRequirements: e.target.value })}
                        placeholder="Any special requirements, delivery instructions, or technical specifications..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 p-4 border rounded-lg bg-muted/50">
                      <Checkbox
                        id="termsAccepted"
                        checked={orderForm.termsAccepted}
                        onCheckedChange={(checked) => setOrderForm({ ...orderForm, termsAccepted: checked as boolean })}
                        className="mt-1"
                        required
                      />
                      <div className="text-sm">
                        <Label htmlFor="termsAccepted" className="font-medium cursor-pointer">
                          I accept the rental terms and conditions *
                        </Label>
                        <p className="text-muted-foreground mt-1">
                          By submitting this order, I agree to the rental terms, pricing, and delivery conditions.
                          I understand that this is a request and final approval is subject to availability and review.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!orderForm.termsAccepted || isSubmittingOrder}>
                      {isSubmittingOrder ? 'Submitting...' : 'Submit Order Request'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Extend Rental Dialog */}
            <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Extend Rental - {selectedRental?.contract_number}</DialogTitle>
                  <DialogDescription>
                    Select a new end date for the rental. The extension will be subject to approval.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleExtendSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="newEndDate">New End Date</Label>
                    <Input
                      id="newEndDate"
                      type="date"
                      value={extendForm.newEndDate}
                      onChange={(e) => setExtendForm({ ...extendForm, newEndDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Extend Rental
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {rentals.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active rentals found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Extend</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental) => (
                  <>
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{rental.contract_number}</TableCell>
                      <TableCell>{rental.project_name || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{new Date(rental.start_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{new Date(rental.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(rental.status)}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => handleExtendRental(rental.id)}>Extend</Button></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedRental(rental)}>
                                <FileText className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Rental Details - {rental.contract_number}</DialogTitle>
                                <DialogDescription>
                                  Complete information about this rental contract
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Project Name</label>
                                    <p className="text-sm text-muted-foreground">{rental.project_name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Contract Status</label>
                                    <div className="mt-1">{getStatusBadge(rental.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Project Type</label>
                                    <p className="text-sm text-muted-foreground">{rental.project_type || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Equipment Category</label>
                                    <p className="text-sm text-muted-foreground">{rental.equipment_category || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Equipment Type</label>
                                    <p className="text-sm text-muted-foreground">{rental.equipment_type || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Quantity</label>
                                    <p className="text-sm text-muted-foreground">{rental.quantity || 'N/A'} {rental.unit || ''}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Start Date</label>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(rental.start_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">End Date</label>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(rental.end_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Total Amount</label>
                                  <p className="text-lg font-semibold">${rental.total_amount?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Delivery Address</label>
                                    <p className="text-sm text-muted-foreground">{rental.delivery_address || 'N/A'}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Contact Person</label>
                                      <p className="text-sm text-muted-foreground">{rental.contact_person || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Contact Phone</label>
                                      <p className="text-sm text-muted-foreground">{rental.contact_phone || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium">Contact Email</label>
                                      <p className="text-sm text-muted-foreground">{rental.contact_email || 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Special Requirements</label>
                                    <p className="text-sm text-muted-foreground">{rental.special_requirements || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="pt-4 border-t">
                                  <label className="text-sm font-medium">Equipment Items</label>
                                  <div className="mt-1">
                                    {rental.equipment_items && rental.equipment_items.length > 0 ? (
                                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {rental.equipment_items.map((item, index) => (
                                          <li key={index}>{item}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No equipment items listed</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};