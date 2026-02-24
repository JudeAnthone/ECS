"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { Textarea } from '@/shared/components/ui/TextArea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select'
import {
  ClipboardList,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  CornerUpRight,
  Search,
  RotateCcw,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Loader2,
  Trash2,
} from 'lucide-react'

const API = 'http://localhost:8081/api/v1'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

interface Request {
  id: string
  request_title: string
  request_description: string
  requested_by: string
  requested_department: string | null
  estimated_budget: number | null
  target_beneficiaries: string | null
  justification: string | null
  status: string
  workflow_stage: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  assigned_program_id: string | null
  program_chair_feedback: string | null
  assigned_department_id: string | null
  assigned_to_project_head: string | null
  assignment_notes: string | null
  project_head_response: string | null
  project_head_notes: string | null
  proposal_document_url: string | null
  proposal_submitted_date: string | null
  final_approved_by: string | null
  final_approval_date: string | null
  final_approval_notes: string | null
  created_at: string
}

interface Program {
  id: string
  program_name: string
}

interface Department {
  id: string
  department_name: string
  department_code?: string
}

// ── Status helpers ──────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-purple-100 text-purple-800 border-purple-200',
  }
  return map[status.toLowerCase()] ?? 'bg-slate-100 text-slate-700 border-slate-200'
}

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    submitted: 'Awaiting Review',
    under_program_chair_review: 'Approved — Pending Assignment',
    feedback_provided: 'Feedback Provided',
    assigned_to_department: 'Assigned to Department',
    project_head_reviewing: 'Project Head Reviewing',
    project_head_accepted: 'Project Head Accepted',
    project_head_declined: 'Project Head Declined',
    proposal_submitted: 'Proposal Submitted',
    proposal_under_review: 'Proposal Under Review',
    proposal_changes_requested: 'Changes Requested',
    pending_final_approval: 'Pending Final Approval',
    approved: 'Fully Approved',
    rejected: 'Rejected',
  }
  return map[stage] ?? stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800">{value || '—'}</span>
    </div>
  )
}

function Section({ title, children, color = 'slate' }: { title: string; children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-50 border-slate-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  }
  return (
    <div className={`rounded-lg border p-4 ${colors[color] ?? colors.slate}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function ProgramChairRequestManagement() {
  const [requests, setRequests] = useState<Request[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dialog states
  const [detailReq, setDetailReq] = useState<Request | null>(null)
  const [reviewReq, setReviewReq] = useState<Request | null>(null)
  const [assignReq, setAssignReq] = useState<Request | null>(null)
  const [deleteReq, setDeleteReq] = useState<Request | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // Review form
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewDepartmentId, setReviewDepartmentId] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // Assign form — department is required; project head is not
  const [assignDept, setAssignDept] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  // Reroute form
  const [rerouteReq, setRerouteReq] = useState<Request | null>(null)
  const [rerouteDept, setRerouteDept] = useState('')
  const [rerouteSubmitting, setRerouteSubmitting] = useState(false)

  // Stats
  const total = requests.length
  const pending = requests.filter(r => r.workflow_stage === 'submitted').length
  const reviewed = requests.filter(r => r.status === 'approved').length
  const rejected = requests.filter(r => r.status === 'rejected').length
  const assigned = requests.filter(r => r.workflow_stage === 'assigned_to_department').length

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || ''

      // Fetch programs for this chair (for the review dropdown)
      const progRes = await fetch(`${API}/programs/program-chair/${userId}`, { headers: authHeaders() })
      if (progRes.ok) {
        const d = await progRes.json()
        setPrograms(d.programs ?? [])
      }

      // Fetch ALL requests — backend now returns all for program_chair role
      const reqRes = await fetch(`${API}/requests`, { headers: authHeaders() })
      if (!reqRes.ok) throw new Error('Failed to fetch requests')
      const reqData = await reqRes.json()
      setRequests(reqData.requests ?? [])

      // Fetch departments
      const deptRes = await fetch(`${API}/departments`, { headers: authHeaders() })
      if (deptRes.ok) {
        const d = await deptRes.json()
        setDepartments(d.departments ?? [])
      }
    } catch {
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = requests.filter(r => {
    const matchSearch = r.request_title.toLowerCase().includes(search.toLowerCase()) ||
      r.requested_by?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter || r.workflow_stage === statusFilter
    return matchSearch && matchStatus
  })

  // ── Review submit ────────────────────────────────────────────────────────
  async function handleReviewSubmit() {
    if (!reviewReq) return
    setReviewSubmitting(true)
    try {
      const body: Record<string, unknown> = { status: reviewStatus }
      if (reviewNotes) body.review_notes = reviewNotes
      if (reviewFeedback) body.program_chair_feedback = reviewFeedback
      if (reviewDepartmentId) body.assigned_department_id = reviewDepartmentId
      const res = await fetch(`${API}/requests/${reviewReq.id}/review`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Review failed')
        return
      }
      setReviewReq(null)
      setReviewNotes('')
      setReviewFeedback('')
      setReviewDepartmentId('')
      setReviewStatus('approved')
      await fetchData()
    } finally {
      setReviewSubmitting(false)
    }
  }

  // ── Quick approve ────────────────────────────────────────────────────────
  async function handleQuickApprove(req: Request) {
    try {
      const res = await fetch(`${API}/requests/${req.id}/review`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'approved' }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Approve failed'); return }
      await fetchData()
    } catch { alert('Network error') }
  }

  // ── Quick reject ─────────────────────────────────────────────────────────
  async function handleQuickReject(req: Request) {
    try {
      const res = await fetch(`${API}/requests/${req.id}/review`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'rejected' }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Reject failed'); return }
      await fetchData()
    } catch { alert('Network error') }
  }

  // ── Delete submit ────────────────────────────────────────────────────────
  async function handleDeleteSubmit() {
    if (!deleteReq) return
    setDeleteSubmitting(true)
    try {
      const res = await fetch(`${API}/requests/${deleteReq.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Delete failed'); return }
      setDeleteReq(null)
      await fetchData()
    } finally { setDeleteSubmitting(false) }
  }

  // ── Reroute submit ───────────────────────────────────────────────────────
  async function handleRerouteSubmit() {
    if (!rerouteReq || !rerouteDept) return
    setRerouteSubmitting(true)
    try {
      const res = await fetch(`${API}/requests/${rerouteReq.id}/reroute`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ target_department_id: rerouteDept }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Reroute failed'); return }
      setRerouteReq(null)
      setRerouteDept('')
      await fetchData()
    } finally { setRerouteSubmitting(false) }
  }

  // ── Assign submit ────────────────────────────────────────────────────────
  async function handleAssignSubmit() {
    if (!assignReq || !assignDept) return
    setAssignSubmitting(true)
    try {
      const body: Record<string, unknown> = { assigned_department_id: assignDept }
      if (assignNotes) body.assignment_notes = assignNotes
      const res = await fetch(`${API}/requests/${assignReq.id}/assign`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Assignment failed')
        return
      }
      setAssignReq(null)
      setAssignDept('')
      setAssignNotes('')
      await fetchData()
    } finally {
      setAssignSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-indigo-600" />
              Request Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Review and assign incoming service requests for your programs.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RotateCcw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: total, icon: <ClipboardList className="h-5 w-5 text-indigo-500" />, border: 'border-l-indigo-500' },
            { label: 'Awaiting Review', value: pending, icon: <AlertCircle className="h-5 w-5 text-yellow-500" />, border: 'border-l-yellow-500' },
            { label: 'Approved', value: reviewed, icon: <CheckCircle className="h-5 w-5 text-green-500" />, border: 'border-l-green-500' },
            { label: 'Assigned to Dept', value: assigned, icon: <UserCheck className="h-5 w-5 text-blue-500" />, border: 'border-l-blue-500' },
          ].map(s => (
            <Card key={s.label} className={`border-l-4 ${s.border}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
                  </div>
                  {s.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title or requester..."
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Awaiting Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="under_program_chair_review">Pending Assignment</SelectItem>
                  <SelectItem value="assigned_to_department">Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">
              Requests ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading requests...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-medium text-slate-900 truncate">{req.request_title}</p>
                          {req.requested_department && (
                            <p className="text-xs text-slate-400">{req.requested_department}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{req.requested_by}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(req.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(req.status)}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{stageLabel(req.workflow_stage)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-600 hover:text-indigo-600" onClick={() => setDetailReq(req)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {/* Only allow review via dialog, no quick approve/reject */}
                            {/* Assign — show when approved and not yet assigned to a department */}
                            {req.status === 'approved' && !req.assigned_department_id && (
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => setAssignReq(req)} title="Assign to Department">
                                <UserCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {/* Reroute — show when not yet assigned to a department */}
                            {!req.assigned_department_id && req.status !== 'rejected' && (
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50" onClick={() => { setRerouteReq(req); setRerouteDept('') }} title="Reroute to another department">
                                <CornerUpRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {/* Delete */}
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteReq(req)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── View Detail Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!detailReq} onOpenChange={() => setDetailReq(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 pr-6">
              {detailReq?.request_title}
            </DialogTitle>
          </DialogHeader>

          {detailReq && (
            <div className="space-y-4 mt-2">
              {/* Status row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(detailReq.status)}`}>
                  {detailReq.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">{stageLabel(detailReq.workflow_stage)}</span>
              </div>

              {/* Request details */}
              <Section title="Request Details" color="slate">
                <InfoRow label="Requested By" value={detailReq.requested_by} />
                <InfoRow label="Submitted" value={fmt(detailReq.created_at)} />
                <InfoRow label="Department" value={detailReq.requested_department} />
                <InfoRow label="Estimated Budget" value={detailReq.estimated_budget != null ? `₱${detailReq.estimated_budget.toLocaleString()}` : '—'} />
                <InfoRow label="Target Beneficiaries" value={detailReq.target_beneficiaries} />
              </Section>

              {/* Description & Justification */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">{detailReq.request_description}</p>
                </div>
                {detailReq.justification && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Justification / Objectives</p>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">{detailReq.justification}</p>
                  </div>
                )}
              </div>

              {/* Program Chair Review */}
              {detailReq.reviewed_at && (
                <Section title="Program Chair Review" color="yellow">
                  <InfoRow label="Reviewed At" value={fmt(detailReq.reviewed_at)} />
                  <InfoRow label="Review Notes" value={detailReq.review_notes} />
                  <InfoRow label="Feedback" value={detailReq.program_chair_feedback} />
                  <InfoRow label="Assigned Program" value={detailReq.assigned_program_id} />
                </Section>
              )}

              {/* Assignment */}
              {detailReq.assigned_department_id && (
                <Section title="Department Assignment" color="blue">
                  <InfoRow label="Assigned Department" value={departments.find(d => d.id === detailReq.assigned_department_id)?.department_name ?? detailReq.assigned_department_id} />
                  {detailReq.assigned_to_project_head && <InfoRow label="Project Head" value={detailReq.assigned_to_project_head} />}
                  <InfoRow label="Assignment Notes" value={detailReq.assignment_notes} />
                </Section>
              )}

              {/* Project Head Response */}
              {detailReq.project_head_response && (
                <Section title="Project Head Response" color="green">
                  <InfoRow label="Response" value={detailReq.project_head_response} />
                  <InfoRow label="Notes" value={detailReq.project_head_notes} />
                </Section>
              )}

              {/* Proposal */}
              {detailReq.proposal_document_url && (
                <Section title="Proposal" color="purple">
                  <InfoRow label="Submitted" value={fmt(detailReq.proposal_submitted_date)} />
                  <div className="col-span-2">
                    <a
                      href={detailReq.proposal_document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-600 underline break-all"
                    >
                      {detailReq.proposal_document_url}
                    </a>
                  </div>
                </Section>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailReq(null)}>Close</Button>
            {detailReq?.workflow_stage === 'submitted' && (
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => { setDetailReq(null); setReviewReq(detailReq); setReviewStatus('approved') }}
              >
                <FileText className="h-4 w-4 mr-1.5" /> Review This Request
              </Button>
            )}
            {detailReq?.status === 'approved' && !detailReq.assigned_department_id && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => { setDetailReq(null); setAssignReq(detailReq) }}
              >
                <UserCheck className="h-4 w-4 mr-1.5" /> Assign to Department
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Review Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={!!reviewReq} onOpenChange={() => setReviewReq(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
          </DialogHeader>

          {reviewReq && (
            <div className="space-y-4 mt-1">
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 font-medium">{reviewReq.request_title}</p>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Decision <span className="text-red-500">*</span></Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReviewStatus('approved')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                      reviewStatus === 'approved'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 text-slate-500 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => setReviewStatus('rejected')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                      reviewStatus === 'rejected'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 text-slate-500 hover:border-red-300'
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>

              {reviewStatus === 'approved' && departments.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Assign to Department</Label>
                  <Select value={reviewDepartmentId} onValueChange={setReviewDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.department_name}{d.department_code ? ` (${d.department_code})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Review Notes</Label>
                <Textarea
                  placeholder="Add review notes visible to admin..."
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Feedback to Requester</Label>
                <Textarea
                  placeholder="Feedback shown to the public user..."
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewReq(null)}>Cancel</Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewSubmitting}
              className={reviewStatus === 'approved'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'}
            >
              {reviewSubmitting
                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Submitting...</>
                : reviewStatus === 'approved'
                  ? <><CheckCircle className="h-4 w-4 mr-1.5" /> Approve Request</>
                  : <><XCircle className="h-4 w-4 mr-1.5" /> Reject Request</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={!!assignReq} onOpenChange={() => setAssignReq(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign to Department</DialogTitle>
          </DialogHeader>

          {assignReq && (
            <div className="space-y-4 mt-1">
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 font-medium">{assignReq.request_title}</p>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Department <span className="text-red-500">*</span></Label>
                <p className="text-xs text-slate-400">Select the department whose project heads will handle this program request.</p>
                {departments.length > 0 ? (
                  <Select value={assignDept} onValueChange={setAssignDept}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.department_name}{d.department_code ? ` (${d.department_code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Department UUID"
                    value={assignDept}
                    onChange={e => setAssignDept(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Assignment Notes (optional)</Label>
                <Textarea
                  placeholder="Any notes for the department..."
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignReq(null)}>Cancel</Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={assignSubmitting || !assignDept}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {assignSubmitting
                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Assigning...</>
                : <><UserCheck className="h-4 w-4 mr-1.5" /> Assign to Department</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!deleteReq} onOpenChange={() => setDeleteReq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Request
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm text-slate-700">Are you sure you want to delete this request? This action cannot be undone.</p>
            {deleteReq && (
              <p className="text-sm font-semibold text-slate-900 bg-slate-50 rounded-lg px-3 py-2">{deleteReq.request_title}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteReq(null)}>Cancel</Button>
            <Button
              onClick={handleDeleteSubmit}
              disabled={deleteSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteSubmitting
                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Deleting...</>
                : <><Trash2 className="h-4 w-4 mr-1.5" /> Delete</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reroute Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!rerouteReq} onOpenChange={() => setRerouteReq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-600 flex items-center gap-2">
              <CornerUpRight className="h-5 w-5" /> Reroute Request
            </DialogTitle>
          </DialogHeader>
          {rerouteReq && (
            <div className="py-2 space-y-4">
              <p className="text-sm text-slate-600">
                Redirect <span className="font-semibold text-slate-800">{rerouteReq.request_title}</span> to a different department whose program chair will handle it.
              </p>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Target Department <span className="text-red-500">*</span></Label>
                {departments.length > 0 ? (
                  <Select value={rerouteDept} onValueChange={setRerouteDept}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.department_name}{d.department_code ? ` (${d.department_code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-slate-400">No departments loaded.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRerouteReq(null)}>Cancel</Button>
            <Button
              onClick={handleRerouteSubmit}
              disabled={rerouteSubmitting || !rerouteDept}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {rerouteSubmitting
                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Rerouting...</>
                : <><CornerUpRight className="h-4 w-4 mr-1.5" /> Reroute</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
