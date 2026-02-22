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

  useEffect(() => {
    loadUsers();
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
    // TODO: Implement edit user functionality
    console.log('Edit user:', userId);
    alert('Edit user functionality coming soon!');
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
    // Sort by role priority: admin > project_chair > project_head > staff > public_user
    const rolePriority: Record<string, number> = {
      admin: 1,
      project_chair: 2,
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
      project_chair: 'bg-blue-100 text-blue-700 border-blue-300',
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

  // All roles in priority order
  const rolePriorityOrder = ['admin', 'project_chair', 'project_head', 'staff', 'public_user'];
  const roles = rolePriorityOrder;

  // Get pending approval users (sorted by role priority)
  const pendingUsers = users
    .filter(u => u.account_status === 'pending_approval')
    .sort((a, b) => {
      const rolePriority: Record<string, number> = {
        admin: 1,
        project_chair: 2,
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
                      <TableHead className="text-slate-700 font-semibold">Role</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Section</TableHead>
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
                        <TableCell>
                          <Badge className={`${getRoleBadgeColor(user.role)} border font-medium`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {user.section || '-'}
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
                        <TableHead className="text-slate-700 font-semibold">Role</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Section</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Date Joined</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
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
                            <TableCell>
                              <Badge className={`${getRoleBadgeColor(user.role)} border font-medium`}>
                                {user.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {user.section || '-'}
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
      </div>
    </div>
  );
}