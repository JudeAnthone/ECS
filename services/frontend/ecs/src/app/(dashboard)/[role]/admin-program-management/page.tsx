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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/Dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import {
  Search, Filter, MoreVertical, Edit, Trash2, Eye,
  CheckCircle, XCircle, Plus, ChevronRight, ArrowLeft,
  FolderOpen, Layers, Users, Tag, Target,
  CalendarRange, FileText, Building2, Wallet, UserCog
} from 'lucide-react';
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

function UserAvatar({ user, size = 'md' }: { user: UserOption; size?: 'sm' | 'md' | 'lg' }) {
  const szClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
  return user.avatar_url
    ? <img src={user.avatar_url} alt={initials} className={`${szClass} rounded-full object-cover shrink-0`} />
    : <div className={`${szClass} rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center shrink-0`}>{initials}</div>;
}

function UserPickerList({ users, value, onChange, emptyLabel, isDisabled, disabledReason }: {
  users: UserOption[];
  value: string;
  onChange: (id: string) => void;
  emptyLabel: string;
  isDisabled?: (user: UserOption) => boolean;
  disabledReason?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => onChange('__none__')}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
          value === '__none__' ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'
        }`}
      >
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
          <span className="text-slate-400 text-xs">—</span>
        </div>
        <span className="text-slate-500">None (remove assignment)</span>
        {value === '__none__' && <span className="ml-auto text-slate-400 text-xs">✓</span>}
      </button>
      {users.length === 0 ? (
        <div className="px-4 py-5 text-center text-sm text-slate-400 border-t border-slate-100">
          {emptyLabel}
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
          {users.map(u => {
            const disabled = isDisabled?.(u) ?? false;
            return (
            <button
              key={u.id}
              type="button"
              onClick={() => !disabled && onChange(u.id)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                value === u.id ? 'bg-indigo-50' : disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'
              }`}
            >
              <UserAvatar user={u} size="sm" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-slate-800 truncate">{u.first_name} {u.last_name}</span>
                <span className="text-xs text-slate-400 truncate">{u.email}</span>
                {disabled && disabledReason && <span className="text-[11px] text-amber-600 truncate">{disabledReason}</span>}
              </div>
              {value === u.id && <span className="ml-auto text-indigo-500 text-xs font-medium">✓</span>}
            </button>
          )})}
        </div>
      )}
    </div>
  );
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

      {/* Basic Info */}
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
              <Input value={formData.program_category}
                onChange={e => setFormData({ ...formData, program_category: e.target.value })}
                placeholder="e.g. Health, Education"
                className="border-slate-300" />
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

      {/* Goals */}
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

      {/* Budget & Schedule */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <Wallet className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Budget & Schedule</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <span className="text-slate-400 text-sm font-bold">₱</span> Budget Allocation
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₱</span>
              <Input type="number" value={formData.budget_allocation}
                onChange={e => setFormData({ ...formData, budget_allocation: e.target.value })}
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

// ─── PROJECT FORM ─────────────────────────────────────────────────────────────
function ProjectForm({ formData, setFormData, onSubmit, onCancel, submitLabel, error }: {
  formData: any; setFormData: any;
  onSubmit: () => void; onCancel: () => void; submitLabel: string; error?: string;
}) {
  return (
    <div className="space-y-5 pt-1">

      {/* Basic Info */}
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

      {/* Budget & Schedule */}
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
  const emptyForm = { project_name: '', project_description: '', objectives: '', budget_allocated: '', start_date: '', end_date: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadProjects();
    fetch(`${API}/users/by-role?role=project_head`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
      .then(d => setHeads(d.users || []))
      .catch(() => setHeads([]));
  }, []);

  const eligibleHeads = React.useMemo(() => {
    if (!program.program_chair_id) {
      return [];
    }
    return heads.filter((h) => h.assigned_program_chair_id === program.program_chair_id);
  }, [heads, program.program_chair_id]);

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
        status: 'in_progress',
        approval_status: 'approved',
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    const res = await fetch(`${API}/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) await loadProjects();
    else { const e = await res.json(); setPageError(e.error || 'Failed to delete project'); }
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

  const filtered = projects.filter(p =>
    p.project_name.toLowerCase().includes(search.toLowerCase())
  );

  const total = projects.length;
  const active = projects.filter(p => p.status === 'in_progress').length;
  const programBudget = program.budget_allocation || 0;
  const approvedBudget = projects
    .filter(p => p.approval_status === 'approved')
    .reduce((s, p) => s + (p.budget_allocated || 0), 0);
  const remainingBudget = programBudget - approvedBudget;
  const usedPct = programBudget > 0 ? Math.min(100, Math.round((approvedBudget / programBudget) * 100)) : 0;

  return (
    <div className="space-y-6">
      {pageError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{pageError}</span>
          </div>
          <button onClick={() => setPageError('')} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={onBack} className="hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Program Management
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">{program.program_name}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800">Projects</span>
      </div>

      {/* Program context card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{program.program_name}</h2>
            <p className="text-slate-500 text-sm mt-1">{program.program_description || 'No description'}</p>
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

        {/* Budget tracker */}
        {programBudget > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Budget Allocation</span>
              <span className="text-xs text-slate-500">{usedPct}% allocated</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  usedPct >= 100 ? 'bg-red-500' : usedPct >= 75 ? 'bg-orange-400' : 'bg-green-500'
                }`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">Program Budget</div>
                <div className="text-sm font-bold text-slate-800">₱{programBudget.toLocaleString()}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">Approved Projects</div>
                <div className="text-sm font-bold text-orange-700">₱{approvedBudget.toLocaleString()}</div>
              </div>
              <div className={`rounded-lg p-3 ${remainingBudget < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="text-xs text-slate-500 mb-0.5">Remaining</div>
                <div className={`text-sm font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  ₱{remainingBudget.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects table */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search projects..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
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
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    No projects found under this program
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
                        <DropdownMenuItem onClick={() => openEdit(p)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssignHead(p)}>
                          <UserCog className="w-4 h-4 mr-2" /> Assign Project Head
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-red-600">
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

      {/* Edit Dialog */}
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

      {/* Assign Project Head Dialog */}
      <Dialog open={assignHeadOpen} onOpenChange={v => { setAssignHeadOpen(v); if (!v) setAssignHeadError(''); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5" /> Assign Project Head</DialogTitle>
            <DialogDescription>
              {assignHeadProject?.project_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {assignHeadError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{assignHeadError}</span>
              </div>
            )}
            {assignHeadProject?.project_head_id && (() => {
              const current = heads.find(h => h.id === assignHeadProject.project_head_id);
              return current ? (
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                  <UserAvatar user={current} size="md" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Currently assigned</p>
                    <p className="text-sm font-medium text-slate-800">{current.first_name} {current.last_name}</p>
                    <p className="text-xs text-slate-400">{current.email}</p>
                  </div>
                </div>
              ) : null;
            })()}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Select Project Head</label>
              <UserPickerList
                users={eligibleHeads}
                value={selectedHeadID}
                onChange={setSelectedHeadID}
                emptyLabel={program.program_chair_id
                  ? 'No project heads assigned to this program chair team.'
                  : 'Assign a program chair to this program first.'}
              />
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

// ─── PROGRAMS VIEW (top level) ────────────────────────────────────────────────
export default function AdminProgramManagement() {
  const role = 'admin';

  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Program | null>(null);
  const [drillProgram, setDrillProgram] = useState<Program | null>(null);
  const [programFormError, setProgramFormError] = useState('');
  const [programPageError, setProgramPageError] = useState('');
  const [assignChairOpen, setAssignChairOpen] = useState(false);
  const [assignChairProgram, setAssignChairProgram] = useState<Program | null>(null);
  const [chairs, setChairs] = useState<UserOption[]>([]);
  const [selectedChairID, setSelectedChairID] = useState('__none__');
  const [assignChairError, setAssignChairError] = useState('');

  const assignedChairIds = React.useMemo(() => {
    const ids = new Set<string>();
    programs.forEach((p) => {
      if (p.program_chair_id) {
        ids.add(p.program_chair_id);
      }
    });
    return ids;
  }, [programs]);
  const assignedChairCount = assignedChairIds.size;

  const emptyForm = {
    program_name: '', program_description: '', program_category: '',
    department_id: '', objectives: '', target_beneficiaries: '',
    budget_allocation: '', start_date: '', end_date: '',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadPrograms();
    loadDepartments(role);
    fetch(`${API}/users/by-role?role=program_chair`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
      .then(d => setChairs(d.users || []))
      .catch(() => setChairs([]));
  }, []);

  const loadPrograms = async () => {
    try {
      const res = await fetch(`${API}/programs`, { headers: authHeaders() });
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadDepartments = async (role: string) => {
    try {
      const res = await fetch(`${API}/departments`, { headers: authHeaders() });
      const data = await res.json();
      let filtered = data.departments || [];
      if (role !== 'admin') {
        filtered = filtered.filter(
          (d: Department) => d.department_code !== 'ADMIN' && d.department_name.toLowerCase() !== 'administration'
        );
      }
      setDepartments(filtered);
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
        budget_allocation: form.budget_allocation ? parseFloat(form.budget_allocation) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        // Admin creates = auto approved and active
        status: 'active',
        approval_status: 'approved',
      }),
    });
    if (res.ok) { await loadPrograms(); setCreateOpen(false); setForm(emptyForm); setProgramFormError(''); }
    else { const e = await res.json(); setProgramFormError(e.error || 'Failed to create program'); }
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
        budget_allocation: form.budget_allocation ? parseFloat(form.budget_allocation) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }),
    });
    if (res.ok) { await loadPrograms(); setEditOpen(false); setSelected(null); setForm(emptyForm); setProgramFormError(''); }
    else { const e = await res.json(); setProgramFormError(e.error || 'Failed to update program'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const label = status === 'completed' ? 'complete' : 'cancel';
    if (!confirm(`Mark this program as ${label}?`)) return;
    const res = await fetch(`${API}/programs/${id}/status`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) await loadPrograms();
    else { const e = await res.json(); setProgramPageError(e.error || `Failed to ${label} program`); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program? All its projects will also be affected.')) return;
    const res = await fetch(`${API}/programs/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) await loadPrograms();
    else { const e = await res.json(); setProgramPageError(e.error || 'Failed to delete program'); }
  };

  const openAssignChair = (p: Program) => {
    setAssignChairProgram(p);
    setSelectedChairID(p.program_chair_id || '__none__');
    setAssignChairError('');
    setAssignChairOpen(true);
  };

  const handleAssignChair = async () => {
    if (!assignChairProgram) return;
    if (selectedChairID !== '__none__' && assignedChairCount >= 3 && !assignedChairIds.has(selectedChairID)) {
      setAssignChairError('Program chair limit reached: only 3 distinct program chairs can be assigned.');
      return;
    }
    const res = await fetch(`${API}/programs/${assignChairProgram.id}/assign-chair`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ program_chair_id: selectedChairID === '__none__' ? null : selectedChairID }),
    });
    if (res.ok) { await loadPrograms(); setAssignChairOpen(false); }
    else {
      const text = await res.text();
      let msg = 'Failed to assign program chair';
      try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
      setAssignChairError(msg);
    }
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
      budget_allocation: p.budget_allocation?.toString() || '',
      start_date: p.start_date?.split('T')[0] || '',
      end_date: p.end_date?.split('T')[0] || '',
    });
    setEditOpen(true);
  };

  const filtered = programs.filter(p => {
    const s = p.program_name.toLowerCase().includes(search.toLowerCase()) ||
      p.program_description?.toLowerCase().includes(search.toLowerCase());
    const d = filterDept === 'all' || p.department_id === filterDept;
    const st = filterStatus === 'all' || p.status === filterStatus;
    return s && d && st;
  });

  const total = programs.length;
  const active = programs.filter(p => p.status === 'active').length;
  const completed = programs.filter(p => p.status === 'completed').length;
  const cancelled = programs.filter(p => p.status === 'cancelled').length;

  const [activeTab, setActiveTab] = useState<'programs' | 'requests'>('programs');
  // const params = useParams();
  // const role = params?.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant={activeTab === 'programs' ? 'default' : 'outline'} onClick={() => setActiveTab('programs')}>Programs</Button>
          <Button variant={activeTab === 'requests' ? 'default' : 'outline'} onClick={() => setActiveTab('requests')}>Program Requests</Button>
        </div>
        {activeTab === 'programs' ? (
          <div>
            {programPageError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{programPageError}</span>
                </div>
                <button onClick={() => setProgramPageError('')} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            )}
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Program Management</h1>
                <p className="text-slate-500 mt-1">Manage extension service programs and their projects</p>
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
                    <DialogDescription>Add a new extension service program</DialogDescription>
                  </DialogHeader>
                  <ProgramForm formData={form} setFormData={setForm} departments={departments}
                    onSubmit={handleCreate} onCancel={() => { setCreateOpen(false); setProgramFormError(''); }} submitLabel="Create Program" error={programFormError} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Programs', value: total, icon: Layers, color: 'text-slate-700', bg: 'bg-slate-50' },
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

            {/* Filters + Table */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search programs..." value={search}
                    onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.department_code}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                          No programs found
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
                        <TableCell>{p.budget_allocation ? `₱${p.budget_allocation.toLocaleString()}` : '-'}</TableCell>
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
                              <DropdownMenuItem onClick={() => openAssignChair(p)}>
                                <UserCog className="w-4 h-4 mr-2" /> Assign Program Chair
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

            {/* Assign Program Chair Dialog */}
            <Dialog open={assignChairOpen} onOpenChange={v => { setAssignChairOpen(v); if (!v) setAssignChairError(''); }}>
              <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5" /> Assign Program Chair</DialogTitle>
                  <DialogDescription>{assignChairProgram?.program_name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Program chair usage: <span className="font-semibold">{assignedChairCount}/3</span>
                  </div>
                  {assignChairError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{assignChairError}</span>
                    </div>
                  )}
                  {assignChairProgram?.program_chair_id && (() => {
                    const current = chairs.find(c => c.id === assignChairProgram.program_chair_id);
                    return current ? (
                      <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                        <UserAvatar user={current} size="md" />
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Currently assigned</p>
                          <p className="text-sm font-medium text-slate-800">{current.first_name} {current.last_name}</p>
                          <p className="text-xs text-slate-400">{current.email}</p>
                          {current.department && <p className="text-xs text-slate-400">{current.department}</p>}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Select Program Chair</label>
                    <UserPickerList
                      users={chairs}
                      value={selectedChairID}
                      onChange={setSelectedChairID}
                      emptyLabel="No active program chairs. Register a user with the program_chair role first."
                      isDisabled={(chair) => assignedChairCount >= 3 && !assignedChairIds.has(chair.id)}
                      disabledReason="Global limit reached (3 chairs). Use one of the currently assigned chairs."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAssignChairOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssignChair}>Save Assignment</Button>
                  </div>
                </div>
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
                        <label className="text-sm font-medium text-slate-700">Budget Allocation</label>
                        <p className="mt-1 text-slate-600 text-sm">
                          {selected.budget_allocation ? `₱${selected.budget_allocation.toLocaleString()}` : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Spent Budget</label>
                        <p className="mt-1 text-slate-600 text-sm">₱{(selected.spent_budget || 0).toLocaleString()}</p>
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
                    <div>
                      <label className="text-sm font-medium text-slate-700">Program Chair</label>
                      {(() => {
                        const chair = chairs.find(c => c.id === selected.program_chair_id);
                        return chair ? (
                          <div className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                            <UserAvatar user={chair} size="lg" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{chair.first_name} {chair.last_name}</p>
                              <p className="text-xs text-slate-400">{chair.email}</p>
                              {chair.department && <p className="text-xs text-slate-400">{chair.department}</p>}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-slate-400 text-sm italic">No program chair assigned</p>
                        );
                      })()}
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
          </div>
        ) : (
          <ProgramChairRequestManagement />
        )}
      </div>
    </div>
  );
}