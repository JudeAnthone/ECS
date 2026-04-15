"use client"

import React, { useEffect, useRef, useState } from 'react'
import { API_URL } from '@/shared/lib/api-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { Textarea } from '@/shared/components/ui/TextArea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/Select'
import { Badge } from '@/shared/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/Dialog'
import { UploadCloud, Printer, RefreshCw, FileText, Paperclip, CheckCircle2, Clock3, XCircle, Loader2, Eye } from 'lucide-react'
import ActivityLogService from '@/shared/lib/activity-log-service'
import { AuthService } from '@/shared/lib/auth-service'

type Allocation = {
  allocated: number
  spent: number
  remaining: number
  percent: number
}

type ProjectOption = {
  id: string
  project_name?: string
  status?: string
  approval_status?: string
  program_id?: string
}

type BudgetRequestItem = {
  id: string
  project_id?: string
  project_name?: string
  requested_by_name?: string
  amount?: number
  reason?: string
  needed_by_date?: string
  status?: string
  workflow_stage?: string
  document_url?: string
  document_name?: string
  reviewed_by_name?: string
  review_notes?: string
  chair_slip_number?: string
  chair_slip_generated_at?: string
  created_at?: string
}

type StaffBudgetDocument = {
  id: string
  project_id?: string
  project_name?: string
  document_type?: string
  title?: string
  file_url?: string
  uploaded_by_name?: string
  created_at?: string
}

type DepartmentSummary = {
  id: string
  department_code?: string
  department_name?: string
  program_chair_id?: string
}

type ChairDepartmentAllocationRaw = {
  department_id?: string
  department_name?: string
  allocated_budget?: number
  spent_budget?: number
}

const API = `${API_URL}/api/v1`

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''
  return { Authorization: `Bearer ${token}` }
}

function authJsonHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(value)
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function normalize(value?: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function toAcronym(name?: string) {
  if (!name) return ''
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toLowerCase()
}

function statusClass(status?: string) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (normalized === 'declined') return 'bg-rose-50 text-rose-700 border-rose-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

function stageLabel(stage?: string) {
  const normalized = String(stage || '').toLowerCase()
  const map: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    declined: 'Declined',
  }
  return map[normalized] || (stage ? stage.replace(/_/g, ' ') : 'Pending')
}

function getBudgetRequestDocumentUrl(documentUrl?: string) {
  const raw = String(documentUrl || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  const normalized = raw.replace(/\\/g, '/').replace(/^\/+/, '')
  if (normalized.startsWith('uploads/')) return `${API_URL}/${normalized}`
  return `${API_URL}/uploads/${normalized.replace(/^uploads\//, '')}`
}

function canDeleteBudgetRequest(stage?: string) {
  return String(stage || '').toLowerCase() !== 'approved'
}

export default function ProjectHeadBudgetManagementPage() {
  const [allocation, setAllocation] = useState<Allocation | null>(null)
  const [allocationError, setAllocationError] = useState('')
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [requests, setRequests] = useState<BudgetRequestItem[]>([])
  const [staffDocs, setStaffDocs] = useState<StaffBudgetDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const requestFormRef = useRef<HTMLDivElement | null>(null)

  const [form, setForm] = useState({
    projectId: '',
    amount: '',
    neededByDate: '',
    reason: '',
  })
  const [supportingDocument, setSupportingDocument] = useState<File | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<BudgetRequestItem | null>(null)
  const [deleteRequest, setDeleteRequest] = useState<BudgetRequestItem | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  useEffect(() => {
    if (!toast) return
    setToastVisible(true)
    const hideTimer = setTimeout(() => setToastVisible(false), 2700)
    const clearTimer = setTimeout(() => setToast(null), 3000)
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(clearTimer)
    }
  }, [toast])

  useEffect(() => {
    let mounted = true

    async function loadData() {
      setLoading(true)
      setAllocationError('')
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        let chairID = user.assigned_program_chair_id
        const userDepartment = String(user.department || '').toLowerCase()
        const userDeptNorm = normalize(userDepartment)

        let departmentId = ''
        const deptRes = await fetch(`${API}/departments`, { headers: authHeaders() })
        let departments: DepartmentSummary[] = []
        if (deptRes.ok) {
          const deptData = await deptRes.json()
          departments = deptData.departments || []
          const matched = departments.find((department) => {
            const code = String(department.department_code || '').toLowerCase()
            const name = String(department.department_name || '').toLowerCase()
            const acronym = toAcronym(department.department_name)
            const needle = userDepartment.trim()
            const codeNorm = normalize(code)
            const nameNorm = normalize(name)
            return (
              code === needle ||
              needle.includes(code) ||
              name === needle ||
              name.includes(needle) ||
              acronym === needle ||
              needle.includes(acronym) ||
              codeNorm === userDeptNorm ||
              nameNorm === userDeptNorm ||
              nameNorm.includes(userDeptNorm) ||
              userDeptNorm.includes(codeNorm)
            )
          })
          departmentId = matched?.id || ''
          if (matched?.program_chair_id) {
            chairID = matched.program_chair_id
          }
        }

        let nextAllocation: Allocation = { allocated: 0, spent: 0, remaining: 0, percent: 0 }
        if (chairID) {
          const allocRes = departmentId
            ? await fetch(`${API}/budgets/chair-departments?chair_id=${chairID}&department_id=${departmentId}`, { headers: authHeaders() })
            : await fetch(`${API}/budgets/chair-departments?chair_id=${chairID}`, { headers: authHeaders() })

          if (allocRes.ok) {
            const allocData = await allocRes.json()
            const items: ChairDepartmentAllocationRaw[] = allocData.chair_department_budgets || []
            let mine: ChairDepartmentAllocationRaw | null = null
            if (departmentId) {
              mine = items.find((item) => item.department_id === departmentId) || null
            } else if (items.length > 0) {
              const needle = (userDepartment || '').trim().toLowerCase()
              mine = items.find((item) => {
                const name = String(item.department_name || '').toLowerCase()
                return name === needle || name.includes(needle)
              }) || null
              if (!mine && userDepartment) {
                mine = items.find((item) => item.department_id === userDepartment) || null
              }
            }

            if (mine) {
              const allocated = Number(mine.allocated_budget || 0)
              const spent = Number(mine.spent_budget || 0)
              nextAllocation = {
                allocated,
                spent,
                remaining: Math.max(0, allocated - spent),
                percent: allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0,
              }
            }
          } else {
            setAllocationError(`Could not load department allocation (HTTP ${allocRes.status}).`)
          }
        } else {
          setAllocationError('Could not determine assigned program chair for this department.')
        }

        const [assignedProjectsRes, ownedProjectsRes, requestsRes, staffDocsRes] = await Promise.all([
          fetch(`${API}/projects?assigned_to_me=1`, { headers: authHeaders() }),
          fetch(`${API}/projects?mine=1`, { headers: authHeaders() }),
          fetch(`${API}/budget-requests`, { headers: authHeaders() }),
          fetch(`${API}/budget-reports/staff`, { headers: authHeaders() }),
        ])

        const assignedProjects = assignedProjectsRes.ok ? (await assignedProjectsRes.json()).projects || [] : []
        const ownedProjects = ownedProjectsRes.ok ? (await ownedProjectsRes.json()).projects || [] : []
        const projectMap = new Map<string, ProjectOption>()
        for (const project of [...assignedProjects, ...ownedProjects]) {
          if (!project?.id) continue
          projectMap.set(project.id, {
            id: project.id,
            project_name: project.project_name,
            status: project.status,
            approval_status: project.approval_status,
            program_id: project.program_id,
          })
        }
        const nextProjects = Array.from(projectMap.values())
        const nextRequests = requestsRes.ok ? (await requestsRes.json()).requests || [] : []
        const nextStaffDocs = staffDocsRes.ok ? (await staffDocsRes.json()).documents || [] : []

        if (!mounted) return
        setAllocation(nextAllocation)
        setProjects(nextProjects)
        setRequests(nextRequests)
        setStaffDocs(nextStaffDocs)
      } catch (error) {
        console.error(error)
        if (!mounted) return
        setAllocation({ allocated: 0, spent: 0, remaining: 0, percent: 0 })
        setAllocationError('Failed to load budget data.')
        setProjects([])
        setRequests([])
        setStaffDocs([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [])

  async function handleSubmit() {
    if (!form.projectId || !form.amount || !form.reason.trim() || !supportingDocument) {
      showToast('Please choose a project, attach a document, and fill all required fields.', 'error')
      return
    }

    if (submitting) return
    setSubmitting(true)

    try {
      const payload = new FormData()
      payload.append('project_id', form.projectId)
      payload.append('amount', form.amount)
      payload.append('reason', form.reason.trim())
      if (form.neededByDate) payload.append('needed_by_date', form.neededByDate)
      payload.append('supporting_document', supportingDocument)

      const res = await fetch(`${API}/budget-requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: payload,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to submit budget request')
      }

      const created = await res.json()
      const currentUser = AuthService.getUser()
      if (currentUser) {
        await ActivityLogService.logActivity(
          currentUser.id,
          `${currentUser.first_name} ${currentUser.last_name}`.trim(),
          currentUser.role || 'project_head',
          currentUser.department || 'Budget Management',
          `Submitted budget request for ${selectedProject?.project_name || form.projectId}`,
          'submission',
          {
            budgetRequestId: created?.id,
            projectId: form.projectId,
            projectName: selectedProject?.project_name,
            amount: Number(form.amount),
            neededByDate: form.neededByDate || null,
          }
        )
      }

      setRequests((current) => [created, ...current])
      setForm({ projectId: '', amount: '', neededByDate: '', reason: '' })
      setSupportingDocument(null)
      showToast('Budget request submitted successfully.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProject = projects.find((project) => project.id === form.projectId)

  const printSlip = (request: BudgetRequestItem) => {
    const popup = window.open('', '_blank', 'width=720,height=900')
    if (!popup) {
      showToast('Popup blocked. Please allow popups to print.', 'error')
      return
    }

    popup.document.write(`<!doctype html><html><head><title>Budget Request Slip</title><style>body{font-family:sans-serif;padding:24px;color:#111827}h1{margin:0 0 12px}p{margin:6px 0}</style></head><body>`)
    popup.document.write(`<h1>Budget Request Slip</h1>`)
    popup.document.write(`<p><strong>Request ID:</strong> ${request.id}</p>`)
    popup.document.write(`<p><strong>Project:</strong> ${request.project_name || request.project_id}</p>`)
    popup.document.write(`<p><strong>Amount:</strong> ${formatCurrency(Number(request.amount || 0))}</p>`)
    popup.document.write(`<p><strong>Status:</strong> ${request.status}</p>`)
    popup.document.write(`<p><strong>Stage:</strong> ${stageLabel(request.workflow_stage)}</p>`)
    popup.document.write(`<p><strong>Document:</strong> ${request.document_name || request.document_url || '—'}</p>`)
    popup.document.write(`</body></html>`)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  const openDocument = (documentUrl?: string) => {
    const href = getBudgetRequestDocumentUrl(documentUrl)
    if (!href) {
      showToast('No uploaded document was found for this request.', 'error')
      return
    }
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const handleDeleteRequest = async () => {
    if (!deleteRequest) return
    setDeleteSubmitting(true)
    try {
      const res = await fetch(`${API}/budget-requests/${deleteRequest.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        const txt = await res.text()
        let message = 'Failed to delete budget request'
        try {
          message = JSON.parse(txt).error || message
        } catch {
          message = txt || message
        }
        throw new Error(message)
      }
      const currentUser = AuthService.getUser()
      if (currentUser) {
        await ActivityLogService.logActivity(
          currentUser.id,
          `${currentUser.first_name} ${currentUser.last_name}`.trim(),
          currentUser.role || 'project_head',
          currentUser.department || 'Budget Management',
          `Deleted budget request for ${deleteRequest.project_name || deleteRequest.project_id || 'project'}`,
          'other',
          {
            budgetRequestId: deleteRequest.id,
            projectId: deleteRequest.project_id,
            projectName: deleteRequest.project_name,
            amount: deleteRequest.amount,
          }
        )
      }

      setRequests((current) => current.filter((request) => request.id !== deleteRequest.id))
      setDeleteRequest(null)
      if (selectedRequest?.id === deleteRequest.id) {
        setSelectedRequest(null)
      }
      showToast('Budget request deleted successfully.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete budget request'
      showToast(message, 'error')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {toast && (
          <div className="fixed right-6 top-6 z-50">
            <div className={`rounded-lg shadow-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {toast.message}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Management</h1>
            <p className="text-slate-500 mt-1">Submit a project budget request with supporting documentation.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
            </Button>
            <Button
              className="bg-[#BA0021] hover:bg-[#930018] text-white"
              onClick={() => requestFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <UploadCloud className="h-4 w-4 mr-1.5" /> New Budget Request
            </Button>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Department Allocation</CardTitle>
            <CardDescription>Available funds for your assigned department</CardDescription>
            {allocationError && <p className="text-sm text-amber-700">{allocationError}</p>}
          </CardHeader>
          <CardContent>
            {allocation ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Allocated</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(allocation.allocated)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Spent</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(allocation.spent)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Remaining</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(allocation.remaining)}</p>
                  </div>
                </div>
                <div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${allocation.percent < 50 ? 'bg-emerald-500' : allocation.percent < 85 ? 'bg-amber-500' : 'bg-[#BA0021]'}`} style={{ width: `${allocation.percent}%` }} />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{allocation.percent}% used</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Loading allocation...</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div ref={requestFormRef}>
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Submit Budget Request</CardTitle>
                <CardDescription>Choose an assigned project and attach the supporting document.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Project Name</Label>
                  <Select value={form.projectId} onValueChange={(value) => setForm((current) => ({ ...current, projectId: value }))}>
                    <SelectTrigger className="w-full border-slate-300">
                      <SelectValue placeholder={projects.length ? 'Select an assigned project' : 'No assigned projects found'} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.project_name || project.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProject && <p className="text-xs text-slate-500">Selected project: {selectedProject.project_name || selectedProject.id}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Amount (PHP)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="0"
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Needed</Label>
                  <Input
                    type="date"
                    value={form.neededByDate}
                    onChange={(event) => setForm((current) => ({ ...current, neededByDate: event.target.value }))}
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason / Justification</Label>
                <Textarea
                  value={form.reason}
                  onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="Explain the budget need and the market research or quotation basis."
                  className="min-h-32 border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label>Supporting Document</Label>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={(event) => setSupportingDocument(event.target.files?.[0] || null)}
                        className="border-slate-300 bg-white"
                      />
                      <p className="text-xs text-slate-500">Upload the budget estimate, quotation, or market research evidence.</p>
                      {supportingDocument && <p className="text-sm text-slate-700">Selected file: {supportingDocument.name}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  Budget requests are reviewed by your Program Chair for approval or decline.
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-[#BA0021] hover:bg-[#930018] text-white"
                >
                  {submitting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <FileText className="h-4 w-4 mr-1.5" />}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Request Status</CardTitle>
                <CardDescription>Current workflow state for your submitted requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-sm text-slate-500">No budget requests found.</p>
                ) : (
                  requests.slice(0, 4).map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-200 p-3 space-y-2 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">{request.project_name || request.project_id || 'Untitled project'}</p>
                          <p className="text-xs text-slate-500">{formatDate(request.created_at)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(request.status)}`}>
                          {String(request.status || 'pending').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{stageLabel(request.workflow_stage)}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatCurrency(Number(request.amount || 0))}</span>
                      </div>
                      {request.document_name && <p className="text-xs text-slate-500">Attachment: {request.document_name}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Supporting Notes</CardTitle>
                <CardDescription>What happens after submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <p>Program Chair reviews the request and adds feedback.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-amber-600" />
                  <p>Approved requests are finalized by the Program Chair with an approval slip.</p>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                  <p>Declined requests remain visible with reviewer notes for revision.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Your Budget Requests</CardTitle>
            <CardDescription>All submitted budget requests with their attached documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 uppercase tracking-wide text-xs">
                  <tr>
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Stage</th>
                    <th className="py-3 pr-4">Submitted</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">No requests yet.</td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="border-t border-slate-100">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">{request.project_name || request.project_id}</div>
                          <div className="text-xs text-slate-500">{request.reason}</div>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{formatCurrency(Number(request.amount || 0))}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={statusClass(request.status)}>{stageLabel(request.workflow_stage)}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-slate-500">{formatDate(request.created_at)}</td>
                        <td className="py-3 pr-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-700 hover:text-[#BA0021]" onClick={() => setSelectedRequest(request)}>
                              <Eye className="h-4 w-4 mr-1.5" /> Details
                            </Button>
                            <Button variant="ghost" size="sm" className="text-[#BA0021] hover:text-[#930018]" onClick={() => printSlip(request)}>
                              <Printer className="h-4 w-4 mr-1.5" /> Print
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              disabled={!canDeleteBudgetRequest(request.workflow_stage)}
                              onClick={() => setDeleteRequest(request)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Budget Request Details</DialogTitle>
              <DialogDescription>Review the submission, open the supporting document, or print the slip.</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">{selectedRequest.project_name || selectedRequest.project_id}</p>
                  <p>Amount: {formatCurrency(Number(selectedRequest.amount || 0))}</p>
                  <p>Stage: {stageLabel(selectedRequest.workflow_stage)}</p>
                  <p>Status: {String(selectedRequest.status || 'pending').toUpperCase()}</p>
                  <p>Document: {selectedRequest.document_name || selectedRequest.document_url || '—'}</p>
                  {selectedRequest.review_notes && <p>Chair notes: {selectedRequest.review_notes}</p>}
                  {selectedRequest.chair_slip_number && <p>Slip No: {selectedRequest.chair_slip_number}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedRequest.document_url && (
                    <Button variant="outline" className="border-slate-300" onClick={() => openDocument(selectedRequest.document_url)}>
                      <FileText className="h-4 w-4 mr-1.5" /> View file
                    </Button>
                  )}
                  <Button variant="outline" className="border-[#BA0021] text-[#BA0021] hover:bg-red-50" onClick={() => printSlip(selectedRequest)}>
                    <Printer className="h-4 w-4 mr-1.5" /> Print slip
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    disabled={!canDeleteBudgetRequest(selectedRequest.workflow_stage)}
                    onClick={() => setDeleteRequest(selectedRequest)}
                  >
                    Delete request
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteRequest} onOpenChange={() => setDeleteRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Budget Request</DialogTitle>
              <DialogDescription>This will permanently delete the request and its uploaded document.</DialogDescription>
            </DialogHeader>
            {deleteRequest && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{deleteRequest.project_name || deleteRequest.project_id}</p>
                <p>Amount: {formatCurrency(Number(deleteRequest.amount || 0))}</p>
                <p>Stage: {stageLabel(deleteRequest.workflow_stage)}</p>
                <p>Document: {deleteRequest.document_name || deleteRequest.document_url || '—'}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteRequest(null)} disabled={deleteSubmitting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteRequest} disabled={deleteSubmitting || !canDeleteBudgetRequest(deleteRequest?.workflow_stage)}>
                {deleteSubmitting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Deleting...</> : 'Delete request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Sent Budget Requests Monitoring</CardTitle>
            <CardDescription>Track whether each request is approved, declined, or pending.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pending</p>
                <p className="text-2xl font-semibold text-amber-700 mt-1">{requests.filter((request) => String(request.workflow_stage || '').toLowerCase() === 'pending').length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Approved</p>
                <p className="text-2xl font-semibold text-emerald-700 mt-1">{requests.filter((request) => String(request.workflow_stage || '').toLowerCase() === 'approved').length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Declined</p>
                <p className="text-2xl font-semibold text-rose-700 mt-1">{requests.filter((request) => String(request.workflow_stage || '').toLowerCase() === 'declined').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Budget Reports and Market Research from Staff</CardTitle>
            <CardDescription>Department staff submissions connected to your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 uppercase tracking-wide text-xs">
                  <tr>
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4">Uploaded By</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">No staff budget reports or market research found.</td>
                    </tr>
                  ) : (
                    staffDocs.map((doc) => (
                      <tr key={doc.id} className="border-t border-slate-100">
                        <td className="py-3 pr-4 text-slate-900">{doc.project_name || doc.project_id || '—'}</td>
                        <td className="py-3 pr-4 text-slate-600">{String(doc.document_type || '').replace('_', ' ').toUpperCase()}</td>
                        <td className="py-3 pr-4 text-slate-600">{doc.title || '—'}</td>
                        <td className="py-3 pr-4 text-slate-600">{doc.uploaded_by_name || '—'}</td>
                        <td className="py-3 pr-4 text-slate-500">{formatDate(doc.created_at)}</td>
                        <td className="py-3 pr-4 text-right">
                          <Button variant="ghost" size="sm" className="text-slate-700 hover:text-[#BA0021]" onClick={() => openDocument(doc.file_url)}>
                            <Eye className="h-4 w-4 mr-1.5" /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
