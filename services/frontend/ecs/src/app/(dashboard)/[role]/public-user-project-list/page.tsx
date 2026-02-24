"use client";

import { Badge } from "@/shared/components/ui/Badge";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/Select";
import {
  Search, Calendar, ArrowLeft, FolderOpen,
  Layers, RefreshCw, Target, Wallet, CalendarRange
} from "lucide-react";
import { useState, useEffect } from "react";

const API = 'http://localhost:8081/api/v1';
function getToken() { return localStorage.getItem('auth_token'); }
function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

interface Program {
  id: string;
  program_name: string;
  program_description?: string;
  program_category?: string;
  objectives?: string;
  target_beneficiaries?: string;
  budget_allocation?: number;
  start_date?: string;
  end_date?: string;
  status: string;
  approval_status: string;
}

interface Project {
  id: string;
  project_name: string;
  project_description?: string;
  objectives?: string;
  budget_allocated?: number;
  budget_used: number;
  start_date?: string;
  end_date?: string;
  status: string;
  approval_status: string;
  program_id: string;
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
    in_progress: 'bg-green-100 text-green-700',
    planning: 'bg-purple-100 text-purple-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function fmt(n?: number | null) {
  return n == null ? '—' : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Program card (drill-down) ─────────────────────────────────────────────────
function ProgramCard({ program, onClick }: { program: Program; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-slate-800 text-base leading-snug group-hover:text-indigo-600 transition-colors">
            {program.program_name}
          </h3>
          <StatusBadge status={program.status} />
        </div>
        {program.program_description && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
            {program.program_description}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
          {program.program_category && (
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" /> {program.program_category}
            </span>
          )}
          {program.budget_allocation != null && (
            <span className="flex items-center gap-1">
              <Wallet className="w-3 h-3" /> {fmt(program.budget_allocation)} allocated
            </span>
          )}
          {program.start_date && (
            <span className="flex items-center gap-1">
              <CalendarRange className="w-3 h-3" />
              {fmtDate(program.start_date)} – {fmtDate(program.end_date)}
            </span>
          )}
          {program.target_beneficiaries && (
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" /> {program.target_beneficiaries}
            </span>
          )}
        </div>
      </div>
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
        <span className="text-xs text-slate-400">Click to view projects</span>
        <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </div>
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-800 text-base leading-snug">{project.project_name}</h3>
          <StatusBadge status={project.status} />
        </div>
        {project.project_description && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-3">
            {project.project_description}
          </p>
        )}
        {project.objectives && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Objectives</p>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{project.objectives}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Wallet className="w-3 h-3 text-slate-400" />
            <span className="font-medium text-slate-700">{fmt(project.budget_allocated)}</span> budget
          </span>
          {project.start_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {fmtDate(project.start_date)} – {fmtDate(project.end_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectsViewPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load programs on mount
  useEffect(() => {
    setLoadingPrograms(true);
    fetch(`${API}/programs`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        // Always set programs as an array
        if (Array.isArray(data.programs)) {
          setPrograms(data.programs);
        } else if (Array.isArray(data)) {
          setPrograms(data);
        } else {
          setPrograms([]);
        }
      })
      .catch(() => setPrograms([]))
      .finally(() => setLoadingPrograms(false));
  }, []);

  // Load projects when a program is selected
  const openProgram = async (program: Program) => {
    setSelectedProgram(program);
    setProjects([]);
    setSearch('');
    setStatusFilter('all');
    setLoadingProjects(true);
    try {
      const r = await fetch(`${API}/projects?program_id=${program.id}`, { headers: authHeaders() });
      const data = r.ok ? await r.json() : {};
      setProjects(data.projects ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.project_name.toLowerCase().includes(q) || (p.project_description ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Programs list view ──────────────────────────────────────────────────────
  if (!selectedProgram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Extension Projects Directory</h1>
              <p className="text-slate-500 mt-1">Browse active programs and their projects</p>
            </div>
            <Badge className="bg-indigo-600 text-white px-4 py-2">
              <FolderOpen className="h-4 w-4 mr-2" /> Programs
            </Badge>
          </div>

          {/* Programs grid */}
          {loadingPrograms ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading programs...
            </div>
          ) : !Array.isArray(programs) || programs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FolderOpen className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-base font-medium">No programs available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {programs.map(p => (
                <ProgramCard key={p.id} program={p} onClick={() => openProgram(p)} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Projects drill-down view ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedProgram(null)} className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-1" /> Programs
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{selectedProgram.program_name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Projects in this program</p>
          </div>
          <StatusBadge status={selectedProgram.status} />
        </div>

        {/* Program info strip */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          {selectedProgram.program_category && (
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-400" /> {selectedProgram.program_category}</span>
          )}
          {selectedProgram.budget_allocation != null && (
            <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4 text-slate-400" /> {fmt(selectedProgram.budget_allocation)} budget</span>
          )}
          {selectedProgram.start_date && (
            <span className="flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-slate-400" />
              {fmtDate(selectedProgram.start_date)} – {fmtDate(selectedProgram.end_date)}
            </span>
          )}
          {selectedProgram.target_beneficiaries && (
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-slate-400" /> {selectedProgram.target_beneficiaries}</span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Count */}
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span>
          {filtered.length !== projects.length && <> of <span className="font-semibold text-slate-700">{projects.length}</span></>} projects
        </p>

        {/* Project grid */}
        {loadingProjects ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">{projects.length === 0 ? 'No projects in this program yet' : 'No projects match your search'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
