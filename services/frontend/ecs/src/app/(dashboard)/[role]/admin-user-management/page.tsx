"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/Table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/Dialog';
import { 
  Users,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Edit,
} from 'lucide-react';
import { userService, type User } from '@/shared/lib/user-service';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Array<{id: string, department_name: string, department_code: string}>>([]);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: '',
    department: '',
    contact_number: '',
    account_status: '',
  });

  // Check if currently editing own account
  const isEditingSelf = editingUser?.id === currentUserId;

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated. Please login first.');
        return;
      }

      const fetchedUsers = await userService.getAllUsers(token);
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found for loading departments');
        return;
      }

      console.log('Fetching departments from API...');
      const response = await fetch('http://localhost:8081/api/v1/departments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Departments API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch departments:', response.status, errorText);
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      console.log('Departments data received:', data);
      setDepartments(data.departments || []);
      console.log('Departments set:', data.departments?.length || 0, 'departments');
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  useEffect(() => {
    // Load current user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
      }
    }
    loadUsers();
    loadDepartments();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      setProcessingId(userId);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated. Please login first.');
        return;
      }

      await userService.approveUser(userId, token);
      
      // Reload users to reflect the change
      await loadUsers();
      
      alert('User approved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
      console.error('Error approving user:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingId(userId);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated. Please login first.');
        return;
      }

      await userService.rejectUser(userId, token);
      
      // Reload users to reflect the change
      await loadUsers();
      
      alert('User rejected successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject user');
      console.error('Error rejecting user:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingId(userId);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated. Please login first.');
        return;
      }

      await userService.deleteUser(userId, token);
      
      // Reload users to reflect the change
      await loadUsers();
      
      alert('User deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      console.error('Error deleting user:', err);
      alert(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      role: user.role,
      department: user.department || '',
      contact_number: user.contact_number || '',
      account_status: user.account_status,
    });
    setIsEditDialogOpen(true);
    
    // Reload departments to ensure they're available in the dropdown
    loadDepartments();
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setProcessingId(editingUser.id);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated. Please login first.');
        return;
      }

      // Validate department for roles that require it
      if ((editForm.role === 'program_chair' || editForm.role === 'project_head' || editForm.role === 'staff') && !editForm.department.trim()) {
        setError('Department is required for Program Chair, Project Head, and Staff roles');
        setProcessingId(null);
        return;
      }

      const updates: any = {};
      if (editForm.first_name !== editingUser.first_name) updates.first_name = editForm.first_name;
      if (editForm.last_name !== editingUser.last_name) updates.last_name = editForm.last_name;
      if (editForm.email !== editingUser.email) updates.email = editForm.email;
      if (editForm.username !== editingUser.username) updates.username = editForm.username;
      if (editForm.role !== editingUser.role) {
        updates.role = editForm.role;
        // If changing to a role that requires department, always include department in update
        if (editForm.role === 'program_chair' || editForm.role === 'project_head' || editForm.role === 'staff') {
          updates.department = editForm.department;
        }
      }
      // Only update department if it changed AND we're not already including it from role change
      if (!updates.department && editForm.department !== (editingUser.department || '')) {
        updates.department = editForm.department || null;
      }
      if (editForm.contact_number !== (editingUser.contact_number || '')) updates.contact_number = editForm.contact_number || null;
      if (editForm.account_status !== editingUser.account_status) updates.account_status = editForm.account_status;

      await userService.updateUser(editingUser.id, updates, token);
      
      // Reload users to reflect the change
      await loadUsers();
      
      setIsEditDialogOpen(false);
      alert('User updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      console.error('Error updating user:', err);
      alert(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter users based on search, role, and status (excluding pending approvals - they have their own section)
  const filteredUsers = users.filter(user => {
    // Exclude pending approval users from the main directory
    if (user.account_status === 'pending_approval') return false;
    
    const fullName = `${user.first_name} ${user.last_name}`;
    const matchesSearch = searchTerm === '' || 
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.account_status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    // Sort by role priority: admin > program_chair > project_head > staff > public_user
    const rolePriority: Record<string, number> = {
      admin: 1,
      program_chair: 2,
      project_head: 3,
      staff: 4,
      public_user: 5,
    };
    return (rolePriority[a.role] || 999) - (rolePriority[b.role] || 999);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'suspended':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      program_chair: 'bg-blue-100 text-blue-700 border-blue-300',
      project_head: 'bg-green-100 text-green-700 border-green-300',
      staff: 'bg-orange-100 text-orange-700 border-orange-300',
      public_user: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      const lastActive = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - lastActive.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return lastActive.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Never';
    }
  };

  // All roles in priority order
  const rolePriorityOrder = ['admin', 'program_chair', 'project_head', 'staff', 'public_user'];
  const roles = rolePriorityOrder;

  // Get pending approval users (sorted by role priority)
  const pendingUsers = users
    .filter(u => u.account_status === 'pending_approval')
    .sort((a, b) => {
      const rolePriority: Record<string, number> = {
        admin: 1,
        program_chair: 2,
        project_head: 3,
        staff: 4,
        public_user: 5,
      };
      return (rolePriority[a.role] || 999) - (rolePriority[b.role] || 999);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .table-row-hover:hover {
          background-color: rgba(59, 130, 246, 0.05);
          transition: all 0.2s ease;
        }
      `}</style>

      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              User Management
            </h1>
            <p className="text-slate-600 text-lg">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={loading}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {pendingUsers.length > 0 && (
              <Badge className="bg-orange-600 text-white px-4 py-2 text-sm">
                <UserCheck className="h-4 w-4 mr-2" />
                {pendingUsers.length} Pending
              </Badge>
            )}
            <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              {users.filter(u => u.account_status === 'active').length} Active Users
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pending Approvals Card */}
        {pendingUsers.length > 0 && !loading && (
          <Card className="bg-white border-orange-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 text-2xl mb-2 flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-orange-600" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Users waiting for approval to access the system
                  </CardDescription>
                </div>
                <Badge className="bg-orange-600 text-white px-4 py-2 text-sm">
                  {pendingUsers.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-slate-700 font-semibold">User ID</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Full Name</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Email</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Username</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Role</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Department</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Contact</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Last Active</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Date Registered</TableHead>
                      <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id} className="table-row-hover border-slate-200">
                        <TableCell className="font-semibold text-slate-900 mono text-sm">
                          {user.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-xs">
                              {user.first_name[0]}{user.last_name[0]}
                            </div>
                            <span className="text-slate-900 font-medium">{user.first_name} {user.last_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleBadgeColor(user.role)} border font-medium`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {user.department || '-'}
                        </TableCell>
                        <TableCell className="text-slate-700 text-sm">
                          {user.contact_number || '-'}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {formatLastActive(user.last_active)}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(user.id)}
                              disabled={processingId === user.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(user.id)}
                              disabled={processingId === user.id}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 text-2xl mb-2">User Directory</CardTitle>
                <CardDescription className="text-slate-600">
                  Complete directory of all users - search and filter by role, status, or search term
                </CardDescription>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by ID, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[200px] bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-slate-900">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role} className="text-slate-900">
                        {role.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[200px] bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-slate-900">All Statuses</SelectItem>
                    <SelectItem value="active" className="text-slate-900">ACTIVE</SelectItem>
                    <SelectItem value="inactive" className="text-slate-900">INACTIVE</SelectItem>
                    <SelectItem value="suspended" className="text-slate-900">SUSPENDED</SelectItem>
                    <SelectItem value="rejected" className="text-slate-900">REJECTED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('all');
                    setSelectedStatus('all');
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600">Loading users...</p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of{' '}
                    <span className="font-semibold text-slate-900">{users.length - pendingUsers.length}</span> processed users
                  </p>
                </div>

                {/* User Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-slate-700 font-semibold">User ID</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Full Name</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Email</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Username</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Role</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Department</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Contact</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Last Active</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Date Joined</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                            No users found matching your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="table-row-hover border-slate-200">
                            <TableCell className="font-semibold text-slate-900 mono text-sm">
                              {user.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                                  {user.first_name[0]}{user.last_name[0]}
                                </div>
                                <span className="text-slate-900 font-medium">{user.first_name} {user.last_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700 text-sm">
                              {user.email}
                            </TableCell>
                            <TableCell className="text-slate-700 font-medium">
                              {user.username}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getRoleBadgeColor(user.role)} border font-medium`}>
                                {user.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {user.department || '-'}
                            </TableCell>
                            <TableCell className="text-slate-700 text-sm">
                              {user.contact_number || '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">
                              {formatLastActive(user.last_active)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(user.account_status)} border font-medium`}>
                                {formatStatus(user.account_status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">
                              {formatDate(user.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              {user.account_status === 'pending_approval' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(user.id)}
                                    disabled={processingId === user.id}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(user.id)}
                                    disabled={processingId === user.id}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={processingId === user.id}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                    <DropdownMenuItem 
                                      onClick={() => handleEdit(user.id)}
                                      className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                    >
                                      <Edit className="mr-2 h-4 w-4 text-blue-600" />
                                      <span>Edit User</span>
                                    </DropdownMenuItem>
                                    {(user.account_status === 'inactive' || user.account_status === 'suspended') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleApprove(user.id)}
                                        className="cursor-pointer text-slate-900 hover:bg-green-50"
                                      >
                                        <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                        <span>Approve User</span>
                                      </DropdownMenuItem>
                                    )}
                                    {(user.account_status === 'inactive' || user.account_status === 'suspended') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleReject(user.id)}
                                        className="cursor-pointer text-slate-900 hover:bg-orange-50"
                                      >
                                        <UserX className="mr-2 h-4 w-4 text-orange-600" />
                                        <span>Reject User</span>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      onClick={() => handleDelete(user.id)}
                                      className="cursor-pointer text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete User</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle className="text-2xl text-slate-900">Edit User</DialogTitle>
              <DialogDescription className="text-slate-600">
                Update user information. Fields marked with * are required.
              </DialogDescription>
              {isEditingSelf && (
                <Alert className="mt-3 border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800 text-sm">
                    ⚠️ You are editing your own account. Role and Account Status fields are disabled to prevent self-lockout.
                  </AlertDescription>
                </Alert>
              )}
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* User ID Display */}
              {editingUser && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">User ID</p>
                      <p className="text-sm font-mono text-slate-900 break-all">{editingUser.id}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(editingUser.id);
                        alert('User ID copied to clipboard!');
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    First Name *
                  </label>
                  <Input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    placeholder="First name"
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Last Name *
                  </label>
                  <Input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    placeholder="Last name"
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="email@example.com"
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Username *
                  </label>
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    placeholder="username"
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Role *
                  </label>
                  <Select 
                    value={editForm.role} 
                    onValueChange={(value) => setEditForm({...editForm, role: value})}
                    disabled={isEditingSelf}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="program_chair">Program Chair</SelectItem>
                      <SelectItem value="project_head">Project Head</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="public_user">Public User</SelectItem>
                    </SelectContent>
                  </Select>
                  {isEditingSelf && (
                    <p className="text-xs text-orange-600">Cannot change your own role</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Contact Number
                  </label>
                  <Input
                    value={editForm.contact_number}
                    onChange={(e) => setEditForm({...editForm, contact_number: e.target.value})}
                    placeholder="e.g., +63 123 456 7890"
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Department {(editForm.role === 'program_chair' || editForm.role === 'project_head' || editForm.role === 'staff') && '*'}
                </label>
                <Select 
                  value={editForm.department} 
                  onValueChange={(value) => setEditForm({...editForm, department: value})}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {departments.length === 0 ? (
                      <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.department_name}>
                          {dept.department_name} ({dept.department_code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {departments.length === 0 && (
                  <p className="text-xs text-red-600">No departments loaded. Check console for errors.</p>
                )}
                {(editForm.role === 'program_chair' || editForm.role === 'project_head' || editForm.role === 'staff') && (
                  <p className="text-xs text-slate-500">Required for Program Chair, Project Head, and Staff roles</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Account Status *
                </label>
                <Select 
                  value={editForm.account_status} 
                  onValueChange={(value) => setEditForm({...editForm, account_status: value})}
                  disabled={isEditingSelf}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Active</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="deactivated">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <span>Deactivated</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pending_approval">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span>Pending Approval</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isEditingSelf ? (
                  <p className="text-xs text-orange-600">Cannot change your own account status</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    {editForm.account_status === 'active' && 'User can access the system'}
                    {editForm.account_status === 'deactivated' && 'User cannot access the system'}
                    {editForm.account_status === 'pending_approval' && 'User awaiting admin approval'}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={processingId === editingUser?.id}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {processingId === editingUser?.id ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}