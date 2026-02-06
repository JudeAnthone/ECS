"use client"
import React, { useState } from 'react';
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
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail
} from 'lucide-react';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // Sample user data
  const [users, setUsers] = useState([
    {
      id: 'USR001',
      username: 'sarah.chen',
      fullName: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      department: 'Engineering',
      role: 'Senior Developer',
      status: 'Active',
      dateJoined: '2023-03-15',
      lastActive: '2026-01-31'
    },
    {
      id: 'USR002',
      username: 'david.kim',
      fullName: 'David Kim',
      email: 'david.kim@company.com',
      department: 'Engineering',
      role: 'Team Lead',
      status: 'Active',
      dateJoined: '2022-11-20',
      lastActive: '2026-01-31'
    },
    {
      id: 'USR003',
      username: 'emily.watson',
      fullName: 'Emily Watson',
      email: 'emily.watson@company.com',
      department: 'Research',
      role: 'Research Scientist',
      status: 'Active',
      dateJoined: '2023-01-10',
      lastActive: '2026-01-30'
    },
    {
      id: 'USR004',
      username: 'marcus.rodriguez',
      fullName: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@company.com',
      department: 'Marketing',
      role: 'Marketing Manager',
      status: 'Active',
      dateJoined: '2023-06-01',
      lastActive: '2026-01-31'
    },
    {
      id: 'USR005',
      username: 'lisa.anderson',
      fullName: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      department: 'Finance',
      role: 'Financial Analyst',
      status: 'Active',
      dateJoined: '2023-02-14',
      lastActive: '2026-01-29'
    },
    {
      id: 'USR006',
      username: 'james.foster',
      fullName: 'James Foster',
      email: 'james.foster@company.com',
      department: 'Operations',
      role: 'Operations Manager',
      status: 'Inactive',
      dateJoined: '2022-09-12',
      lastActive: '2026-01-15'
    },
    {
      id: 'USR007',
      username: 'robert.taylor',
      fullName: 'Robert Taylor',
      email: 'robert.taylor@company.com',
      department: 'Engineering',
      role: 'Junior Developer',
      status: 'Active',
      dateJoined: '2024-01-08',
      lastActive: '2026-01-31'
    },
    {
      id: 'USR008',
      username: 'patricia.martinez',
      fullName: 'Patricia Martinez',
      email: 'patricia.martinez@company.com',
      department: 'HR',
      role: 'HR Specialist',
      status: 'Active',
      dateJoined: '2023-07-22',
      lastActive: '2026-01-31'
    },
    {
      id: 'USR009',
      username: 'john.smith',
      fullName: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Marketing',
      role: 'Content Creator',
      status: 'Suspended',
      dateJoined: '2023-10-05',
      lastActive: '2026-01-20'
    },
    {
      id: 'USR010',
      username: 'michelle.lee',
      fullName: 'Michelle Lee',
      email: 'michelle.lee@company.com',
      department: 'Research',
      role: 'Data Analyst',
      status: 'Active',
      dateJoined: '2024-03-12',
      lastActive: '2026-01-31'
    }
  ]);

  // Filter users based on search and department
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      user.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Suspended':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const handleEdit = (userId: string) => {
    console.log('Edit user:', userId);
    // Add your edit logic here
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    console.log('Deleted user:', userId);
  };

  const handleSuspend = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'Suspended' } : u
    ));
    console.log('Suspended user:', userId);
  };

  const handleActivate = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'Active' } : u
    ));
    console.log('Activated user:', userId);
  };

  const handleSendEmail = (userId: string) => {
    console.log('Send email to user:', userId);
    // Add your email logic here
  };

  // Get unique departments
  const departments = Array.from(new Set(users.map(u => u.department))).sort();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
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
            <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              {filteredUsers.length} Users
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 text-2xl mb-2">User Directory</CardTitle>
                <CardDescription className="text-slate-600">
                  Search and filter users by department, ID, or username
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
                  placeholder="Search by ID, username, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px] bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-slate-900">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept} className="text-slate-900">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedDepartment !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('all');
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{users.length}</span> users
              </p>
            </div>

            {/* User Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold">User ID</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Username</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Full Name</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Email</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Department</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Role</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Last Active</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No users found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="table-row-hover border-slate-200">
                        <TableCell className="font-semibold text-slate-900 mono">
                          {user.id}
                        </TableCell>
                        <TableCell className="text-slate-900 mono">
                          {user.username}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-slate-900 font-medium">{user.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-medium">
                            {user.department}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {user.role}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(user.status)} border font-medium`}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm mono">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                              <DropdownMenuItem 
                                onClick={() => handleSendEmail(user.id)}
                                className="cursor-pointer text-slate-900 hover:bg-slate-100"
                              >
                                <Mail className="mr-2 h-4 w-4 text-green-600" />
                                <span>Send Email</span>
                              </DropdownMenuItem>
                              {user.status === 'Active' ? (
                                <DropdownMenuItem 
                                  onClick={() => handleSuspend(user.id)}
                                  className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                >
                                  <Lock className="mr-2 h-4 w-4 text-orange-600" />
                                  <span>Suspend User</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleActivate(user.id)}
                                  className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                >
                                  <Unlock className="mr-2 h-4 w-4 text-green-600" />
                                  <span>Activate User</span>
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}