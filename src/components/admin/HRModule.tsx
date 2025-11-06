import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, FileText, ClipboardList, Calendar, Wallet, Briefcase, Plus, Loader2 } from 'lucide-react';

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  join_date?: string;
  status?: 'active' | 'inactive';
};

export const HRModule = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      employee_id: 'EMP001',
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+971 50 123 4567',
      department: 'Sales',
      designation: 'Senior Sales Executive',
      join_date: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      employee_id: 'EMP002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+971 50 234 5678',
      department: 'Finance',
      designation: 'Finance Analyst',
      join_date: '2023-03-20',
      status: 'active'
    },
    {
      id: '3',
      employee_id: 'EMP003',
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      phone: '+971 50 345 6789',
      department: 'Warehouse',
      designation: 'Warehouse Supervisor',
      join_date: '2022-11-10',
      status: 'active'
    },
    {
      id: '4',
      employee_id: 'EMP004',
      name: 'Emma Wilson',
      email: 'emma.wilson@company.com',
      phone: '+971 50 456 7890',
      department: 'HR',
      designation: 'HR Manager',
      join_date: '2022-08-05',
      status: 'active'
    },
    {
      id: '5',
      employee_id: 'EMP005',
      name: 'David Brown',
      email: 'david.brown@company.com',
      phone: '+971 50 567 8901',
      department: 'Operations',
      designation: 'Operations Manager',
      join_date: '2023-06-12',
      status: 'active'
    },
    {
      id: '6',
      employee_id: 'EMP006',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      phone: '+971 50 678 9012',
      department: 'Sales',
      designation: 'Sales Representative',
      join_date: '2024-01-08',
      status: 'active'
    },
    {
      id: '7',
      employee_id: 'EMP007',
      name: 'Robert Taylor',
      email: 'robert.taylor@company.com',
      phone: '+971 50 789 0123',
      department: 'Warehouse',
      designation: 'Warehouse Assistant',
      join_date: '2024-02-15',
      status: 'active'
    },
    {
      id: '8',
      employee_id: 'EMP008',
      name: 'Maria Garcia',
      email: 'maria.garcia@company.com',
      phone: '+971 50 890 1234',
      department: 'Finance',
      designation: 'Accounts Payable Clerk',
      join_date: '2023-09-22',
      status: 'active'
    },
    {
      id: '9',
      employee_id: 'EMP009',
      name: 'Ahmed Al Mansoori',
      email: 'ahmed.mansoori@company.com',
      phone: '+971 50 901 2345',
      department: 'Sales',
      designation: 'Sales Manager',
      join_date: '2022-05-10',
      status: 'active'
    },
    {
      id: '10',
      employee_id: 'EMP010',
      name: 'Fatima Al Zaabi',
      email: 'fatima.zaabi@company.com',
      phone: '+971 50 012 3456',
      department: 'Finance',
      designation: 'Senior Accountant',
      join_date: '2023-02-18',
      status: 'active'
    },
    {
      id: '11',
      employee_id: 'EMP011',
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      phone: '+971 50 123 7890',
      department: 'Warehouse',
      designation: 'Logistics Coordinator',
      join_date: '2023-07-25',
      status: 'active'
    },
    {
      id: '12',
      employee_id: 'EMP012',
      name: 'Sofia Martinez',
      email: 'sofia.martinez@company.com',
      phone: '+971 50 234 8901',
      department: 'HR',
      designation: 'HR Assistant',
      join_date: '2024-03-01',
      status: 'active'
    },
    {
      id: '13',
      employee_id: 'EMP013',
      name: 'Mohammed Al Shamsi',
      email: 'mohammed.shamsi@company.com',
      phone: '+971 50 345 9012',
      department: 'Sales',
      designation: 'Sales Coordinator',
      join_date: '2023-11-14',
      status: 'active'
    },
    {
      id: '14',
      employee_id: 'EMP014',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@company.com',
      phone: '+971 50 456 0123',
      department: 'Finance',
      designation: 'Finance Manager',
      join_date: '2022-09-30',
      status: 'active'
    },
    {
      id: '15',
      employee_id: 'EMP015',
      name: 'Khalid Al Qasimi',
      email: 'khalid.qasimi@company.com',
      phone: '+971 50 567 1234',
      department: 'Warehouse',
      designation: 'Warehouse Manager',
      join_date: '2022-12-05',
      status: 'active'
    },
    {
      id: '16',
      employee_id: 'EMP016',
      name: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      phone: '+971 50 678 2345',
      department: 'Operations',
      designation: 'Operations Coordinator',
      join_date: '2023-04-22',
      status: 'active'
    },
    {
      id: '17',
      employee_id: 'EMP017',
      name: 'Omar Al Falahi',
      email: 'omar.falahi@company.com',
      phone: '+971 50 789 3456',
      department: 'Sales',
      designation: 'Sales Executive',
      join_date: '2024-01-20',
      status: 'active'
    },
    {
      id: '18',
      employee_id: 'EMP018',
      name: 'Rachel Thompson',
      email: 'rachel.thompson@company.com',
      phone: '+971 50 890 4567',
      department: 'Finance',
      designation: 'Accounts Receivable Clerk',
      join_date: '2023-08-10',
      status: 'active'
    },
    {
      id: '19',
      employee_id: 'EMP019',
      name: 'Hassan Al Mazrouei',
      email: 'hassan.mazrouei@company.com',
      phone: '+971 50 901 5678',
      department: 'Warehouse',
      designation: 'Inventory Specialist',
      join_date: '2023-10-05',
      status: 'active'
    },
    {
      id: '20',
      employee_id: 'EMP020',
      name: 'Noor Al Dhaheri',
      email: 'noor.dhaheri@company.com',
      phone: '+971 50 012 6789',
      department: 'HR',
      designation: 'HR Coordinator',
      join_date: '2023-05-15',
      status: 'active'
    },
    {
      id: '21',
      employee_id: 'EMP021',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      phone: '+971 50 123 7890',
      department: 'Operations',
      designation: 'Dispatch Coordinator',
      join_date: '2023-09-12',
      status: 'active'
    },
    {
      id: '22',
      employee_id: 'EMP022',
      name: 'Aisha Al Nuaimi',
      email: 'aisha.nuaimi@company.com',
      phone: '+971 50 234 8901',
      department: 'Sales',
      designation: 'Customer Service Representative',
      join_date: '2024-02-28',
      status: 'active'
    },
    {
      id: '23',
      employee_id: 'EMP023',
      name: 'Tom Anderson',
      email: 'tom.anderson@company.com',
      phone: '+971 50 345 9012',
      department: 'Finance',
      designation: 'Financial Controller',
      join_date: '2022-07-18',
      status: 'active'
    },
    {
      id: '24',
      employee_id: 'EMP024',
      name: 'Layla Al Suwaidi',
      email: 'layla.suwaidi@company.com',
      phone: '+971 50 456 0123',
      department: 'Warehouse',
      designation: 'Quality Control Inspector',
      join_date: '2023-12-08',
      status: 'active'
    },
    {
      id: '25',
      employee_id: 'EMP025',
      name: 'Ryan O\'Connor',
      email: 'ryan.oconnor@company.com',
      phone: '+971 50 567 1234',
      department: 'Operations',
      designation: 'Fleet Manager',
      join_date: '2023-03-25',
      status: 'active'
    },
    {
      id: '26',
      employee_id: 'EMP026',
      name: 'Salma Al Hosani',
      email: 'salma.hosani@company.com',
      phone: '+971 50 678 2345',
      department: 'HR',
      designation: 'Talent Acquisition Specialist',
      join_date: '2023-11-30',
      status: 'active'
    },
    {
      id: '27',
      employee_id: 'EMP027',
      name: 'Daniel Kim',
      email: 'daniel.kim@company.com',
      phone: '+971 50 789 3456',
      department: 'Sales',
      designation: 'Business Development Manager',
      join_date: '2022-10-15',
      status: 'active'
    },
    {
      id: '28',
      employee_id: 'EMP028',
      name: 'Amira Al Kaabi',
      email: 'amira.kaabi@company.com',
      phone: '+971 50 890 4567',
      department: 'Finance',
      designation: 'Payroll Specialist',
      join_date: '2023-06-20',
      status: 'active'
    },
    {
      id: '29',
      employee_id: 'EMP029',
      name: 'Chris Mitchell',
      email: 'chris.mitchell@company.com',
      phone: '+971 50 901 5678',
      department: 'Warehouse',
      designation: 'Maintenance Technician',
      join_date: '2024-01-12',
      status: 'active'
    },
    {
      id: '30',
      employee_id: 'EMP030',
      name: 'Yasmin Al Remeithi',
      email: 'yasmin.remeithi@company.com',
      phone: '+971 50 012 6789',
      department: 'Operations',
      designation: 'Project Coordinator',
      join_date: '2023-08-28',
      status: 'active'
    },
    {
      id: '31',
      employee_id: 'EMP031',
      name: 'Kevin Patel',
      email: 'kevin.patel@company.com',
      phone: '+971 50 123 7890',
      department: 'Sales',
      designation: 'Sales Support Specialist',
      join_date: '2024-03-10',
      status: 'active'
    },
    {
      id: '32',
      employee_id: 'EMP032',
      name: 'Maya Al Ali',
      email: 'maya.ali@company.com',
      phone: '+971 50 234 8901',
      department: 'Finance',
      designation: 'Billing Coordinator',
      join_date: '2023-07-15',
      status: 'active'
    },
    {
      id: '33',
      employee_id: 'EMP033',
      name: 'Peter Singh',
      email: 'peter.singh@company.com',
      phone: '+971 50 345 9012',
      department: 'Warehouse',
      designation: 'Stock Clerk',
      join_date: '2024-02-05',
      status: 'active'
    },
    {
      id: '34',
      employee_id: 'EMP034',
      name: 'Hala Al Marri',
      email: 'hala.marri@company.com',
      phone: '+971 50 456 0123',
      department: 'HR',
      designation: 'Training & Development Officer',
      join_date: '2023-10-22',
      status: 'active'
    },
    {
      id: '35',
      employee_id: 'EMP035',
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@company.com',
      phone: '+971 50 567 1234',
      department: 'Operations',
      designation: 'Safety Officer',
      join_date: '2023-04-08',
      status: 'active'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    join_date: '',
  });

  const [addLeaveDialogOpen, setAddLeaveDialogOpen] = useState(false);
  const [addingLeave, setAddingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/api/hr/employees', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data || []);
      } else {
        setEmployees([]);
      }
    } catch (e) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    if (!form.name || !form.email) {
      toast({ title: 'Validation', description: 'Name and email are required', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/api/hr/employees', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to create employee' }));
        throw new Error(err.detail || 'Failed to create employee');
      }
      toast({ title: 'Employee Added', description: `${form.name} created successfully` });
      setCreateDialogOpen(false);
      setForm({ name: '', email: '', phone: '', department: '', designation: '', join_date: '' });
      await fetchEmployees();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to create employee', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Human Resources</h3>
          <p className="text-sm text-muted-foreground">Manage people operations (employees, attendance, leave, payroll, recruitment)</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="employees"><Users className="h-4 w-4 mr-2" />Employees</TabsTrigger>
          <TabsTrigger value="attendance"><Calendar className="h-4 w-4 mr-2" />Attendance</TabsTrigger>
          <TabsTrigger value="leave"><ClipboardList className="h-4 w-4 mr-2" />Leave</TabsTrigger>
          <TabsTrigger value="payroll"><Wallet className="h-4 w-4 mr-2" />Payroll</TabsTrigger>
          <TabsTrigger value="recruitment"><Briefcase className="h-4 w-4 mr-2" />Recruitment</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-2" />Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total Employees: {employees.length}</div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add Employee</DialogTitle>
                  <DialogDescription>Capture basic employee information</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+971 5x xxx xxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Sales / Warehouse / Finance" />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Job title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Joining Date</Label>
                    <Input type="date" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateEmployee} disabled={creating}>{creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Directory of staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                  ) : employees.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No employees found</TableCell></TableRow>
                  ) : employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.employee_id || emp.id}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell className="text-sm">{emp.email}</TableCell>
                      <TableCell className="text-sm">{emp.department || '-'}</TableCell>
                      <TableCell className="text-sm">{emp.designation || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>{emp.status || 'active'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Basic overview of daily check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Present Today</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">On Leave</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Late Arrivals</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Absent</p>
                        <p className="text-2xl font-bold">1</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: 'John Smith', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9.0' },
                      { name: 'Sarah Johnson', checkIn: '09:15 AM', checkOut: '06:00 PM', status: 'Late', hours: '8.75' },
                      { name: 'Mike Davis', checkIn: '09:00 AM', checkOut: '05:30 PM', status: 'Present', hours: '8.5' },
                      { name: 'Emma Wilson', checkIn: '-', checkOut: '-', status: 'Absent', hours: '0.0' },
                      { name: 'David Brown', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9.0' },
                    ].map((record, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>
                          <Badge variant={
                            record.status === 'Present' ? 'default' :
                              record.status === 'Late' ? 'secondary' :
                                'destructive'
                          }>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.hours}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leave Management</CardTitle>
                  <CardDescription>Track leave requests and approvals</CardDescription>
                </div>
                <Dialog open={addLeaveDialogOpen} onOpenChange={setAddLeaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Add Leave</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Add Leave Request</DialogTitle>
                      <DialogDescription>Create a new leave request for an employee</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Employee *</Label>
                        <select
                          value={leaveForm.employee_id}
                          onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Employee</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.employee_id || emp.id}>
                              {emp.name} ({emp.employee_id || emp.id})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Leave Type *</Label>
                        <select
                          value={leaveForm.leave_type}
                          onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Leave Type</option>
                          <option value="Annual Leave">Annual Leave</option>
                          <option value="Sick Leave">Sick Leave</option>
                          <option value="Maternity Leave">Maternity Leave</option>
                          <option value="Paternity Leave">Paternity Leave</option>
                          <option value="Emergency Leave">Emergency Leave</option>
                          <option value="Unpaid Leave">Unpaid Leave</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>From Date *</Label>
                          <Input
                            type="date"
                            value={leaveForm.from_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, from_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>To Date *</Label>
                          <Input
                            type="date"
                            value={leaveForm.to_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, to_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Reason</Label>
                        <textarea
                          value={leaveForm.reason}
                          onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                          placeholder="Enter reason for leave..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setAddLeaveDialogOpen(false)}>Cancel</Button>
                      <Button
                        onClick={async () => {
                          if (!leaveForm.employee_id || !leaveForm.leave_type || !leaveForm.from_date || !leaveForm.to_date) {
                            toast({
                              title: 'Validation',
                              description: 'Please fill all required fields',
                              variant: 'destructive',
                            });
                            return;
                          }
                          try {
                            setAddingLeave(true);
                            const token = localStorage.getItem('auth_token');
                            const res = await fetch('http://localhost:8000/api/hr/leave', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(leaveForm),
                            });
                            if (!res.ok) {
                              const err = await res.json().catch(() => ({ detail: 'Failed to create leave request' }));
                              throw new Error(err.detail || 'Failed to create leave request');
                            }
                            toast({
                              title: 'Leave Added',
                              description: 'Leave request created successfully',
                            });
                            setAddLeaveDialogOpen(false);
                            setLeaveForm({
                              employee_id: '',
                              leave_type: '',
                              from_date: '',
                              to_date: '',
                              reason: '',
                            });
                          } catch (e: any) {
                            toast({
                              title: 'Error',
                              description: e.message || 'Failed to create leave request',
                              variant: 'destructive',
                            });
                          } finally {
                            setAddingLeave(false);
                          }
                        }}
                        disabled={addingLeave}
                      >
                        {addingLeave ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Pending Requests</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Approved This Month</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Annual Leave Balance</p>
                        <p className="text-2xl font-bold">28</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Sick Leave Used</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>From Date</TableHead>
                      <TableHead>To Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { employee: 'John Smith', type: 'Annual Leave', from: '2025-01-15', to: '2025-01-20', days: 6, status: 'Approved' },
                      { employee: 'Sarah Johnson', type: 'Sick Leave', from: '2025-01-18', to: '2025-01-18', days: 1, status: 'Approved' },
                      { employee: 'Mike Davis', type: 'Annual Leave', from: '2025-02-01', to: '2025-02-05', days: 5, status: 'Pending' },
                      { employee: 'Emma Wilson', type: 'Maternity Leave', from: '2025-03-01', to: '2025-05-31', days: 92, status: 'Approved' },
                      { employee: 'David Brown', type: 'Annual Leave', from: '2025-01-25', to: '2025-01-27', days: 3, status: 'Pending' },
                    ].map((leave, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{leave.employee}</TableCell>
                        <TableCell>{leave.type}</TableCell>
                        <TableCell>{leave.from}</TableCell>
                        <TableCell>{leave.to}</TableCell>
                        <TableCell>{leave.days}</TableCell>
                        <TableCell>
                          <Badge variant={
                            leave.status === 'Approved' ? 'default' :
                              leave.status === 'Pending' ? 'secondary' :
                                'destructive'
                          }>
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {leave.status === 'Pending' && (
                              <>
                                <Button size="sm" variant="outline">Approve</Button>
                                <Button size="sm" variant="outline">Reject</Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll</CardTitle>
              <CardDescription>Run payroll and view payslips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Total Payroll</p>
                        <p className="text-2xl font-bold">AED 125,000</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Employees Paid</p>
                        <p className="text-2xl font-bold">28</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Pending Payslips</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Deductions</p>
                        <p className="text-2xl font-bold">AED 8,500</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { employee: 'John Smith', basic: 8000, allowances: 1200, deductions: 400, net: 8800, status: 'Paid' },
                      { employee: 'Sarah Johnson', basic: 7500, allowances: 1000, deductions: 375, net: 8125, status: 'Paid' },
                      { employee: 'Mike Davis', basic: 7000, allowances: 900, deductions: 350, net: 7550, status: 'Paid' },
                      { employee: 'Emma Wilson', basic: 6500, allowances: 800, deductions: 325, net: 6975, status: 'Pending' },
                      { employee: 'David Brown', basic: 7200, allowances: 950, deductions: 360, net: 7790, status: 'Paid' },
                    ].map((payroll, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{payroll.employee}</TableCell>
                        <TableCell>AED {payroll.basic.toLocaleString()}</TableCell>
                        <TableCell>AED {payroll.allowances.toLocaleString()}</TableCell>
                        <TableCell>AED {payroll.deductions.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">AED {payroll.net.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={payroll.status === 'Paid' ? 'default' : 'secondary'}>
                            {payroll.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">View Payslip</Button>
                            {payroll.status === 'Pending' && (
                              <Button size="sm" variant="default">Process Payment</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex gap-2">
                  <Button variant="outline">Generate Payslips</Button>
                  <Button variant="default">Run Payroll</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruitment">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment</CardTitle>
              <CardDescription>Track applicants and job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Open Positions</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Total Applicants</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Interviews Scheduled</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Offers Extended</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Applicants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { position: 'Senior Sales Executive', department: 'Sales', applicants: 12, status: 'Interviewing', posted: '2025-01-10' },
                      { position: 'Warehouse Supervisor', department: 'Warehouse', applicants: 8, status: 'Shortlisting', posted: '2025-01-15' },
                      { position: 'Finance Analyst', department: 'Finance', applicants: 4, status: 'Open', posted: '2025-01-20' },
                    ].map((job, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{job.position}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>{job.applicants}</TableCell>
                        <TableCell>
                          <Badge variant={
                            job.status === 'Open' ? 'default' :
                              job.status === 'Interviewing' ? 'secondary' :
                                'outline'
                          }>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.posted}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">View Applicants</Button>
                            <Button size="sm" variant="outline">Edit Job</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex gap-2">
                  <Button variant="outline">Post New Job</Button>
                  <Button variant="default">View All Applications</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>HR Documents</CardTitle>
              <CardDescription>Contracts, IDs, and certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total Documents</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Employment Contracts</p>
                        <p className="text-2xl font-bold">28</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">ID Documents</p>
                        <p className="text-2xl font-bold">84</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Certificates</p>
                        <p className="text-2xl font-bold">44</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { employee: 'John Smith', type: 'Employment Contract', name: 'Contract_2025.pdf', date: '2025-01-15', status: 'Verified' },
                      { employee: 'Sarah Johnson', type: 'ID Document', name: 'Emirates_ID.pdf', date: '2025-01-10', status: 'Verified' },
                      { employee: 'Mike Davis', type: 'Certificate', name: 'Safety_Cert.pdf', date: '2025-01-08', status: 'Pending' },
                      { employee: 'Emma Wilson', type: 'Employment Contract', name: 'Contract_2025.pdf', date: '2025-01-12', status: 'Verified' },
                      { employee: 'David Brown', type: 'ID Document', name: 'Passport.pdf', date: '2025-01-09', status: 'Verified' },
                    ].map((doc, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{doc.employee}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>
                          <Badge variant={doc.status === 'Verified' ? 'default' : 'secondary'}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">View</Button>
                            <Button size="sm" variant="outline">Download</Button>
                            {doc.status === 'Pending' && (
                              <Button size="sm" variant="default">Verify</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex gap-2">
                  <Button variant="outline">Upload Document</Button>
                  <Button variant="default">Generate Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRModule;


