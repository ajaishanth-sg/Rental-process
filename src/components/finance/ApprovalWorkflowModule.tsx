import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, MessageSquare, Clock, User } from 'lucide-react';

const approvalItemsData = [
  { id: 'APR-2025-001', type: 'invoice', referenceId: 'INV-2025-001', description: 'Invoice approval for ABC Construction LLC', amount: 12500, submittedBy: 'John Doe', submittedDate: '2025-01-15', status: 'pending', approver: 'Jane Smith' },
  { id: 'APR-2025-002', type: 'penalty', referenceId: 'PEN-2025-001', description: 'Penalty approval for late return', amount: 500, submittedBy: 'Mike Johnson', submittedDate: '2025-02-15', status: 'approved', approver: 'Jane Smith' },
  { id: 'APR-2025-003', type: 'deposit_refund', referenceId: 'DEP-2025-004', description: 'Deposit refund for Modern Builders', amount: 4500, submittedBy: 'Sarah Wilson', submittedDate: '2025-03-01', status: 'rejected', approver: 'Jane Smith' },
  { id: 'APR-2025-004', type: 'invoice', referenceId: 'INV-2025-003', description: 'Invoice approval for Elite Construction', amount: 15200, submittedBy: 'John Doe', submittedDate: '2025-01-20', status: 'pending', approver: 'Jane Smith' },
];

export const ApprovalWorkflowModule = () => {
  const [approvalItems, setApprovalItems] = useState(approvalItemsData);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    setApprovalItems(approvalItems.map(item =>
      item.id === id ? { ...item, status: 'approved', approver: 'Jane Smith' } : item
    ));
    toast({
      title: 'Approved',
      description: `Item ${id} has been approved.`,
    });
  };

  const handleReject = (id: string) => {
    setSelectedItem(approvalItems.find(item => item.id === id));
    setCommentDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (selectedItem) {
      setApprovalItems(approvalItems.map(item =>
        item.id === selectedItem.id ? { ...item, status: 'rejected', approver: 'Jane Smith', comment } : item
      ));
      toast({
        title: 'Rejected',
        description: `Item ${selectedItem.id} has been rejected.`,
      });
      setCommentDialogOpen(false);
      setSelectedItem(null);
      setComment('');
    }
  };

  const handleComment = (id: string) => {
    setSelectedItem(approvalItems.find(item => item.id === id));
    setCommentDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary',
    };
    return variants[status] || 'outline';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return '📄';
      case 'penalty': return '⚠️';
      case 'deposit_refund': return '💰';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Approval Workflow</h3>
          <p className="text-sm text-muted-foreground">Review and approve financial transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {approvalItems.filter(item => item.status === 'pending').length}
              </p>
              <p className="text-sm text-blue-600">Pending Approvals</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {approvalItems.filter(item => item.status === 'approved').length}
              </p>
              <p className="text-sm text-green-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-600">
                {approvalItems.filter(item => item.status === 'rejected').length}
              </p>
              <p className="text-sm text-red-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.status === 'pending' ? 'Add Comment' : 'Reject with Comment'}</DialogTitle>
            <DialogDescription>
              {selectedItem?.status === 'pending'
                ? 'Add a comment to this approval item'
                : 'Provide a reason for rejection'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Item Details</Label>
                <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                <p className="text-sm text-muted-foreground">Amount: AED {selectedItem.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={selectedItem.status === 'pending' ? 'Add your comment...' : 'Reason for rejection...'}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                <Button
                  type="button"
                  variant={selectedItem.status === 'pending' ? 'default' : 'destructive'}
                  onClick={selectedItem.status === 'pending' ? () => {
                    // Just add comment for pending items
                    setCommentDialogOpen(false);
                    setSelectedItem(null);
                    setComment('');
                  } : handleRejectSubmit}
                >
                  {selectedItem.status === 'pending' ? 'Add Comment' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvalItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <span className="capitalize">{item.type.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.referenceId}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="font-semibold">AED {item.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {item.submittedBy}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{item.submittedDate}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {item.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleApprove(item.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(item.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleComment(item.id)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {item.status !== 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => handleComment(item.id)}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};