"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
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
  Search,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Building2,
  Users,
  Wallet,
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
  created_at: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function stageBadge(stage: string) {
  const map: Record<string, string> = {
    assigned_to_department: 'bg-blue-100 text-blue-800 border-blue-200',
    project_head_reviewing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    project_head_accepted: 'bg-green-100 text-green-800 border-green-200',
    project_head_declined: 'bg-red-100 text-red-800 border-red-200',
    proposal_submitted: 'bg-purple-100 text-purple-800 border-purple-200',
    proposal_under_review: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return map[stage] ?? 'bg-slate-100 text-slate-700 border-slate-200'
}

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    assigned_to_department: 'Assigned to Your Department',
    project_head_reviewing: 'Under Review',
    project_head_accepted: 'Accepted',
    project_head_declined: 'Declined',
    proposal_submitted: 'Proposal Submitted',
    proposal_under_review: 'Proposal Under Review',
    proposal_changes_requested: 'Changes Requested',
    pending_final_approval: 'Pending Final Approval',
    approved: 'Fully Approved',
    rejected: 'Rejected',
  }
  return map[stage] ?? stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function fmtDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtBudget(n?: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n)
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800">{value || '—'}</span>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectHeadRequestManagement() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [detailReq, setDetailReq] = useState<Request | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/requests`, { headers: authHeaders() })
      if (!res.ok) throw new Error('Failed to fetch requests')
      const data = await res.json()
      setRequests(data.requests ?? [])
    } catch {
      setError('Failed to load program requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const filtered = requests.filter(r => {
    const matchSearch =
      r.request_title.toLowerCase().includes(search.toLowerCase()) ||
      (r.requested_by ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === 'all' || r.workflow_stage === stageFilter
    return matchSearch && matchStage
  })

  // Stats
  const total = requests.length
  const newlyAssigned = requests.filter(r => r.workflow_stage === 'assigned_to_department').length
  const inProgress = requests.filter(r =>
    ['project_head_reviewing', 'proposal_submitted', 'proposal_under_review'].includes(r.workflow_stage)
  ).length
  const completed = requests.filter(r => r.workflow_stage === 'approved').length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-teal-600" />
              Program Requests
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Program requests assigned to your department for review and implementation.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
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
            { label: 'Total Assigned', value: total, icon: <ClipboardList className="h-5 w-5 text-teal-500" />, border: 'border-l-teal-500' },
            { label: 'Newly Assigned', value: newlyAssigned, icon: <Clock className="h-5 w-5 text-blue-500" />, border: 'border-l-blue-500' },
            { label: 'In Progress', value: inProgress, icon: <AlertCircle className="h-5 w-5 text-yellow-500" />, border: 'border-l-yellow-500' },
            { label: 'Completed', value: completed, icon: <CheckCircle className="h-5 w-5 text-green-500" />, border: 'border-l-green-500' },
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
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="assigned_to_department">Newly Assigned</SelectItem>
                  <SelectItem value="project_head_reviewing">Under Review</SelectItem>
                  <SelectItem value="proposal_submitted">Proposal Submitted</SelectItem>
                  <SelectItem value="approved">Completed / Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">
              Assigned Requests ({filtered.length})
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
                <p className="text-sm">No program requests assigned to your department yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Program Name</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date Submitted</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-medium text-slate-900 truncate">{req.request_title}</p>
                          {req.target_beneficiaries && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Users className="h-3 w-3" /> {req.target_beneficiaries}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{req.requested_by}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Wallet className="h-3.5 w-3.5 text-slate-400" />
                            {fmtBudget(req.estimated_budget)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{fmtDate(req.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${stageBadge(req.workflow_stage)}`}>
                            {stageLabel(req.workflow_stage)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                            onClick={() => setDetailReq(req)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
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

      {/* ── Detail Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!detailReq} onOpenChange={() => setDetailReq(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 pr-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600 shrink-0" />
              {detailReq?.request_title}
            </DialogTitle>
          </DialogHeader>

          {detailReq && (
            <div className="space-y-4 mt-2">

              {/* Stage badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${stageBadge(detailReq.workflow_stage)}`}>
                {stageLabel(detailReq.workflow_stage)}
              </span>

              {/* Program Details */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Program Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow label="Requested By" value={detailReq.requested_by} />
                  <InfoRow label="Date Submitted" value={fmtDate(detailReq.created_at)} />
                  <InfoRow label="Budget Allocation" value={fmtBudget(detailReq.estimated_budget)} />
                  <InfoRow label="Target Beneficiaries" value={detailReq.target_beneficiaries} />
                  {detailReq.requested_department && (
                    <InfoRow label="Preferred Department" value={detailReq.requested_department} />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                  {detailReq.request_description}
                </p>
              </div>

              {/* Objectives */}
              {detailReq.justification && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Objectives</p>
                  <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                    {detailReq.justification}
                  </p>
                </div>
              )}

              {/* Program Chair Review */}
              {detailReq.reviewed_at && (
                <div className="rounded-lg border border-yellow-200 p-4 bg-yellow-50">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Program Chair Review</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow label="Reviewed At" value={fmtDate(detailReq.reviewed_at)} />
                    {detailReq.review_notes && <InfoRow label="Review Notes" value={detailReq.review_notes} />}
                    {detailReq.program_chair_feedback && <InfoRow label="Feedback" value={detailReq.program_chair_feedback} />}
                    {detailReq.assigned_program_id && <InfoRow label="Linked Program" value={detailReq.assigned_program_id} />}
                  </div>
                </div>
              )}

              {/* Assignment info */}
              {detailReq.assignment_notes && (
                <div className="rounded-lg border border-blue-200 p-4 bg-blue-50">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assignment Notes from Program Chair</p>
                  <p className="text-sm text-slate-700">{detailReq.assignment_notes}</p>
                </div>
              )}

            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailReq(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
