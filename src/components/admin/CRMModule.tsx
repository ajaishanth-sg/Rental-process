import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  FileText,
  TrendingUp,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  DollarSign,
  Award,
  Target,
  Activity,
  UserCheck,
  FileCheck,
  Building2,
  Globe,
  Send,
  Mic,
  PhoneCall,
  PhoneOff,
  StickyNote,
  Link2,
  ArrowRight,
  CheckSquare,
  Circle,
  UserCircle2,
  Loader2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import * as crmService from '@/services/crmService';

// Mock data
const customersData = [
  {
    id: 'CUST-001',
    name: 'ABC Construction LLC',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abcconstruction.ae',
    phone: '+971-4-123-4567',
    location: 'Dubai Marina, Dubai',
    website: 'www.abcconstruction.ae',
    companyType: 'Construction',
    registrationDate: '2024-01-15',
    totalValue: 156000,
    activeContracts: 3,
    completedProjects: 8,
    satisfactionScore: 4.8,
    status: 'active',
    passportNumber: 'P12345678',
    passportExpiry: '2026-05-20',
    emiratesId: 'EID-784-1985-1234567-1',
    tradeLicense: 'TL-123456',
    licenseExpiry: '2025-12-31',
    vatNumber: 'VAT-100012345',
    creditLimit: 200000,
    outstandingAmount: 45000,
    documents: [
      { name: 'Trade License', type: 'license', status: 'verified', uploadDate: '2024-01-15', expiryDate: '2025-12-31' },
      { name: 'Passport Copy', type: 'passport', status: 'verified', uploadDate: '2024-01-15', expiryDate: '2026-05-20' },
      { name: 'Emirates ID', type: 'id', status: 'verified', uploadDate: '2024-01-15', expiryDate: '2026-08-15' },
      { name: 'VAT Certificate', type: 'certificate', status: 'verified', uploadDate: '2024-01-15', expiryDate: '2025-12-31' }
    ]
  },
  {
    id: 'CUST-002',
    name: 'Dubai Builders Co.',
    contactPerson: 'Mohammed Hassan',
    email: 'mohammed@dubaibuilders.ae',
    phone: '+971-4-234-5678',
    location: 'Business Bay, Dubai',
    website: 'www.dubaibuilders.ae',
    companyType: 'Development',
    registrationDate: '2024-02-10',
    totalValue: 234000,
    activeContracts: 5,
    completedProjects: 12,
    satisfactionScore: 4.9,
    status: 'active',
    passportNumber: 'P87654321',
    passportExpiry: '2027-03-15',
    emiratesId: 'EID-784-1990-7654321-1',
    tradeLicense: 'TL-234567',
    licenseExpiry: '2026-06-30',
    vatNumber: 'VAT-100023456',
    creditLimit: 300000,
    outstandingAmount: 78000,
    documents: [
      { name: 'Trade License', type: 'license', status: 'verified', uploadDate: '2024-02-10', expiryDate: '2026-06-30' },
      { name: 'Passport Copy', type: 'passport', status: 'pending', uploadDate: '2024-02-10', expiryDate: '2027-03-15' },
      { name: 'Emirates ID', type: 'id', status: 'verified', uploadDate: '2024-02-10', expiryDate: '2027-09-20' }
    ]
  },
  {
    id: 'CUST-003',
    name: 'Elite Construction',
    contactPerson: 'Rashid Al Maktoum',
    email: 'rashid@eliteconstruction.ae',
    phone: '+971-4-345-6789',
    location: 'DIFC, Dubai',
    website: 'www.eliteconstruction.ae',
    companyType: 'Construction',
    registrationDate: '2023-11-20',
    totalValue: 189000,
    activeContracts: 4,
    completedProjects: 15,
    satisfactionScore: 4.6,
    status: 'warning',
    passportNumber: 'P11223344',
    passportExpiry: '2025-11-10',
    emiratesId: 'EID-784-1987-1122334-1',
    tradeLicense: 'TL-345678',
    licenseExpiry: '2025-03-31',
    vatNumber: 'VAT-100034567',
    creditLimit: 250000,
    outstandingAmount: 120000,
    documents: [
      { name: 'Trade License', type: 'license', status: 'expiring', uploadDate: '2023-11-20', expiryDate: '2025-03-31' },
      { name: 'Passport Copy', type: 'passport', status: 'expiring', uploadDate: '2023-11-20', expiryDate: '2025-11-10' },
      { name: 'Emirates ID', type: 'id', status: 'verified', uploadDate: '2023-11-20', expiryDate: '2026-12-15' }
    ]
  }
];

const pipelineData = [
  {
    id: 'PIPE-001',
    customerId: 'CUST-001',
    customerName: 'ABC Construction LLC',
    enquiryId: 'ENQ-2025-001',
    enquiryDate: '2025-01-10',
    enquiryStatus: 'completed',
    quotationId: 'QUO-2025-001',
    quotationDate: '2025-01-12',
    quotationValue: 15000,
    quotationStatus: 'accepted',
    contractId: 'RC-2025-001',
    contractDate: '2025-01-15',
    contractValue: 15000,
    contractStatus: 'active',
    feedbackScore: 5,
    feedbackDate: '2025-01-25',
    stage: 'contract',
    notes: 'Smooth transition from enquiry to contract. Customer very satisfied.'
  },
  {
    id: 'PIPE-002',
    customerId: 'CUST-002',
    customerName: 'Dubai Builders Co.',
    enquiryId: 'ENQ-2025-002',
    enquiryDate: '2025-01-15',
    enquiryStatus: 'completed',
    quotationId: 'QUO-2025-002',
    quotationDate: '2025-01-17',
    quotationValue: 22000,
    quotationStatus: 'pending',
    contractId: null,
    contractDate: null,
    contractValue: null,
    contractStatus: null,
    feedbackScore: null,
    feedbackDate: null,
    stage: 'quotation',
    notes: 'Awaiting customer decision on quotation.'
  },
  {
    id: 'PIPE-003',
    customerId: 'CUST-003',
    customerName: 'Elite Construction',
    enquiryId: 'ENQ-2025-003',
    enquiryDate: '2025-01-20',
    enquiryStatus: 'completed',
    quotationId: 'QUO-2025-003',
    quotationDate: '2025-01-22',
    quotationValue: 18000,
    quotationStatus: 'accepted',
    contractId: 'RC-2025-003',
    contractDate: '2025-01-24',
    contractValue: 18000,
    contractStatus: 'completed',
    feedbackScore: 4,
    feedbackDate: '2025-01-26',
    stage: 'feedback',
    notes: 'Contract completed successfully. Good feedback received.'
  },
  {
    id: 'PIPE-004',
    customerId: 'CUST-001',
    customerName: 'ABC Construction LLC',
    enquiryId: 'ENQ-2025-004',
    enquiryDate: '2025-01-25',
    enquiryStatus: 'in-progress',
    quotationId: null,
    quotationDate: null,
    quotationValue: null,
    quotationStatus: null,
    contractId: null,
    contractDate: null,
    contractValue: null,
    contractStatus: null,
    feedbackScore: null,
    feedbackDate: null,
    stage: 'enquiry',
    notes: 'New enquiry received. Preparing quotation.'
  }
];

const salesPerformanceData = [
  { month: 'Jan 2025', enquiries: 25, quotations: 18, contracts: 12, revenue: 180000, conversionRate: 66.7 },
  { month: 'Dec 2024', enquiries: 30, quotations: 22, contracts: 15, revenue: 225000, conversionRate: 68.2 },
  { month: 'Nov 2024', enquiries: 28, quotations: 20, contracts: 13, revenue: 195000, conversionRate: 65.0 },
  { month: 'Oct 2024', enquiries: 32, quotations: 24, contracts: 16, revenue: 240000, conversionRate: 66.7 }
];

type LeadFormData = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  organization: string;
  website: string;
  jobTitle: string;
  industry: string;
  source: string;
  status: string;
  gender: string;
  noOfEmployees: string;
  annualRevenue: number;
  territory: string;
  leadOwner: string;
};

const getDefaultLeadForm = (defaultOwner: string = 'Shariq Ansari'): LeadFormData => ({
  salutation: 'Mr',
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  organization: '',
  website: '',
  jobTitle: '',
  industry: '',
  source: '',
  status: 'New',
  gender: 'Male',
  noOfEmployees: '',
  annualRevenue: 0,
  territory: '',
  leadOwner: defaultOwner,
});

const mapLeadToFormData = (lead: any): LeadFormData => ({
  salutation: lead?.salutation || 'Mr',
  firstName: lead?.firstName || '',
  lastName: lead?.lastName || '',
  email: lead?.email || '',
  mobile: lead?.mobile || '',
  organization: lead?.organization || '',
  website: lead?.website || '',
  jobTitle: lead?.jobTitle || '',
  industry: lead?.industry || '',
  source: lead?.source || '',
  status: lead?.status || 'New',
  gender: lead?.gender || 'Male',
  noOfEmployees: lead?.noOfEmployees ? String(lead.noOfEmployees) : '',
  annualRevenue: Number.isFinite(Number(lead?.annualRevenue)) ? Number(lead.annualRevenue) : 0,
  territory: lead?.territory || '',
  leadOwner: lead?.leadOwner || 'Shariq Ansari',
});

export const CRMModule = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState(pipelineData);
  const [salesPerformance, setSalesPerformance] = useState(salesPerformanceData);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [leadDetailsDialogOpen, setLeadDetailsDialogOpen] = useState(false);
  const [createLeadDialogOpen, setCreateLeadDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editCustomerDialogOpen, setEditCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [pipelineDetailsDialogOpen, setPipelineDetailsDialogOpen] = useState(false);
  const [selectedPipelineItem, setSelectedPipelineItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLead, setNewLead] = useState<LeadFormData>(getDefaultLeadForm('Shariq Ansari'));
  const [editLeadData, setEditLeadData] = useState<LeadFormData>(getDefaultLeadForm());
  const [editLeadDialogOpen, setEditLeadDialogOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<any>(null);
  const [isLoadingLeadForEdit, setIsLoadingLeadForEdit] = useState(false);

  // Additional state for enhanced CRM features
  const [convertToDealDialogOpen, setConvertToDealDialogOpen] = useState(false);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    documentType: '',
    expiryDate: '',
    description: '',
    file: null as File | null
  });
  // Enquiry creation (Admin -> CRM Leads tab)
  const [createEnquiryDialogOpen, setCreateEnquiryDialogOpen] = useState(false);
  const [creatingEnquiry, setCreatingEnquiry] = useState(false);
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
    assigned_salesperson_name: 'Admin',
  });
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [leadDetailTab, setLeadDetailTab] = useState('activity');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'Backlog',
    assignedTo: 'Shariq Ansari',
    dueDate: '',
    priority: 'Low'
  });

  const [noteData, setNoteData] = useState({
    title: '',
    content: ''
  });

  const [leadCalls, setLeadCalls] = useState<any[]>([]);
  const [leadEmails, setLeadEmails] = useState<any[]>([]);
  const [leadTasks, setLeadTasks] = useState<any[]>([]);
  const [leadNotes, setLeadNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);
  const [salesUsers, setSalesUsers] = useState<Array<{ id: string; full_name: string; email: string }>>([]);

  const { toast } = useToast();

  // Fetch sales users for Lead Owner dropdown
  useEffect(() => {
    const fetchSalesUsers = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const users = await response.json();
          // Filter users with 'sales' role
          const sales = users.filter((user: any) => user.role === 'sales').map((user: any) => ({
            id: user.id,
            full_name: user.full_name || user.email,
            email: user.email
          }));
          setSalesUsers(sales);
          
          // Update default lead owner to first sales user if available
          if (sales.length > 0) {
            const defaultOwner = sales[0].full_name;
            // Update default function to use this owner
            setNewLead(prev => ({ ...prev, leadOwner: prev.leadOwner || defaultOwner }));
          }
        }
      } catch (error) {
        console.error('Error fetching sales users:', error);
        // Fallback to hardcoded names if API fails
        setSalesUsers([
          { id: '1', full_name: 'Shariq Ansari', email: 'shariq@example.com' },
          { id: '2', full_name: 'Asif Mula', email: 'asif@example.com' },
          { id: '3', full_name: 'Ankush Nehe', email: 'ankush@example.com' },
          { id: '4', full_name: 'Suraj Sharma', email: 'suraj@example.com' },
          { id: '5', full_name: 'Faris Ansari', email: 'faris@example.com' },
        ]);
      }
    };

    fetchSalesUsers();
  }, []);

  // Add Customer dialog state (Customers tab)
  const [createCustomerDialogOpen, setCreateCustomerDialogOpen] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  // Edit Customer form state
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    businessPhone: '',
    officePhone: '',
    mobile: '',
    cellPhone: '',
    secondaryEmail: '',
    secondaryPhone: '',
    website: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    projectContact: '',
    contactPhone: '',
    contactEmail: '',
    paymentTerms: '',
    specialTerms: '',
    preferredBillingMethod: '',
    preferredPaymentMethod: '',
    servicesNotes: '',
    notes: '',
    comments: '',
    specialInstructions: '',
  });

  const handleCreateCustomer = async () => {
    if (!customerForm.name || !customerForm.email) {
      toast({ title: 'Validation Error', description: 'Name and email are required', variant: 'destructive' });
      return;
    }
    try {
      setCreatingCustomer(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({ title: 'Authentication Error', description: 'Please log in again', variant: 'destructive' });
        return;
      }
      const payload = {
        name: customerForm.name,
        contactPerson: customerForm.contactPerson || '',
        email: customerForm.email,
        phone: customerForm.phone || '',
      };
      const response = await fetch('http://localhost:8000/api/admin/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create customer' }));
        throw new Error(errorData.detail || 'Failed to create customer');
      }
      const result = await response.json();
      toast({ title: 'Customer Created', description: `Customer ${result.customer_id || ''} added successfully` });
      setCreateCustomerDialogOpen(false);
      setCustomerForm({ name: '', contactPerson: '', email: '', phone: '' });
      await fetchCustomers();
    } catch (e: any) {
      console.error('Create customer failed:', e);
      toast({ title: 'Error', description: e.message || 'Failed to create customer', variant: 'destructive' });
    } finally {
      setCreatingCustomer(false);
    }
  };

  // Fetch leads and customers on component mount
  useEffect(() => {
    fetchLeads();
    fetchCustomers();
  }, []);

  // Fetch customers when customers tab is active for real-time updates
  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();

      // Set up periodic refresh every 30 seconds when customers tab is active
      const refreshInterval = setInterval(() => {
        fetchCustomers();
      }, 30000); // Refresh every 30 seconds

      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [activeTab]);

  // Fetch leads when leads tab is active for real-time updates
  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads();

      // Set up periodic refresh every 30 seconds when leads tab is active
      const refreshInterval = setInterval(() => {
        fetchLeads();
      }, 30000); // Refresh every 30 seconds

      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [activeTab]);

  // Fetch lead details when selected lead changes
  useEffect(() => {
    if (selectedLead && selectedLead.lead_id) {
      fetchLeadDetails(selectedLead.lead_id);
    }
  }, [selectedLead?.lead_id]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      console.log('Fetching leads from backend...');
      const data = await crmService.getLeads();
      console.log('Leads fetched:', data);
      setLeads(data);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      // Don't show error toast on initial load if backend is not running
      // This allows the user to still see the UI
      if (leads.length > 0) {
        toast({
          title: 'Error',
          description: 'Failed to fetch leads. Backend server may not be running.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Create enquiry from CRM Leads tab (admin)
  const handleCreateEnquiry = async () => {
    if (!enquiryForm.customer_name || !enquiryForm.customer_email || !enquiryForm.equipment_name || !enquiryForm.delivery_location || !enquiryForm.expected_delivery_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingEnquiry(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({ title: 'Authentication Error', description: 'Please log in again', variant: 'destructive' });
        return;
      }

      const normalizedDate = enquiryForm.expected_delivery_date
        ? new Date(enquiryForm.expected_delivery_date).toISOString().slice(0, 10)
        : '';

      const response = await fetch('http://localhost:8000/api/admin/enquiries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: enquiryForm.customer_name,
          customer_email: enquiryForm.customer_email,
          customer_id: enquiryForm.customer_id || '',
          equipment_name: enquiryForm.equipment_name,
          quantity: enquiryForm.quantity,
          rental_duration_days: enquiryForm.rental_duration_days,
          delivery_location: enquiryForm.delivery_location,
          expected_delivery_date: normalizedDate,
          special_instructions: enquiryForm.special_instructions || '',
          assigned_salesperson_name: enquiryForm.assigned_salesperson_name || 'Admin',
          status: 'submitted_by_customer',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create enquiry' }));
        throw new Error(errorData.detail || 'Failed to create enquiry');
      }

      const result = await response.json();
      console.log('Enquiry created:', result);

      // Dispatch events to notify other modules (like Sales modules) that an enquiry was created
      window.dispatchEvent(new CustomEvent('enquiryCreated', { 
        detail: { enquiry_id: result?.enquiry_id || result?.id } 
      }));
      window.dispatchEvent(new CustomEvent('leadCreated')); // Lead is also created from enquiry
      window.dispatchEvent(new CustomEvent('refreshEnquiries'));

      toast({ title: 'Success', description: 'Enquiry created successfully' });
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
        assigned_salesperson_name: 'Admin',
      });

      // New enquiry automatically creates a lead; refresh leads
      await fetchLeads();
    } catch (error: any) {
      console.error('Error creating enquiry:', error);
      toast({ title: 'Error', description: error.message || 'Failed to create enquiry', variant: 'destructive' });
    } finally {
      setCreatingEnquiry(false);
    }
  };

  const fetchLeadDetails = async (leadId: string) => {
    try {
      const [emails, calls, tasks, notes] = await Promise.all([
        crmService.getLeadEmails(leadId),
        crmService.getLeadCalls(leadId),
        crmService.getLeadTasks(leadId),
        crmService.getLeadNotes(leadId),
      ]);
      setLeadEmails(emails);
      setLeadCalls(calls);
      setLeadTasks(tasks);
      setLeadNotes(notes);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      console.log('Fetching customers from backend...');
      const data = await crmService.getCustomers();
      console.log('Customers fetched:', data);

      // Transform the data to match the expected format
      const transformedData = data.map((customer: any) => {
        // Preserve all fields from the backend, especially MongoDB _id
        const mongoId = customer._id || customer.id;
        const displayId = customer.id || customer.customer_id || mongoId;
        
        return {
          ...customer, // Preserve all original fields
          id: displayId, // Display ID for UI
          _id: mongoId, // MongoDB ObjectId for API calls - CRITICAL for updates
          name: customer.name || customer.companyName || '',
          contactPerson: customer.contactPerson || customer.contact_name || customer.name || '',
          email: customer.email || '',
          phone: customer.phone || customer.contact_phone || '',
          location: customer.location || customer.address || '',
          website: customer.website || '',
          companyType: customer.companyType || customer.company_type || '',
          registrationDate: customer.registrationDate || customer.created_at || '',
          totalValue: customer.totalValue || 0,
          activeContracts: customer.activeContracts || 0,
          completedProjects: customer.completedProjects || 0,
          satisfactionScore: customer.satisfactionScore || 5.0,
          status: customer.status || 'inactive',
          outstandingAmount: customer.outstandingAmount || 0,
          documents: customer.documents || [],
          // Preserve all other fields that might be needed for updates
          customer_id: customer.customer_id || displayId,
          streetAddress: customer.streetAddress || customer.address || customer.location || '',
          city: customer.city || '',
          state: customer.state || '',
          zip: customer.zip || '',
          billingAddress: customer.billingAddress || customer.location || '',
          billingCity: customer.billingCity || customer.city || '',
          billingState: customer.billingState || customer.state || '',
          billingZip: customer.billingZip || customer.zip || '',
          shippingAddress: customer.shippingAddress || customer.deliveryLocation || customer.location || '',
          shippingCity: customer.shippingCity || customer.city || '',
          shippingState: customer.shippingState || customer.state || '',
          shippingZip: customer.shippingZip || customer.zip || '',
          projectContact: customer.projectContact || customer.contactPerson || '',
          contactPhone: customer.contactPhone || customer.phone || '',
          contactEmail: customer.contactEmail || customer.email || '',
          paymentTerms: customer.paymentTerms || '',
          specialTerms: customer.specialTerms || '',
          preferredBillingMethod: customer.preferredBillingMethod || '',
          preferredPaymentMethod: customer.preferredPaymentMethod || '',
          servicesNotes: customer.servicesNotes || customer.notes || '',
          notes: customer.notes || customer.servicesNotes || '',
          comments: customer.comments || customer.specialInstructions || '',
          specialInstructions: customer.specialInstructions || customer.comments || '',
        };
      });

      // Sort customers by ID in ascending order (CUST-0001, CUST-0002, etc.)
      const extractCustomerNumber = (cust: any) => {
        const custId = cust.id || '';
        if (custId.startsWith('CUST-')) {
          try {
            const parts = custId.split('-');
            if (parts.length >= 2) {
              const numStr = parts.length === 2 ? parts[1] : parts[parts.length - 1];
              return parseInt(numStr, 10);
            }
          } catch (e) {
            // Invalid ID, put at end
          }
        }
        return Infinity; // Put invalid IDs at the end
      };

      transformedData.sort((a, b) => extractCustomerNumber(a) - extractCustomerNumber(b));

      setCustomers(transformedData);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      // Don't show error toast on initial load if backend is not running
      // This allows the user to still see the UI
      if (customers.length > 0) {
        toast({
          title: 'Error',
          description: 'Failed to fetch customers. Backend server may not be running.',
          variant: 'destructive',
        });
      }
    } finally {
      setCustomersLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      warning: 'bg-yellow-500',
      inactive: 'bg-red-500',
      verified: 'bg-green-500',
      pending: 'bg-yellow-500',
      expiring: 'bg-orange-500',
      expired: 'bg-red-500',
      completed: 'bg-blue-500',
      'in-progress': 'bg-purple-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      active: 'default',
      verified: 'default',
      completed: 'default',
      accepted: 'default',
      warning: 'outline',
      pending: 'outline',
      expiring: 'outline',
      'in-progress': 'secondary',
      inactive: 'destructive',
      expired: 'destructive',
      rejected: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getStageIcon = (stage: string) => {
    const icons: Record<string, any> = {
      enquiry: Clock,
      quotation: FileText,
      contract: FileCheck,
      feedback: Star
    };
    return icons[stage] || Clock;
  };

  const handleViewPipeline = (item: any) => {
    setSelectedPipelineItem(item);
    setPipelineDetailsDialogOpen(true);
  };

  const handleViewCustomer = (customer: any) => {
    // Ensure all required fields have defaults to prevent undefined errors
    const safeCustomer = {
      ...customer,
      totalValue: customer.totalValue || 0,
      activeContracts: customer.activeContracts || 0,
      completedProjects: customer.completedProjects || 0,
      satisfactionScore: customer.satisfactionScore || 5.0,
      outstandingAmount: customer.outstandingAmount || 0,
      creditLimit: customer.creditLimit || customer.credit_limit || 0,
      name: customer.name || '',
      contactPerson: customer.contactPerson || '',
      email: customer.email || '',
      phone: customer.phone || '',
      location: customer.location || '',
      website: customer.website || '',
      companyType: customer.companyType || '',
      registrationDate: customer.registrationDate || ''
    };
    setSelectedCustomer(safeCustomer);
    setDetailsDialogOpen(true);
  };

  const handleEditCustomer = async (customer: any) => {
    try {
      // Set the selected customer first
      setSelectedCustomer(customer);
      
      // Try to fetch full customer details if we have an ID
      let fullCustomerData = customer;
      if (customer._id || customer.id) {
        try {
          const customerId = customer._id || customer.id;
          // Try to get full details from backend
          const details = await crmService.getCustomerDetails(customerId);
          if (details) {
            fullCustomerData = details;
            setSelectedCustomer(details);
          }
        } catch (error) {
          console.warn('Could not fetch full customer details, using provided data:', error);
        }
      }
      
      // Populate form with customer data
      setEditCustomerForm({
        name: fullCustomerData.name || customer.name || '',
        contactPerson: fullCustomerData.contactPerson || fullCustomerData.projectContact || customer.contactPerson || customer.projectContact || '',
        email: fullCustomerData.email || customer.email || '',
        phone: fullCustomerData.phone || customer.phone || '',
        location: fullCustomerData.location || customer.location || '',
        address: fullCustomerData.address || customer.address || '',
        streetAddress: fullCustomerData.streetAddress || fullCustomerData.address || fullCustomerData.location || customer.streetAddress || customer.address || customer.location || '',
        city: fullCustomerData.city || customer.city || '',
        state: fullCustomerData.state || customer.state || '',
        zip: fullCustomerData.zip || customer.zip || '',
        businessPhone: fullCustomerData.businessPhone || customer.businessPhone || fullCustomerData.phone || customer.phone || '',
        officePhone: fullCustomerData.officePhone || customer.officePhone || fullCustomerData.phone || customer.phone || '',
        mobile: fullCustomerData.mobile || customer.mobile || fullCustomerData.cellPhone || customer.cellPhone || '',
        cellPhone: fullCustomerData.cellPhone || customer.cellPhone || fullCustomerData.mobile || customer.mobile || '',
        secondaryEmail: fullCustomerData.secondaryEmail || customer.secondaryEmail || '',
        secondaryPhone: fullCustomerData.secondaryPhone || customer.secondaryPhone || '',
        website: fullCustomerData.website || customer.website || '',
        billingAddress: fullCustomerData.billingAddress || customer.billingAddress || fullCustomerData.location || customer.location || '',
        billingCity: fullCustomerData.billingCity || customer.billingCity || fullCustomerData.city || customer.city || '',
        billingState: fullCustomerData.billingState || customer.billingState || fullCustomerData.state || customer.state || '',
        billingZip: fullCustomerData.billingZip || customer.billingZip || fullCustomerData.zip || customer.zip || '',
        shippingAddress: fullCustomerData.shippingAddress || customer.shippingAddress || fullCustomerData.deliveryLocation || customer.deliveryLocation || fullCustomerData.location || customer.location || '',
        shippingCity: fullCustomerData.shippingCity || customer.shippingCity || fullCustomerData.city || customer.city || '',
        shippingState: fullCustomerData.shippingState || customer.shippingState || fullCustomerData.state || customer.state || '',
        shippingZip: fullCustomerData.shippingZip || customer.shippingZip || fullCustomerData.zip || customer.zip || '',
        projectContact: fullCustomerData.projectContact || customer.projectContact || fullCustomerData.contactPerson || customer.contactPerson || '',
        contactPhone: fullCustomerData.contactPhone || customer.contactPhone || fullCustomerData.phone || customer.phone || '',
        contactEmail: fullCustomerData.contactEmail || customer.contactEmail || fullCustomerData.email || customer.email || '',
        paymentTerms: fullCustomerData.paymentTerms || customer.paymentTerms || '',
        specialTerms: fullCustomerData.specialTerms || customer.specialTerms || '',
        preferredBillingMethod: fullCustomerData.preferredBillingMethod || customer.preferredBillingMethod || '',
        preferredPaymentMethod: fullCustomerData.preferredPaymentMethod || customer.preferredPaymentMethod || '',
        servicesNotes: fullCustomerData.servicesNotes || customer.servicesNotes || fullCustomerData.notes || customer.notes || '',
        notes: fullCustomerData.notes || customer.notes || fullCustomerData.servicesNotes || customer.servicesNotes || '',
        comments: fullCustomerData.comments || customer.comments || fullCustomerData.specialInstructions || customer.specialInstructions || '',
        specialInstructions: fullCustomerData.specialInstructions || customer.specialInstructions || fullCustomerData.comments || customer.comments || '',
      });
      
      setEditCustomerDialogOpen(true);
    } catch (error) {
      console.error('Error opening edit customer dialog:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customer data for editing',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCustomer = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validation
    if (!editCustomerForm.name?.trim() || !editCustomerForm.email?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Customer name and email are required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: 'Error',
        description: 'No customer selected for update',
        variant: 'destructive',
      });
      return;
    }

    try {
      setEditingCustomer(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive',
        });
        setEditingCustomer(false);
        return;
      }

      // Get customer ID - prioritize MongoDB _id
      let customerId = selectedCustomer._id || selectedCustomer.id;
      
      // If we don't have a valid ObjectId (24 chars), try to find it
      if (!customerId || (typeof customerId === 'string' && customerId.length !== 24 && !customerId.startsWith('CUST-'))) {
        console.log('Customer ID not found or invalid, fetching customer list...');
        try {
          const customers = await crmService.getCustomers();
          const foundCustomer = customers.find((c: any) => {
            const displayId = c.id || c.customer_id;
            const mongoId = c._id || c.id;
            return (
              displayId === selectedCustomer.id ||
              displayId === selectedCustomer.customer_id ||
              mongoId === selectedCustomer._id ||
              String(mongoId) === String(selectedCustomer._id) ||
              String(mongoId) === String(selectedCustomer.id)
            );
          });
          
          if (foundCustomer) {
            customerId = foundCustomer._id || foundCustomer.id;
            console.log('Found customer with ID:', customerId);
          }
        } catch (fetchError) {
          console.error('Error fetching customers:', fetchError);
        }
      }

      if (!customerId) {
        toast({
          title: 'Error',
          description: 'Could not determine customer ID. Please refresh the page and try again.',
          variant: 'destructive',
        });
        setEditingCustomer(false);
        return;
      }

      // Prepare update data - only send fields that have values
      const updateData: any = {
        name: editCustomerForm.name.trim(),
        email: editCustomerForm.email.trim(),
      };

      // Add optional fields only if they have values
      if (editCustomerForm.contactPerson?.trim()) updateData.contactPerson = editCustomerForm.contactPerson.trim();
      if (editCustomerForm.phone?.trim()) updateData.phone = editCustomerForm.phone.trim();
      if (editCustomerForm.location?.trim()) updateData.location = editCustomerForm.location.trim();
      if (editCustomerForm.address?.trim()) updateData.address = editCustomerForm.address.trim();
      if (editCustomerForm.streetAddress?.trim()) updateData.streetAddress = editCustomerForm.streetAddress.trim();
      if (editCustomerForm.city?.trim()) updateData.city = editCustomerForm.city.trim();
      if (editCustomerForm.state?.trim()) updateData.state = editCustomerForm.state.trim();
      if (editCustomerForm.zip?.trim()) updateData.zip = editCustomerForm.zip.trim();
      if (editCustomerForm.businessPhone?.trim()) updateData.businessPhone = editCustomerForm.businessPhone.trim();
      if (editCustomerForm.officePhone?.trim()) updateData.officePhone = editCustomerForm.officePhone.trim();
      if (editCustomerForm.mobile?.trim()) updateData.mobile = editCustomerForm.mobile.trim();
      if (editCustomerForm.cellPhone?.trim()) updateData.cellPhone = editCustomerForm.cellPhone.trim();
      if (editCustomerForm.secondaryEmail?.trim()) updateData.secondaryEmail = editCustomerForm.secondaryEmail.trim();
      if (editCustomerForm.secondaryPhone?.trim()) updateData.secondaryPhone = editCustomerForm.secondaryPhone.trim();
      if (editCustomerForm.website?.trim()) updateData.website = editCustomerForm.website.trim();
      if (editCustomerForm.billingAddress?.trim()) updateData.billingAddress = editCustomerForm.billingAddress.trim();
      if (editCustomerForm.billingCity?.trim()) updateData.billingCity = editCustomerForm.billingCity.trim();
      if (editCustomerForm.billingState?.trim()) updateData.billingState = editCustomerForm.billingState.trim();
      if (editCustomerForm.billingZip?.trim()) updateData.billingZip = editCustomerForm.billingZip.trim();
      if (editCustomerForm.shippingAddress?.trim()) updateData.shippingAddress = editCustomerForm.shippingAddress.trim();
      if (editCustomerForm.shippingCity?.trim()) updateData.shippingCity = editCustomerForm.shippingCity.trim();
      if (editCustomerForm.shippingState?.trim()) updateData.shippingState = editCustomerForm.shippingState.trim();
      if (editCustomerForm.shippingZip?.trim()) updateData.shippingZip = editCustomerForm.shippingZip.trim();
      if (editCustomerForm.projectContact?.trim()) updateData.projectContact = editCustomerForm.projectContact.trim();
      if (editCustomerForm.contactPhone?.trim()) updateData.contactPhone = editCustomerForm.contactPhone.trim();
      if (editCustomerForm.contactEmail?.trim()) updateData.contactEmail = editCustomerForm.contactEmail.trim();
      if (editCustomerForm.paymentTerms?.trim()) updateData.paymentTerms = editCustomerForm.paymentTerms.trim();
      if (editCustomerForm.specialTerms?.trim()) updateData.specialTerms = editCustomerForm.specialTerms.trim();
      if (editCustomerForm.preferredBillingMethod?.trim()) updateData.preferredBillingMethod = editCustomerForm.preferredBillingMethod.trim();
      if (editCustomerForm.preferredPaymentMethod?.trim()) updateData.preferredPaymentMethod = editCustomerForm.preferredPaymentMethod.trim();
      if (editCustomerForm.servicesNotes?.trim()) updateData.servicesNotes = editCustomerForm.servicesNotes.trim();
      if (editCustomerForm.notes?.trim()) updateData.notes = editCustomerForm.notes.trim();
      if (editCustomerForm.comments?.trim()) updateData.comments = editCustomerForm.comments.trim();
      if (editCustomerForm.specialInstructions?.trim()) updateData.specialInstructions = editCustomerForm.specialInstructions.trim();

      console.log('Updating customer:', customerId);
      console.log('Update data:', updateData);

      // Make API call
      const customerIdStr = String(customerId);
      const response = await fetch(`http://localhost:8000/api/crm/customers/${customerIdStr}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Update failed:', errorData);
        
        // If 404, try to find customer by customer_id field
        if (response.status === 404) {
          try {
            const customers = await crmService.getCustomers();
            const foundCustomer = customers.find((c: any) => 
              String(c._id) === customerIdStr ||
              c.id === customerIdStr ||
              c.customer_id === customerIdStr ||
              c.id === selectedCustomer.id ||
              c.customer_id === selectedCustomer.id
            );
            
            if (foundCustomer && foundCustomer._id) {
              const actualId = String(foundCustomer._id);
              console.log('Retrying with correct ID:', actualId);
              
              const retryResponse = await fetch(`http://localhost:8000/api/crm/customers/${actualId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
              });
              
              if (!retryResponse.ok) {
                const retryError = await retryResponse.json().catch(() => ({ detail: 'Update failed' }));
                throw new Error(retryError.detail || 'Failed to update customer');
              }
            } else {
              throw new Error(errorData.detail || 'Customer not found');
            }
          } catch (retryError: any) {
            throw new Error(retryError.message || errorData.detail || 'Failed to update customer');
          }
        } else {
          throw new Error(errorData.detail || `Update failed with status ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Update successful:', result);

      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
      
      // Close dialog and refresh
      setEditCustomerDialogOpen(false);
      await fetchCustomers();
      
      // Refresh selected customer if details dialog is open
      if (detailsDialogOpen && selectedCustomer) {
        try {
          const updatedCustomer = await crmService.getCustomerDetails(customerIdStr);
          setSelectedCustomer(updatedCustomer);
        } catch (fetchError) {
          console.warn('Could not refresh customer details:', fetchError);
        }
      }
      
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update customer. Please check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setEditingCustomer(false);
    }
  };

  const handleViewDocuments = async (customer: any) => {
    try {
      // Use MongoDB _id for API call, fallback to formatted id
      const customerIdToFetch = customer._id || customer.id;

      // Fetch full customer details with documents
      const customerDetails = await crmService.getCustomerDetails(customerIdToFetch);

      // Transform the data to match expected format with all required fields and defaults
      const transformedCustomer = {
        ...customer,
        id: customerDetails.id || customer.id, // Keep formatted ID for display
        _id: customerDetails._id || customerDetails.id || customer._id || customer.id, // Keep MongoDB ID for reference
        name: customerDetails.name || customerDetails.companyName || customer.name,
        contactPerson: customerDetails.contactPerson || customerDetails.contact_name || customer.contactPerson || '',
        email: customerDetails.email || customer.email || '',
        phone: customerDetails.phone || customer.phone || '',
        location: customerDetails.location || customerDetails.address || customer.location || '',
        website: customerDetails.website || customer.website || '',
        companyType: customerDetails.companyType || customerDetails.company_type || customer.companyType || '',
        registrationDate: customerDetails.registrationDate || customerDetails.created_at || customer.registrationDate || '',
        totalValue: customerDetails.totalValue || customer.totalValue || 0,
        activeContracts: customerDetails.activeContracts || customer.activeContracts || 0,
        completedProjects: customerDetails.completedProjects || customer.completedProjects || 0,
        satisfactionScore: customerDetails.satisfactionScore || customer.satisfactionScore || 5.0,
        status: customerDetails.status || customer.status || 'inactive',
        outstandingAmount: customerDetails.outstandingAmount || customer.outstandingAmount || 0,
        creditLimit: customerDetails.creditLimit || customerDetails.credit_limit || customer.creditLimit || 0,
        documents: customerDetails.documents || customer.documents || []
      };

      setSelectedCustomer(transformedCustomer);
      setDocumentDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching customer details:', error);
      // Fallback: use the customer from the list if API fails with all required fields and defaults
      setSelectedCustomer({
        ...customer,
        totalValue: customer.totalValue || 0,
        activeContracts: customer.activeContracts || 0,
        completedProjects: customer.completedProjects || 0,
        satisfactionScore: customer.satisfactionScore || 5.0,
        outstandingAmount: customer.outstandingAmount || 0,
        creditLimit: customer.creditLimit || customer.credit_limit || 0,
        documents: customer.documents || []
      });
      setDocumentDialogOpen(true);
      toast({
        title: 'Warning',
        description: 'Could not fetch full customer details. Showing available documents.',
        variant: 'destructive',
      });
    }
  };

  const handleDocumentUpload = (customer: any) => {
    setSelectedCustomer(customer);
    setUploadDocumentDialogOpen(true);
    // Reset form
    setDocumentForm({
      documentType: '',
      expiryDate: '',
      description: '',
      file: null
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentForm({
        ...documentForm,
        file: e.target.files[0]
      });
    }
  };

  const handleDocumentSubmit = async () => {
    if (!selectedCustomer) return;

    // Validate form
    if (!documentForm.documentType) {
      toast({
        title: 'Error',
        description: 'Please select a document type',
        variant: 'destructive',
      });
      return;
    }

    if (!documentForm.file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingDocument(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', documentForm.file);
      formData.append('customer_id', selectedCustomer._id || selectedCustomer.id);
      formData.append('document_type', documentForm.documentType);
      if (documentForm.expiryDate) {
        formData.append('expiry_date', documentForm.expiryDate);
      }
      if (documentForm.description) {
        formData.append('description', documentForm.description);
      }

      // Call API to upload document
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/crm/customers/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to upload document' }));
        throw new Error(errorData.detail || 'Failed to upload document');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      // Refresh customers list to update documents in the documents tab
      await fetchCustomers();

      // Refresh customer details to show new document in dialog
      if (selectedCustomer.id || selectedCustomer._id) {
        try {
          const customerDetails = await crmService.getCustomerDetails(selectedCustomer._id || selectedCustomer.id);
          setSelectedCustomer({
            ...selectedCustomer,
            documents: customerDetails.documents || []
          });
        } catch (error) {
          console.error('Error refreshing customer details:', error);
          // Even if this fails, refresh customers list from the main data
          const updatedCustomer = customers.find(c =>
            (c.id === selectedCustomer.id) || (c._id === selectedCustomer._id)
          );
          if (updatedCustomer) {
            setSelectedCustomer(updatedCustomer);
          }
        }
      }

      // Reset form and close dialog
      setDocumentForm({
        documentType: '',
        expiryDate: '',
        description: '',
        file: null
      });
      setUploadDocumentDialogOpen(false);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const getTotalCustomers = () => customers.length;
  const getActiveCustomers = () => customers.filter(c => c.status === 'active').length;
  const getTotalRevenue = () => customers.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const getAverageSatisfaction = () => {
    if (customers.length === 0) return '0.0';
    const scores = customers.map(c => c.satisfactionScore || 5.0);
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
  };

  const getExpiringDocuments = () => {
    const expiringDocs: any[] = [];
    customers.forEach(customer => {
      if (customer.documents && Array.isArray(customer.documents)) {
        customer.documents.forEach(doc => {
          if (doc.status === 'expiring') {
            expiringDocs.push({ ...doc, customerName: customer.name, customerId: customer.id });
          }
        });
      }
    });
    return expiringDocs;
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeads = leads.filter(lead =>
    `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLead = async () => {
    if (!newLead.firstName || !newLead.email) {
      toast({
        title: 'Error',
        description: 'First name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Creating lead:', newLead);
      const result = await crmService.createLead(newLead);
      console.log('Lead created:', result);

      setCreateLeadDialogOpen(false);
      setNewLead(getDefaultLeadForm());

      // Dispatch event to notify other modules (like SalesCrmModule) that a lead was created
      window.dispatchEvent(new CustomEvent('leadCreated', { 
        detail: { lead_id: result.lead_id, lead: newLead } 
      }));
      window.dispatchEvent(new CustomEvent('refreshLeads'));

      toast({
        title: '✅ Lead Created',
        description: `${newLead.firstName} ${newLead.lastName} has been added to leads.`,
      });

      // Refresh leads list
      await fetchLeads();
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lead. Make sure the backend server is running on port 8000.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditLead = async (lead: any) => {
    try {
      const leadIdentifier = lead?.lead_id || lead?.id;
      if (!leadIdentifier) {
        toast({
          title: 'Lead unavailable',
          description: 'Unable to identify the selected lead for editing.',
          variant: 'destructive',
        });
        return;
      }

      setEditLeadDialogOpen(true);
      setIsLoadingLeadForEdit(true);

      let normalizedLead = { ...lead, lead_id: lead?.lead_id || leadIdentifier };

      try {
        const latestLead = await crmService.getLead(leadIdentifier);
        if (latestLead) {
          normalizedLead = { ...latestLead, lead_id: latestLead.lead_id || leadIdentifier };
        }
      } catch (error) {
        console.warn('Failed to refresh lead before editing:', error);
        // Continue with cached data - don't show error toast as it's not critical
      }

      setLeadToEdit(normalizedLead);
      const formData = mapLeadToFormData(normalizedLead);
      setEditLeadData(formData);
      setIsLoadingLeadForEdit(false);
    } catch (error: any) {
      console.error('Error starting edit lead:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load lead for editing. Please try again.',
        variant: 'destructive',
      });
      setIsLoadingLeadForEdit(false);
      setEditLeadDialogOpen(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!leadToEdit) return;
    if (!editLeadData.firstName || !editLeadData.email) {
      toast({
        title: 'Error',
        description: 'First name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    const leadIdentifier = leadToEdit.lead_id || leadToEdit.id;
    if (!leadIdentifier) {
      toast({
        title: 'Error',
        description: 'Lead identifier missing. Unable to update lead.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUpdatingLead(true);
      await crmService.updateLead(leadIdentifier, editLeadData);

      // Dispatch event to notify other modules (like SalesCrmModule) that a lead was updated
      window.dispatchEvent(new CustomEvent('leadUpdated', { 
        detail: { lead_id: leadIdentifier, lead: editLeadData } 
      }));
      window.dispatchEvent(new CustomEvent('refreshLeads'));

      toast({
        title: '✅ Lead Updated',
        description: `${editLeadData.firstName} ${editLeadData.lastName} has been updated.`,
      });

      setEditLeadDialogOpen(false);
      setLeadToEdit(null);
      setEditLeadData(getDefaultLeadForm());

      await fetchLeads();

      if (selectedLead && (selectedLead.lead_id === leadIdentifier || selectedLead.id === leadIdentifier)) {
        const refreshedLead = await crmService.getLead(leadIdentifier);
        setSelectedLead(refreshedLead);
      }
    } catch (error: any) {
      console.error('Failed to update lead:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingLead(false);
    }
  };

  const handleViewLeadDetails = (lead: any) => {
    setSelectedLead(lead);
    setLeadDetailsDialogOpen(true);
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await crmService.updateLeadStatus(leadId, newStatus);

      // Dispatch event to notify other modules (like SalesCrmModule) that a lead status was updated
      window.dispatchEvent(new CustomEvent('leadUpdated', { 
        detail: { lead_id: leadId, status: newStatus } 
      }));
      window.dispatchEvent(new CustomEvent('refreshLeads'));

      toast({
        title: '✅ Status Updated',
        description: `Lead status updated to ${newStatus}.`,
      });

      // Refresh leads
      await fetchLeads();

      // Refresh selected lead details
      if (selectedLead && selectedLead.lead_id === leadId) {
        const updatedLead = await crmService.getLead(leadId);
        setSelectedLead(updatedLead);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    }
  };

  const getLeadStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'New': 'default',
      'Qualified': 'default',
      'Nurture': 'secondary',
      'Junk': 'destructive',
      'Unqualified': 'destructive'
    };
    return variants[status] || 'outline';
  };

  // Call functionality
  useEffect(() => {
    let interval: any;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const handleMakeCall = () => {
    if (!selectedLead) return;
    setCallDuration(0);
    setIsCallActive(true);
    setCallDialogOpen(true);

    toast({
      title: '📞 Calling...',
      description: `Initiating call to ${selectedLead.firstName} ${selectedLead.lastName}`,
    });
  };

  const handleEndCall = async () => {
    if (!selectedLead) return;

    try {
      await crmService.logCall({
        leadId: selectedLead.lead_id,
        duration: callDuration,
        type: 'Outbound Call'
      });

      setIsCallActive(false);
      setCallDialogOpen(false);
      setCallDuration(0);

      toast({
        title: '✅ Call Ended',
        description: `Call duration: ${Math.floor(callDuration / 60)}m ${callDuration % 60}s`,
      });

      // Refresh lead details
      await fetchLeadDetails(selectedLead.lead_id);
      const updatedLead = await crmService.getLead(selectedLead.lead_id);
      setSelectedLead(updatedLead);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log call',
        variant: 'destructive',
      });
    }
  };

  // Email functionality
  const handleSendEmail = async () => {
    if (!selectedLead || !emailData.subject) {
      toast({
        title: 'Error',
        description: 'Subject is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await crmService.sendEmail({
        leadId: selectedLead.lead_id,
        to: emailData.to || selectedLead.email,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        body: emailData.body,
      });

      setEmailComposerOpen(false);
      setEmailData({ to: '', cc: '', bcc: '', subject: '', body: '' });

      toast({
        title: '✅ Email Sent',
        description: `Email sent to ${selectedLead.firstName} ${selectedLead.lastName}`,
      });

      // Refresh lead details
      await fetchLeadDetails(selectedLead.lead_id);
      const updatedLead = await crmService.getLead(selectedLead.lead_id);
      setSelectedLead(updatedLead);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      });
    }
  };

  // Task functionality
  const handleCreateTask = async () => {
    if (!selectedLead || !taskData.title) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await crmService.createTask({
        leadId: selectedLead.lead_id,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
      });

      setTaskDialogOpen(false);
      setTaskData({ title: '', description: '', status: 'Backlog', assignedTo: 'Shariq Ansari', dueDate: '', priority: 'Low' });

      toast({
        title: '✅ Task Created',
        description: taskData.title,
      });

      // Refresh lead details
      await fetchLeadDetails(selectedLead.lead_id);
      const updatedLead = await crmService.getLead(selectedLead.lead_id);
      setSelectedLead(updatedLead);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  // Note functionality
  const handleCreateNote = async () => {
    if (!selectedLead || !noteData.title) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await crmService.createNote({
        leadId: selectedLead.lead_id,
        title: noteData.title,
        content: noteData.content,
      });

      setNoteDialogOpen(false);
      setNoteData({ title: '', content: '' });

      toast({
        title: '✅ Note Created',
        description: noteData.title,
      });

      // Refresh lead details
      await fetchLeadDetails(selectedLead.lead_id);
      const updatedLead = await crmService.getLead(selectedLead.lead_id);
      setSelectedLead(updatedLead);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create note',
        variant: 'destructive',
      });
    }
  };

  // Convert to Customer functionality
  const handleConvertToCustomer = async () => {
    if (!selectedLead) return;

    try {
      // Prepare customer data from lead
      const customerData = {
        name: selectedLead.organization || `${selectedLead.firstName} ${selectedLead.lastName}`,
        email: selectedLead.email || '',
        phone: selectedLead.mobile || '',
        cr_number: '', // Can be added later if needed
        vat_number: '', // Can be added later if needed
        credit_limit: 0, // Default credit limit
        deposit_amount: 0, // Default deposit amount
      };

      // Call admin API to create customer
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/admin/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create customer' }));
        throw new Error(errorData.detail || 'Failed to create customer');
      }

      const result = await response.json();

      toast({
        title: '✅ Lead Converted to Customer',
        description: `${selectedLead.firstName} ${selectedLead.lastName} has been converted to a customer (${result.customer_id || 'Customer created'}).`,
      });

      setConvertToDealDialogOpen(false);
      setLeadDetailsDialogOpen(false);

      // Refresh leads and customers
      await fetchLeads();
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error converting lead to customer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert lead to customer',
        variant: 'destructive',
      });
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">CRM Control Center</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive customer relationship management, document tracking, and sales pipeline visibility
          </p>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCustomers()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">{getActiveCustomers()} active</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {getTotalRevenue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageSatisfaction()} / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">Excellent</span> customer satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Document Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getExpiringDocuments().length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Header with Add Enquiry Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">CRM Overview</h3>
              <p className="text-sm text-muted-foreground">Monitor customer relationships and sales pipeline</p>
            </div>
            <Button onClick={() => setCreateEnquiryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Enquiry
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Customer Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Customer Activity</CardTitle>
                <CardDescription>Latest customer interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(customer.status)}`} />
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.contactPerson}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">AED {customer.totalValue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{customer.satisfactionScore}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Status */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Pipeline Status</CardTitle>
                <CardDescription>Current stage distribution of all deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['enquiry', 'quotation', 'contract', 'feedback'].map((stage) => {
                    const count = pipeline.filter(p => p.stage === stage).length;
                    const percentage = (count / pipeline.length) * 100;
                    const Icon = getStageIcon(stage);
                    return (
                      <div key={stage} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium capitalize">{stage}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{count} deals</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Alerts */}
          {getExpiringDocuments().length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-5 w-5" />
                  Document Expiry Alerts
                </CardTitle>
                <CardDescription className="text-orange-700">
                  The following documents are expiring soon and require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getExpiringDocuments().map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{doc.customerName}</p>
                        <p className="text-xs text-muted-foreground">{doc.name} - Expires: {doc.expiryDate}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Request Update
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search leads by name, email, organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog
              open={editLeadDialogOpen}
              onOpenChange={(open) => {
                setEditLeadDialogOpen(open);
                if (!open) {
                  setLeadToEdit(null);
                  setEditLeadData(getDefaultLeadForm());
                  setIsLoadingLeadForEdit(false);
                }
              }}
            >
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Lead</DialogTitle>
                  <DialogDescription>Update lead information to keep your pipeline accurate.</DialogDescription>
                </DialogHeader>

                {isLoadingLeadForEdit ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading lead data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <div className="space-y-2">
                    <Label>Salutation</Label>
                    <Select value={editLeadData.salutation} onValueChange={(value) => setEditLeadData({ ...editLeadData, salutation: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={editLeadData.firstName}
                      onChange={(e) => setEditLeadData({ ...editLeadData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={editLeadData.lastName}
                      onChange={(e) => setEditLeadData({ ...editLeadData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={editLeadData.email}
                      onChange={(e) => setEditLeadData({ ...editLeadData, email: e.target.value })}
                      placeholder="john@doe.com"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-2">
                    <Label>Mobile No</Label>
                    <Input
                      value={editLeadData.mobile}
                      onChange={(e) => setEditLeadData({ ...editLeadData, mobile: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={editLeadData.gender} onValueChange={(value) => setEditLeadData({ ...editLeadData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 4 */}
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Input
                      value={editLeadData.organization}
                      onChange={(e) => setEditLeadData({ ...editLeadData, organization: e.target.value })}
                      placeholder="Frappe Technologies"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={editLeadData.website}
                      onChange={(e) => setEditLeadData({ ...editLeadData, website: e.target.value })}
                      placeholder="https://frappe.io"
                    />
                  </div>

                  {/* Row 5 */}
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={editLeadData.jobTitle}
                      onChange={(e) => setEditLeadData({ ...editLeadData, jobTitle: e.target.value })}
                      placeholder="Product Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>No of Employees</Label>
                    <Select value={editLeadData.noOfEmployees} onValueChange={(value) => setEditLeadData({ ...editLeadData, noOfEmployees: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="501-1000">501-1000</SelectItem>
                        <SelectItem value="1000-5000">1000-5000</SelectItem>
                        <SelectItem value="5000-10000">5000-10000</SelectItem>
                        <SelectItem value="10000+">10000+</SelectItem>
                        <SelectItem value="50000+">50000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 6 */}
                  <div className="space-y-2">
                    <Label>Territory</Label>
                    <Select value={editLeadData.territory} onValueChange={(value) => setEditLeadData({ ...editLeadData, territory: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select territory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="Singapore">Singapore</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Revenue</Label>
                    <Input
                      type="number"
                      value={editLeadData.annualRevenue}
                      onChange={(e) => setEditLeadData({ ...editLeadData, annualRevenue: Number(e.target.value) })}
                      placeholder="1000000"
                    />
                  </div>

                  {/* Row 7 */}
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={editLeadData.industry} onValueChange={(value) => setEditLeadData({ ...editLeadData, industry: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select value={editLeadData.source} onValueChange={(value) => setEditLeadData({ ...editLeadData, source: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Advertisement">Advertisement</SelectItem>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="Youtube">Youtube</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 8 */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editLeadData.status} onValueChange={(value) => setEditLeadData({ ...editLeadData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Nurture">Nurture</SelectItem>
                        <SelectItem value="Junk">Junk</SelectItem>
                        <SelectItem value="Unqualified">Unqualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Owner</Label>
                    <Select value={editLeadData.leadOwner} onValueChange={(value) => setEditLeadData({ ...editLeadData, leadOwner: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {salesUsers.length > 0 ? (
                          salesUsers.map((user) => (
                            <SelectItem key={user.id} value={user.full_name}>
                              {user.full_name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Shariq Ansari">Shariq Ansari</SelectItem>
                            <SelectItem value="Asif Mula">Asif Mula</SelectItem>
                            <SelectItem value="Ankush Nehe">Ankush Nehe</SelectItem>
                            <SelectItem value="Suraj Sharma">Suraj Sharma</SelectItem>
                            <SelectItem value="Faris Ansari">Faris Ansari</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditLeadDialogOpen(false);
                      setLeadToEdit(null);
                      setEditLeadData(getDefaultLeadForm());
                      setIsLoadingLeadForEdit(false);
                    }}
                    disabled={isUpdatingLead || isLoadingLeadForEdit}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateLead} disabled={isUpdatingLead || isLoadingLeadForEdit || !leadToEdit}>
                    {isUpdatingLead ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leads</CardTitle>
              <CardDescription>Manage and track your sales leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile No</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          No leads found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="font-medium">
                              {lead.salutation} {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{lead.lead_id || lead.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {lead.organization}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getLeadStatusBadge(lead.status)}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{lead.source}</TableCell>
                          <TableCell>{lead.jobTitle}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {lead.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {lead.mobile}
                            </div>
                          </TableCell>
                          <TableCell>{lead.assignedTo}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Details"
                                onClick={() => handleViewLeadDetails(lead)}
                                className="h-9 w-9 rounded-full border border-muted-foreground/10 bg-muted"
                              >
                                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit Lead"
                                onClick={() => handleStartEditLead(lead)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Lead Details Dialog */}
          <Dialog open={leadDetailsDialogOpen} onOpenChange={setLeadDetailsDialogOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
              {selectedLead && (
                <div className="flex h-full">
                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Leads / {selectedLead.firstName} {selectedLead.lastName}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span className="text-sm">{selectedLead.leadOwner}</span>
                        </div>
                        <Badge variant={getLeadStatusBadge(selectedLead.status)}>
                          {selectedLead.status}
                        </Badge>
                        <Button onClick={() => setConvertToDealDialogOpen(true)}>
                          Convert to Customer
                        </Button>
                      </div>
                    </div>

                    {/* Tabs for Activity, Emails, Calls, Tasks, Notes */}
                    <Tabs value={leadDetailTab} onValueChange={setLeadDetailTab} className="flex-1 flex flex-col">
                      <TabsList className="px-6 border-b rounded-none w-full justify-start">
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="emails">Emails</TabsTrigger>
                        <TabsTrigger value="calls">Calls</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto px-6 py-4">
                        {/* Activity Tab */}
                        <TabsContent value="activity" className="mt-0">
                          <div className="space-y-4">
                            {selectedLead.activities && selectedLead.activities.length > 0 ? (
                              selectedLead.activities.map((activity: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 border-l-2 pl-4 py-2">
                                  <UserCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="font-medium">{activity.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {activity.by} • {activity.timestamp}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No activities yet</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Emails Tab */}
                        <TabsContent value="emails" className="mt-0">
                          <div className="space-y-4">
                            <Button onClick={() => { setEmailData({ ...emailData, to: selectedLead.email, subject: `${selectedLead.firstName} ${selectedLead.lastName} (#${selectedLead.lead_id || selectedLead.id})` }); setEmailComposerOpen(true); }}>
                              <Mail className="h-4 w-4 mr-2" />
                              New Email
                            </Button>
                            {leadEmails.length > 0 ? (
                              leadEmails.map((email: any) => (
                                <Card key={email.id}>
                                  <CardHeader>
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-base">{email.subject}</CardTitle>
                                        <CardDescription>TO: {email.to}</CardDescription>
                                      </div>
                                      <span className="text-xs text-muted-foreground">{email.timestamp}</span>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm">{email.body}</p>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No Email Communications</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Calls Tab */}
                        <TabsContent value="calls" className="mt-0">
                          <div className="space-y-4">
                            <Button onClick={handleMakeCall}>
                              <Phone className="h-4 w-4 mr-2" />
                              Make a Call
                            </Button>
                            {leadCalls.length > 0 ? (
                              leadCalls.map((call: any) => (
                                <Card key={call.id}>
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <PhoneCall className="h-5 w-5" />
                                        <div>
                                          <CardTitle className="text-base">{call.type}</CardTitle>
                                          <CardDescription>
                                            Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                          </CardDescription>
                                        </div>
                                      </div>
                                      <span className="text-xs text-muted-foreground">{call.timestamp}</span>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span>{call.from}</span>
                                      <ArrowRight className="h-4 w-4" />
                                      <span>{call.to}</span>
                                      <span className="text-muted-foreground">({call.phone})</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <Phone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No Call Logs</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Tasks Tab */}
                        <TabsContent value="tasks" className="mt-0">
                          <div className="space-y-4">
                            <Button onClick={() => setTaskDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              New Task
                            </Button>
                            {leadTasks.length > 0 ? (
                              leadTasks.map((task: any) => (
                                <Card key={task.id}>
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">{task.title}</CardTitle>
                                      <Badge variant="outline">{task.status}</Badge>
                                    </div>
                                    <CardDescription>{task.description}</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="flex items-center gap-1">
                                        <UserCheck className="h-4 w-4" />
                                        {task.assignedTo}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {task.dueDate || 'No due date'}
                                      </span>
                                      <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                                        {task.priority}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No tasks yet</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Notes Tab */}
                        <TabsContent value="notes" className="mt-0">
                          <div className="space-y-4">
                            <Button onClick={() => setNoteDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              New Note
                            </Button>
                            {leadNotes.length > 0 ? (
                              leadNotes.map((note: any) => (
                                <Card key={note.id}>
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">{note.title}</CardTitle>
                                      <span className="text-xs text-muted-foreground">{note.createdAt}</span>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                    <p className="text-xs text-muted-foreground mt-2">By {note.createdBy}</p>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No notes yet</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* WhatsApp Tab */}
                        <TabsContent value="whatsapp" className="mt-0">
                          <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>WhatsApp integration coming soon</p>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  {/* Right Sidebar - Lead Details */}
                  <div className="w-80 border-l bg-muted/20 overflow-y-auto p-6">
                    <div className="space-y-6">
                      {/* Lead Info */}
                      <div className="text-center pb-4 border-b">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-primary">
                            {selectedLead.firstName[0]}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">
                          {selectedLead.salutation} {selectedLead.firstName} {selectedLead.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{selectedLead.lead_id || selectedLead.id}</p>
                        <div className="flex items-center justify-center gap-3 mt-3">
                          <Button size="icon" variant="outline" onClick={handleMakeCall}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => { setEmailData({ ...emailData, to: selectedLead.email }); setEmailComposerOpen(true); }}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline">
                            <Link2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-3">Details</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Organization</p>
                              <p className="text-sm font-medium">{selectedLead.organization}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Website</p>
                              <p className="text-sm font-medium">{selectedLead.website}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Industry</p>
                              <p className="text-sm font-medium">{selectedLead.industry}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Job Title</p>
                              <p className="text-sm font-medium">{selectedLead.jobTitle}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Source</p>
                              <p className="text-sm font-medium">{selectedLead.source}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Lead Owner</p>
                              <p className="text-sm font-medium">{selectedLead.leadOwner}</p>
                            </div>
                          </div>
                        </div>

                        {/* Person */}
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold text-sm mb-3">Person</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground">First Name *</p>
                              <p className="text-sm font-medium">{selectedLead.firstName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Last Name</p>
                              <p className="text-sm font-medium">{selectedLead.lastName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="text-sm font-medium">{selectedLead.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Mobile No</p>
                              <p className="text-sm font-medium">{selectedLead.mobile}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={createCustomerDialogOpen} onOpenChange={setCreateCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setCreateCustomerDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Customer</DialogTitle>
                  <DialogDescription>Enter customer details to add to CRM</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cust_name">Company Name *</Label>
                    <Input id="cust_name" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder="Company Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cust_contact">Contact Person</Label>
                    <Input id="cust_contact" value={customerForm.contactPerson} onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })} placeholder="Contact Person Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cust_email">Email *</Label>
                    <Input id="cust_email" type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} placeholder="name@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cust_phone">Phone</Label>
                    <Input id="cust_phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="+971 5x xxx xxxx" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreateCustomerDialogOpen(false)} disabled={creatingCustomer}>Cancel</Button>
                  <Button onClick={handleCreateCustomer} disabled={creatingCustomer || !customerForm.name || !customerForm.email}>
                    {creatingCustomer ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Customer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Active Contracts</TableHead>
                  <TableHead>Satisfaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.companyType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{customer.contactPerson}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{customer.phone}</TableCell>
                      <TableCell className="font-semibold">AED {customer.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{customer.activeContracts}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{customer.satisfactionScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Details"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Upload Document"
                            onClick={() => handleDocumentUpload(customer)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Edit Customer"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Sales Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Sales Pipeline</CardTitle>
              <CardDescription>Track every deal from enquiry to feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Enquiry</TableHead>
                      <TableHead>Quotation</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipeline.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{item.customerName}</p>
                            <p className="text-xs text-muted-foreground">{item.customerId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.enquiryStatus === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            <div>
                              <p className="text-xs font-medium">{item.enquiryId}</p>
                              <p className="text-xs text-muted-foreground">{item.enquiryDate}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.quotationId ? (
                            <div className="flex items-center gap-2">
                              {item.quotationStatus === 'accepted' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : item.quotationStatus === 'pending' ? (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <div>
                                <p className="text-xs font-medium">{item.quotationId}</p>
                                <p className="text-xs text-muted-foreground">AED {item.quotationValue?.toLocaleString()}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.contractId ? (
                            <div className="flex items-center gap-2">
                              {item.contractStatus === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Activity className="h-4 w-4 text-blue-600" />
                              )}
                              <div>
                                <p className="text-xs font-medium">{item.contractId}</p>
                                <p className="text-xs text-muted-foreground">{item.contractDate}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.feedbackScore ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{item.feedbackScore}/5</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.stage)}>
                            {item.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {item.contractValue ? `AED ${item.contractValue.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Pipeline"
                            onClick={() => handleViewPipeline(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab removed per request */}

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance Metrics</CardTitle>
                <CardDescription>Monthly conversion and revenue tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesPerformance.map((month, idx) => (
                    <div key={idx} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-sm text-muted-foreground">
                          {month.conversionRate}% conversion
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Enquiries</p>
                          <p className="text-lg font-bold text-blue-600">{month.enquiries}</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Quotations</p>
                          <p className="text-lg font-bold text-purple-600">{month.quotations}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Contracts</p>
                          <p className="text-lg font-bold text-green-600">{month.contracts}</p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg font-bold text-orange-600">
                            {(month.revenue / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction Analysis</CardTitle>
                <CardDescription>Feedback scores and satisfaction trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{customer.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= customer.satisfactionScore
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{customer.satisfactionScore}/5.0</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Projects</p>
                        <p className="text-sm font-semibold">{customer.completedProjects}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Excellent Performance</p>
                      <p className="text-sm text-green-700">
                        Average satisfaction score of {getAverageSatisfaction()}/5.0 across all customers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Value</CardTitle>
              <CardDescription>Highest value customers and their contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customers
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .slice(0, 5)
                  .map((customer, idx) => (
                    <div key={customer.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.activeContracts} active contracts • {customer.completedProjects} completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">AED {customer.totalValue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{customer.satisfactionScore}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Details Dialog - Client Information Sheet */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-primary pb-4">
                <h2 className="text-2xl font-bold text-primary">Client Information Sheet</h2>
                <div className="px-4 py-2 border-2 border-primary rounded bg-primary/5">
                  <p className="text-sm font-semibold text-primary">{selectedCustomer.id || 'New customer ID'}</p>
                </div>
              </div>

              {/* Comments / Special Instructions */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Comments / Special Instructions</Label>
                <div className="min-h-[80px] p-3 border rounded-md bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.specialInstructions || selectedCustomer.special_instructions || selectedCustomer.comments || 'No special instructions or comments available.'}
                  </p>
                </div>
              </div>

              {/* Customer Info Section */}
              <div className="space-y-3 border-b pb-4">
                <h3 className="text-base font-bold">Customer Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Customer Name:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.name || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Street Address:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.location || selectedCustomer.address || selectedCustomer.streetAddress || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">City, State, Zip:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.city || selectedCustomer.location || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Business Phone:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.phone || selectedCustomer.businessPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Bill To and Ship To Address */}
              <div className="grid grid-cols-2 gap-6 border-b pb-4">
                {/* Bill To Address */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold">Bill To Address:</Label>
                  <div className="space-y-2">
                    <div className="flex items-start gap-4">
                      <Label className="text-sm font-medium min-w-[120px]">Street Address:</Label>
                      <p className="text-sm flex-1">{selectedCustomer.billingAddress || selectedCustomer.location || 'N/A'}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Label className="text-sm font-medium min-w-[120px]">City, State, Zip:</Label>
                      <p className="text-sm flex-1">{selectedCustomer.billingCity || selectedCustomer.city || selectedCustomer.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Ship To Address */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold">Ship To Address</Label>
                  <div className="space-y-2">
                    <div className="flex items-start gap-4">
                      <Label className="text-sm font-medium min-w-[120px]">Street Address:</Label>
                      <p className="text-sm flex-1">{selectedCustomer.shippingAddress || selectedCustomer.deliveryLocation || selectedCustomer.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary customer contact */}
              <div className="space-y-3 border-b pb-4">
                <Label className="text-sm font-bold">Primary customer contact</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Office Phone:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.phone || selectedCustomer.officePhone || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Email Address(s):</Label>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{selectedCustomer.email || 'N/A'}</p>
                      {selectedCustomer.secondaryEmail && (
                        <p className="text-sm">{selectedCustomer.secondaryEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Cell Phone(s):</Label>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{selectedCustomer.mobile || selectedCustomer.cellPhone || selectedCustomer.phone || 'N/A'}</p>
                      {selectedCustomer.secondaryPhone && (
                        <p className="text-sm">{selectedCustomer.secondaryPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Name/No. Section */}
              <div className="space-y-3">
                <Label className="text-sm font-bold">Contract Name/No.</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Project Contact:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.contactPerson || selectedCustomer.projectContact || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Phone:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.contactPhone || selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Email Address:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.contactEmail || selectedCustomer.email || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Payment Terms:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.paymentTerms || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Special Terms:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.specialTerms || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Preferred Billing Method:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.preferredBillingMethod || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Label className="text-sm font-medium min-w-[140px]">Preferred Payment Method:</Label>
                    <p className="text-sm flex-1">{selectedCustomer.preferredPaymentMethod || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-start gap-4">
                      <Label className="text-sm font-medium min-w-[140px]">Services Notes:</Label>
                      <div className="min-h-[60px] p-3 border rounded-md bg-muted/50 flex-1">
                        <p className="text-sm text-muted-foreground">
                          {selectedCustomer.servicesNotes || selectedCustomer.notes || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editCustomerDialogOpen} onOpenChange={setEditCustomerDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information and details</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    value={editCustomerForm.name}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={editCustomerForm.contactPerson}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, contactPerson: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={editCustomerForm.email}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Phone</Label>
                  <Input
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={editCustomerForm.website}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, website: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input
                    value={editCustomerForm.streetAddress}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, streetAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={editCustomerForm.city}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={editCustomerForm.state}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={editCustomerForm.zip}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, zip: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Phone</Label>
                  <Input
                    value={editCustomerForm.businessPhone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, businessPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Office Phone</Label>
                  <Input
                    value={editCustomerForm.officePhone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, officePhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile / Cell Phone</Label>
                  <Input
                    value={editCustomerForm.mobile}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, mobile: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Email</Label>
                  <Input
                    type="email"
                    value={editCustomerForm.secondaryEmail}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, secondaryEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Phone</Label>
                  <Input
                    value={editCustomerForm.secondaryPhone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, secondaryPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Billing Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billing Street Address</Label>
                  <Input
                    value={editCustomerForm.billingAddress}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, billingAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing City</Label>
                  <Input
                    value={editCustomerForm.billingCity}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, billingCity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing State</Label>
                  <Input
                    value={editCustomerForm.billingState}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, billingState: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Zip Code</Label>
                  <Input
                    value={editCustomerForm.billingZip}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, billingZip: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Shipping Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shipping Street Address</Label>
                  <Input
                    value={editCustomerForm.shippingAddress}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, shippingAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shipping City</Label>
                  <Input
                    value={editCustomerForm.shippingCity}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, shippingCity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shipping State</Label>
                  <Input
                    value={editCustomerForm.shippingState}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, shippingState: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shipping Zip Code</Label>
                  <Input
                    value={editCustomerForm.shippingZip}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, shippingZip: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Project Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Project Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Contact Name</Label>
                  <Input
                    value={editCustomerForm.projectContact}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, projectContact: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={editCustomerForm.contactPhone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, contactPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={editCustomerForm.contactEmail}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, contactEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Payment & Terms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Payment & Terms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input
                    value={editCustomerForm.paymentTerms}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, paymentTerms: e.target.value })}
                    placeholder="e.g., Net 30, Due on Receipt"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Special Terms</Label>
                  <Input
                    value={editCustomerForm.specialTerms}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, specialTerms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Billing Method</Label>
                  <Select
                    value={editCustomerForm.preferredBillingMethod}
                    onValueChange={(value) => setEditCustomerForm({ ...editCustomerForm, preferredBillingMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Mail">Mail</SelectItem>
                      <SelectItem value="Online Portal">Online Portal</SelectItem>
                      <SelectItem value="Fax">Fax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Payment Method</Label>
                  <Select
                    value={editCustomerForm.preferredPaymentMethod}
                    onValueChange={(value) => setEditCustomerForm({ ...editCustomerForm, preferredPaymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes & Comments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Notes & Comments</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Services Notes</Label>
                  <Textarea
                    value={editCustomerForm.servicesNotes}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, servicesNotes: e.target.value })}
                    rows={4}
                    placeholder="Enter service-related notes..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comments / Special Instructions</Label>
                  <Textarea
                    value={editCustomerForm.comments || editCustomerForm.specialInstructions}
                    onChange={(e) => setEditCustomerForm({ 
                      ...editCustomerForm, 
                      comments: e.target.value,
                      specialInstructions: e.target.value 
                    })}
                    rows={4}
                    placeholder="Enter any special instructions or comments..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <form onSubmit={handleUpdateCustomer}>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditCustomerDialogOpen(false);
                    setEditCustomerForm({
                      name: '',
                      contactPerson: '',
                      email: '',
                      phone: '',
                      location: '',
                      address: '',
                      streetAddress: '',
                      city: '',
                      state: '',
                      zip: '',
                      businessPhone: '',
                      officePhone: '',
                      mobile: '',
                      cellPhone: '',
                      secondaryEmail: '',
                      secondaryPhone: '',
                      website: '',
                      billingAddress: '',
                      billingCity: '',
                      billingState: '',
                      billingZip: '',
                      shippingAddress: '',
                      shippingCity: '',
                      shippingState: '',
                      shippingZip: '',
                      projectContact: '',
                      contactPhone: '',
                      contactEmail: '',
                      paymentTerms: '',
                      specialTerms: '',
                      preferredBillingMethod: '',
                      preferredPaymentMethod: '',
                      servicesNotes: '',
                      notes: '',
                      comments: '',
                      specialInstructions: '',
                    });
                  }}
                  disabled={editingCustomer}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editingCustomer || !editCustomerForm.name || !editCustomerForm.email}>
                  {editingCustomer ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Customer'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Management</DialogTitle>
            <DialogDescription>View and manage all customer documents</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-semibold">{selectedCustomer.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.id}</p>
                </div>
                <Button onClick={() => handleDocumentUpload(selectedCustomer)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Document
                </Button>
              </div>

              <div className="space-y-3">
                {selectedCustomer.documents && selectedCustomer.documents.length > 0 ? (
                  selectedCustomer.documents.map((doc: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name || 'Unnamed Document'}</p>
                            <p className="text-sm text-muted-foreground">
                              Type: {doc.type || 'N/A'} • Uploaded: {doc.uploadDate || doc.upload_date || 'N/A'}
                            </p>
                            {doc.expiryDate || doc.expiry_date ? (
                              <p className="text-sm text-muted-foreground">
                                Expiry Date: {doc.expiryDate || doc.expiry_date}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(doc.status || 'pending')}>
                            {doc.status || 'pending'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No documents found for this customer</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pipeline Details Dialog */}
      <Dialog open={pipelineDetailsDialogOpen} onOpenChange={setPipelineDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales Pipeline Details</DialogTitle>
            <DialogDescription>Complete information about this pipeline item</DialogDescription>
          </DialogHeader>
          {selectedPipelineItem && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Customer Name</Label>
                    <p className="font-medium">{selectedPipelineItem.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Customer ID</Label>
                    <p className="font-medium">{selectedPipelineItem.customerId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Enquiry Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {selectedPipelineItem.enquiryStatus === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                  Enquiry Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Enquiry ID</Label>
                    <p className="font-medium">{selectedPipelineItem.enquiryId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Enquiry Date</Label>
                    <p className="font-medium">{selectedPipelineItem.enquiryDate || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={selectedPipelineItem.enquiryStatus === 'completed' ? 'default' : 'secondary'}>
                      {selectedPipelineItem.enquiryStatus || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quotation Information */}
              {selectedPipelineItem.quotationId && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    {selectedPipelineItem.quotationStatus === 'accepted' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : selectedPipelineItem.quotationStatus === 'pending' ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Quotation Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Quotation ID</Label>
                      <p className="font-medium">{selectedPipelineItem.quotationId || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Quotation Date</Label>
                      <p className="font-medium">{selectedPipelineItem.quotationDate || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Quotation Value</Label>
                      <p className="font-medium">AED {selectedPipelineItem.quotationValue?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge
                        variant={
                          selectedPipelineItem.quotationStatus === 'accepted' ? 'default' :
                            selectedPipelineItem.quotationStatus === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {selectedPipelineItem.quotationStatus || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Contract Information */}
              {selectedPipelineItem.contractId && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    {selectedPipelineItem.contractStatus === 'completed' || selectedPipelineItem.contractStatus === 'active' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Activity className="h-5 w-5 text-blue-600" />
                    )}
                    Contract Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Contract ID</Label>
                      <p className="font-medium">{selectedPipelineItem.contractId || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Contract Date</Label>
                      <p className="font-medium">{selectedPipelineItem.contractDate || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Contract Value</Label>
                      <p className="font-medium font-semibold text-lg">
                        AED {selectedPipelineItem.contractValue?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge variant={selectedPipelineItem.contractStatus === 'active' ? 'default' : 'secondary'}>
                        {selectedPipelineItem.contractStatus || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Information */}
              {selectedPipelineItem.feedbackScore && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    Feedback Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Feedback Score</Label>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <p className="font-medium text-lg">{selectedPipelineItem.feedbackScore}/5</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Feedback Date</Label>
                      <p className="font-medium">{selectedPipelineItem.feedbackDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage and Notes */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Current Stage</Label>
                  <Badge variant={getStatusBadgeVariant(selectedPipelineItem.stage)} className="mt-2">
                    {selectedPipelineItem.stage || 'N/A'}
                  </Badge>
                </div>
                {selectedPipelineItem.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <div className="mt-2 p-3 border rounded-md bg-muted/50">
                      <p className="text-sm">{selectedPipelineItem.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDocumentDialogOpen} onOpenChange={setUploadDocumentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a new document for {selectedCustomer?.name || 'this customer'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type <span className="text-red-500">*</span></Label>
              <Select
                value={documentForm.documentType}
                onValueChange={(value) => setDocumentForm({ ...documentForm, documentType: value })}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emigration_certificate">Emigration Certificate</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="licence">Licence</SelectItem>
                  <SelectItem value="trade_licence">Trade Licence</SelectItem>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="id_card">ID Card</SelectItem>
                  <SelectItem value="work_permit">Work Permit</SelectItem>
                  <SelectItem value="company_registration">Company Registration</SelectItem>
                  <SelectItem value="vat_certificate">VAT Certificate</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={documentForm.expiryDate}
                onChange={(e) => setDocumentForm({ ...documentForm, expiryDate: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter document description..."
                value={documentForm.description}
                onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Document File <span className="text-red-500">*</span></Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              {documentForm.file && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{documentForm.file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(documentForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX (Max 10MB)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDocumentDialogOpen(false);
                  setDocumentForm({
                    documentType: '',
                    expiryDate: '',
                    description: '',
                    file: null
                  });
                }}
                disabled={uploadingDocument}
              >
                Cancel
              </Button>
              <Button onClick={handleDocumentSubmit} disabled={uploadingDocument || !documentForm.documentType || !documentForm.file}>
                {uploadingDocument ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert to Customer Dialog */}
      <Dialog open={convertToDealDialogOpen} onOpenChange={setConvertToDealDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Convert to Customer</DialogTitle>
            <DialogDescription>
              Create a new customer from this lead. Customer details will be populated from the lead information.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">{selectedLead.organization || `${selectedLead.firstName} ${selectedLead.lastName}`}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      <span className="font-medium">{selectedLead.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{' '}
                      <span className="font-medium">{selectedLead.mobile || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contact Person:</span>{' '}
                      <span className="font-medium">{selectedLead.firstName} {selectedLead.lastName}</span>
                    </div>
                    {selectedLead.website && (
                      <div>
                        <span className="text-muted-foreground">Website:</span>{' '}
                        <span className="font-medium">{selectedLead.website}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Note: CR Number, VAT Number, Credit Limit, and Deposit Amount can be updated later in customer details.
                </p>
              </div>

              <Button onClick={handleConvertToCustomer} className="w-full">
                Convert to Customer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Composer Dialog */}
      <Dialog open={emailComposerOpen} onOpenChange={setEmailComposerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Email</DialogTitle>
            <DialogDescription>Compose and send email to lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>SUBJECT:</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Subject"
              />
            </div>
            <div>
              <Label>TO:</Label>
              <Input
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                placeholder="recipient@email.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CC:</Label>
                <Input
                  value={emailData.cc}
                  onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                  placeholder="CC"
                />
              </div>
              <div>
                <Label>BCC:</Label>
                <Input
                  value={emailData.bcc}
                  onChange={(e) => setEmailData({ ...emailData, bcc: e.target.value })}
                  placeholder="BCC"
                />
              </div>

            </div>
            <div>
              <Label>Message:</Label>
              <Textarea
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                placeholder="Type your message here..."
                rows={8}
              />
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={callDialogOpen} onOpenChange={(open) => { if (!open && isCallActive) handleEndCall(); else setCallDialogOpen(open); }}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-5xl font-bold text-primary">
                {selectedLead?.firstName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {selectedLead?.salutation} {selectedLead?.firstName} {selectedLead?.lastName}
              </h3>
              <p className="text-muted-foreground">{selectedLead?.mobile}</p>
            </div>
            <div className="text-4xl font-mono">{formatCallDuration(callDuration)}</div>
            <div className="flex items-center justify-center gap-4">
              <Button size="icon" variant="outline" className="rounded-full h-14 w-14">
                <Mic className="h-6 w-6" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-14 w-14" onClick={() => setNoteDialogOpen(true)}>
                <StickyNote className="h-6 w-6" />
              </Button>
              <Button size="icon" variant="destructive" className="rounded-full h-14 w-14" onClick={handleEndCall}>
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isCallActive ? 'Initiating call...' : 'Call ended'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Create tasks to capture followup details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="Follow Up"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                placeholder="Took a call with John Doe and discussed the new project."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={taskData.status} onValueChange={(value) => setTaskData({ ...taskData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Backlog">
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4" />
                        Backlog
                      </div>
                    </SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select value={taskData.assignedTo} onValueChange={(value) => setTaskData({ ...taskData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shariq Ansari">Shariq Ansari</SelectItem>
                    <SelectItem value="Asif Mula">Asif Mula</SelectItem>
                    <SelectItem value="Ankush Nehe">Ankush Nehe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={taskData.priority} onValueChange={(value) => setTaskData({ ...taskData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
            <DialogDescription>While you are in the call make a note in real time</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={noteData.title}
                onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                placeholder="Call with John Doe"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={noteData.content}
                onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                placeholder="Took a call with John Doe and discussed the new project."
                rows={8}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateNote}>Save Note</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Enquiry Dialog */}
      <Dialog open={createEnquiryDialogOpen} onOpenChange={setCreateEnquiryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Enquiry</DialogTitle>
            <DialogDescription>Create a new customer enquiry for equipment rental</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enq_customer_name">Customer Name <span className="text-red-500">*</span></Label>
              <Input id="enq_customer_name" value={enquiryForm.customer_name} onChange={(e) => setEnquiryForm({ ...enquiryForm, customer_name: e.target.value })} placeholder="Enter customer name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enq_customer_email">Customer Email <span className="text-red-500">*</span></Label>
              <Input id="enq_customer_email" type="email" value={enquiryForm.customer_email} onChange={(e) => setEnquiryForm({ ...enquiryForm, customer_email: e.target.value })} placeholder="customer@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enq_equipment">Equipment Name <span className="text-red-500">*</span></Label>
              <Input id="enq_equipment" value={enquiryForm.equipment_name} onChange={(e) => setEnquiryForm({ ...enquiryForm, equipment_name: e.target.value })} placeholder="e.g., Scaffolding - Steel Frame" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enq_quantity">Quantity <span className="text-red-500">*</span></Label>
                <Input id="enq_quantity" type="number" min={1} value={enquiryForm.quantity} onChange={(e) => setEnquiryForm({ ...enquiryForm, quantity: parseInt(e.target.value) || 1 })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enq_duration">Rental Duration (Days) <span className="text-red-500">*</span></Label>
                <Input id="enq_duration" type="number" min={1} value={enquiryForm.rental_duration_days} onChange={(e) => setEnquiryForm({ ...enquiryForm, rental_duration_days: parseInt(e.target.value) || 30 })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enq_location">Delivery Location <span className="text-red-500">*</span></Label>
              <Input id="enq_location" value={enquiryForm.delivery_location} onChange={(e) => setEnquiryForm({ ...enquiryForm, delivery_location: e.target.value })} placeholder="Enter delivery address" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enq_expected">Expected Delivery Date <span className="text-red-500">*</span></Label>
              <Input id="enq_expected" type="date" value={enquiryForm.expected_delivery_date} onChange={(e) => setEnquiryForm({ ...enquiryForm, expected_delivery_date: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enq_notes">Special Instructions</Label>
              <Textarea id="enq_notes" value={enquiryForm.special_instructions} onChange={(e) => setEnquiryForm({ ...enquiryForm, special_instructions: e.target.value })} placeholder="Any special requirements or instructions..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enq_owner">Assigned Salesperson (Optional)</Label>
              <Input id="enq_owner" value={enquiryForm.assigned_salesperson_name} onChange={(e) => setEnquiryForm({ ...enquiryForm, assigned_salesperson_name: e.target.value })} placeholder="Enter salesperson name" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateEnquiryDialogOpen(false)} disabled={creatingEnquiry}>Cancel</Button>
              <Button onClick={handleCreateEnquiry} disabled={creatingEnquiry || !enquiryForm.customer_name || !enquiryForm.customer_email || !enquiryForm.equipment_name || !enquiryForm.delivery_location || !enquiryForm.expected_delivery_date}>
                {creatingEnquiry ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4 mr-2" /> Create Enquiry</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

