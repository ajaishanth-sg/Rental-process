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
  Circle
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

export const CRMModule = () => {
  const [customers, setCustomers] = useState(customersData);
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
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLead, setNewLead] = useState({
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
    leadOwner: 'Shariq Ansari'
  });

  // Additional state for enhanced CRM features
  const [convertToDealDialogOpen, setConvertToDealDialogOpen] = useState(false);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [leadDetailTab, setLeadDetailTab] = useState('activity');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chooseExistingOrg, setChooseExistingOrg] = useState(true);
  const [chooseExistingContact, setChooseExistingContact] = useState(false);
  
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

  const { toast } = useToast();

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Fetch lead details when selected lead changes
  useEffect(() => {
    if (selectedLead && selectedLead.lead_id) {
      fetchLeadDetails(selectedLead.lead_id);
    }
  }, [selectedLead?.lead_id]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await crmService.getLeads();
      setLeads(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailsDialogOpen(true);
  };

  const handleViewDocuments = (customer: any) => {
    setSelectedCustomer(customer);
    setDocumentDialogOpen(true);
  };

  const handleDocumentUpload = (customer: any) => {
    toast({
      title: 'Document Upload',
      description: 'Document upload functionality would be implemented here.',
    });
  };

  const getTotalCustomers = () => customers.length;
  const getActiveCustomers = () => customers.filter(c => c.status === 'active').length;
  const getTotalRevenue = () => customers.reduce((sum, c) => sum + c.totalValue, 0);
  const getAverageSatisfaction = () => {
    const scores = customers.map(c => c.satisfactionScore);
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
  };

  const getExpiringDocuments = () => {
    const expiringDocs: any[] = [];
    customers.forEach(customer => {
      customer.documents.forEach(doc => {
        if (doc.status === 'expiring') {
          expiringDocs.push({ ...doc, customerName: customer.name, customerId: customer.id });
        }
      });
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
      const result = await crmService.createLead(newLead);
      
      setCreateLeadDialogOpen(false);
      setNewLead({
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
        leadOwner: 'Shariq Ansari'
      });

      toast({
        title: '✅ Lead Created',
        description: `${newLead.firstName} ${newLead.lastName} has been added to leads.`,
      });

      // Refresh leads list
      await fetchLeads();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewLeadDetails = (lead: any) => {
    setSelectedLead(lead);
    setLeadDetailsDialogOpen(true);
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await crmService.updateLeadStatus(leadId, newStatus);

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

  // Convert to Deal functionality
  const handleConvertToDeal = async () => {
    if (!selectedLead) return;

    try {
      await crmService.convertToDeal({
        leadId: selectedLead.lead_id,
        useExistingOrg: chooseExistingOrg,
        useExistingContact: chooseExistingContact,
      });

      toast({
        title: '✅ Lead Converted to Deal',
        description: `${selectedLead.firstName} ${selectedLead.lastName} has been converted to a deal.`,
      });

      setConvertToDealDialogOpen(false);
      setLeadDetailsDialogOpen(false);

      // Refresh leads
      await fetchLeads();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert lead to deal',
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
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
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
            <Dialog open={createLeadDialogOpen} onOpenChange={setCreateLeadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Lead</DialogTitle>
                  <DialogDescription>Add a new lead to the CRM system</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <div className="space-y-2">
                    <Label>Salutation</Label>
                    <Select value={newLead.salutation} onValueChange={(value) => setNewLead({...newLead, salutation: value})}>
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
                      value={newLead.firstName}
                      onChange={(e) => setNewLead({...newLead, firstName: e.target.value})}
                      placeholder="John"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={newLead.lastName}
                      onChange={(e) => setNewLead({...newLead, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      placeholder="john@doe.com"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-2">
                    <Label>Mobile No</Label>
                    <Input
                      value={newLead.mobile}
                      onChange={(e) => setNewLead({...newLead, mobile: e.target.value})}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={newLead.gender} onValueChange={(value) => setNewLead({...newLead, gender: value})}>
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
                      value={newLead.organization}
                      onChange={(e) => setNewLead({...newLead, organization: e.target.value})}
                      placeholder="Frappe Technologies"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={newLead.website}
                      onChange={(e) => setNewLead({...newLead, website: e.target.value})}
                      placeholder="https://frappe.io"
                    />
                  </div>

                  {/* Row 5 */}
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={newLead.jobTitle}
                      onChange={(e) => setNewLead({...newLead, jobTitle: e.target.value})}
                      placeholder="Product Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>No of Employees</Label>
                    <Select value={newLead.noOfEmployees} onValueChange={(value) => setNewLead({...newLead, noOfEmployees: value})}>
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
                    <Select value={newLead.territory} onValueChange={(value) => setNewLead({...newLead, territory: value})}>
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
                      value={newLead.annualRevenue}
                      onChange={(e) => setNewLead({...newLead, annualRevenue: Number(e.target.value)})}
                      placeholder="1000000"
                    />
                  </div>

                  {/* Row 7 */}
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={newLead.industry} onValueChange={(value) => setNewLead({...newLead, industry: value})}>
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
                    <Select value={newLead.source} onValueChange={(value) => setNewLead({...newLead, source: value})}>
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
                    <Select value={newLead.status} onValueChange={(value) => setNewLead({...newLead, status: value})}>
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
                    <Select value={newLead.leadOwner} onValueChange={(value) => setNewLead({...newLead, leadOwner: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shariq Ansari">Shariq Ansari</SelectItem>
                        <SelectItem value="Asif Mula">Asif Mula</SelectItem>
                        <SelectItem value="Ankush Nehe">Ankush Nehe</SelectItem>
                        <SelectItem value="Suraj Sharma">Suraj Sharma</SelectItem>
                        <SelectItem value="Faris Ansari">Faris Ansari</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setCreateLeadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateLead}>
                    Create Lead
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
                            <div className="text-xs text-muted-foreground">{lead.id}</div>
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
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Details"
                                onClick={() => handleViewLeadDetails(lead)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit Lead"
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
                          Convert to Deal
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
                            <Button onClick={() => { setEmailData({...emailData, to: selectedLead.email, subject: `${selectedLead.firstName} ${selectedLead.lastName} (#${selectedLead.id})`}); setEmailComposerOpen(true); }}>
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
                        <p className="text-sm text-muted-foreground">{selectedLead.id}</p>
                        <div className="flex items-center justify-center gap-3 mt-3">
                          <Button size="icon" variant="outline" onClick={handleMakeCall}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => { setEmailData({...emailData, to: selectedLead.email}); setEmailComposerOpen(true); }}>
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
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
                {filteredCustomers.map((customer) => (
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
                          title="View Documents"
                          onClick={() => handleViewDocuments(customer)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Customer">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
                          <Button variant="ghost" size="icon" title="View Pipeline">
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

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Tracking Center</CardTitle>
              <CardDescription>Monitor passports, licenses, IDs, and all customer documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {customers.map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.id} • {customer.contactPerson}</p>
                      </div>
                      <Button size="sm" onClick={() => handleDocumentUpload(customer)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                      </Button>
                    </div>

                    {/* Key Document Summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Passport</p>
                        <p className="text-sm font-medium">{customer.passportNumber}</p>
                        <p className="text-xs text-muted-foreground">Exp: {customer.passportExpiry}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Emirates ID</p>
                        <p className="text-sm font-medium truncate">{customer.emiratesId}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Trade License</p>
                        <p className="text-sm font-medium">{customer.tradeLicense}</p>
                        <p className="text-xs text-muted-foreground">Exp: {customer.licenseExpiry}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">VAT Number</p>
                        <p className="text-sm font-medium">{customer.vatNumber}</p>
                      </div>
                    </div>

                    {/* Document List */}
                    <div className="space-y-2">
                      {customer.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-3">
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {doc.uploadDate} • Expires: {doc.expiryDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(doc.status)}>
                              {doc.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                                className={`h-3 w-3 ${
                                  star <= customer.satisfactionScore
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

      {/* Customer Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Complete customer profile and information</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Company Name</Label>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contact Person</Label>
                    <p className="font-medium">{selectedCustomer.contactPerson}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <p className="font-medium">{selectedCustomer.location}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Website</Label>
                    <p className="font-medium">{selectedCustomer.website}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Company Type</Label>
                    <p className="font-medium">{selectedCustomer.companyType}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Registration Date</Label>
                    <p className="font-medium">{selectedCustomer.registrationDate}</p>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Financial Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Total Value</Label>
                    <p className="text-lg font-bold">AED {selectedCustomer.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Credit Limit</Label>
                    <p className="text-lg font-bold">AED {selectedCustomer.creditLimit.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Outstanding</Label>
                    <p className="text-lg font-bold text-orange-600">AED {selectedCustomer.outstandingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Project Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedCustomer.activeContracts}</p>
                    <p className="text-sm text-muted-foreground">Active Contracts</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedCustomer.completedProjects}</p>
                    <p className="text-sm text-muted-foreground">Completed Projects</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                      <p className="text-2xl font-bold">{selectedCustomer.satisfactionScore}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Document
                </Button>
              </div>

              <div className="space-y-3">
                {selectedCustomer.documents.map((doc: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Type: {doc.type} • Uploaded: {doc.uploadDate}
                          </p>
                          <p className="text-sm text-muted-foreground">Expiry Date: {doc.expiryDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(doc.status)}>{doc.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert to Deal Dialog */}
      <Dialog open={convertToDealDialogOpen} onOpenChange={setConvertToDealDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Convert to Deal</DialogTitle>
            <DialogDescription>
              While converting you can select existing organization or contact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Organization */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <Label>Organization</Label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Choose Existing</span>
                <Switch checked={chooseExistingOrg} onCheckedChange={setChooseExistingOrg} />
              </div>
              {chooseExistingOrg ? (
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adobe">Adobe Inc</SelectItem>
                    <SelectItem value="bwh">BWH</SelectItem>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="circooles">Circooles</SelectItem>
                    <SelectItem value="figma">Figma</SelectItem>
                    <SelectItem value="havells">Havells India Ltd.</SelectItem>
                    <SelectItem value="nike">Nike</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  New organization will be created based on the data in details section
                </p>
              )}
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
                <Label>Contact</Label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Choose Existing</span>
                <Switch checked={chooseExistingContact} onCheckedChange={setChooseExistingContact} />
              </div>
              {!chooseExistingContact && (
                <p className="text-sm text-muted-foreground">
                  New contact will be created based on the person's details
                </p>
              )}
            </div>

            <Button onClick={handleConvertToDeal} className="w-full">
              Convert to deal
            </Button>
          </div>
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
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="Subject"
              />
            </div>
            <div>
              <Label>TO:</Label>
              <Input
                value={emailData.to}
                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                placeholder="recipient@email.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CC:</Label>
                <Input
                  value={emailData.cc}
                  onChange={(e) => setEmailData({...emailData, cc: e.target.value})}
                  placeholder="CC"
                />
              </div>
              <div>
                <Label>BCC:</Label>
                <Input
                  value={emailData.bcc}
                  onChange={(e) => setEmailData({...emailData, bcc: e.target.value})}
                  placeholder="BCC"
                />
              </div>
            </div>
            <div>
              <Label>Message:</Label>
              <Textarea
                value={emailData.body}
                onChange={(e) => setEmailData({...emailData, body: e.target.value})}
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
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                placeholder="Follow Up"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                placeholder="Took a call with John Doe and discussed the new project."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={taskData.status} onValueChange={(value) => setTaskData({...taskData, status: value})}>
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
                <Select value={taskData.assignedTo} onValueChange={(value) => setTaskData({...taskData, assignedTo: value})}>
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
                  onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={taskData.priority} onValueChange={(value) => setTaskData({...taskData, priority: value})}>
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
                onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                placeholder="Call with John Doe"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={noteData.content}
                onChange={(e) => setNoteData({...noteData, content: e.target.value})}
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
    </div>
  );
};

