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
  staff_originated?: boolean;
  created_by?: string;
  created_by_role?: string;
  created_by_first_name?: string;
  created_by_last_name?: string;
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
  role?: string;
  department?: string;
  assigned_program_chair_id?: string;
  avatar_url?: string | null;
}

interface ChairDepartmentBudget {
  department_id?: string;
  allocated_budget?: number;
  spent_budget?: number;
}

function UserAvatar({ user, size = 'md' }: { user: UserOption; size?: 'sm' | 'md' | 'lg' }) {
  const szClass = size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-xs';
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
  return user.avatar_url
    ? <img src={user.avatar_url} alt={initials} className={`${szClass} rounded-full object-cover border border-slate-200 shrink-0`} />
    : <div className={`${szClass} rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center border border-slate-300 shrink-0`}>{initials}</div>;
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
                value === u.id ? 'bg-red-50' : disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'
              }`}
            >
              <UserAvatar user={u} size="sm" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-slate-800 truncate">{u.first_name} {u.last_name}</span>
                <span className="text-xs text-slate-400 truncate">{u.email}</span>
                {disabled && disabledReason && <span className="text-[11px] text-amber-600 truncate">{disabledReason}</span>}
              </div>
              {value === u.id && <span className="ml-auto text-[#BA0021] text-xs font-medium">✓</span>}
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

function formatDisplayDate(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function normalize(value?: string | null) {
  return (value || '').toLowerCase();
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
    needs_funding: 'bg-yellow-100 text-yellow-800',
    planning: 'bg-purple-100 text-purple-700',
    pending_approval: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace(/_/g, ' ').toUpperCase()}
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

      {/* Schedule */}
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
function ProjectForm({ formData, setFormData, onSubmit, onCancel, submitLabel, error, showBudgetSection = true }: {
  formData: any; setFormData: any;
  onSubmit: () => void; onCancel: () => void; submitLabel: string; error?: string; showBudgetSection?: boolean;
}) {
  const budgetLocked = submitLabel.toLowerCase().includes('update');
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
      {showBudgetSection && (
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
                disabled={budgetLocked}
                className="pl-7 border-slate-300" />
            </div>
            <p className="text-xs text-slate-500">
              {budgetLocked
                ? 'Budget allocation is locked after project creation. Spending is adjusted through approved budget requests.'
                : 'Project allocation is a planning cap. Actual spend is released through approved budget requests.'}
            </p>
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
      )}

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
  const [budgetRequests, setBudgetRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProjectLifecycle, setFilterProjectLifecycle] = useState<'all' | 'needs_funding' | 'pending_approval' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');
  const [assignHeadOpen, setAssignHeadOpen] = useState(false);
  const [assignHeadProject, setAssignHeadProject] = useState<Project | null>(null);
  const [heads, setHeads] = useState<UserOption[]>([]);
  const [staffUsers, setStaffUsers] = useState<UserOption[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserOption[]>([]);
  const [chairUsers, setChairUsers] = useState<UserOption[]>([]);
  const [selectedHeadID, setSelectedHeadID] = useState('__none__');
  const [assignHeadError, setAssignHeadError] = useState('');
  const [projectTab, setProjectTab] = useState<'all' | 'pending'>('all');
  const [deleteProjectDialog, setDeleteProjectDialog] = useState<Project | null>(null);
  const [deleteProjectError, setDeleteProjectError] = useState<string | null>(null);
  const [projectApprovalDialog, setProjectApprovalDialog] = useState<{ project: Project; approvalStatus: 'approved' | 'rejected' } | null>(null);
  const [viewProjectDialog, setViewProjectDialog] = useState<Project | null>(null);
  const [viewStaffIDs, setViewStaffIDs] = useState<string[]>([]);
  const [viewStaffLoading, setViewStaffLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [departmentAllocationCap, setDepartmentAllocationCap] = useState<number | null>(null);
  const [departmentAllocationSpent, setDepartmentAllocationSpent] = useState<number | null>(null);
  const emptyForm = { project_name: '', project_description: '', objectives: '', budget_allocated: '', start_date: '', end_date: '' };
  const [form, setForm] = useState(emptyForm);

  // Fetch all budget requests for the program
  const loadBudgetRequests = async () => {
    try {
      const res = await fetch(`${API}/budget-requests`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Filter to only budget requests for projects in this program
        const allRequests = data.budget_requests || data.requests || [];
        const programProjectIds = new Set(projects.map(p => p.id));
        const filtered = allRequests.filter((r: any) => 
          programProjectIds.has(r.project_id)
        );
        setBudgetRequests(filtered);
      } else {
        setBudgetRequests([]);
      }
    } catch {
      setBudgetRequests([]);
    }
  };

  const loadDepartmentAllocationCap = async () => {
    if (!program.program_chair_id || !program.department_id) {
      setDepartmentAllocationCap(null);
      setDepartmentAllocationSpent(null);
      return;
    }
    try {
      const res = await fetch(
        `${API}/budgets/chair-departments?chair_id=${program.program_chair_id}&department_id=${program.department_id}`,
        { headers: authHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        const item: ChairDepartmentBudget | undefined = data?.chair_department_budgets?.[0];
        setDepartmentAllocationCap(Number(item?.allocated_budget || 0));
        setDepartmentAllocationSpent(Number(item?.spent_budget || 0));
      } else {
        setDepartmentAllocationCap(null);
        setDepartmentAllocationSpent(null);
      }
    } catch {
      setDepartmentAllocationCap(null);
      setDepartmentAllocationSpent(null);
    }
  };

  useEffect(() => {
    loadProjects();
    loadDepartmentAllocationCap();
    Promise.all([
      fetch(`${API}/users/by-role?role=project_head`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
        .then(d => setHeads(d.users || []))
        .catch(() => setHeads([])),
      fetch(`${API}/users/by-role?role=staff`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
        .then(d => setStaffUsers(d.users || []))
        .catch(() => setStaffUsers([])),
      fetch(`${API}/users/by-role?role=admin`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
        .then(d => setAdminUsers(d.users || []))
        .catch(() => setAdminUsers([])),
      fetch(`${API}/users/by-role?role=program_chair`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.resolve({ users: [] }))
        .then(d => setChairUsers(d.users || []))
        .catch(() => setChairUsers([])),
    ]);
  }, []);

  // Load budget requests whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      loadBudgetRequests();
    } else {
      setBudgetRequests([]);
    }
  }, [projects]);

  const eligibleHeads = React.useMemo(() => {
    if (!program.program_chair_id) {
      return [];
    }
    return heads.filter((h) => h.assigned_program_chair_id === program.program_chair_id);
  }, [heads, program.program_chair_id]);

  const loadProjects = async () => {
    try {
      // Refresh user lists to ensure we have all possible creators
      const [headRes, staffRes, adminRes] = await Promise.all([
        fetch(`${API}/users/by-role?role=project_head`, { headers: authHeaders() }),
        fetch(`${API}/users/by-role?role=staff`, { headers: authHeaders() }),
        fetch(`${API}/users/by-role?role=admin`, { headers: authHeaders() }),
      ]);
      
      if (headRes.ok) {
        const headData = await headRes.json();
        setHeads(headData.users || []);
      }
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaffUsers(staffData.users || []);
      }
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setAdminUsers(adminData.users || []);
      }
      
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
      return `Project end date cannot exceed the program end date (${formatDisplayDate(program.end_date)}).`;
    const budget = parseFloat(form.budget_allocated);
    if (!Number.isFinite(budget) || budget <= 0) return 'Enter a budget greater than 0.';
    if (departmentAllocationCap === null)
      return 'No department allocation found for this program. Assign a Program Chair and set allocation in Budget Management first.';
    const committedExcludingCurrent = projects
      .filter(p => p.id !== selected?.id)
      .filter(p => p.approval_status !== 'rejected' && p.status !== 'cancelled')
      .reduce((s, p) => s + (p.budget_allocated || 0), 0);
    const remaining = departmentAllocationCap - committedExcludingCurrent;
    if (budget > remaining)
      return `Budget ₱${budget.toLocaleString()} exceeds remaining department allocation of ₱${Math.max(0, remaining).toLocaleString()}.`;
    return '';
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
    setDeleteProjectError(null);
    const res = await fetch(`${API}/projects/${deleteProjectDialog.id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      await loadProjects();
      setDeleteProjectDialog(null);
    } else {
      const e = await res.json();
      const errorMsg = e.error || 'Failed to delete project';
      if (res.status === 409) {
        setDeleteProjectError(errorMsg);
      } else {
        setPageError(errorMsg);
        setDeleteProjectDialog(null);
      }
    }
  };

  const handleProjectApproval = (project: Project, approvalStatus: 'approved' | 'rejected') => {
    setProjectApprovalDialog({ project, approvalStatus });
    setReviewNotes('');
  };

  const submitProjectApproval = async () => {
    if (!projectApprovalDialog) return;
    const { project, approvalStatus } = projectApprovalDialog;
    const action = approvalStatus === 'approved' ? 'approve' : 'reject';
    if (approvalStatus === 'rejected' && !reviewNotes.trim()) {
      setPageError('Review notes are required when rejecting a project.');
      return;
    }

    const res = await fetch(`${API}/projects/${project.id}/approval`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ approval_status: approvalStatus, review_notes: reviewNotes.trim() || null }),
    });

    if (res.ok) {
      await loadProjects();
      setPageSuccess(approvalStatus === 'approved' ? 'Project approved successfully.' : 'Project declined successfully.');
      setProjectApprovalDialog(null);
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

  const approvedBudgetByProject = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const req of budgetRequests) {
      if (normalize(req?.status) !== 'approved') continue;
      const prev = map.get(req.project_id) || 0;
      map.set(req.project_id, prev + Number(req.amount || 0));
    }
    return map;
  }, [budgetRequests]);

  const approvedBudgetRequestCountByProject = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const req of budgetRequests) {
      if (normalize(req?.status) !== 'approved') continue;
      const prev = map.get(req.project_id) || 0;
      map.set(req.project_id, prev + 1);
    }
    return map;
  }, [budgetRequests]);

  const hasApprovedBudgetRequest = React.useCallback((projectID?: string | null) => {
    if (!projectID) return false;
    return (approvedBudgetRequestCountByProject.get(projectID) || 0) > 0;
  }, [approvedBudgetRequestCountByProject]);

  const projectNeedsFunding = React.useCallback((project?: Project | null) => {
    if (!project) return false;
    return normalize(project.approval_status) === 'approved' && !hasApprovedBudgetRequest(project.id);
  }, [hasApprovedBudgetRequest]);

  const projectLifecycleLabel = React.useCallback((project: Project) => {
    if (projectNeedsFunding(project)) return 'needs_funding';
    return project.status;
  }, [projectNeedsFunding]);

  const projectBudgetDisplay = React.useCallback((project: Project) => {
    if (projectNeedsFunding(project)) return 0;
    return Number(approvedBudgetByProject.get(project.id) || project.budget_allocated || 0);
  }, [approvedBudgetByProject, projectNeedsFunding]);

  const pendingProjects = projects.filter((p) => p.approval_status === 'pending');
  const scopedProjects = projectTab === 'pending' ? pendingProjects : projects;
  const filtered = scopedProjects.filter((p) => {
    const matchesSearch = p.project_name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterProjectLifecycle === 'all') return true;
    return projectLifecycleLabel(p) === filterProjectLifecycle;
  });
  const programDepartment = departments.find((d) => d.id === program.department_id);

  const verificationBadge = (p: Project) => {
    const isForwarded = p.approval_status === 'pending' && !!p.project_head_id && p.status !== 'pending_approval';
    if (p.approval_status === 'approved') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">FINAL APPROVED</span>;
    }
    if (p.approval_status === 'rejected') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">FINAL DECLINED</span>;
    }
    if (isForwarded) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-indigo-100 text-indigo-800 border-indigo-200">PENDING CHAIR FINAL REVIEW</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-100 text-amber-800 border-amber-200">AWAITING HEAD REVIEW</span>;
  };

  const requesterName = (p: Project) => {
    if (p.created_by_first_name && p.created_by_last_name) {
      return `${p.created_by_first_name} ${p.created_by_last_name}`.trim();
    }
    // Fallback for old data
    if (p.staff_originated === true) return 'Department Staff';
    return 'Admin';
  };

  const requesterRole = (p: Project) => {
    if (p.created_by_role) {
      const role = (p.created_by_role || '').trim();
      if (role) {
        return role
          .split('_')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }
    }
    // Fallback for old data
    if (p.staff_originated === true) return 'Staff';
    if (p.created_by) return 'Unknown Role';
    return 'Admin';
  };

  const requesterUserByID = React.useMemo(() => {
    const map = new Map<string, UserOption>();
    [...staffUsers, ...adminUsers, ...chairUsers].forEach(u => map.set(u.id, u));
    return map;
  }, [staffUsers, adminUsers, chairUsers]);

  const requesterUser = (p: Project): UserOption => {
    const existing = p.created_by ? requesterUserByID.get(p.created_by) : undefined;
    if (existing) return existing;

    const fallbackName = requesterName(p).split(' ');
    return {
      id: p.created_by || p.id,
      first_name: fallbackName[0] || 'User',
      last_name: fallbackName.slice(1).join(' ') || '',
      email: '',
      role: p.staff_originated ? 'staff' : 'admin',
      avatar_url: null,
    };
  };

  useEffect(() => {
    if (!viewProjectDialog?.id) {
      setViewStaffIDs([]);
      setViewStaffLoading(false);
      return;
    }

    let active = true;
    const loadViewStaffAssignments = async () => {
      setViewStaffLoading(true);
      try {
        const res = await fetch(`${API}/projects/${viewProjectDialog.id}/staff-assignments`, { headers: authHeaders() });
        if (!res.ok) {
          if (active) setViewStaffIDs([]);
          return;
        }
        const payload = await res.json();
        const ids = Array.isArray(payload?.staff_ids)
          ? payload.staff_ids.filter((id: unknown): id is string => typeof id === 'string')
          : [];
        if (active) setViewStaffIDs(ids);
      } catch {
        if (active) setViewStaffIDs([]);
      } finally {
        if (active) setViewStaffLoading(false);
      }
    };

    void loadViewStaffAssignments();
    return () => {
      active = false;
    };
  }, [viewProjectDialog?.id]);

  const total = projects.length;
  const active = projects.filter(p => p.status === 'in_progress').length;
  const committedBudget = projects
    .filter(p => p.approval_status !== 'rejected' && p.status !== 'cancelled')
    .reduce((s, p) => s + (p.budget_allocated || 0), 0);
  const programBudget = departmentAllocationCap ?? 0;
  const deductedBudget = Number(departmentAllocationSpent || 0);
  const remainingBudget = programBudget - deductedBudget;
  const usedPct = programBudget > 0 ? Math.min(100, Math.round((deductedBudget / programBudget) * 100)) : 0;

  return (
    <div className="space-y-6">
      {pageSuccess && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{pageSuccess}</span>
          </div>
          <button onClick={() => setPageSuccess('')} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}
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

        {/* Budget tracker */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Department Allocation Budget</span>
            <span className="text-xs text-slate-500">{usedPct}% utilized</span>
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
              <div className="text-xs text-slate-500 mb-0.5">Department Allocation</div>
              <div className="text-sm font-bold text-slate-800">₱{programBudget.toLocaleString()}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-0.5">Deducted Total</div>
              <div className="text-sm font-bold text-orange-700">₱{deductedBudget.toLocaleString()}</div>
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

      {/* Projects table */}
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
                className={`px-3 py-1.5 text-sm border-l border-slate-200 ${projectTab === 'pending' ? 'bg-[#BA0021] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                Pending Projects ({pendingProjects.length})
              </button>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder={projectTab === 'pending' ? 'Search pending projects...' : 'Search projects...'} value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterProjectLifecycle} onValueChange={(v: 'all' | 'needs_funding' | 'pending_approval' | 'in_progress' | 'completed' | 'cancelled') => setFilterProjectLifecycle(v)}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="All Lifecycle" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Lifecycle</SelectItem>
                <SelectItem value="needs_funding">Needs Funding</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2" />
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading projects...</div>
        ) : (
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="bg-slate-50 border-b text-left">
                <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Name</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lifecycle</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verification</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {projectTab === 'pending' ? 'No pending projects found under this program' : 'No projects found under this program'}
                  </TableCell>
                </TableRow>
              ) : filtered.map(p => (
                <TableRow key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setViewProjectDialog(p)}>
                  <TableCell className="px-4 py-3 font-medium text-slate-900">{p.project_name}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-700 text-xs">
                    <span className="flex items-center gap-2">
                      <UserAvatar user={requesterUser(p)} size="sm" />
                      <span>{requesterName(p)}</span>
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1 ml-8">{requesterRole(p)}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3"><StatusBadge status={projectLifecycleLabel(p)} /></TableCell>
                  <TableCell className="px-4 py-3">{verificationBadge(p)}</TableCell>
                  <TableCell className="px-4 py-3 font-medium text-slate-900">₱{projectBudgetDisplay(p).toLocaleString()}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{formatDisplayDate(p.created_at)}</TableCell>
                  <TableCell className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    {(() => {
                      const pendingFinalDecision = p.approval_status === 'pending';
                      const staffAwaitingHeadReview = !!p.staff_originated && (p.status === 'pending_approval' || !p.project_head_id);
                      const canFinalReview = pendingFinalDecision && !staffAwaitingHeadReview;
                      return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={() => handleProjectApproval(p, 'approved')}
                          className="text-green-700"
                          disabled={!canFinalReview}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve Project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleProjectApproval(p, 'rejected')}
                          className="text-red-700"
                          disabled={!canFinalReview}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Decline Project
                        </DropdownMenuItem>
                        {staffAwaitingHeadReview && (
                          <DropdownMenuItem disabled className="text-xs text-slate-500">
                            Waiting for Project Head pre-review
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setViewProjectDialog(p)}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssignHead(p)}>
                          <UserCog className="w-4 h-4 mr-2" /> Assign Project Head
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(p)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                      )
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!deleteProjectDialog} onOpenChange={(open) => { if (!open) { setDeleteProjectDialog(null); setDeleteProjectError(null); } }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteProjectDialog?.project_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteProjectError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Cannot Delete Project</p>
                <p className="mt-1">{deleteProjectError}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {deleteProjectError ? (
              <Button variant="outline" onClick={() => { setDeleteProjectDialog(null); setDeleteProjectError(null); }}>Close</Button>
            ) : (
              <>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={confirmDeleteProject}>Delete</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!projectApprovalDialog} onOpenChange={(open) => { if (!open) setProjectApprovalDialog(null); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {projectApprovalDialog?.approvalStatus === 'approved' ? 'Approve Project' : 'Decline Project'}
            </DialogTitle>
            <DialogDescription>
              {projectApprovalDialog
                ? `Are you sure you want to ${projectApprovalDialog.approvalStatus === 'approved' ? 'approve' : 'decline'} ${projectApprovalDialog.project.project_name}?`
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
              {projectApprovalDialog?.approvalStatus === 'approved' ? 'Approve' : 'Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) setFormError(''); }}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-slate-700 font-medium">Current Department Funds</p>
            {departmentAllocationCap === null ? (
              <p className="text-red-600 mt-1">No department allocation found. Assign Program Chair and set allocation in Budget Management first.</p>
            ) : (
              <p className="text-slate-600 mt-1">
                Cap: <span className="font-semibold text-slate-900">₱{programBudget.toLocaleString()}</span>
                {' · '}Planned: <span className="font-semibold text-slate-900">₱{committedBudget.toLocaleString()}</span>
                {' · '}Deducted: <span className="font-semibold text-slate-900">₱{deductedBudget.toLocaleString()}</span>
                {' · '}Remaining: <span className={`font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-700'}`}>₱{Math.max(0, remainingBudget).toLocaleString()}</span>
              </p>
            )}
          </div>
          <ProjectForm formData={form} setFormData={setForm}
            onSubmit={handleUpdate} onCancel={() => { setEditOpen(false); setFormError(''); }} submitLabel="Update Project" error={formError} showBudgetSection={false} />
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
              <Button className="bg-[#BA0021] hover:bg-[#930018] text-white" onClick={handleAssignHead}>Save Assignment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewProjectDialog} onOpenChange={(open) => { if (!open) setViewProjectDialog(null); }}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewProjectDialog?.project_name}</DialogTitle>
            <DialogDescription>Project Details</DialogDescription>
          </DialogHeader>
          {viewProjectDialog && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={projectLifecycleLabel(viewProjectDialog)} />
                {verificationBadge(viewProjectDialog)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Requested By</label>
                  <div className="mt-1 flex items-center gap-2">
                    <UserAvatar user={requesterUser(viewProjectDialog)} size="md" />
                    <div>
                      <p className="text-slate-600 text-sm">{requesterName(viewProjectDialog)}</p>
                      <p className="text-xs text-slate-500">{requesterRole(viewProjectDialog)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Created</label>
                  <p className="mt-1 text-slate-600 text-sm">{formatDisplayDate(viewProjectDialog.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <p className="mt-1 text-slate-600 text-sm">{formatDisplayDate(viewProjectDialog.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <p className="mt-1 text-slate-600 text-sm">{formatDisplayDate(viewProjectDialog.end_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Project Head</label>
                  {(() => {
                    const head = heads.find(h => h.id === viewProjectDialog.project_head_id);
                    if (!head) {
                      return <p className="mt-1 text-slate-500 text-sm">Unassigned</p>;
                    }
                    return (
                      <div className="mt-1 flex items-center gap-2">
                        <UserAvatar user={head} size="sm" />
                        <span className="text-slate-700 text-sm">{head.first_name} {head.last_name}</span>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Budget Allocation</label>
                  <p className="mt-1 text-slate-600 text-sm">₱{projectBudgetDisplay(viewProjectDialog).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Funding Status</label>
                  <p className="mt-1 text-slate-600 text-sm">{projectNeedsFunding(viewProjectDialog) ? 'Needs Funding' : 'Funded / Not Required Yet'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProjectDialog.project_description || 'No description'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Objectives</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProjectDialog.objectives || 'Not defined'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Assigned Staff</label>
                {viewStaffLoading ? (
                  <p className="mt-1 text-slate-500 text-sm">Loading assigned staff...</p>
                ) : viewStaffIDs.length === 0 ? (
                  <p className="mt-1 text-slate-500 text-sm">No staff assigned yet.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewStaffIDs.map((id) => {
                      const staff = staffUsers.find((s) => s.id === id);
                      const fullName = staff ? `${staff.first_name} ${staff.last_name}`.trim() : id;
                      return (
                        <span key={id} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                          {fullName}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Funding History Section */}
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1 mt-4">Funding History</label>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Date</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Amount</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(budgetRequests?.filter?.(r => r.project_id === viewProjectDialog.id)?.length === 0) ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-center text-slate-400">No budget requests found for this project.</td>
                        </tr>
                      ) : (
                        budgetRequests
                          ?.filter?.(r => r.project_id === viewProjectDialog.id)
                          ?.sort?.((a, b) => (a.id > b.id ? 1 : -1))
                          ?.map?.((r, idx) => (
                            <tr key={r.id || idx} className="border-t border-slate-200">
                              <td className="px-4 py-2">{r.created_at ? formatDisplayDate(r.created_at) : '-'}</td>
                              <td className="px-4 py-2">₱{Number(r.amount || 0).toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${normalize(r.status) === 'approved' ? 'bg-green-100 text-green-700' : normalize(r.status) === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {String(r.status || '').charAt(0).toUpperCase() + String(r.status || '').slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => {
                    const projectToEdit = viewProjectDialog;
                    setViewProjectDialog(null);
                    if (projectToEdit) {
                      openEdit(projectToEdit);
                    }
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Project
                </Button>
              </div>
            </div>
          )}
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
  const [programStatusDialog, setProgramStatusDialog] = useState<{ id: string; status: string; label: string } | null>(null);
  const [deleteProgramDialogID, setDeleteProgramDialogID] = useState<string | null>(null);

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
    start_date: '', end_date: '',
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
      let filtered = filterVisibleDepartments((data.departments || []) as Department[]);
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
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }),
    });
    if (res.ok) { await loadPrograms(); setEditOpen(false); setSelected(null); setForm(emptyForm); setProgramFormError(''); }
    else { const e = await res.json(); setProgramFormError(e.error || 'Failed to update program'); }
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
    if (res.ok) await loadPrograms();
    else { const e = await res.json(); setProgramPageError(e.error || `Failed to ${programStatusDialog.label} program`); }
    setProgramStatusDialog(null);
  };

  const handleDelete = (id: string) => {
    setDeleteProgramDialogID(id);
  };

  const confirmDeleteProgram = async () => {
    if (!deleteProgramDialogID) return;
    const res = await fetch(`${API}/programs/${deleteProgramDialogID}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) await loadPrograms();
    else { const e = await res.json(); setProgramPageError(e.error || 'Failed to delete program'); }
    setDeleteProgramDialogID(null);
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button className={activeTab === 'programs' ? 'bg-[#BA0021] hover:bg-[#930018] text-white' : ''} variant={activeTab === 'programs' ? 'default' : 'outline'} onClick={() => setActiveTab('programs')}>Programs</Button>
          <Button className={activeTab === 'requests' ? 'bg-[#BA0021] hover:bg-[#930018] text-white' : ''} variant={activeTab === 'requests' ? 'default' : 'outline'} onClick={() => setActiveTab('requests')}>Program Requests</Button>
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
                  <Button className="flex items-center gap-2 bg-[#BA0021] hover:bg-[#930018] text-white" onClick={() => { setForm(emptyForm); setProgramFormError(''); }}>
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
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b text-left">
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Program Name</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Beneficiary</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Overall Budget</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="px-4 py-12 text-center text-slate-400">
                          No programs found
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(p => (
                      <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="px-4 py-3">
                          <button
                            onClick={() => setDrillProgram(p)}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            {p.program_name}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-3">{p.program_category || '-'}</TableCell>
                        <TableCell className="px-4 py-3">{(() => {
                          const department = departments.find(d => d.id === p.department_id)
                          return department ? `${department.department_name} (${department.department_code})` : '-'
                        })()}</TableCell>
                        <TableCell className="px-4 py-3">{p.target_beneficiaries || '-'}</TableCell>
                        <TableCell className="px-4 py-3">{p.spent_budget ? `₱${p.spent_budget.toLocaleString()}` : '₱0'}</TableCell>
                        <TableCell className="px-4 py-3"><StatusBadge status={p.status} /></TableCell>
                        <TableCell className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{formatDisplayDate(p.created_at)}</TableCell>
                        <TableCell className="px-4 py-3 text-right">
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
                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'cancelled')} className="text-red-600">
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
                    <Button className="bg-[#BA0021] hover:bg-[#930018] text-white" onClick={handleAssignChair}>Save Assignment</Button>
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
                          {selected.start_date ? formatDisplayDate(selected.start_date) : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">End Date</label>
                        <p className="mt-1 text-slate-600 text-sm">
                          {selected.end_date ? formatDisplayDate(selected.end_date) : 'Not set'}
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
                      <Button className="bg-[#BA0021] hover:bg-[#930018] text-white" onClick={() => { setViewOpen(false); setDrillProgram(selected); }}>
                        <FolderOpen className="w-4 h-4 mr-2" /> View Projects
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <ProgramChairRequestManagement onRequestApproved={loadPrograms} />
        )}
      </div>
    </div>
  );
}