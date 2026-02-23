"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import { 
  BookOpen,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  Calendar
} from 'lucide-react';

interface Program {
  id: string;
  program_name: string;
  program_description?: string;
  program_category?: string;
  department_id?: string;
  program_chair_id?: string;
  objectives?: string;
  target_beneficiaries?: string;
  budget_allocation?: number;
  spent_budget: number;
  start_date?: string;
  end_date?: string;
  status: string;
  approval_status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: string;
  department_name: string;
  department_code: string;
}

export default function AdminProgramManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState('all');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [formData, setFormData] = useState({
    program_name: '',
    program_description: '',
    program_category: '',
    department_id: '',
    program_chair_id: '',
    objectives: '',
    target_beneficiaries: '',
    budget_allocation: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadPrograms();
    loadDepartments();
  }, []);

  const loadPrograms = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8081/api/v1/programs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load programs:', response.status, errorText);
        setLoading(false);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setPrograms(data.programs || []);
      } else {
        console.error('Expected JSON response but got:', contentType);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load programs:', error);
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8081/api/v1/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load departments:', response.status, errorText);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setDepartments(data.departments || []);
      } else {
        console.error('Expected JSON response but got:', contentType);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        ...formData,
        budget_allocation: formData.budget_allocation ? parseFloat(formData.budget_allocation) : null,
        department_id: formData.department_id || null,
        program_chair_id: formData.program_chair_id || null,
      };

      const response = await fetch('http://localhost:8081/api/v1/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadPrograms();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to create program';
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Failed to create program');
    }
  };

  const handleUpdate = async () => {
    if (!selectedProgram) return;

    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        ...formData,
        budget_allocation: formData.budget_allocation ? parseFloat(formData.budget_allocation) : null,
        department_id: formData.department_id || null,
        program_chair_id: formData.program_chair_id || null,
      };

      const response = await fetch(`http://localhost:8081/api/v1/programs/${selectedProgram.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadPrograms();
        setIsEditDialogOpen(false);
        setSelectedProgram(null);
        resetForm();
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to update program';
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error updating program:', error);
      alert('Failed to update program');
    }
  };

  const handleApprove = async (programId: string) => {
    if (!confirm('Are you sure you want to approve this program?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8081/api/v1/programs/${programId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approval_status: 'approved' }),
      });

      if (response.ok) {
        await loadPrograms();
      }
    } catch (error) {
      console.error('Error approving program:', error);
    }
  };

  const handleReject = async (programId: string) => {
    if (!confirm('Are you sure you want to reject this program?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8081/api/v1/programs/${programId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approval_status: 'rejected' }),
      });

      if (response.ok) {
        await loadPrograms();
      }
    } catch (error) {
      console.error('Error rejecting program:', error);
    }
  };

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8081/api/v1/programs/${programId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadPrograms();
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const openEditDialog = (program: Program) => {
    setSelectedProgram(program);
    setFormData({
      program_name: program.program_name,
      program_description: program.program_description || '',
      program_category: program.program_category || '',
      department_id: program.department_id || '',
      program_chair_id: program.program_chair_id || '',
      objectives: program.objectives || '',
      target_beneficiaries: program.target_beneficiaries || '',
      budget_allocation: program.budget_allocation?.toString() || '',
      start_date: program.start_date?.split('T')[0] || '',
      end_date: program.end_date?.split('T')[0] || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (program: Program) => {
    setSelectedProgram(program);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      program_name: '',
      program_description: '',
      program_category: '',
      department_id: '',
      program_chair_id: '',
      objectives: '',
      target_beneficiaries: '',
      budget_allocation: '',
      start_date: '',
      end_date: '',
    });
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.program_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || program.department_id === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || program.status === selectedStatus;
    const matchesApproval = selectedApprovalStatus === 'all' || program.approval_status === selectedApprovalStatus;

    return matchesSearch && matchesDepartment && matchesStatus && matchesApproval;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
      draft: { variant: "outline", color: "text-gray-600" },
      active: { variant: "default", color: "text-green-600" },
      completed: { variant: "secondary", color: "text-blue-600" },
      cancelled: { variant: "destructive", color: "text-red-600" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant} className={config.color}>{status}</Badge>;
  };

  const getApprovalBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
      pending: { variant: "outline", color: "text-orange-600" },
      approved: { variant: "default", color: "text-green-600" },
      rejected: { variant: "destructive", color: "text-red-600" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className={config.color}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Program Management</h1>
          <p className="text-slate-600 mt-1">Manage extension service programs</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={resetForm}>
              <Plus className="w-4 h-4" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
              <DialogDescription>Add a new extension service program to the system</DialogDescription>
            </DialogHeader>
            <ProgramForm 
              formData={formData} 
              setFormData={setFormData} 
              departments={departments}
              onSubmit={handleCreate}
              submitLabel="Create Program"
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.department_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedApprovalStatus} onValueChange={setSelectedApprovalStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Approval status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Approvals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading programs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No programs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.program_name}</TableCell>
                      <TableCell>{program.program_category || '-'}</TableCell>
                      <TableCell>
                        {departments.find(d => d.id === program.department_id)?.department_code || '-'}
                      </TableCell>
                      <TableCell>
                        {program.budget_allocation ? `₱${program.budget_allocation.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(program.status)}</TableCell>
                      <TableCell>{getApprovalBadge(program.approval_status)}</TableCell>
                      <TableCell>{new Date(program.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openViewDialog(program)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(program)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {program.approval_status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(program.id)} className="text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(program.id)} className="text-orange-600">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(program.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>Update program information</DialogDescription>
          </DialogHeader>
          <ProgramForm 
            formData={formData} 
            setFormData={setFormData} 
            departments={departments}
            onSubmit={handleUpdate}
            submitLabel="Update Program"
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProgram?.program_name}</DialogTitle>
            <DialogDescription>Program Details</DialogDescription>
          </DialogHeader>
          {selectedProgram && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedProgram.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Approval Status</label>
                  <div className="mt-1">{getApprovalBadge(selectedProgram.approval_status)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <p className="mt-1 text-slate-600">{selectedProgram.program_description || 'No description'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <p className="mt-1 text-slate-600">{selectedProgram.program_category || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Objectives</label>
                <p className="mt-1 text-slate-600">{selectedProgram.objectives || 'No objectives defined'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Target Beneficiaries</label>
                <p className="mt-1 text-slate-600">{selectedProgram.target_beneficiaries || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Budget Allocation</label>
                  <p className="mt-1 text-slate-600">
                    {selectedProgram.budget_allocation ? `₱${selectedProgram.budget_allocation.toLocaleString()}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Spent Budget</label>
                  <p className="mt-1 text-slate-600">₱{selectedProgram.spent_budget.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <p className="mt-1 text-slate-600">
                    {selectedProgram.start_date ? new Date(selectedProgram.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <p className="mt-1 text-slate-600">
                    {selectedProgram.end_date ? new Date(selectedProgram.end_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProgramForm({ formData, setFormData, departments, onSubmit, submitLabel }: {
  formData: any;
  setFormData: (data: any) => void;
  departments: Department[];
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Program Name *</label>
        <Input
          value={formData.program_name}
          onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
          placeholder="Enter program name"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={formData.program_description}
          onChange={(e) => setFormData({ ...formData, program_description: e.target.value })}
          placeholder="Enter program description"
          className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <Input
            value={formData.program_category}
            onChange={(e) => setFormData({ ...formData, program_category: e.target.value })}
            placeholder="e.g., Health, Education"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Department</label>
          <Select 
            value={formData.department_id} 
            onValueChange={(value) => setFormData({ ...formData, department_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.department_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Objectives</label>
        <textarea
          value={formData.objectives}
          onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
          placeholder="Enter program objectives"
          className="w-full min-h-[80px] px-3 py-2 border border-slate-300 rounded-md"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Target Beneficiaries</label>
        <Input
          value={formData.target_beneficiaries}
          onChange={(e) => setFormData({ ...formData, target_beneficiaries: e.target.value })}
          placeholder="e.g., Local communities, Students"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Budget Allocation</label>
        <Input
          type="number"
          value={formData.budget_allocation}
          onChange={(e) => setFormData({ ...formData, budget_allocation: e.target.value })}
          placeholder="Enter budget amount"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Start Date</label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">End Date</label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
