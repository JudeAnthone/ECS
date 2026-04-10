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
import { PROGRAM_CATEGORIES } from '@/shared/configs/program-categories'
import { filterVisibleDepartments } from '@/shared/configs/department-visibility'
import {
  ClipboardList,
  Eye,
  CheckCircle,
  XCircle,
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

interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  email?: string
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
    project_head_reviewing: 'Project Head Reviewing',
    project_head_accepted: 'Project Head Accepted',
    project_head_declined: 'Project Head Declined',
    proposal_submitted: 'Proposal Submitted',
    proposal_under_review: 'Proposal Under Review',
    proposal_changes_requested: 'Changes Requested',
    pending_final_approval: 'Pending Final Approval',
    approved: 'Fully Approved',
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
    red: 'bg-red-50 border-red-200',
  }
  return (
    <div className={`rounded-lg border p-4 ${colors[color] ?? colors.slate}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function ProgramChairRequestManagement({ onRequestApproved }: { onRequestApproved?: () => void }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [publicUsersByID, setPublicUsersByID] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  // Dialog states
  const [detailReq, setDetailReq] = useState<Request | null>(null)
  const [reviewReq, setReviewReq] = useState<Request | null>(null)
  const [deleteReq, setDeleteReq] = useState<Request | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // Review form
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewProgramCategory, setReviewProgramCategory] = useState('')
  const [reviewDepartmentID, setReviewDepartmentID] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // Assign form removed — assignment moved to Program Management

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

  // Stats
  const total = requests.length
  const pending = requests.filter(r => r.workflow_stage === 'submitted').length
  const reviewed = requests.filter(r => r.status === 'approved').length
  const rejected = requests.filter(r => r.status === 'rejected').length

  const requestedByLabel = (requestedBy: string) => {
    const user = publicUsersByID[requestedBy]
    if (!user) return requestedBy
    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    if (fullName && user.email) return `${fullName} (${user.email})`
    return fullName || user.email || requestedBy
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

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

      const reqRes = await fetch(`${API}/requests`, { headers: authHeaders() })
      if (!reqRes.ok) throw new Error('Failed to fetch requests')
      const reqData = await reqRes.json()
      setRequests(reqData.requests ?? [])

      // Fetch departments
      const deptRes = await fetch(`${API}/departments`, { headers: authHeaders() })
      if (deptRes.ok) {
        const d = await deptRes.json()
        setDepartments(filterVisibleDepartments(d.departments ?? []))
      }

      const publicUsersRes = await fetch(`${API}/users/by-role?role=public_user`, { headers: authHeaders() })
      if (publicUsersRes.ok) {
        const d = await publicUsersRes.json()
        const users = (d.users ?? []) as UserProfile[]
        const map: Record<string, UserProfile> = {}
        users.forEach((u) => {
          if (u.id) map[u.id] = u
        })
        setPublicUsersByID(map)
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
    if (reviewStatus === 'approved' && (!reviewProgramCategory || !reviewDepartmentID)) {
      alert('Please select program category and department before approving.')
      return
    }
    setReviewSubmitting(true)
    try {
      const body: Record<string, unknown> = { status: reviewStatus }
      if (reviewNotes) body.review_notes = reviewNotes
      if (reviewFeedback) body.program_chair_feedback = reviewFeedback
      if (reviewStatus === 'approved') {
        body.program_category = reviewProgramCategory
        body.department_id = reviewDepartmentID
      }
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
      setReviewProgramCategory('')
      setReviewDepartmentID('')
      setReviewStatus('approved')
      await fetchData()
      showToast(
        reviewStatus === 'approved' ? 'Request approved successfully.' : 'Request rejected successfully.',
        'success',
      )
      if (reviewStatus === 'approved') {
        onRequestApproved?.()
      }
    } finally {
      setReviewSubmitting(false)
    }
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

  // ── Assign submit ────────────────────────────────────────────────────────
  // Assign functionality moved to Program Management

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`rounded-lg shadow-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {toast.message}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-[#BA0021]" />
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
            { label: 'Total Requests', value: total, icon: ClipboardList, color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Awaiting Review', value: pending, icon: AlertCircle, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Approved', value: reviewed, icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
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

        {/* Single Requests Table */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xl font-semibold text-slate-800">Program Requests</p>
            <p className="text-sm text-slate-500 mt-0.5">Review incoming requests and manage their approval status.</p>
          </div>

          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
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
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Awaiting Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="under_program_chair_review">Pending Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 pb-2">
            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Requests ({filtered.length})</p>
          </div>

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
                      <td className="px-4 py-3 text-slate-600">{requestedByLabel(req.requested_by)}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(req.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(req.status)}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-600 hover:text-[#BA0021]" onClick={() => setDetailReq(req)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
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
        </div>

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
                <InfoRow label="Requested By" value={requestedByLabel(detailReq.requested_by)} />
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

              {/* Rejection */}
              {detailReq.status === 'rejected' && (
                <Section title="Rejected" color="red">
                  <InfoRow label="Reason" value={detailReq.review_notes || 'No reason provided'} />
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
                      className="text-sm text-[#BA0021] underline break-all"
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
                className="bg-[#BA0021] hover:bg-[#930018] text-white"
                onClick={() => {
                  setDetailReq(null)
                  setReviewReq(detailReq)
                  setReviewStatus('approved')
                  setReviewProgramCategory('')
                  setReviewDepartmentID('')
                }}
              >
                <FileText className="h-4 w-4 mr-1.5" /> Review This Request
              </Button>
            )}
            {/* Department assignment moved to Program Management */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Review Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={!!reviewReq}
        onOpenChange={() => {
          setReviewReq(null)
          setReviewProgramCategory('')
          setReviewDepartmentID('')
          setReviewStatus('approved')
        }}
      >
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

              {/* Department assignment moved to Program Management; review only approves/rejects */}

              {reviewStatus === 'approved' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Program Category <span className="text-red-500">*</span></Label>
                    <Select value={reviewProgramCategory} onValueChange={setReviewProgramCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROGRAM_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Department <span className="text-red-500">*</span></Label>
                    <Select value={reviewDepartmentID} onValueChange={setReviewDepartmentID}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
            <Button
              variant="outline"
              onClick={() => {
                setReviewReq(null)
                setReviewProgramCategory('')
                setReviewDepartmentID('')
                setReviewStatus('approved')
              }}
            >
              Cancel
            </Button>
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

      {/* Department assignment removed from requests UI; assign in Program Management */}

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

    </div>
  )
}
