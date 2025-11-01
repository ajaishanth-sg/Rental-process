import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';

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

export const RentalsModule = () => {
  const { user } = useAuth();
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
      const response = await fetch('http://localhost:8000/api/rentals/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRentals(data);
      } else {
        console.error('Failed to fetch rentals');
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
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
      returned: 'default',
      
      // Processing states
      processing: 'secondary',
      pending: 'secondary',
      pending_approval: 'secondary',
      pending_return: 'secondary',
      submitted_by_customer: 'secondary',
      extended: 'secondary',
      draft: 'secondary',
      
      // Warning states
      expiring_soon: 'destructive',
      
      // Neutral states
      in_transit: 'outline',
      
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
          <CardTitle>Rentals</CardTitle>
          <CardDescription>Loading your rental data...</CardDescription>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rentals</CardTitle>
          <CardDescription>View all your rental contracts and details</CardDescription>
        </CardHeader>
        <CardContent>
          {rentals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No rentals found</p>
              <p className="text-sm text-muted-foreground mt-2">Your rental data will appear here once available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Number</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Equipment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{rental.contract_number}</TableCell>
                    <TableCell>{rental.project_name}</TableCell>
                    <TableCell className="text-sm">{new Date(rental.start_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{new Date(rental.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell>${rental.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">
                      {rental.equipment_category} - {rental.equipment_type} ({rental.quantity} {rental.unit})
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