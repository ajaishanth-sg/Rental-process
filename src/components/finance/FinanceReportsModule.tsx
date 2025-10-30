import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, TrendingDown, DollarSign, FileText, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const FinanceReportsModule = () => {
  const { toast } = useToast();

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading ${reportType} report...`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Financial Reports</h3>
        <p className="text-sm text-muted-foreground">Comprehensive financial analytics and reporting</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,430</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +23%
              </span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Payments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,920</div>
            <p className="text-xs text-muted-foreground mt-1">Across 7 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit Margin
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Average this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash Flow
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$89,245</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </span> positive flow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
          <CardDescription>Monthly revenue breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Rental Revenue</TableHead>
                <TableHead>Equipment Sales</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { month: 'October 2025', rental: 89500, sales: 12500, services: 28430, total: 130430, growth: '+23%' },
                { month: 'September 2025', rental: 72800, sales: 15200, services: 22340, total: 110340, growth: '+18%' },
                { month: 'August 2025', rental: 61200, sales: 18900, services: 19850, total: 99950, growth: '+15%' },
                { month: 'July 2025', rental: 53400, sales: 22100, services: 17230, total: 92730, growth: '+12%' },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell>${row.rental.toLocaleString()}</TableCell>
                  <TableCell>${row.sales.toLocaleString()}</TableCell>
                  <TableCell>${row.services.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">${row.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="text-success">
                      {row.growth}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Profitability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Profitability</CardTitle>
          <CardDescription>Revenue vs cost analysis for active contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 'RC-2025-001', customer: 'ABC Construction LLC', revenue: 12500, cost: 8200, profit: 4300, margin: 34.4, status: 'active' },
                { id: 'RC-2025-002', customer: 'XYZ Builders', revenue: 8900, cost: 5800, profit: 3100, margin: 34.8, status: 'active' },
                { id: 'RC-2025-003', customer: 'Elite Construction', revenue: 15200, cost: 9800, profit: 5400, margin: 35.5, status: 'active' },
                { id: 'RC-2025-004', customer: 'Modern Builders', revenue: 6750, cost: 4500, profit: 2250, margin: 33.3, status: 'completed' },
              ].map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell>{contract.customer}</TableCell>
                  <TableCell>${contract.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">${contract.cost.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold text-success">${contract.profit.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold text-success">{contract.margin}%</TableCell>
                  <TableCell>
                    <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Download detailed financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownloadReport('Monthly Financial Statement')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Monthly Statement</CardTitle>
                <CardDescription>Complete financial overview</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownloadReport('VAT Reports')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">VAT Reports</CardTitle>
                <CardDescription>VAT calculations and summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownloadReport('Revenue, Profit & Cost Center Summary')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Revenue & Profit Summary</CardTitle>
                <CardDescription>Revenue, profit, and cost center analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownloadReport('Customer Payment History')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment History</CardTitle>
                <CardDescription>Customer payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownloadReport('Deposit & Penalty Report')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deposit & Penalty Report</CardTitle>
                <CardDescription>Deposit tracking and penalty summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDownloadReport('Vendor Cost Analysis')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vendor Cost Analysis</CardTitle>
                <CardDescription>Vendor costs and margin comparisons</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Trends</CardTitle>
          <CardDescription>Monthly cash flow analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Cash flow chart will be displayed here</p>
              <p className="text-sm text-muted-foreground mt-1">Interactive charts coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};