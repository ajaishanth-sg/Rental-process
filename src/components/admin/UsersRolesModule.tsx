import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react';

const usersData = [
  { id: '1', email: 'admin@almakinauae.com', fullName: 'System Admin', role: 'admin', status: 'active', lastLogin: '2024-01-20 10:30', permissions: ['read', 'write', 'approve', 'delete'], approvalStatus: 'approved' },
  { id: '2', email: 'sales@almakinauae.com', fullName: 'Sales Manager', role: 'sales', status: 'active', lastLogin: '2024-01-20 09:15', permissions: ['read', 'write'], approvalStatus: 'approved' },
  { id: '3', email: 'warehouse@almakinauae.com', fullName: 'Warehouse Manager', role: 'warehouse', status: 'active', lastLogin: '2024-01-19 16:45', permissions: ['read', 'write', 'approve'], approvalStatus: 'approved' },
  { id: '4', email: 'finance@almakinauae.com', fullName: 'Finance Manager', role: 'finance', status: 'active', lastLogin: '2024-01-20 08:00', permissions: ['read', 'write', 'approve'], approvalStatus: 'approved' },
];

export const UsersRolesModule = () => {
  const [users, setUsers] = useState(usersData);
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '', fullName: '', role: '', password: ''
  });
  const [permissionsForm, setPermissionsForm] = useState({
    read: false, write: false, approve: false, delete: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'User Added',
      description: `${formData.fullName} has been added with ${formData.role} role.`,
    });
    setOpen(false);
    setFormData({ email: '', fullName: '', role: '', password: '' });
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    toast({
      title: 'User Updated',
      description: `${editingUser.fullName} has been updated successfully.`,
    });
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string, name: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast({
      title: 'User Deleted',
      description: `${name} has been removed.`,
    });
  };

  const handleAssignPermissions = (user: any) => {
    setSelectedUser(user);
    setPermissionsForm({
      read: user.permissions.includes('read'),
      write: user.permissions.includes('write'),
      approve: user.permissions.includes('approve'),
      delete: user.permissions.includes('delete')
    });
    setPermissionsDialogOpen(true);
  };

  const handlePermissionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPermissions = Object.keys(permissionsForm).filter(key => permissionsForm[key as keyof typeof permissionsForm]);
    const updatedUser = { ...selectedUser, permissions: newPermissions };
    setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
    toast({
      title: 'Permissions Updated',
      description: `Permissions for ${selectedUser.fullName} have been updated.`,
    });
    setPermissionsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleApproveUser = (user: any) => {
    const updatedUser = { ...user, approvalStatus: 'approved' };
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    toast({
      title: 'User Approved',
      description: `${user.fullName} has been approved.`,
    });
  };

  const handleRejectUser = (user: any) => {
    const updatedUser = { ...user, approvalStatus: 'rejected' };
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    toast({
      title: 'User Rejected',
      description: `${user.fullName} has been rejected.`,
    });
  };

  const handleDeactivate = (user: any) => {
    const updatedUser = { ...user, status: 'inactive' };
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    toast({
      title: 'User Deactivated',
      description: `${user.fullName} has been deactivated.`,
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      admin: 'default',
      sales: 'secondary',
      warehouse: 'secondary',
      finance: 'secondary',
    };
    return variants[role] || 'outline';
  };

  const getApprovalBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      approved: 'default',
      pending: 'outline',
      rejected: 'destructive',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <div>
           <h3 className="text-lg font-semibold">Users & Roles</h3>
           <p className="text-sm text-muted-foreground">Manage user accounts, roles, permissions, and access control</p>
         </div>
         <div className="flex gap-2">
           <Dialog open={open} onOpenChange={setOpen}>
             <DialogTrigger asChild>
               <Button>
                 <Plus className="mr-2 h-4 w-4" />
                 Add User
               </Button>
             </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with assigned role</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user details and role</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Full Name</Label>
                  <Input id="edit-fullName" value={editingUser.fullName} onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editingUser.role} onValueChange={(val) => setEditingUser({ ...editingUser, role: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Update User</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Permissions</DialogTitle>
              <DialogDescription>Configure access permissions for {selectedUser?.fullName}</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handlePermissionsSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="read"
                      checked={permissionsForm.read}
                      onCheckedChange={(checked) => setPermissionsForm({ ...permissionsForm, read: checked as boolean })}
                    />
                    <Label htmlFor="read">Read Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="write"
                      checked={permissionsForm.write}
                      onCheckedChange={(checked) => setPermissionsForm({ ...permissionsForm, write: checked as boolean })}
                    />
                    <Label htmlFor="write">Write Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approve"
                      checked={permissionsForm.approve}
                      onCheckedChange={(checked) => setPermissionsForm({ ...permissionsForm, approve: checked as boolean })}
                    />
                    <Label htmlFor="approve">Approval Rights</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="delete"
                      checked={permissionsForm.delete}
                      onCheckedChange={(checked) => setPermissionsForm({ ...permissionsForm, delete: checked as boolean })}
                    />
                    <Label htmlFor="delete">Delete Access</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setPermissionsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Update Permissions</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Approval Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((perm: string) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getApprovalBadgeVariant(user.approvalStatus)}>
                    {user.approvalStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" title="Edit User" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Assign Permissions" onClick={() => handleAssignPermissions(user)}>
                      <Shield className="h-4 w-4" />
                    </Button>
                    {user.approvalStatus === 'pending' && (
                      <>
                        <Button variant="ghost" size="icon" title="Approve User" onClick={() => handleApproveUser(user)}>
                          <UserCheck className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Reject User" onClick={() => handleRejectUser(user)}>
                          <UserX className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" title="Deactivate User" onClick={() => handleDeactivate(user)}>
                      <UserX className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete User" onClick={() => handleDelete(user.id, user.fullName)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
