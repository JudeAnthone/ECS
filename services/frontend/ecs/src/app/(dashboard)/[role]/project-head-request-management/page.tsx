"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  CheckCircle2,
  CircleDashed,
  Clock,
  ClipboardList,
  Filter,
  FolderKanban,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  Wallet,
  MoreVertical,
  Eye,
  FolderOpen,
} from 'lucide-react'

const API = 'http://localhost:8081/api/v1'

type ProgramProjectsTab = 'all' | 'assign_staff' | 'task_management'

interface CurrentUser {
  id: string
  first_name?: string
  last_name?: string
  department?: string
}

interface Program {
  id: string
  program_name: string
  program_description?: string | null
  program_category?: string | null
  department_id?: string | null
  status?: string | null
  created_at?: string
  target_beneficiaries?: string | null
  objectives?: string | null
  start_date?: string | null
  end_date?: string | null
  program_chair_id?: string | null
  spent_budget?: number | null
}

interface Department {
  id: string
  department_name: string
  department_code: string
}

interface StaffUser {
  id: string
  first_name: string
  last_name: string
  department?: string
  role: string
  avatar_url?: string | null
}

interface ProgramChairUser {
  id: string
  first_name: string
  last_name: string
  email?: string
  department?: string
  avatar_url?: string | null
}

interface Project {
  id: string
  project_name: string
  project_description?: string | null
  program_id?: string | null
  department_id?: string | null
  created_by: string
  project_head_id?: string | null
  budget_allocated?: number | null
  status: string
  approval_status: string
  created_at: string
}

interface ProjectStaffAssignment {
  projectId: string
  staffIds: string[]
}

interface ProjectFormState {
  project_name: string
  project_description: string
  objectives: string
  budget_allocated: string
  start_date: string
  end_date: string
}

type TaskStatus = 'not_started' | 'ongoing' | 'completed' | 'cancelled'

interface ProjectTask {
  id: string
  project_id: string
  title: string
  description?: string
  assignee_ids: string[]
  assignee_id?: string
  status: TaskStatus
  priority?: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string
  created_at: string
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

function normalize(v?: string | null) {
  return (v || '').trim().toLowerCase()
}

function fmtDate(date: string | null | undefined) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtBudget(n?: number | null) {
  if (n == null) return '-'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n)
}

function toUiTaskStatus(status?: string | null): TaskStatus {
  const s = normalize(status)
  if (s === 'in_progress' || s === 'ongoing') return 'ongoing'
  if (s === 'completed') return 'completed'
  if (s === 'cancelled') return 'cancelled'
  return 'not_started'
}

function toApiTaskStatus(status: TaskStatus): 'pending' | 'in_progress' | 'completed' | 'cancelled' {
  if (status === 'ongoing') return 'in_progress'
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return 'pending'
}

function toUiPriority(priority?: string | null): 'low' | 'medium' | 'high' | 'critical' {
  const p = normalize(priority)
  if (p === 'urgent' || p === 'critical') return 'critical'
  if (p === 'high') return 'high'
  if (p === 'low') return 'low'
  return 'medium'
}

function toApiPriority(priority?: string | null): 'low' | 'medium' | 'high' | 'urgent' {
  const p = normalize(priority)
  if (p === 'critical' || p === 'urgent') return 'urgent'
  if (p === 'high') return 'high'
  if (p === 'low') return 'low'
  return 'medium'
}

function StaffAvatar({ staff, size = 'md' }: { staff: StaffUser; size?: 'sm' | 'md' }) {
  const initials = `${staff.first_name?.[0] || ''}${staff.last_name?.[0] || ''}`.toUpperCase() || 'ST'
  const sizeClass = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-9 w-9 text-xs'

  if (staff.avatar_url) {
    return (
      <img
        src={staff.avatar_url}
        alt={`${staff.first_name} ${staff.last_name}`}
        className={`${sizeClass} rounded-full object-cover border border-slate-200`}
      />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center border border-slate-300`}>
      {initials}
    </div>
  )
}

function ProgramStatusBadge({ status }: { status?: string | null }) {
  const s = (status || 'draft').toLowerCase()
  const style =
    s === 'active'
      ? 'bg-green-100 text-green-800 border-green-200'
      : s === 'completed'
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : s === 'cancelled'
          ? 'bg-red-100 text-red-800 border-red-200'
          : 'bg-slate-100 text-slate-700 border-slate-200'

  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>{s.replace(/_/g, ' ').toUpperCase()}</span>
}

function LifecycleBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase()
  const style =
    s === 'in_progress'
      ? 'bg-green-100 text-green-800 border-green-200'
      : s === 'planning'
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : s === 'pending_approval'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : s === 'cancelled' || s === 'on_hold'
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-slate-100 text-slate-700 border-slate-200'

  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>{(s.replace(/_/g, ' ') || '-').toUpperCase()}</span>
}

function VerificationBadge({ project }: { project: Project }) {
  const isForwarded = project.approval_status === 'pending' && !!project.project_head_id && project.status !== 'pending_approval'

  if (project.approval_status === 'approved') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">FINAL APPROVED</span>
  }
  if (project.approval_status === 'rejected') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">FINAL REJECTED</span>
  }
  if (isForwarded) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-indigo-100 text-indigo-800 border-indigo-200">PENDING FINAL APPROVAL</span>
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-100 text-amber-800 border-amber-200">AWAITING HEAD REVIEW</span>
}

const emptyForm: ProjectFormState = {
  project_name: '',
  project_description: '',
  objectives: '',
  budget_allocated: '',
  start_date: '',
  end_date: '',
}

const PHRM_STORAGE_KEYS = {
  programProjectsTab: 'phrm.programProjectsTab',
  selectedProgramID: 'phrm.selectedProgramID',
  taskProjectID: 'phrm.taskProjectID',
} as const

export default function ProjectHeadRequestManagement() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [myDepartment, setMyDepartment] = useState<Department | null>(null)

  const [departmentPrograms, setDepartmentPrograms] = useState<Program[]>([])
  const [departmentStaff, setDepartmentStaff] = useState<StaffUser[]>([])
  const [programChairs, setProgramChairs] = useState<ProgramChairUser[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])

  const [selectedProgramID, setSelectedProgramID] = useState<string | null>(null)
  const [searchPrograms, setSearchPrograms] = useState('')
  const [filterProgramStatus, setFilterProgramStatus] = useState('all')
  const [searchProgramProjects, setSearchProgramProjects] = useState('')
  const [filterProjectOwner, setFilterProjectOwner] = useState<'all' | 'mine'>('all')
  const [filterProjectVerification, setFilterProjectVerification] = useState<'all' | 'accepted' | 'pending' | 'rejected'>('all')
  const [programProjectsTab, setProgramProjectsTab] = useState<ProgramProjectsTab>('all')
  const [selectedAssignProjectID, setSelectedAssignProjectID] = useState<string | null>(null)
  const [assignStaffError, setAssignStaffError] = useState('')
  const [savingAssignment, setSavingAssignment] = useState(false)
  const [pendingUnassignDialog, setPendingUnassignDialog] = useState<{
    projectID: string
    staffID: string
    staffName: string
    affectedTaskCount: number
    soloTaskCount: number
    teamTaskCount: number
  } | null>(null)
  const [staffSearch, setStaffSearch] = useState('')
  const [viewProgramDetails, setViewProgramDetails] = useState<Program | null>(null)
  const [deleteProgramDialog, setDeleteProgramDialog] = useState<Program | null>(null)
  const [deletingProgram, setDeletingProgram] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const [acceptingRequestID, setAcceptingRequestID] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<ProjectFormState>(emptyForm)
  const [createError, setCreateError] = useState('')

  const [viewProjectDetails, setViewProjectDetails] = useState<Project | null>(null)
  const [deleteProjectDialog, setDeleteProjectDialog] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState(false)

  const [staffAssignments, setStaffAssignments] = useState<ProjectStaffAssignment[]>([])
  const [taskProjectID, setTaskProjectID] = useState<string | null>(null)
  const [selectProjectDialog, setSelectProjectDialog] = useState(false)
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([])
  const [taskFilterStatus, setTaskFilterStatus] = useState<'all' | TaskStatus>('all')
  const [taskError, setTaskError] = useState('')
  const [didRestoreSession, setDidRestoreSession] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee_ids: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    due_date: '',
  })

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      if (!raw) return
      const u = JSON.parse(raw)
      setCurrentUser({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        department: u.department,
      })
    } catch {
      setCurrentUser(null)
    }
  }, [])

  // Restore session state from localStorage when currentUser is set
  useEffect(() => {
    if (!currentUser?.id) return
    
    if (typeof window !== 'undefined') {
      // Restore programProjectsTab
      const savedProgramTab = localStorage.getItem(PHRM_STORAGE_KEYS.programProjectsTab)
      if (savedProgramTab && ['all', 'assign_staff', 'task_management'].includes(savedProgramTab)) {
        setProgramProjectsTab(savedProgramTab as ProgramProjectsTab)
      }

      // Restore selectedProgramID
      const savedProgramID = localStorage.getItem(PHRM_STORAGE_KEYS.selectedProgramID)
      if (savedProgramID) {
        setSelectedProgramID(savedProgramID)
      }
      
      // Restore taskProjectID
      const savedTaskProjectID = localStorage.getItem(PHRM_STORAGE_KEYS.taskProjectID)
      if (savedTaskProjectID) {
        setTaskProjectID(savedTaskProjectID)
      }

      setDidRestoreSession(true)
    }
  }, [currentUser?.id])

  // Persist programProjectsTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && didRestoreSession) {
      localStorage.setItem(PHRM_STORAGE_KEYS.programProjectsTab, programProjectsTab)
    }
  }, [programProjectsTab, didRestoreSession])

  // Persist selectedProgramID to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && didRestoreSession) {
      if (selectedProgramID) {
        localStorage.setItem(PHRM_STORAGE_KEYS.selectedProgramID, selectedProgramID)
      } else {
        localStorage.removeItem(PHRM_STORAGE_KEYS.selectedProgramID)
      }
    }
  }, [selectedProgramID, didRestoreSession])

  // Persist taskProjectID to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && didRestoreSession) {
      if (taskProjectID) {
        localStorage.setItem(PHRM_STORAGE_KEYS.taskProjectID, taskProjectID)
      } else {
        localStorage.removeItem(PHRM_STORAGE_KEYS.taskProjectID)
      }
    }
  }, [taskProjectID, didRestoreSession])

  const loadData = useCallback(async () => {
    if (!currentUser?.id) return

    setLoading(true)
    setError('')

    try {
      const [programRes, deptRes, staffRes, chairRes] = await Promise.all([
        fetch(`${API}/programs`, { headers: authHeaders() }),
        fetch(`${API}/departments`, { headers: authHeaders() }),
        fetch(`${API}/users/by-role?role=staff`, { headers: authHeaders() }),
        fetch(`${API}/users/by-role?role=program_chair`, { headers: authHeaders() }),
      ])

      if (!programRes.ok) throw new Error('Failed to load programs')
      if (!deptRes.ok) throw new Error('Failed to load departments')
      if (!staffRes.ok) throw new Error('Failed to load staff users')

      const programData = await programRes.json()
      const deptData = await deptRes.json()
      const staffData = await staffRes.json()
      const chairData = chairRes.ok ? await chairRes.json() : { users: [] }

      const programs: Program[] = programData.programs || []
      const departments: Department[] = deptData.departments || []
      const staffs: StaffUser[] = staffData.users || []
      const chairs: ProgramChairUser[] = chairData.users || []

      const meDept = normalize(currentUser.department)
      const mappedDept = departments.find(d => normalize(d.department_code) === meDept || normalize(d.department_name) === meDept)
      setMyDepartment(mappedDept || null)

      if (!mappedDept) {
        setDepartmentPrograms([])
        setDepartmentStaff([])
        setAllProjects([])
        setStaffAssignments([])
        setError('Your account department is not mapped to an active department record.')
        setLoading(false)
        return
      }

      const scopedDeptPrograms = programs.filter(p => p.department_id === mappedDept.id)
      setDepartmentPrograms(scopedDeptPrograms)
      setProgramChairs(chairs)

      const scopedDeptStaff = staffs.filter(s => {
        const sDept = normalize(s.department)
        return sDept === normalize(mappedDept.department_code) || sDept === normalize(mappedDept.department_name)
      })
      setDepartmentStaff(scopedDeptStaff)

      if (scopedDeptPrograms.length === 0) {
        setAllProjects([])
        setStaffAssignments([])
        setLoading(false)
        return
      }

      const projectResponses = await Promise.all(
        scopedDeptPrograms.map(p => fetch(`${API}/projects?program_id=${p.id}`, { headers: authHeaders() }))
      )

      const mergedProjects: Project[] = []
      for (const res of projectResponses) {
        if (!res.ok) continue
        const payload = await res.json()
        mergedProjects.push(...(payload.projects || []))
      }
      setAllProjects(mergedProjects)

      const assignmentResponses = await Promise.all(
        mergedProjects.map(project =>
          fetch(`${API}/projects/${project.id}/staff-assignments`, { headers: authHeaders() })
        )
      )

      const mergedAssignments: ProjectStaffAssignment[] = []
      for (let i = 0; i < assignmentResponses.length; i++) {
        const res = assignmentResponses[i]
        if (!res.ok) continue
        const payload = await res.json()
        const staffIDs = Array.isArray(payload.staff_ids)
          ? payload.staff_ids.filter((id: unknown): id is string => typeof id === 'string')
          : []
        mergedAssignments.push({
          projectId: mergedProjects[i].id,
          staffIds: staffIDs,
        })
      }
      setStaffAssignments(mergedAssignments)

      if (selectedProgramID && !scopedDeptPrograms.some(p => p.id === selectedProgramID)) {
        setSelectedProgramID(null)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load project management data'
      setError(msg)
      setDepartmentPrograms([])
      setDepartmentStaff([])
      setProgramChairs([])
      setAllProjects([])
      setStaffAssignments([])
    } finally {
      setLoading(false)
    }
  }, [currentUser, selectedProgramID])

  useEffect(() => {
    loadData()
  }, [loadData])

  const departmentNameByID = useMemo(() => {
    const map = new Map<string, string>()
    if (myDepartment) {
      map.set(myDepartment.id, `${myDepartment.department_name} (${myDepartment.department_code})`)
    }
    return map
  }, [myDepartment])

  const userNameByID = useMemo(() => {
    const map = new Map<string, string>()
    departmentStaff.forEach(s => map.set(s.id, `${s.first_name} ${s.last_name}`.trim()))
    if (currentUser?.id) {
      const meName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
      if (meName) map.set(currentUser.id, meName)
    }
    return map
  }, [departmentStaff, currentUser])

  const staffByID = useMemo(() => {
    const map = new Map<string, StaffUser>()
    departmentStaff.forEach(s => map.set(s.id, s))
    return map
  }, [departmentStaff])

  const programNameByID = useMemo(() => {
    const map = new Map<string, string>()
    departmentPrograms.forEach(p => map.set(p.id, p.program_name))
    return map
  }, [departmentPrograms])

  const chairByID = useMemo(() => {
    const map = new Map<string, ProgramChairUser>()
    programChairs.forEach(c => map.set(c.id, c))
    return map
  }, [programChairs])

  const filteredPrograms = useMemo(() => {
    const q = searchPrograms.toLowerCase()
    return departmentPrograms.filter(p =>
      (p.program_name.toLowerCase().includes(q) ||
      (p.program_category || '').toLowerCase().includes(q)) &&
      (filterProgramStatus === 'all' || (p.status || 'draft') === filterProgramStatus)
    )
  }, [departmentPrograms, searchPrograms, filterProgramStatus])

  const selectedProgram = useMemo(
    () => departmentPrograms.find(p => p.id === selectedProgramID) || null,
    [departmentPrograms, selectedProgramID]
  )

  const selectedProgramIsCancelled = useMemo(
    () => normalize(selectedProgram?.status) === 'cancelled',
    [selectedProgram]
  )

  const selectedProgramProjects = useMemo(() => {
    if (!selectedProgramID) return []
    const q = searchProgramProjects.toLowerCase()
    return allProjects
      .filter(p => p.program_id === selectedProgramID)
      .filter(p =>
        p.project_name.toLowerCase().includes(q) ||
        (userNameByID.get(p.created_by) || '').toLowerCase().includes(q)
      )
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  }, [allProjects, selectedProgramID, searchProgramProjects, userNameByID])

  const selectedProgramProjectsByTab = useMemo(() => {
    if (!currentUser?.id) return selectedProgramProjects

    let filtered = selectedProgramProjects

    if (filterProjectOwner === 'mine') {
      filtered = filtered.filter(p => p.created_by === currentUser.id)
    }

    if (filterProjectVerification === 'accepted') {
      filtered = filtered.filter(p => p.approval_status === 'approved')
    } else if (filterProjectVerification === 'pending') {
      filtered = filtered.filter(p => p.approval_status === 'pending')
    } else if (filterProjectVerification === 'rejected') {
      filtered = filtered.filter(p => p.approval_status === 'rejected')
    }

    return filtered
  }, [selectedProgramProjects, currentUser, filterProjectOwner, filterProjectVerification])

  const selectedAssignProject = useMemo(
    () => selectedProgramProjects.find(p => p.id === selectedAssignProjectID) || null,
    [selectedProgramProjects, selectedAssignProjectID]
  )

  const isProjectApproved = useCallback((project?: Project | null) => {
    return normalize(project?.approval_status) === 'approved'
  }, [])

  const taskManageProjects = useMemo(
    () => selectedProgramProjects.filter(p => isProjectApproved(p)),
    [selectedProgramProjects, isProjectApproved]
  )

  const selectedTaskProject = useMemo(
    () => taskManageProjects.find(p => p.id === taskProjectID) || null,
    [taskManageProjects, taskProjectID]
  )

  const filteredDepartmentStaff = useMemo(() => {
    const q = staffSearch.toLowerCase()
    return departmentStaff.filter(staff => {
      const fullName = `${staff.first_name} ${staff.last_name}`.toLowerCase()
      return fullName.includes(q)
    })
  }, [departmentStaff, staffSearch])

  const getAssignedStaffIDs = (projectID: string) => {
    return staffAssignments.find(a => a.projectId === projectID)?.staffIds || []
  }

  const assignedTaskStaff = useMemo(() => {
    if (!selectedTaskProject) return []
    const allowed = new Set(getAssignedStaffIDs(selectedTaskProject.id))
    return departmentStaff.filter(st => allowed.has(st.id))
  }, [selectedTaskProject, departmentStaff, staffAssignments])

  const visibleProjectTasks = useMemo(() => {
    if (!selectedTaskProject) return []
    const tasks = projectTasks.filter(t => t.project_id === selectedTaskProject.id)
    if (taskFilterStatus === 'all') return tasks
    return tasks.filter(t => t.status === taskFilterStatus)
  }, [projectTasks, selectedTaskProject, taskFilterStatus])

  const applyStaffAssignmentChange = async (projectID: string, staffID: string, applyUnassignTaskRules: boolean) => {
    const previousAssignments = staffAssignments
    const previousTasks = projectTasks
    const currentStaffIDs = getAssignedStaffIDs(projectID)
    const exists = currentStaffIDs.includes(staffID)
    const nextStaffIDs = exists
      ? currentStaffIDs.filter(id => id !== staffID)
      : [...currentStaffIDs, staffID]

    setSavingAssignment(true)
    setStaffAssignments(prev => {
      const existing = prev.find(a => a.projectId === projectID)
      if (!existing) {
        return [...prev, { projectId: projectID, staffIds: nextStaffIDs }]
      }
      return prev.map(a => a.projectId === projectID ? { ...a, staffIds: nextStaffIDs } : a)
    })

    if (applyUnassignTaskRules) {
      setProjectTasks(prev => prev.map(task =>
        {
          if (task.project_id !== projectID || task.status === 'completed' || task.status === 'cancelled') {
            return task
          }
          const assigneeIDs = task.assignee_ids?.length
            ? task.assignee_ids
            : (task.assignee_id ? [task.assignee_id] : [])
          if (!assigneeIDs.includes(staffID)) {
            return task
          }

          const remainingAssignees = assigneeIDs.filter(id => id !== staffID)
          if (remainingAssignees.length === 0) {
            return { ...task, assignee_ids: [], assignee_id: undefined, status: 'cancelled' }
          }
          return { ...task, assignee_ids: remainingAssignees, assignee_id: remainingAssignees[0] }
        }
      ))
    }

    try {
      const res = await fetch(`${API}/projects/${projectID}/staff-assignments`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ staff_ids: nextStaffIDs }),
      })

      if (!res.ok) {
        const text = await res.text()
        let msg = 'Failed to persist staff assignment.'
        try {
          msg = JSON.parse(text).error || msg
        } catch {
          msg = text || msg
        }
        throw new Error(msg)
      }

      setAssignStaffError('')
    } catch (err) {
      setStaffAssignments(previousAssignments)
      setProjectTasks(previousTasks)
      setAssignStaffError(err instanceof Error ? err.message : 'Failed to persist staff assignment.')
    } finally {
      setSavingAssignment(false)
    }
  }

  const toggleAssignStaffUI = async (projectID: string, staffID: string, staffName: string) => {
    const assigned = getAssignedStaffIDs(projectID).includes(staffID)
    if (assigned) {
      const activeRelatedTasks = projectTasks.filter(task => {
        if (task.project_id !== projectID || task.status === 'completed' || task.status === 'cancelled') return false
        const assigneeIDs = task.assignee_ids?.length
          ? task.assignee_ids
          : (task.assignee_id ? [task.assignee_id] : [])
        return assigneeIDs.includes(staffID)
      })
      const affectedTaskCount = activeRelatedTasks.length
      const soloTaskCount = activeRelatedTasks.filter(task => {
        const assigneeIDs = task.assignee_ids?.length
          ? task.assignee_ids
          : (task.assignee_id ? [task.assignee_id] : [])
        return assigneeIDs.length <= 1
      }).length
      const teamTaskCount = affectedTaskCount - soloTaskCount

      if (affectedTaskCount > 0) {
        setPendingUnassignDialog({
          projectID,
          staffID,
          staffName,
          affectedTaskCount,
          soloTaskCount,
          teamTaskCount,
        })
        return
      }
    }

    await applyStaffAssignmentChange(projectID, staffID, false)
  }

  const confirmUnassignAndCancelTasks = async () => {
    if (!pendingUnassignDialog) return
    const { projectID, staffID } = pendingUnassignDialog
    setPendingUnassignDialog(null)
    await applyStaffAssignmentChange(projectID, staffID, true)
  }

  const submitCreateProject = async () => {
    if (!selectedProgram) return
    if (selectedProgramIsCancelled) {
      setCreateError('Cannot create a project under a cancelled program.')
      return
    }
    if (!createForm.project_name.trim()) {
      setCreateError('Project name is required.')
      return
    }

    setCreatingProject(true)
    setCreateError('')

    const budget = createForm.budget_allocated.trim() === '' ? null : Number(createForm.budget_allocated)
    if (budget !== null && Number.isNaN(budget)) {
      setCreateError('Budget must be a valid number.')
      setCreatingProject(false)
      return
    }

    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          project_name: createForm.project_name.trim(),
          project_description: createForm.project_description.trim() || null,
          objectives: createForm.objectives.trim() || null,
          budget_allocated: budget,
          start_date: createForm.start_date || null,
          end_date: createForm.end_date || null,
          program_id: selectedProgram.id,
          department_id: selectedProgram.department_id || null,
          status: 'pending_approval',
          approval_status: 'pending',
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        let msg = 'Failed to create project request'
        try {
          msg = JSON.parse(text).error || msg
        } catch {
          msg = text || msg
        }
        throw new Error(msg)
      }

      setCreateOpen(false)
      setCreateForm(emptyForm)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create project'
      setCreateError(msg)
    } finally {
      setCreatingProject(false)
    }
  }

  const openProgramProjects = (programID: string) => {
    setSelectedProgramID(programID)
    setSearchProgramProjects('')
    setFilterProjectOwner('all')
    setFilterProjectVerification('all')
    setProgramProjectsTab('all')
    setSelectedAssignProjectID(null)
    setTaskProjectID(null)
    setStaffSearch('')
  }

  const openTaskManagementForProject = (projectID: string) => {
    const project = selectedProgramProjects.find(p => p.id === projectID)
    if (!isProjectApproved(project)) return
    setTaskProjectID(projectID)
    setProgramProjectsTab('task_management')
    setTaskError('')
  }

  useEffect(() => {
    if (programProjectsTab !== 'task_management') return
    if (selectedTaskProject) return
    if (taskManageProjects.length > 0) {
      setTaskProjectID(taskManageProjects[0].id)
    }
  }, [programProjectsTab, selectedTaskProject, taskManageProjects])

  const parseAPIError = async (res: Response, fallback: string) => {
    const text = await res.text()
    if (!text) return fallback
    try {
      return JSON.parse(text).error || fallback
    } catch {
      return text
    }
  }

  const loadProjectTasks = useCallback(async (projectID: string) => {
    const res = await fetch(`${API}/projects/${projectID}/tasks`, { headers: authHeaders() })
    if (!res.ok) {
      throw new Error(await parseAPIError(res, 'Failed to load project tasks.'))
    }

    const payload = await res.json()
    const fetchedTasks: ProjectTask[] = []
    if (Array.isArray(payload.tasks)) {
      for (const raw of payload.tasks as unknown[]) {
        if (!raw || typeof raw !== 'object') continue
        const task = raw as Record<string, unknown>
        const assigneeIDs = Array.isArray(task.assignee_ids)
          ? task.assignee_ids.filter((id: unknown): id is string => typeof id === 'string')
          : []

        const normalized: ProjectTask = {
          id: String(task.id || ''),
          project_id: String(task.project_id || projectID),
          title: String(task.title || ''),
          description: typeof task.description === 'string' ? task.description : undefined,
          assignee_ids: assigneeIDs,
          assignee_id: assigneeIDs[0],
          status: toUiTaskStatus(typeof task.status === 'string' ? task.status : undefined),
          priority: toUiPriority(typeof task.priority === 'string' ? task.priority : undefined),
          due_date: typeof task.due_date === 'string' ? task.due_date : undefined,
          created_at: typeof task.created_at === 'string' ? task.created_at : new Date().toISOString(),
        }

        if (normalized.id && normalized.project_id && normalized.title) {
          fetchedTasks.push(normalized)
        }
      }
    }

    setProjectTasks(prev => [...prev.filter(task => task.project_id !== projectID), ...fetchedTasks])
  }, [])

  useEffect(() => {
    if (programProjectsTab !== 'task_management') return
    if (!selectedTaskProject?.id) return

    loadProjectTasks(selectedTaskProject.id).catch(err => {
      setTaskError(err instanceof Error ? err.message : 'Failed to load tasks.')
    })
  }, [programProjectsTab, selectedTaskProject?.id, loadProjectTasks])

  const createTaskForProject = async () => {
    if (!selectedTaskProject) return
    if (!taskForm.title.trim()) {
      setTaskError('Task title is required.')
      return
    }
    const allowed = new Set(getAssignedStaffIDs(selectedTaskProject.id))
    const selectedAssigneeIDs = Array.from(new Set(taskForm.assignee_ids.filter(id => allowed.has(id))))
    if (selectedAssigneeIDs.length === 0) {
      setTaskError('Select at least one assignee from assigned staff for this project.')
      return
    }

    try {
      const res = await fetch(`${API}/projects/${selectedTaskProject.id}/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: taskForm.title.trim(),
          description: taskForm.description.trim() || null,
          assignee_ids: selectedAssigneeIDs,
          priority: toApiPriority(taskForm.priority),
          due_date: taskForm.due_date || null,
        }),
      })

      if (!res.ok) {
        throw new Error(await parseAPIError(res, 'Failed to create task.'))
      }

      await loadProjectTasks(selectedTaskProject.id)
      setTaskForm({ title: '', description: '', assignee_ids: [], priority: 'medium', due_date: '' })
      setTaskError('')
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to create task.')
    }
  }

  const updateTaskStatus = async (taskID: string, status: TaskStatus) => {
    const prevTasks = projectTasks
    setProjectTasks(prev => prev.map(t => (t.id === taskID ? { ...t, status } : t)))

    try {
      const res = await fetch(`${API}/projects/tasks/${taskID}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: toApiTaskStatus(status) }),
      })
      if (!res.ok) {
        throw new Error(await parseAPIError(res, 'Failed to update task status.'))
      }
      if (selectedTaskProject?.id) {
        await loadProjectTasks(selectedTaskProject.id)
      }
      setTaskError('')
    } catch (err) {
      setProjectTasks(prevTasks)
      setTaskError(err instanceof Error ? err.message : 'Failed to update task status.')
    }
  }

  const deleteTask = async (taskID: string) => {
    const prevTasks = projectTasks
    setProjectTasks(prev => prev.filter(t => t.id !== taskID))

    try {
      const res = await fetch(`${API}/projects/tasks/${taskID}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        throw new Error(await parseAPIError(res, 'Failed to delete task.'))
      }
      if (selectedTaskProject?.id) {
        await loadProjectTasks(selectedTaskProject.id)
      }
      setTaskError('')
    } catch (err) {
      setProjectTasks(prevTasks)
      setTaskError(err instanceof Error ? err.message : 'Failed to delete task.')
    }
  }

  const confirmDeleteProgram = async () => {
    if (!deleteProgramDialog) return

    setDeletingProgram(true)
    try {
      const res = await fetch(`${API}/programs/${deleteProgramDialog.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      if (!res.ok) {
        const text = await res.text()
        let msg = 'Failed to delete program'
        try {
          msg = JSON.parse(text).error || msg
        } catch {
          msg = text || msg
        }
        throw new Error(msg)
      }

      if (selectedProgramID === deleteProgramDialog.id) {
        setSelectedProgramID(null)
        setProgramProjectsTab('all')
        setSelectedAssignProjectID(null)
        setStaffSearch('')
      }

      setDeleteProgramDialog(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete program')
    } finally {
      setDeletingProgram(false)
    }
  }

  const openAssignStaffForProject = (project: Project) => {
    if (!isProjectApproved(project)) {
      setAssignStaffError('Only approved projects can have staff assigned.')
      return
    }
    setAssignStaffError('')
    setSelectedAssignProjectID(project.id)
    setProgramProjectsTab('assign_staff')
    setStaffSearch('')
  }

  const confirmDeleteProject = async () => {
    if (!deleteProjectDialog) return

    setDeletingProject(true)
    try {
      const res = await fetch(`${API}/projects/${deleteProjectDialog.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      if (!res.ok) {
        const text = await res.text()
        let msg = 'Failed to delete project'
        try {
          msg = JSON.parse(text).error || msg
        } catch {
          msg = text || msg
        }
        throw new Error(msg)
      }

      if (selectedAssignProjectID === deleteProjectDialog.id) {
        setSelectedAssignProjectID(null)
      }

      setDeleteProjectDialog(null)
      setViewProjectDetails(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    } finally {
      setDeletingProject(false)
    }
  }

  const canAcceptStaffRequest = (project: Project) => {
    const createdByStaff = departmentStaff.some(staff => staff.id === project.created_by)
    if (!createdByStaff) return false

    const awaitingHeadReview = project.approval_status === 'pending' && project.status === 'pending_approval'
    if (!awaitingHeadReview) return false

    return !project.project_head_id || project.project_head_id === currentUser?.id
  }

  const acceptStaffRequest = async (project: Project) => {
    if (!canAcceptStaffRequest(project)) return

    setAcceptingRequestID(project.id)
    try {
      const res = await fetch(`${API}/projects/${project.id}/head-review`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          decision: 'approved',
          review_notes: null,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        let msg = 'Failed to accept staff request.'
        try {
          msg = JSON.parse(text).error || msg
        } catch {
          msg = text || msg
        }
        throw new Error(msg)
      }

      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept staff request.')
    } finally {
      setAcceptingRequestID(null)
    }
  }

  const requesterRoleLabel = (createdBy: string) => {
    if (createdBy === currentUser?.id) return 'Project Head'
    const role = staffByID.get(createdBy)?.role
    if (!role) return 'Requester'
    return role
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{selectedProgram ? selectedProgram.program_name : 'Project Management'}</h1>
            <p className="text-slate-500 mt-1">
              {selectedProgram
                ? 'Create, review, and assign projects within this program.'
                : 'Manage projects under assigned programs, including request review and staff assignment.'}
            </p>
            {selectedProgramIsCancelled && (
              <p className="text-sm text-red-600 font-semibold mt-2">Program has been cancelled.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedProgram && (
              <Button
                className="bg-slate-900 hover:bg-slate-800"
                disabled={selectedProgramIsCancelled}
                title={selectedProgramIsCancelled ? 'Cannot add projects to a cancelled program' : undefined}
                onClick={() => {
                  if (selectedProgramIsCancelled) return
                  setCreateForm(emptyForm)
                  setCreateError('')
                  setCreateOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Create Project
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading || !currentUser?.id}>
              <RotateCcw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Assigned Programs', value: departmentPrograms.length, icon: Building2, color: 'text-slate-700', bg: 'bg-slate-50' },
            {
              label: 'Active Programs',
              value: departmentPrograms.filter(p => (p.status || '').toLowerCase() === 'active').length,
              icon: CheckCircle,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
            },
            { label: 'Overall Projects', value: allProjects.length, icon: ClipboardList, color: 'text-blue-700', bg: 'bg-blue-50' },
            {
              label: 'Accepted Projects',
              value: allProjects.filter(p => p.approval_status === 'approved').length,
              icon: Wallet,
              color: 'text-indigo-700',
              bg: 'bg-indigo-50',
            },
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

        <>
            {!selectedProgram && (
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search programs..."
                      value={searchPrograms}
                      onChange={e => setSearchPrograms(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterProgramStatus} onValueChange={setFilterProgramStatus}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
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
                  <div className="overflow-x-auto">
                    {filteredPrograms.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">No assigned programs found.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-left">
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Program Name</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Beneficiary</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Overall Budget</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredPrograms.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <button
                                  className="font-medium text-blue-600 hover:text-blue-800 text-left"
                                  onClick={() => {
                                    setSelectedProgramID(p.id)
                                    setSearchProgramProjects('')
                                    setProgramProjectsTab('all')
                                    setSelectedAssignProjectID(null)
                                    setStaffSearch('')
                                  }}
                                >
                                  {p.program_name}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{p.program_category || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">{departmentNameByID.get(p.department_id || '') || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">{p.target_beneficiaries || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">{fmtBudget(0)}</td>
                              <td className="px-4 py-3"><ProgramStatusBadge status={p.status?.toUpperCase()} /></td>
                              <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{fmtDate(p.created_at)}</td>
                              <td className="px-4 py-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white">
                                    <DropdownMenuItem onClick={() => openProgramProjects(p.id)}>
                                      <FolderOpen className="w-4 h-4 mr-2" /> Open Projects
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setViewProgramDetails(p)}>
                                      <Eye className="w-4 h-4 mr-2" /> View Program Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteProgramDialog(p)} className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedProgram && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <button
                        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-1"
                        onClick={() => {
                          setSelectedProgramID(null)
                          setProgramProjectsTab('all')
                          setSelectedAssignProjectID(null)
                          setStaffSearch('')
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to assigned programs
                      </button>
                      <CardTitle className="text-base font-semibold text-slate-700">{selectedProgram.program_name} - Projects</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">Create project requests, track verification, and manage department staff project work.</p>
                    </div>
                    <Button
                      className="bg-slate-900 hover:bg-slate-800"
                      disabled={selectedProgramIsCancelled}
                      title={selectedProgramIsCancelled ? 'Cannot add projects to a cancelled program' : undefined}
                      onClick={() => {
                        if (selectedProgramIsCancelled) return
                        setCreateForm(emptyForm)
                        setCreateError('')
                        setCreateOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Create Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setProgramProjectsTab('all')}
                      className={`px-3 py-1.5 text-sm ${programProjectsTab === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      All ({selectedProgramProjects.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgramProjectsTab('assign_staff')}
                      className={`px-3 py-1.5 text-sm border-l border-slate-200 ${programProjectsTab === 'assign_staff' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      Assign Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProgramProjectsTab('task_management')
                        if (!taskProjectID && taskManageProjects.length > 0) {
                          setTaskProjectID(taskManageProjects[0].id)
                        }
                      }}
                      className={`px-3 py-1.5 text-sm border-l border-slate-200 ${programProjectsTab === 'task_management' ? 'bg-purple-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      Task Management
                    </button>
                  </div>

                  {programProjectsTab === 'all' && (
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search projects..."
                          value={searchProgramProjects}
                          onChange={e => setSearchProgramProjects(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={filterProjectOwner} onValueChange={(v: 'all' | 'mine') => setFilterProjectOwner(v)}>
                        <SelectTrigger className="w-full md:w-[190px]">
                          <SelectValue placeholder="All Owners" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All Owners</SelectItem>
                          <SelectItem value="mine">Created By Me</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterProjectVerification} onValueChange={(v: 'all' | 'accepted' | 'pending' | 'rejected') => setFilterProjectVerification(v)}>
                        <SelectTrigger className="w-full md:w-[190px]">
                          <SelectValue placeholder="All Verification" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All Verification</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {loading && programProjectsTab === 'all' ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading projects...
                    </div>
                  ) : programProjectsTab === 'all' && selectedProgramProjectsByTab.length === 0 ? (
                    selectedProgramIsCancelled ? (
                      <div className="text-center py-12 text-red-600 font-semibold">Program has been cancelled so no more projects.</div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">No projects under this program yet.</div>
                    )
                  ) : programProjectsTab === 'all' ? (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-sm">
                                          {/* If program is cancelled, show a warning for in-progress projects (rendered after the table/empty state) */}
                                          {selectedProgramIsCancelled && selectedProgramProjectsByTab.some(p => p.status === 'in_progress') && (
                                            <div className="text-center py-4 text-red-700 font-semibold">
                                              Warning: This program is cancelled, but there are still projects marked as "in progress". Please review and close or reassign these projects as appropriate.
                                            </div>
                                          )}
                        <thead>
                          <tr className="bg-slate-50 border-b text-left">
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Name</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lifecycle</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verification</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedProgramProjectsByTab.map(p => (
                            <tr
                              key={p.id}
                              className="hover:bg-slate-50 cursor-pointer"
                              onClick={() => setViewProjectDetails(p)}
                            >
                              <td className="px-4 py-3 font-medium text-slate-900">{p.project_name}</td>
                              <td className="px-4 py-3 text-slate-700 text-xs">
                                <span className="flex items-center gap-2">
                                  {(() => {
                                    const staff = departmentStaff.find(s => s.id === p.created_by)
                                    const fallback = (userNameByID.get(p.created_by) || p.created_by)
                                    return staff ? (
                                      <StaffAvatar staff={staff} size="sm" />
                                    ) : (
                                      <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center border border-slate-300">
                                        {(fallback.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST').toUpperCase()}
                                      </span>
                                    )
                                  })()}
                                  <span>{userNameByID.get(p.created_by) || p.created_by}</span>
                                </span>
                                <span className="block text-[11px] text-slate-500 mt-1 ml-8">{requesterRoleLabel(p.created_by)}</span>
                              </td>
                              <td className="px-4 py-3"><LifecycleBadge status={p.status} /></td>
                              <td className="px-4 py-3"><VerificationBadge project={p} /></td>
                              <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{fmtDate(p.created_at)}</td>
                              <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white">
                                    <DropdownMenuItem onClick={() => setViewProjectDetails(p)}>
                                      <Eye className="w-4 h-4 mr-2" /> View Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={!canAcceptStaffRequest(p) || acceptingRequestID === p.id}
                                      onClick={() => acceptStaffRequest(p)}
                                    >
                                      {acceptingRequestID === p.id ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                      )}
                                      Accept Staff Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={!isProjectApproved(p)}
                                      onClick={() => openAssignStaffForProject(p)}
                                    >
                                      <UserPlus className="w-4 h-4 mr-2" /> Assign Staff
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={!isProjectApproved(p)}
                                      onClick={() => openTaskManagementForProject(p.id)}
                                    >
                                      <ClipboardList className="w-4 h-4 mr-2" /> Manage Tasks
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteProjectDialog(p)} className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : programProjectsTab === 'assign_staff' ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                        <p className="font-semibold text-slate-900">Staff Assignment Workspace</p>
                        <p className="text-slate-600">Select a project to assign department staff. This mirrors the requested assign workflow tab.</p>
                      </div>
                      {assignStaffError && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          {assignStaffError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="border rounded-lg">
                          <div className="px-4 py-3 border-b bg-slate-50">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Projects in this Program</p>
                          </div>
                          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                            {selectedProgramProjects.length === 0 ? (
                              <p className="p-4 text-sm text-slate-500">No projects available.</p>
                            ) : selectedProgramProjects.map(project => (
                              <button
                                key={project.id}
                                disabled={!isProjectApproved(project)}
                                className={`w-full text-left px-4 py-3 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed ${selectedAssignProjectID === project.id ? 'bg-teal-50' : ''}`}
                                onClick={() => {
                                  if (!isProjectApproved(project)) {
                                    setAssignStaffError('Only approved projects can have staff assigned.')
                                    return
                                  }
                                  setAssignStaffError('')
                                  setSelectedAssignProjectID(project.id)
                                }}
                              >
                                <p className="text-sm font-medium text-slate-900">{project.project_name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {project.approval_status === 'approved'
                                    ? 'Final approved'
                                    : project.approval_status === 'rejected'
                                      ? 'Final rejected'
                                      : project.project_head_id && project.status !== 'pending_approval'
                                        ? 'Pending final approval'
                                        : 'Awaiting head review'}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border rounded-lg">
                          <div className="px-4 py-3 border-b bg-slate-50">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department Staff</p>
                          </div>
                          {!selectedAssignProject ? (
                            <p className="p-4 text-sm text-slate-500">Select a project first.</p>
                          ) : !isProjectApproved(selectedAssignProject) ? (
                            <p className="p-4 text-sm text-amber-700">This project is not approved. Staff assignment is only available for approved projects.</p>
                          ) : (
                            <div className="p-3 space-y-3">
                              <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                                Assigning staff for: <span className="font-semibold">{selectedAssignProject.project_name}</span>
                              </div>

                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                  placeholder="Search department staff..."
                                  value={staffSearch}
                                  onChange={e => setStaffSearch(e.target.value)}
                                  className="pl-9"
                                />
                              </div>

                              <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100 border rounded-md">
                                {filteredDepartmentStaff.length === 0 ? (
                                  <p className="p-3 text-sm text-slate-500">No department staff found.</p>
                                ) : filteredDepartmentStaff.map(staff => {
                                  const assigned = getAssignedStaffIDs(selectedAssignProject.id).includes(staff.id)
                                  return (
                                    <div key={staff.id} className="flex items-center justify-between px-3 py-2">
                                      <div className="flex items-center gap-3">
                                        <StaffAvatar staff={staff} />
                                        <div>
                                          <p className="text-sm text-slate-900">{staff.first_name} {staff.last_name}</p>
                                          <p className="text-xs text-slate-500">{staff.department || '-'}</p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={assigned ? 'outline' : 'default'}
                                        className={assigned ? 'h-7 px-2 text-emerald-700 border-emerald-200' : 'h-7 px-2'}
                                        onClick={() => toggleAssignStaffUI(selectedAssignProject.id, staff.id, `${staff.first_name} ${staff.last_name}`.trim())}
                                        disabled={savingAssignment}
                                      >
                                        {savingAssignment ? 'Saving...' : assigned ? 'Assigned' : 'Assign'}
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : programProjectsTab === 'task_management' ? (
                    <div className="space-y-4">
                      {!selectedTaskProject ? (
                        <div className="text-center py-12">
                          <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 mb-2">Select a project to view and manage tasks</p>
                          <p className="text-sm text-slate-400">Choose a project from the list below</p>
                        </div>
                      ) : (
                        <>
                          {/* Project Overview Card */}
                          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <FolderKanban className="h-6 w-6 text-purple-600" />
                                  <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{selectedTaskProject.project_name}</h3>
                                    <p className="text-sm text-slate-600">{departmentNameByID.get(selectedTaskProject.department_id || '') || '-'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" onClick={() => setViewProjectDetails(selectedTaskProject)}>
                                    <Eye className="h-4 w-4 mr-1" /> View Project
                                  </Button>
                                  <Button variant="destructive" onClick={() => setDeleteProjectDialog(selectedTaskProject)}>
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete Project
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectProjectDialog(true)}
                                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                                  >
                                    Change Project
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-600 mb-1">Budget</p>
                                  <p className="font-bold text-slate-900">{fmtBudget(selectedTaskProject.budget_allocated)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-600 mb-1">Status</p>
                                  <p className={`font-bold text-sm ${normalize(selectedTaskProject.status) === 'in_progress' ? 'text-green-600' : 'text-slate-900'}`}>
                                    {normalize(selectedTaskProject.status) === 'in_progress' ? 'In Progress' : (selectedTaskProject.status || '-')}
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-600 mb-1">Total Tasks</p>
                                  <p className="font-bold text-slate-900 text-xl">{visibleProjectTasks.length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-600 mb-1">Completed</p>
                                  <p className="font-bold text-green-600 text-lg">{visibleProjectTasks.filter(t => t.status === 'completed').length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                  <p className="text-xs text-slate-600 mb-1">Ongoing</p>
                                  <p className="font-bold text-blue-600 text-lg">{visibleProjectTasks.filter(t => t.status === 'ongoing').length}</p>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-slate-900 text-sm">Overall Progress</h4>
                                  <span className="text-sm font-bold text-purple-600">
                                    {visibleProjectTasks.length === 0 ? 0 : Math.round((visibleProjectTasks.filter(t => t.status === 'completed').length / visibleProjectTasks.length) * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${visibleProjectTasks.length === 0 ? 0 : Math.round((visibleProjectTasks.filter(t => t.status === 'completed').length / visibleProjectTasks.length) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Create Task Form */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Create New Task</CardTitle>
                              <CardDescription>Add a task and assign it to available staff</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Input
                                placeholder="Task title *"
                                value={taskForm.title}
                                onChange={e => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                                className="bg-white"
                              />
                              <textarea
                                rows={2}
                                value={taskForm.description}
                                onChange={e => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Task description (optional)"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-md border border-slate-200 bg-white p-2 max-h-[160px] overflow-y-auto">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Assignees</p>
                                  {assignedTaskStaff.length === 0 ? (
                                    <p className="text-xs text-slate-500">No available staff</p>
                                  ) : assignedTaskStaff.map(st => {
                                    const checked = taskForm.assignee_ids.includes(st.id)
                                    return (
                                      <label key={st.id} className="flex items-center gap-2 py-1 text-sm text-slate-700 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="h-4 w-4 rounded border-slate-300"
                                          checked={checked}
                                          onChange={e => {
                                            setTaskForm(prev => ({
                                              ...prev,
                                              assignee_ids: e.target.checked
                                                ? [...prev.assignee_ids, st.id]
                                                : prev.assignee_ids.filter(id => id !== st.id),
                                            }))
                                          }}
                                        />
                                        <StaffAvatar staff={st} size="sm" />
                                        <span>{st.first_name} {st.last_name}</span>
                                      </label>
                                    )
                                  })}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</p>
                                  <Input
                                    type="date"
                                    value={taskForm.due_date}
                                    onChange={e => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                                    className="bg-white"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority Tag</p>
                                  <Select value={taskForm.priority} onValueChange={(v: 'low' | 'medium' | 'high' | 'critical') => setTaskForm(prev => ({ ...prev, priority: v }))}>
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center justify-end">
                                  {taskForm.assignee_ids.length} assignee(s) selected
                                </div>
                              </div>
                              {taskError && (
                                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                                  {taskError}
                                </div>
                              )}
                              {assignedTaskStaff.length === 0 && (
                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                                  No staff assigned yet. Use the "Assign Staff" tab to add department staff to this project first.
                                </div>
                              )}
                              <div className="flex justify-end">
                                <Button
                                  onClick={createTaskForProject}
                                  disabled={assignedTaskStaff.length === 0}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Task
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Tasks List */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">Project Tasks</CardTitle>
                                  <CardDescription>All tasks assigned for this project</CardDescription>
                                </div>
                                <Select value={taskFilterStatus} onValueChange={(v: 'all' | TaskStatus) => setTaskFilterStatus(v)}>
                                  <SelectTrigger className="w-[180px] bg-white">
                                    <SelectValue placeholder="All statuses" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {visibleProjectTasks.length === 0 ? (
                                  <div className="text-center py-8">
                                    <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">No tasks found</p>
                                    <p className="text-sm text-slate-400">Create a task above to get started</p>
                                  </div>
                                ) : (
                                  visibleProjectTasks.map(task => {
                                    const getTaskStatusIcon = (status: TaskStatus) => {
                                      switch (status) {
                                        case 'completed':
                                          return <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        case 'ongoing':
                                          return <Clock className="h-5 w-5 text-blue-600" />
                                        case 'cancelled':
                                          return <XCircle className="h-5 w-5 text-red-600" />
                                        case 'not_started':
                                        default:
                                          return <CircleDashed className="h-5 w-5 text-slate-400" />
                                      }
                                    }
                                    const getStatusColor = (status: TaskStatus) => {
                                      switch (status) {
                                        case 'completed':
                                          return 'bg-green-100 text-green-700 border-green-300'
                                        case 'ongoing':
                                          return 'bg-blue-100 text-blue-700 border-blue-300'
                                        case 'cancelled':
                                          return 'bg-red-100 text-red-700 border-red-300'
                                        case 'not_started':
                                        default:
                                          return 'bg-slate-100 text-slate-700 border-slate-300'
                                      }
                                    }
                                    return (
                                      <Card key={task.id} className="border-slate-200 hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3 flex-1">
                                              {getTaskStatusIcon(task.status)}
                                              <div className="flex-1">
                                                <p className="font-semibold text-slate-900">{task.title}</p>
                                                {task.description && <p className="text-sm text-slate-600 mt-1">{task.description}</p>}
                                              </div>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteTask(task.id)}
                                              className="text-red-600 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                                            <span className={`px-2 py-1 rounded-full border font-medium ${getStatusColor(task.status)}`}>
                                              {task.status === 'not_started'
                                                ? 'Not Started'
                                                : task.status === 'cancelled'
                                                  ? 'Cancelled'
                                                  : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                            </span>
                                            <span className="px-2 py-1 rounded-full border font-medium bg-purple-100 text-purple-700 border-purple-200">
                                              {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="text-slate-600">Assigned to:</span>
                                              {(task.assignee_ids?.length ? task.assignee_ids : (task.assignee_id ? [task.assignee_id] : [])).length === 0 ? (
                                                <span className="font-medium text-slate-900">-</span>
                                              ) : (
                                                (task.assignee_ids?.length ? task.assignee_ids : (task.assignee_id ? [task.assignee_id] : [])).map(id => {
                                                  const staff = staffByID.get(id)
                                                  const fallbackName = userNameByID.get(id) || id
                                                  return (
                                                    <span key={`${task.id}-${id}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700">
                                                      {staff ? (
                                                        <StaffAvatar staff={staff} size="sm" />
                                                      ) : (
                                                        <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center border border-slate-300">
                                                          {(fallbackName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST').toUpperCase()}
                                                        </span>
                                                      )}
                                                      <span className="font-medium text-slate-900">{fallbackName}</span>
                                                    </span>
                                                  )
                                                })
                                              )}
                                            </div>
                                            {task.due_date && (
                                              <span className="text-slate-600">
                                                Due: <span className="font-medium text-slate-900">{fmtDate(task.due_date)}</span>
                                              </span>
                                            )}
                                          </div>

                                          <Select value={task.status} onValueChange={(v: TaskStatus) => updateTaskStatus(task.id, v)}>
                                            <SelectTrigger className="w-full bg-white">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                              <SelectItem value="not_started">Not Started</SelectItem>
                                              <SelectItem value="ongoing">Ongoing</SelectItem>
                                              <SelectItem value="completed">Completed</SelectItem>
                                              <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </CardContent>
                                      </Card>
                                    )
                                  })
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Project List on the Side */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Projects in This Program</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {taskManageProjects.length === 0 ? (
                                  <p className="text-sm text-slate-500">No approved projects available for task management.</p>
                                ) : taskManageProjects.map(project => (
                                  <button
                                    key={project.id}
                                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${taskProjectID === project.id ? 'bg-purple-100 border-purple-300' : 'border-slate-200 hover:bg-slate-50'}`}
                                    onClick={() => {
                                      setTaskProjectID(project.id)
                                      setTaskError('')
                                      setTaskForm(prev => ({ ...prev, assignee_ids: [] }))
                                    }}
                                  >
                                    <p className="text-sm font-medium text-slate-900">{project.project_name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{getAssignedStaffIDs(project.id).length} assigned staff</p>
                                  </button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </>
      </div>

      {/* Task Project Selection Dialog */}
      <Dialog open={selectProjectDialog} onOpenChange={setSelectProjectDialog}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Project for Task Management</DialogTitle>
            <DialogDescription>Choose a project to view and manage its tasks</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {taskManageProjects.map(project => (
              <Card
                key={project.id}
                className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
                  taskProjectID === project.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                }`}
                onClick={() => {
                  setTaskProjectID(project.id)
                  setTaskError('')
                  setTaskForm(prev => ({ ...prev, assignee_id: '' }))
                  setSelectProjectDialog(false)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <FolderKanban className="h-5 w-5 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{project.project_name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{departmentNameByID.get(project.department_id || '') || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Budget:</span>
                      <span className="font-medium text-slate-900">{fmtBudget(project.budget_allocated)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <LifecycleBadge status={project.status} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Created:</span>
                      <span className="font-medium text-slate-900 text-xs">{fmtDate(project.created_at)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Assigned Staff:</span>
                      <span className="font-medium text-slate-900">{getAssignedStaffIDs(project.id).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewProgramDetails} onOpenChange={open => { if (!open) setViewProgramDetails(null) }}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewProgramDetails?.program_name}</DialogTitle>
            <DialogDescription>Program Details</DialogDescription>
          </DialogHeader>
          {viewProgramDetails && (
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <ProgramStatusBadge status={viewProgramDetails.status} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <p className="mt-1 text-slate-600 text-sm">{viewProgramDetails.program_category || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <p className="mt-1 text-slate-600 text-sm">{departmentNameByID.get(viewProgramDetails.department_id || '') || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Program ID</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProgramDetails.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProgramDetails.program_description || 'No description'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Objectives</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProgramDetails.objectives || 'Not defined'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Target Beneficiaries</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProgramDetails.target_beneficiaries || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Overall Budget</label>
                  <p className="mt-1 text-slate-600 text-sm">₱{(viewProgramDetails.spent_budget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Budget Source</label>
                  <p className="mt-1 text-slate-600 text-sm">Summed from approved projects under this program</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <p className="mt-1 text-slate-600 text-sm">{viewProgramDetails.start_date ? new Date(viewProgramDetails.start_date).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <p className="mt-1 text-slate-600 text-sm">{viewProgramDetails.end_date ? new Date(viewProgramDetails.end_date).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Program Chair</label>
                {(() => {
                  const chair = chairByID.get(viewProgramDetails.program_chair_id || '')
                  return chair ? (
                    <div className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                      <StaffAvatar staff={{ ...chair, role: 'program_chair' }} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{chair.first_name} {chair.last_name}</p>
                        <p className="text-xs text-slate-400">{chair.email || '-'}</p>
                        {chair.department && <p className="text-xs text-slate-400">{chair.department}</p>}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-400 text-sm italic">No program chair assigned</p>
                  )
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteProgramDialog} onOpenChange={open => { if (!open && !deletingProgram) setDeleteProgramDialog(null) }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteProgramDialog?.program_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deletingProgram}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteProgram} disabled={deletingProgram}>
              {deletingProgram ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewProjectDetails} onOpenChange={open => { if (!open) setViewProjectDetails(null) }}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewProjectDetails?.project_name}</DialogTitle>
            <DialogDescription>Project Details</DialogDescription>
          </DialogHeader>
          {viewProjectDetails && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-2">
                <LifecycleBadge status={viewProjectDetails.status} />
                <VerificationBadge project={viewProjectDetails} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Program</label>
                  <p className="mt-1 text-slate-600 text-sm">{programNameByID.get(viewProjectDetails.program_id || '') || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Requested By</label>
                  <span className="mt-1 flex items-center gap-2 text-slate-600 text-sm">
                    {(() => {
                      const staff = departmentStaff.find(s => s.id === viewProjectDetails.created_by)
                      const fallback = (userNameByID.get(viewProjectDetails.created_by) || viewProjectDetails.created_by)
                      return staff ? (
                        <StaffAvatar staff={staff} size="sm" />
                      ) : (
                        <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center border border-slate-300">
                          {(fallback.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST').toUpperCase()}
                        </span>
                      )
                    })()}
                    <span>{userNameByID.get(viewProjectDetails.created_by) || viewProjectDetails.created_by}</span>
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Project ID</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProjectDetails.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <p className="mt-1 text-slate-600 text-sm">{viewProjectDetails.project_description || 'No description'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Budget</label>
                <p className="mt-1 text-slate-600 text-sm">{fmtBudget(viewProjectDetails.budget_allocated)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Created</label>
                <p className="mt-1 text-slate-600 text-sm">{fmtDate(viewProjectDetails.created_at)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProjectDetails(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteProjectDialog} onOpenChange={open => { if (!open && !deletingProject) setDeleteProjectDialog(null) }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteProjectDialog?.project_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deletingProject}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteProject} disabled={deletingProject}>
              {deletingProject ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingUnassignDialog} onOpenChange={open => { if (!open && !savingAssignment) setPendingUnassignDialog(null) }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Unassign Staff From Project</DialogTitle>
            <DialogDescription>
              <span className="block">
                <strong>{pendingUnassignDialog?.staffName}</strong> is currently assigned to {pendingUnassignDialog?.affectedTaskCount} active project task(s).
              </span>
              <span className="block mt-2">
                Solo tasks that only have this assignee: <strong>{pendingUnassignDialog?.soloTaskCount}</strong> (will be <strong>Cancelled</strong>).
              </span>
              <span className="block mt-1">
                Team tasks with other assignees: <strong>{pendingUnassignDialog?.teamTaskCount}</strong> (will <strong>continue</strong> and remain active).
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={savingAssignment}>Keep Assigned</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmUnassignAndCancelTasks} disabled={savingAssignment}>
              {savingAssignment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Unassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={v => { if (!creatingProject) setCreateOpen(v) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Project Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-900">Program: {selectedProgram?.program_name}</p>
              <p className="text-slate-600">Department: {departmentNameByID.get(selectedProgram?.department_id || '') || '-'}</p>
              <p className="text-slate-500">New project requests are routed for admin/program-chair final verification.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Name</label>
              <Input
                value={createForm.project_name}
                onChange={e => setCreateForm(prev => ({ ...prev, project_name: e.target.value }))}
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
              <textarea
                rows={3}
                value={createForm.project_description}
                onChange={e => setCreateForm(prev => ({ ...prev, project_description: e.target.value }))}
                className="w-full mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Short project description"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Objectives</label>
              <textarea
                rows={3}
                value={createForm.objectives}
                onChange={e => setCreateForm(prev => ({ ...prev, objectives: e.target.value }))}
                className="w-full mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Project objectives"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget</label>
                <Input
                  value={createForm.budget_allocated}
                  onChange={e => setCreateForm(prev => ({ ...prev, budget_allocated: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Date</label>
                <Input
                  type="date"
                  value={createForm.start_date}
                  onChange={e => setCreateForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">End Date</label>
                <Input
                  type="date"
                  value={createForm.end_date}
                  onChange={e => setCreateForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            {createError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {createError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creatingProject}>Cancel</Button>
            <Button onClick={submitCreateProject} disabled={creatingProject} className="bg-slate-900 hover:bg-slate-800">
              {creatingProject ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Project Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
