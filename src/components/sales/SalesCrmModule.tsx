import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCcw,
  TrendingUp,
  Users,
  PhoneCall,
  ClipboardCheck,
  Building2,
  Mail,
  Phone,
  UserCircle2,
  Calendar,
  UserCheck,
  BadgeCheck,
} from 'lucide-react';

type LeadRecord = {
  id?: string;
  lead_id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  organization?: string;
  industry?: string;
  status?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  nextFollowUp?: string;
  assigned_salesperson_name?: string;
  jobTitle?: string;
  notes?: string;
};

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Working',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

const getLeadStatusBadgeVariant = (status?: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'won':
    case 'qualified':
    case 'proposal sent':
      return 'default';
    case 'negotiation':
    case 'working':
    case 'contacted':
      return 'secondary';
    case 'lost':
      return 'destructive';
    default:
      return 'outline';
  }
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const SalesCrmModule = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      console.log('Fetching CRM leads from /api/crm/leads/assigned');
      const response = await fetch('http://localhost:8000/api/crm/leads/assigned', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('CRM leads response status:', response.status);

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: Failed to load leads`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (e2) {
            // Ignore text parsing errors
          }
        }
        
        console.error('API error response:', response.status, errorMessage);
        
        // Only show error toast for actual errors, not for empty results
        if (response.status !== 404) {
          toast({
            title: 'Unable to load leads',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        setLeads([]);
        return;
      }

      const data = await response.json();
      console.log('CRM leads response:', response.status, response.statusText);
      console.log('CRM leads data received:', Array.isArray(data) ? data.length : 'not an array', 'items');
      console.log('Raw data type:', typeof data, 'Is array:', Array.isArray(data));
      
      // Handle empty array - this is normal, not an error
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data, data);
        setLeads([]);
        // Don't show error for empty or invalid response - just set empty leads
        return;
      }
      
      // Normalize lead structure
      const normalizedLeads = data.map((lead: any) => {
        const leadId = lead.lead_id || lead.id || (lead._id ? String(lead._id) : null);
        return {
          ...lead,
          lead_id: leadId,
          id: leadId,
          _id: lead._id || lead.id,
        };
      });
      
      console.log('Normalized leads:', normalizedLeads.length);
      setLeads(normalizedLeads);
      
      // Only show toast if we successfully loaded leads and there are some
      if (normalizedLeads.length > 0) {
        console.log('Successfully loaded', normalizedLeads.length, 'leads');
      } else {
        console.log('No leads found in database (this is normal if no leads have been created yet)');
      }
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      // Only show error for network errors or unexpected exceptions
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check if the backend is running.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Unable to load leads',
          description: error.message || 'Please refresh or contact an administrator if the issue persists.',
          variant: 'destructive',
        });
      }
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    
    // Listen for lead creation/update events from other modules
    const handleLeadUpdate = () => {
      console.log('Lead update event detected, refreshing leads...');
      fetchLeads();
    };
    
    // Listen for custom events that might be dispatched when leads are created
    window.addEventListener('leadCreated', handleLeadUpdate);
    window.addEventListener('leadUpdated', handleLeadUpdate);
    window.addEventListener('refreshLeads', handleLeadUpdate);
    window.addEventListener('enquiryCreated', handleLeadUpdate); // Enquiries also create leads
    window.addEventListener('globalRefresh', handleLeadUpdate); // Global refresh from header
    window.addEventListener('refreshAll', handleLeadUpdate); // Refresh all event
    
    // Also set up a periodic refresh (every 30 seconds) to catch any changes
    const refreshInterval = setInterval(() => {
      fetchLeads();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      window.removeEventListener('leadCreated', handleLeadUpdate);
      window.removeEventListener('leadUpdated', handleLeadUpdate);
      window.removeEventListener('refreshLeads', handleLeadUpdate);
      window.removeEventListener('enquiryCreated', handleLeadUpdate);
      window.removeEventListener('globalRefresh', handleLeadUpdate);
      window.removeEventListener('refreshAll', handleLeadUpdate);
      clearInterval(refreshInterval);
    };
  }, []);

  const statusSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    leads.forEach((lead) => {
      const status = lead.status || 'New';
      summary[status] = (summary[status] || 0) + 1;
    });
    return summary;
  }, [leads]);

  const activePipelineCount = useMemo(
    () => leads.filter((lead) => !['Won', 'Lost'].includes(lead.status || '')).length,
    [leads],
  );

  const handleStatusChange = async (lead: LeadRecord, status: string) => {
    // Get lead_id from various possible fields
    const leadId = lead.lead_id || lead.id || lead._id;
    if (!leadId) {
      toast({
        title: 'Error',
        description: 'Lead ID not found. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    setUpdatingLeadId(String(leadId));

    try {
      console.log('Updating lead status:', leadId, 'to', status);
      const response = await fetch(`http://localhost:8000/api/crm/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (e2) {
            // Ignore parsing errors
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Status update successful:', result);

      // Update the lead in state - match by any ID field
      setLeads((prev) =>
        prev.map((item) => {
          const itemId = item.lead_id || item.id || item._id;
          return String(itemId) === String(leadId)
            ? {
                ...item,
                status,
                updatedAt: new Date().toISOString(),
              }
            : item;
        }),
      );

      toast({
        title: 'Lead updated',
        description: `${lead.firstName || lead.email || 'Lead'} marked as ${status}.`,
      });
    } catch (error: any) {
      console.error('Failed to update lead status:', error);
      toast({
        title: 'Status update failed',
        description: error.message || 'Please refresh the page and try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingLeadId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Lead Pipeline</h3>
          <p className="text-sm text-muted-foreground">
            {leads.length > 0 
              ? `${leads.length} lead${leads.length !== 1 ? 's' : ''} found. Focus on leads and keep the pipeline moving.`
              : 'Focus on leads assigned to you and keep the pipeline moving without the admin-heavy views.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">Includes unassigned and assigned inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePipelineCount}</div>
            <p className="text-xs text-muted-foreground">Open opportunities excluding Won/Lost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Action</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusSummary['New'] || 0}</div>
            <p className="text-xs text-muted-foreground">Leads awaiting first touch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals Sent</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusSummary['Proposal Sent'] || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting customer decision</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Assigned Leads</CardTitle>
            <CardDescription>Stay on top of every conversation and keep the funnel updated.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-sm font-medium mb-2">
                No leads found
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                {loading 
                  ? 'Loading leads...' 
                  : 'Leads created in the CRM module or from website enquiries will appear here. If you just created a lead, it should appear automatically.'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchLeads}
                disabled={loading}
              >
                <RefreshCcw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh Leads'}
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[540px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const leadName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email || 'Lead';
                    const showStatus = lead.status || 'New';
                    const leadId = lead.lead_id || lead.id || lead._id || 'unknown';
                    return (
                      <TableRow key={leadId}>
                        <TableCell>
                          <div className="font-semibold">{leadName}</div>
                          <div className="text-xs text-muted-foreground">{leadId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {lead.organization || '—'}
                          </div>
                          {lead.industry && (
                            <p className="text-xs text-muted-foreground">{lead.industry}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getLeadStatusBadgeVariant(showStatus)}>{showStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{lead.source || 'Website'}</Badge>
                        </TableCell>
                        <TableCell>{lead.jobTitle || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm break-all">{lead.email || 'Not provided'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{lead.mobile || 'Not provided'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            {lead.assigned_salesperson_name || 'Unassigned'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(lead.createdAt)}
                         </TableCell>
                         <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={showStatus}
                              onValueChange={(value) => handleStatusChange(lead, value)}
                              disabled={updatingLeadId === String(leadId)}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                              className="h-9 w-9 rounded-full border border-muted-foreground/10 bg-muted"
                              onClick={() => {
                                setSelectedLead(lead);
                                setDetailOpen(true);
                              }}
                            >
                              <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                         </TableCell>
                       </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>{[selectedLead.salutation, selectedLead.firstName, selectedLead.lastName].filter(Boolean).join(' ') || selectedLead.email || 'Lead'}</DialogTitle>
                <DialogDescription>
                  Lead ID: {selectedLead.lead_id || selectedLead.id || '—'} • Created {formatDate(selectedLead.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.mobile || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.assigned_salesperson_name || 'Unassigned'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.organization || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.industry || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.jobTitle || 'Role not captured'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status & Follow-up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedLead.status || 'New'}</Badge>
                    <span className="text-muted-foreground">
                      Last updated {formatDate(selectedLead.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Next follow-up: {formatDate(selectedLead.nextFollowUp)}</span>
                  </div>
                </CardContent>
              </Card>

              {selectedLead.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedLead.notes}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesCrmModule;


