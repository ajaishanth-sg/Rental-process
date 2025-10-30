import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, TrendingUp, DollarSign, Package, Users, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const reportTypes = [
  { id: '1', title: 'Revenue Report', description: 'Monthly and yearly revenue analysis by customer/project', icon: DollarSign },
  { id: '2', title: 'Equipment Utilization', description: 'Equipment usage rates and efficiency metrics', icon: Package },
  { id: '3', title: 'Customer Analytics', description: 'Customer behavior and rental trends', icon: Users },
  { id: '4', title: 'Rental Contracts', description: 'Active and completed contracts overview', icon: FileText },
  { id: '5', title: 'Performance Dashboard', description: 'Overall business performance metrics', icon: TrendingUp },
  { id: '6', title: 'Document Expiry', description: 'Employee documents and contract expiry reminders', icon: AlertTriangle },
];

const expiryAlerts = [
  { id: '1', type: 'Employee Passport', name: 'John Smith', expiryDate: '2025-02-15', daysLeft: 25, status: 'warning' },
  { id: '2', type: 'Employee Visa', name: 'Sarah Johnson', expiryDate: '2025-01-30', daysLeft: 10, status: 'critical' },
  { id: '3', type: 'Trade License', name: 'ABC Construction LLC', expiryDate: '2025-03-20', daysLeft: 59, status: 'normal' },
  { id: '4', type: 'Contract Renewal', name: 'RC-2025-001', expiryDate: '2025-03-10', daysLeft: 49, status: 'normal' },
];

export const ReportsModule = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reports');

  const handleGenerateReport = (title: string) => {
    toast({
      title: 'Report Generated',
      description: `${title} has been generated successfully.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      normal: 'default',
      warning: 'secondary',
      critical: 'destructive',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Reports & Analytics</h3>
        <p className="text-sm text-muted-foreground">Generate reports, track utilization, and monitor document expiry alerts</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Reports Generated</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Expiry Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{expiryAlerts.filter(a => a.status === 'warning' || a.status === 'critical').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Scheduled Reports</p>
              <p className="text-2xl font-bold">6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'reports'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Report Generation
        </button>
        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'expiry'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Document Expiry Alerts
        </button>
      </div>

      {activeTab === 'reports' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Quick Report Generation</CardTitle>
              <CardDescription>Select date range and report type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue by Customer/Project</SelectItem>
                      <SelectItem value="equipment">Equipment Utilization Rate</SelectItem>
                      <SelectItem value="contracts">Contract Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Period</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Generate & Download Report
                </Button>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <report.icon className="h-8 w-8 text-primary" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReport(report.title)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">{report.title}</h4>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'expiry' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Expiry Alerts</CardTitle>
              <CardDescription>Monitor employee documents, licenses, and contract renewals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Name/Reference</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiryAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.type}</TableCell>
                        <TableCell>{alert.name}</TableCell>
                        <TableCell className={alert.daysLeft <= 30 ? 'text-red-600 font-medium' : ''}>
                          {alert.expiryDate}
                        </TableCell>
                        <TableCell className={alert.daysLeft <= 30 ? 'text-red-600 font-medium' : ''}>
                          {alert.daysLeft} days
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(alert.status)}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Notify
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
