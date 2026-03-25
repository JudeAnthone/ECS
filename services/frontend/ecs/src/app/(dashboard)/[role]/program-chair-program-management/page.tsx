"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/Select';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/Dialog';
import { Textarea } from '@/shared/components/ui/TextArea';
import { PROGRAM_CATEGORIES } from '@/shared/configs/program-categories';
import { filterVisibleDepartments } from '@/shared/configs/department-visibility';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import {
  Search, Filter, MoreVertical, Edit, Trash2, Eye,
  CheckCircle, XCircle, Plus, ChevronRight, ArrowLeft,
  FolderOpen, Layers, Users, Tag, Target,
  CalendarRange, FileText, Building2, Wallet, UserCog,
} from 'lucide-react';
import { AuthService } from '@/shared/lib/auth-service';
import ProgramChairRequestManagement from '../program-chair-request-management/page';

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
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  project_name: string;
  project_description?: string;
  objectives?: string;
  program_id: string;
  department_id?: string;
  project_head_id?: string;
  budget_allocated?: number;
  budget_used: number;
  start_date?: string;
  end_date?: string;
  status: string;
  approval_status: string;
  created_at: string;
}

interface Department {
  id: string;
  department_name: string;
  department_code: string;
}

interface UserOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  assigned_program_chair_id?: string;
  avatar_url?: string | null;
}

const API = 'http://localhost:8081/api/v1';

function getToken() { return localStorage.getItem('auth_token'); }
function authHeaders() {
  return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-green-100 text-green-700',
    planning: 'bg-purple-100 text-purple-700',
    pending_approval: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ─── PROGRAM FORM ─────────────────────────────────────────────────────────────
function ProgramForm({ formData, setFormData, departments, onSubmit, onCancel, submitLabel, error }: {
  formData: any; setFormData: any; departments: Department[];
  onSubmit: () => void; onCancel: () => void; submitLabel: string; error?: string;
}) {
  return (
    <div className="space-y-5 pt-1">
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Basic Information</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Program Name <span className="text-red-500">*</span></label>
            <Input value={formData.program_name}
              onChange={e => setFormData({ ...formData, program_name: e.target.value })}
              placeholder="Enter program name"
              className="border-slate-300 focus:border-slate-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea value={formData.program_description}
              onChange={e => setFormData({ ...formData, program_description: e.target.value })}
              placeholder="Describe the program's purpose and scope..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
              </label>
              <Select
                value={formData.program_category || ''}
                onValueChange={v => setFormData({ ...formData, program_category: v })}
              >
                <SelectTrigger className="border-slate-300"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {formData.program_category && !PROGRAM_CATEGORIES.includes(formData.program_category as (typeof PROGRAM_CATEGORIES)[number]) && (
                    <SelectItem value={formData.program_category}>{formData.program_category} (current)</SelectItem>
                  )}
                  {PROGRAM_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
              </label>
              <Select value={formData.department_id || ''}
                onValueChange={v => setFormData({ ...formData, department_id: v })}>
                <SelectTrigger className="border-slate-300"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.department_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <Target className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Goals & Beneficiaries</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Objectives</label>
            <textarea value={formData.objectives}
              onChange={e => setFormData({ ...formData, objectives: e.target.value })}
              placeholder="List the key objectives of this program..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Target Beneficiaries
            </label>
            <Input value={formData.target_beneficiaries}
              onChange={e => setFormData({ ...formData, target_beneficiaries: e.target.value })}
              placeholder="e.g. Local communities, Students"
              className="border-slate-300" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <CalendarRange className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Schedule</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" /> Start Date
              </label>
              <Input type="date" value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="border-slate-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" /> End Date
              </label>
              <Input type="date" value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="border-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="px-5">Cancel</Button>
        <Button onClick={onSubmit} className="px-5">{submitLabel}</Button>
      </div>
    </div>
  );
}

// ─── PROJECT FORM ─────────────────────────────────────────────────────────────
function ProjectForm({ formData, setFormData, onSubmit, onCancel, submitLabel, error }: {
  formData: any; setFormData: any;
  onSubmit: () => void; onCancel: () => void; submitLabel: string; error?: string;
}) {
  return (
    <div className="space-y-5 pt-1">
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Project Details</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Project Name <span className="text-red-500">*</span></label>
            <Input value={formData.project_name}
              onChange={e => setFormData({ ...formData, project_name: e.target.value })}
              placeholder="Enter project name"
              className="border-slate-300" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea value={formData.project_description}
              onChange={e => setFormData({ ...formData, project_description: e.target.value })}
              placeholder="Describe what this project aims to achieve..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Objectives</label>
            <textarea value={formData.objectives}
              onChange={e => setFormData({ ...formData, objectives: e.target.value })}
              placeholder="List the key objectives of this project..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <Wallet className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Budget & Schedule</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <span className="text-slate-400 text-sm font-bold">₱</span> Budget Allocated
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₱</span>
              <Input type="number" value={formData.budget_allocated}
                onChange={e => setFormData({ ...formData, budget_allocated: e.target.value })}
                placeholder="0.00"
                className="pl-7 border-slate-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" /> Start Date
              </label>
              <Input type="date" value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="border-slate-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" /> End Date
              </label>
              <Input type="date" value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="border-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="px-5">Cancel</Button>
        <Button onClick={onSubmit} className="px-5">{submitLabel}</Button>
      </div>
    </div>
  );
}

// ─── PROJECTS VIEW (drill-down) ───────────────────────────────────────────────
function ProjectsView({ program, departments, onBack }: {
  program: Program; departments: Department[]; onBack: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [assignHeadOpen, setAssignHeadOpen] = useState(false);
  const [assignHeadProject, setAssignHeadProject] = useState<Project | null>(null);
  const [heads, setHeads] = useState<UserOption[]>([]);
  const [selectedHeadID, setSelectedHeadID] = useState('__none__');
  const [assignHeadError, setAssignHeadError] = useState('');
  const [projectTab, setProjectTab] = useState<'all' | 'pending'>('all');
  const [deleteProjectDialog, setDeleteProjectDialog] = useState<Project | null>(null);
  const [projectApprovalDialog, setProjectApprovalDialog] = useState<{ project: Project; approvalStatus: 'approved' | 'rejected' } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const emptyForm = { project_name: '', project_description: '', objectives: '', budget_allocated: '', start_date: '', end_date: '' };
  const [form, setForm] = useState(emptyForm);
  const currentUser = AuthService.getUser();
  const eligibleHeads = React.useMemo(
    () => heads.filter((h) => h.assigned_program_chair_id === currentUser?.id),
    [heads, currentUser?.id]
  );

  useEffect(() => {
    loadProjects();
    fetch(`${API}/users/by-role?role=project_head`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
      .then(d => setHeads(d.users || []))
      .catch(() => setHeads([]));
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch(`${API}/projects?program_id=${program.id}`, { headers: authHeaders() });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const validateProjectForm = (): string => {
    if (!form.project_name.trim()) return 'Project name is required.';
    if (form.end_date && form.start_date && form.end_date < form.start_date)
      return 'End date cannot be before start date.';
    if (form.end_date && program.end_date && form.end_date > program.end_date.split('T')[0])
      return `Project end date cannot exceed the program end date (${new Date(program.end_date).toLocaleDateString()}).`;
    if (form.budget_allocated) {
      const budget = parseFloat(form.budget_allocated);
      const alreadyAllocated = projects
        .filter(p => p.approval_status === 'approved' && p.id !== selected?.id)
        .reduce((s, p) => s + (p.budget_allocated || 0), 0);
      const programBudget = program.budget_allocation || 0;
      const remaining = programBudget - alreadyAllocated;
      if (programBudget > 0 && budget > remaining)
        return `Budget ₱${budget.toLocaleString()} exceeds remaining program budget of ₱${remaining.toLocaleString()}.`;
    }
    return '';
  };

  const handleCreate = async () => {
    const validationError = validateProjectForm();
    if (validationError) { setFormError(validationError); return; }
    setFormError('');
    const res = await fetch(`${API}/projects`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        project_name: form.project_name,
        project_description: form.project_description || null,
        program_id: program.id,
        department_id: program.department_id || null,
        objectives: form.objectives || null,
        budget_allocated: form.budget_allocated ? parseFloat(form.budget_allocated) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: 'pending_approval',
        approval_status: 'pending',
      }),
    });
    if (res.ok) { await loadProjects(); setCreateOpen(false); setForm(emptyForm); setFormError(''); }
    else { const e = await res.json(); setFormError(e.error || 'Failed to create project'); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const validationError = validateProjectForm();
    if (validationError) { setFormError(validationError); return; }
    setFormError('');
    const res = await fetch(`${API}/projects/${selected.id}`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({
        project_name: form.project_name,
        project_description: form.project_description || null,
        objectives: form.objectives || null,
        budget_allocated: form.budget_allocated ? parseFloat(form.budget_allocated) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }),
    });
    if (res.ok) { await loadProjects(); setEditOpen(false); setSelected(null); setForm(emptyForm); setFormError(''); }
    else { const e = await res.json(); setFormError(e.error || 'Failed to update project'); }
  };

  const handleDelete = (project: Project) => {
    setDeleteProjectDialog(project);
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectDialog) return;
    const res = await fetch(`${API}/projects/${deleteProjectDialog.id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) await loadProjects();
    else { const e = await res.json(); setPageError(e.error || 'Failed to delete project'); }
    setDeleteProjectDialog(null);
  };

  const handleProjectApproval = (project: Project, approvalStatus: 'approved' | 'rejected') => {
    setProjectApprovalDialog({ project, approvalStatus });
    setReviewNotes('');
  };

  const submitProjectApproval = async () => {
    if (!projectApprovalDialog) return;
    const { project, approvalStatus } = projectApprovalDialog;
    const action = approvalStatus === 'approved' ? 'approve' : 'reject';

    const res = await fetch(`${API}/projects/${project.id}/approval`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ approval_status: approvalStatus, review_notes: reviewNotes.trim() || null }),
    });

    if (res.ok) {
      await loadProjects();
      return;
    }

    const text = await res.text();
    let msg = `Failed to ${action} project`;
    try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
    setPageError(msg);
    setProjectApprovalDialog(null);
  };



  const openAssignHead = (p: Project) => {
    setAssignHeadProject(p);
    setSelectedHeadID(p.project_head_id || '__none__');
    setAssignHeadError('');
    setAssignHeadOpen(true);
  };

  const handleAssignHead = async () => {
    if (!assignHeadProject) return;
    const res = await fetch(`${API}/projects/${assignHeadProject.id}/assign-head`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ project_head_id: selectedHeadID === '__none__' ? null : selectedHeadID }),
    });
    if (res.ok) { await loadProjects(); setAssignHeadOpen(false); }
    else {
      const text = await res.text();
      let msg = 'Failed to assign project head';
      try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
      setAssignHeadError(msg);
    }
  };

  const openEdit = (p: Project) => {
    setSelected(p);
    setForm({
      project_name: p.project_name,
      project_description: p.project_description || '',
      objectives: p.objectives || '',
      budget_allocated: p.budget_allocated?.toString() || '',
      start_date: p.start_date?.split('T')[0] || '',
      end_date: p.end_date?.split('T')[0] || '',
    });
    setEditOpen(true);
  };

  const pendingProjects = projects.filter((p) => p.approval_status === 'pending');
  const scopedProjects = projectTab === 'pending' ? pendingProjects : projects;
  const filtered = scopedProjects.filter((p) =>
    p.project_name.toLowerCase().includes(search.toLowerCase())
  );
  const programDepartment = departments.find((d) => d.id === program.department_id);
  const pendingVisible = filtered.filter((p) => p.approval_status === 'pending');

  const total = projects.length;
  const active = projects.filter(p => p.status === 'in_progress').length;
  const approvedBudget = projects
    .filter(p => p.approval_status === 'approved')
    .reduce((s, p) => s + (p.budget_allocated || 0), 0);
  const programBudget = approvedBudget;
  const usedBudget = projects.reduce((s, p) => s + (p.budget_used || 0), 0);
  const remainingBudget = programBudget - usedBudget;
  const usedPct = programBudget > 0 ? Math.min(100, Math.round((usedBudget / programBudget) * 100)) : 0;

  return (
    <div className="space-y-6">
      {pageError && (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{pageError}</span>
          </div>
          <button onClick={() => setPageError('')} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={onBack} className="hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> My Programs
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">{program.program_name}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800">Projects</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{program.program_name}</h2>
            <p className="text-slate-500 text-sm mt-1">{program.program_description || 'No description'}</p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
              <div>
                <span className="text-slate-500">Category:</span> {program.program_category || '-'}
              </div>
              <div>
                <span className="text-slate-500">Department:</span> {programDepartment ? `${programDepartment.department_name} (${programDepartment.department_code})` : '-'}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <StatusBadge status={program.status} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 rounded-lg px-4 py-2 text-center">
              <div className="text-2xl font-bold text-slate-800">{total}</div>
              <div className="text-xs text-slate-500">Projects</div>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-2 text-center">
              <div className="text-2xl font-bold text-green-700">{active}</div>
              <div className="text-xs text-slate-500">Active</div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Project Budget</span>
            <span className="text-xs text-slate-500">{usedPct}% utilized</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
            <div
              className={`h-2.5 rounded-full transition-all ${usedPct >= 100 ? 'bg-red-500' : usedPct >= 75 ? 'bg-orange-400' : 'bg-green-500'}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-0.5">Approved Total</div>
              <div className="text-sm font-bold text-slate-800">₱{programBudget.toLocaleString()}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-0.5">Used</div>
              <div className="text-sm font-bold text-orange-700">₱{usedBudget.toLocaleString()}</div>
            </div>
            <div className={`rounded-lg p-3 ${remainingBudget < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="text-xs text-slate-500 mb-0.5">Remaining</div>
              <div className={`text-sm font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-700'}`}>
                ₱{remainingBudget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => { setProjectTab('all'); }}
                className={`px-3 py-1.5 text-sm ${projectTab === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                All Projects ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => { setProjectTab('pending'); }}
                className={`px-3 py-1.5 text-sm border-l border-slate-200 ${projectTab === 'pending' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                Pending Projects ({pendingProjects.length})
              </button>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder={projectTab === 'pending' ? 'Search pending projects...' : 'Search projects...'} value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="flex items-center gap-2">

            <Dialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) setFormError(''); }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" onClick={() => { setForm(emptyForm); setFormError(''); }}>
                  <Plus className="w-4 h-4" /> Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                  <DialogDescription>Add a project under <strong>{program.program_name}</strong></DialogDescription>
                </DialogHeader>
                <ProjectForm formData={form} setFormData={setForm}
                  onSubmit={handleCreate} onCancel={() => { setCreateOpen(false); setFormError(''); }} submitLabel="Create Project" error={formError} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading projects...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={projectTab === 'pending' ? 8 : 7} className="text-center py-12 text-slate-400">
                    {projectTab === 'pending' ? 'No pending projects found under this program' : 'No projects found under this program'}
                  </TableCell>
                </TableRow>
              ) : filtered.map(p => (
                <TableRow key={p.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{p.project_name}</TableCell>
                  <TableCell>{p.budget_allocated ? `₱${p.budget_allocated.toLocaleString()}` : '-'}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell><StatusBadge status={p.approval_status} /></TableCell>
                  <TableCell>{p.start_date ? new Date(p.start_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        {p.approval_status !== 'approved' && (
                          <DropdownMenuItem onClick={() => handleProjectApproval(p, 'approved')} className="text-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve Project
                          </DropdownMenuItem>
                        )}
                        {p.approval_status !== 'rejected' && (
                          <DropdownMenuItem onClick={() => handleProjectApproval(p, 'rejected')} className="text-orange-700">
                            <XCircle className="w-4 h-4 mr-2" /> Reject Project
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openEdit(p)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssignHead(p)}>
                          <UserCog className="w-4 h-4 mr-2" /> Assign Project Head
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(p)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!deleteProjectDialog} onOpenChange={(open) => { if (!open) setDeleteProjectDialog(null); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteProjectDialog?.project_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteProject}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!projectApprovalDialog} onOpenChange={(open) => { if (!open) setProjectApprovalDialog(null); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {projectApprovalDialog?.approvalStatus === 'approved' ? 'Approve Project' : 'Reject Project'}
            </DialogTitle>
            <DialogDescription>
              {projectApprovalDialog
                ? `Are you sure you want to ${projectApprovalDialog.approvalStatus === 'approved' ? 'approve' : 'reject'} ${projectApprovalDialog.project.project_name}?`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Review Notes (optional)</label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes for this decision"
              rows={3}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant={projectApprovalDialog?.approvalStatus === 'rejected' ? 'destructive' : 'default'}
              onClick={submitProjectApproval}
            >
              {projectApprovalDialog?.approvalStatus === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) setFormError(''); }}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details</DialogDescription>
          </DialogHeader>
          <ProjectForm formData={form} setFormData={setForm}
            onSubmit={handleUpdate} onCancel={() => { setEditOpen(false); setFormError(''); }} submitLabel="Update Project" error={formError} />
        </DialogContent>
      </Dialog>

      <Dialog open={assignHeadOpen} onOpenChange={v => { setAssignHeadOpen(v); if (!v) setAssignHeadError(''); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5" /> Assign Project Head</DialogTitle>
            <DialogDescription>{assignHeadProject?.project_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {assignHeadError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{assignHeadError}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Select Project Head</label>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedHeadID('__none__')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${selectedHeadID === '__none__' ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                    <span className="text-slate-400 text-xs">—</span>
                  </div>
                  <span className="text-slate-500">None (remove assignment)</span>
                  {selectedHeadID === '__none__' && <span className="ml-auto text-slate-400 text-xs">✓</span>}
                </button>
                {eligibleHeads.length === 0 ? (
                  <div className="px-4 py-5 text-center text-sm text-slate-400">
                    No project heads assigned to your program chair team.
                  </div>
                ) : eligibleHeads.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedHeadID(u.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${selectedHeadID === u.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center shrink-0 text-sm">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-slate-800 truncate">{u.first_name} {u.last_name}</span>
                      <span className="text-xs text-slate-400 truncate">{u.email}</span>
                    </div>
                    {selectedHeadID === u.id && <span className="ml-auto text-indigo-500 text-xs font-medium">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignHeadOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignHead}>Save Assignment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProgramChairProgramManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Program | null>(null);
  const [drillProgram, setDrillProgram] = useState<Program | null>(null);
  const [programFormError, setProgramFormError] = useState('');
  const [programPageError, setProgramPageError] = useState('');
  const [assignDeptOpen, setAssignDeptOpen] = useState(false);
  const [assignProgram, setAssignProgram] = useState<Program | null>(null);
  const [selectedDeptID, setSelectedDeptID] = useState('__none__');
  const [assignDeptError, setAssignDeptError] = useState('');
  const [activeTab, setActiveTab] = useState<'programs' | 'requests'>('programs');
  const [programStatusDialog, setProgramStatusDialog] = useState<{ id: string; status: string; label: string } | null>(null);
  const [deleteProgramDialogID, setDeleteProgramDialogID] = useState<string | null>(null);
  const params = useParams();
  const role = params?.role;

  const emptyForm = {
    program_name: '', program_description: '', program_category: '',
    department_id: '', objectives: '', target_beneficiaries: '',
    start_date: '', end_date: '',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const user = AuthService.getUser();
    setCurrentUser(user);
    loadDepartments();
    if (user?.id) {
      loadPrograms(user.id);
    }
  }, []);

  const loadPrograms = async (userId: string) => {
    try {
      const res = await fetch(`${API}/programs/program-chair/${userId}`, { headers: authHeaders() });
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadDepartments = async () => {
    try {
      const res = await fetch(`${API}/departments`, { headers: authHeaders() });
      const data = await res.json();
      setDepartments(filterVisibleDepartments(data.departments || []));
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.program_name.trim()) { setProgramFormError('Program name is required.'); return; }
    setProgramFormError('');
    const res = await fetch(`${API}/programs`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        program_name: form.program_name,
        program_description: form.program_description || null,
        program_category: form.program_category || null,
        department_id: form.department_id || null,
        objectives: form.objectives || null,
        target_beneficiaries: form.target_beneficiaries || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }),
    });
    if (res.ok) {
      await loadPrograms(currentUser?.id);
      setCreateOpen(false);
      setForm(emptyForm);
      setProgramFormError('');
    } else {
      const e = await res.json();
      setProgramFormError(e.error || 'Failed to create program');
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const res = await fetch(`${API}/programs/${selected.id}`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({
        program_name: form.program_name,
        program_description: form.program_description || null,
        program_category: form.program_category || null,
        department_id: form.department_id || null,
        objectives: form.objectives || null,
        target_beneficiaries: form.target_beneficiaries || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }),
    });
    if (res.ok) {
      await loadPrograms(currentUser?.id);
      setEditOpen(false);
      setSelected(null);
      setForm(emptyForm);
      setProgramFormError('');
    } else {
      const e = await res.json();
      setProgramFormError(e.error || 'Failed to update program');
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    const label = status === 'completed' ? 'complete' : 'cancel';
    setProgramStatusDialog({ id, status, label });
  };

  const confirmStatusChange = async () => {
    if (!programStatusDialog) return;
    const res = await fetch(`${API}/programs/${programStatusDialog.id}/status`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ status: programStatusDialog.status }),
    });
    if (res.ok) await loadPrograms(currentUser?.id);
    else { const e = await res.json(); setProgramPageError(e.error || `Failed to ${programStatusDialog.label} program`); }
    setProgramStatusDialog(null);
  };

  const handleDelete = (id: string) => {
    setDeleteProgramDialogID(id);
  };

  const confirmDeleteProgram = async () => {
    if (!deleteProgramDialogID) return;
    const res = await fetch(`${API}/programs/${deleteProgramDialogID}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) await loadPrograms(currentUser?.id);
    else { const e = await res.json(); setProgramPageError(e.error || 'Failed to delete program'); }
    setDeleteProgramDialogID(null);
  };

  const openEdit = (p: Program) => {
    setSelected(p);
    setForm({
      program_name: p.program_name,
      program_description: p.program_description || '',
      program_category: p.program_category || '',
      department_id: p.department_id || '',
      objectives: p.objectives || '',
      target_beneficiaries: p.target_beneficiaries || '',
      start_date: p.start_date?.split('T')[0] || '',
      end_date: p.end_date?.split('T')[0] || '',
    });
    setEditOpen(true);
  };

  const openAssignDept = (p: Program) => {
    setAssignProgram(p);
    setSelectedDeptID(p.department_id || '__none__');
    setAssignDeptError('');
    setAssignDeptOpen(true);
  };

  const handleAssignDept = async () => {
    if (!assignProgram) return;
    const deptId = selectedDeptID === '__none__' ? null : selectedDeptID;
    // Use PUT update endpoint with existing program fields so backend can persist changes
    const res = await fetch(`${API}/programs/${assignProgram.id}`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({
        program_name: assignProgram.program_name,
        program_description: assignProgram.program_description || null,
        program_category: assignProgram.program_category || null,
        department_id: deptId,
        objectives: assignProgram.objectives || null,
        target_beneficiaries: assignProgram.target_beneficiaries || null,
        start_date: assignProgram.start_date || null,
        end_date: assignProgram.end_date || null,
      }),
    });
    if (res.ok) { await loadPrograms(currentUser?.id); setAssignDeptOpen(false); }
    else {
      const text = await res.text();
      let msg = 'Failed to assign department';
      try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
      setAssignDeptError(msg);
    }
  };

  const filtered = programs.filter(p => {
    const s = p.program_name.toLowerCase().includes(search.toLowerCase()) ||
      p.program_description?.toLowerCase().includes(search.toLowerCase());
    const st = filterStatus === 'all' || p.status === filterStatus;
    return s && st;
  });

  const total = programs.length;
  const active = programs.filter(p => p.status === 'active').length;
  const completed = programs.filter(p => p.status === 'completed').length;
  const cancelled = programs.filter(p => p.status === 'cancelled').length;

  if (drillProgram) {
    return (
      <div className="container mx-auto p-6">
        <ProjectsView
          program={drillProgram}
          departments={departments}
          onBack={() => setDrillProgram(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant={activeTab === 'programs' ? 'default' : 'outline'} onClick={() => setActiveTab('programs')}>Programs</Button>
          <Button variant={activeTab === 'requests' ? 'default' : 'outline'} onClick={() => setActiveTab('requests')}>Program Requests</Button>
        </div>
        {activeTab === 'programs' ? (
          <>
            {programPageError && (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{programPageError}</span>
                </div>
                <button onClick={() => setProgramPageError('')} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Programs</h1>
                <p className="text-slate-500 mt-1">Manage extension service programs you chair</p>
              </div>
              <Dialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) setProgramFormError(''); }}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" onClick={() => { setForm(emptyForm); setProgramFormError(''); }}>
                    <Plus className="w-4 h-4" /> Create Program
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Program</DialogTitle>
                    <DialogDescription>You will be automatically assigned as the program chair</DialogDescription>
                  </DialogHeader>
                  <ProgramForm formData={form} setFormData={setForm} departments={departments}
                    onSubmit={handleCreate} onCancel={() => { setCreateOpen(false); setProgramFormError(''); }} submitLabel="Create Program" error={programFormError} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'My Programs', value: total, icon: Layers, color: 'text-slate-700', bg: 'bg-slate-50' },
                { label: 'Active', value: active, icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
                { label: 'Completed', value: completed, icon: FolderOpen, color: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                  <div>
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search programs..." value={search}
                    onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading programs...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Overall Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                          {programs.length === 0 ? 'You have no programs yet. Create one to get started.' : 'No programs match your search.'}
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(p => (
                      <TableRow key={p.id} className="hover:bg-slate-50">
                        <TableCell>
                          <button
                            onClick={() => setDrillProgram(p)}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            {p.program_name}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </TableCell>
                        <TableCell>{p.program_category || '-'}</TableCell>
                        <TableCell>{departments.find(d => d.id === p.department_id)?.department_code || '-'}</TableCell>
                        <TableCell>{p.spent_budget ? `₱${p.spent_budget.toLocaleString()}` : '₱0'}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                        <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => setDrillProgram(p)}>
                                <FolderOpen className="w-4 h-4 mr-2" /> View Projects
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelected(p); setViewOpen(true); }}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(p)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              {p.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'completed')} className="text-blue-600">
                                  <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
                                </DropdownMenuItem>
                              )}
                              {p.status === 'completed' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'active')} className="text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-2" /> Revert to Active
                                </DropdownMenuItem>
                              )}
                              {(p.status === 'active' || p.status === 'draft' || p.status === 'completed') && (
                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'cancelled')} className="text-orange-600">
                                  <XCircle className="w-4 h-4 mr-2" /> Cancel Program
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAssignDept(p)}>
                                <Building2 className="w-4 h-4 mr-2" /> {p.department_id ? 'Change Department' : 'Assign Department'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) setProgramFormError(''); }}>
              <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Program</DialogTitle>
                  <DialogDescription>Update program information</DialogDescription>
                </DialogHeader>
                <ProgramForm formData={form} setFormData={setForm} departments={departments}
                  onSubmit={handleUpdate} onCancel={() => { setEditOpen(false); setProgramFormError(''); }} submitLabel="Update Program" error={programFormError} />
              </DialogContent>
            </Dialog>

            <Dialog open={!!programStatusDialog} onOpenChange={(open) => { if (!open) setProgramStatusDialog(null); }}>
              <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Program Status</DialogTitle>
                  <DialogDescription>
                    Mark this program as <strong>{programStatusDialog?.label}</strong>?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant={programStatusDialog?.status === 'cancelled' ? 'destructive' : 'default'}
                    onClick={confirmStatusChange}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={!!deleteProgramDialogID} onOpenChange={(open) => { if (!open) setDeleteProgramDialogID(null); }}>
              <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Program</DialogTitle>
                  <DialogDescription>
                    Delete this program? All its projects will also be affected.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={confirmDeleteProgram}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selected?.program_name}</DialogTitle>
                  <DialogDescription>Program Details</DialogDescription>
                </DialogHeader>
                {selected && (
                  <div className="space-y-4 pt-2">
                    <div className="flex gap-2">
                      <StatusBadge status={selected.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Category</label>
                        <p className="mt-1 text-slate-600 text-sm">{selected.program_category || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Department</label>
                        <p className="mt-1 text-slate-600 text-sm">
                          {departments.find(d => d.id === selected.department_id)?.department_name || '-'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <p className="mt-1 text-slate-600 text-sm">{selected.program_description || 'No description'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Objectives</label>
                      <p className="mt-1 text-slate-600 text-sm">{selected.objectives || 'Not defined'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Target Beneficiaries</label>
                      <p className="mt-1 text-slate-600 text-sm">{selected.target_beneficiaries || 'Not specified'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Overall Budget</label>
                        <p className="mt-1 text-slate-600 text-sm">
                          ₱{(selected.spent_budget || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Budget Source</label>
                        <p className="mt-1 text-slate-600 text-sm">Summed from approved projects under this program</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Start Date</label>
                        <p className="mt-1 text-slate-600 text-sm">
                          {selected.start_date ? new Date(selected.start_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">End Date</label>
                        <p className="mt-1 text-slate-600 text-sm">
                          {selected.end_date ? new Date(selected.end_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={() => { setViewOpen(false); setDrillProgram(selected); }}>
                        <FolderOpen className="w-4 h-4 mr-2" /> View Projects
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            {/* Assign Department Dialog */}
            <Dialog open={assignDeptOpen} onOpenChange={v => { setAssignDeptOpen(v); if (!v) setAssignDeptError(''); }}>
              <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Assign Department</DialogTitle>
                  <DialogDescription>{assignProgram?.program_name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  {assignDeptError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{assignDeptError}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Select Department</label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedDeptID('__none__')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${selectedDeptID === '__none__' ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                          <span className="text-slate-400 text-xs">—</span>
                        </div>
                        <span className="text-slate-500">None (remove assignment)</span>
                        {selectedDeptID === '__none__' && <span className="ml-auto text-slate-400 text-xs">✓</span>}
                      </button>
                      {departments.length === 0 ? (
                        <div className="px-4 py-5 text-center text-sm text-slate-400">No departments available.</div>
                      ) : departments.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedDeptID(d.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${selectedDeptID === d.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center shrink-0 text-sm">{d.department_code?.[0] || 'D'}</div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-sm font-medium text-slate-800 truncate">{d.department_name}</span>
                            <span className="text-xs text-slate-400 truncate">{d.department_code}</span>
                          </div>
                          {selectedDeptID === d.id && <span className="ml-auto text-indigo-500 text-xs font-medium">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAssignDeptOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssignDept}>Save Assignment</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <ProgramChairRequestManagement onRequestApproved={() => { if (currentUser?.id) loadPrograms(currentUser.id); }} />
        )}
      </div>
    </div>
  );
}
