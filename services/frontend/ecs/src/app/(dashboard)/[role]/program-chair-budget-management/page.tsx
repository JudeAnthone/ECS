"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/TextArea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/Alert';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/DropdownMenu';
import {
  PhilippinePeso,
  FileText,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  Send,
  MoreVertical,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/shared/components/ui/Dialog';
import { Loader2, Check, X, Eye, Printer } from 'lucide-react';
import { API_URL } from '@/shared/lib/api-config';

type ProgramRecord = {
  id: string;
  program_name?: string;
};

type DepartmentRecord = {
  id: string;
  department_name?: string;
};

type ChairBudgetRecord = {
  allocated_budget?: number;
  spent_budget?: number;
};

type ChairDepartmentBudgetRecord = {
  id: string;
  department_id?: string;
  department_name?: string;
  allocated_budget?: number;
  spent_budget?: number;
};

type RequestRecord = {
  id: string;
  assigned_program_id?: string | null;
  project_name?: string;
  project_id?: string;
  requested_by_name?: string;
  requested_by?: string;
  estimated_budget?: number;
  amount?: number;
  status?: string;
  approved_at?: string;
  approved_by?: string;
};

type BudgetRequestRecord = {
  id: string;
  project_id?: string;
  project_name?: string;
  department_id?: string;
  department_name?: string;
  department_allocated_budget?: number;
  department_spent_budget?: number;
  department_remaining_budget?: number;
  requested_by_name?: string;
  amount?: number;
  reason?: string;
  needed_by_date?: string;
  status?: string;
  workflow_stage?: string;
  document_url?: string;
  document_name?: string;
  reviewed_by_name?: string;
  review_notes?: string;
  chair_slip_number?: string;
  chair_slip_generated_at?: string;
  created_at?: string;
};

function budgetStageLabel(stage?: string) {
  const normalized = String(stage || '').toLowerCase();
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'approved') return 'Approved';
  if (normalized === 'declined') return 'Declined';
  return 'Pending';
}

function getBudgetRequestDocumentUrl(documentUrl?: string) {
  const raw = String(documentUrl || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  const normalized = raw.replace(/\\/g, '/').replace(/^\/+/, '')
  if (normalized.startsWith('uploads/')) return `${API_URL}/${normalized}`
  return `${API_URL}/uploads/${normalized.replace(/^uploads\//, '')}`
}

function canChairReviewBudgetRequest(stage?: string) {
  return String(stage || '').toLowerCase() === 'pending'
}

export default function ProgramChairBudgetManagementPage() {
  const API = `${API_URL}/api/v1`

  const [program, setProgram] = useState<ProgramRecord | null>(null)
  const [departments, setDepartments] = useState<DepartmentRecord[]>([])
  const [chairBudget, setChairBudget] = useState<ChairBudgetRecord | null>(null)
  const [totalBudget, setTotalBudget] = useState<number | null>(null)
  const [chairDepartmentBudgets, setChairDepartmentBudgets] = useState<ChairDepartmentBudgetRecord[]>([])
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [allocDeptId, setAllocDeptId] = useState('')
  const [allocAmount, setAllocAmount] = useState('')
  const [allocSubmitting, setAllocSubmitting] = useState(false)
  const [allocErrorDialog, setAllocErrorDialog] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [allocBlocked, setAllocBlocked] = useState(false)
  const [allocBlockDetails, setAllocBlockDetails] = useState<{ requested: number; available: number; overBy: number } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [error, setError] = useState('')
  const [revertDialog, setRevertDialog] = useState<{ deptId: string; deptName?: string } | null>(null)
  const [revertSubmitting, setRevertSubmitting] = useState(false)
  const [viewDept, setViewDept] = useState<ChairDepartmentBudgetRecord | null>(null)

  // Slip modal
  const [approvedSlip, setApprovedSlip] = useState<RequestRecord | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [budgetReviewReq, setBudgetReviewReq] = useState<BudgetRequestRecord | null>(null)
  const [budgetReviewStatus, setBudgetReviewStatus] = useState<'approved' | 'declined'>('approved')
  const [budgetReviewNotes, setBudgetReviewNotes] = useState('')
  const [budgetReviewSubmitting, setBudgetReviewSubmitting] = useState(false)
  const [budgetDeleteReq, setBudgetDeleteReq] = useState<BudgetRequestRecord | null>(null)
  const [budgetDeleteSubmitting, setBudgetDeleteSubmitting] = useState(false)
  const [approvedBudgetSlip, setApprovedBudgetSlip] = useState<BudgetRequestRecord | null>(null)

  function authHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || ''

      // Fetch programs for this chair
      let fetchedProgram: ProgramRecord | null = null
      const progRes = await fetch(`${API}/programs/program-chair/${userId}`, { headers: authHeaders() })
      if (progRes.ok) {
        const d = await progRes.json()
        fetchedProgram = (d.programs && d.programs[0]) || null
        setProgram(fetchedProgram)
      }

      // Fetch this chair's admin-defined budget cap
      const chairBudgetRes = await fetch(`${API}/budgets/chairs?chair_id=${userId}`, { headers: authHeaders() })
      if (chairBudgetRes.ok) {
        const cbd = await chairBudgetRes.json()
        const ownBudget = (cbd.program_chair_budgets || [])[0] || null
        setChairBudget(ownBudget)
      } else {
        setChairBudget(null)
      }

      // Try to fetch total budget summary (admin-only endpoint may 403 for non-admins)
      try {
        const totRes = await fetch(`${API}/budgets/summary`, { headers: authHeaders() })
        if (totRes.ok) {
          const td = await totRes.json()
          setTotalBudget(typeof td.total === 'number' ? td.total : null)
        } else {
          setTotalBudget(null)
        }
      } catch (e) {
        setTotalBudget(null)
      }

      // Fetch departments
      const deptRes = await fetch(`${API}/departments`, { headers: authHeaders() })
      if (deptRes.ok) {
        const dd = await deptRes.json()
        setDepartments(dd.departments || [])
      }

      // Fetch existing per-department allocations for this chair
      const deptBudgetRes = await fetch(`${API}/budgets/chair-departments?chair_id=${userId}`, { headers: authHeaders() })
      if (deptBudgetRes.ok) {
        const dbd = await deptBudgetRes.json()
        setChairDepartmentBudgets(dbd.chair_department_budgets || [])
      } else {
        setChairDepartmentBudgets([])
      }

      // Fetch requests and filter using the freshly fetched program (avoid depending on state)
      const reqRes = await fetch(`${API}/requests`, { headers: authHeaders() })
      if (reqRes.ok) {
        const rd = await reqRes.json()
        const all: RequestRecord[] = rd.requests || []
        const filtered = fetchedProgram ? all.filter((r) => r.assigned_program_id === fetchedProgram.id || r.assigned_program_id == null) : all
        setRequests(filtered)
      }

      const budgetReqRes = await fetch(`${API}/budget-requests`, { headers: authHeaders() })
      if (budgetReqRes.ok) {
        const bd = await budgetReqRes.json()
        setBudgetRequests(bd.requests || [])
      } else {
        setBudgetRequests([])
      }
    } catch (error) {
      setError('Failed to load data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [API])

  useEffect(() => { fetchData() }, [fetchData])

  const formatCurrency = (v?: number) => {
    if (v === undefined || v === null) return '₱0.00'
    return `₱${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatNumberLabel = (s?: string) => {
    if (!s) return '0'
    const n = Number(s)
    if (isNaN(n)) return '0'
    if (Number.isInteger(n)) return n.toLocaleString()
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const visibleDepartments = departments.filter(d => {
    const name = (d.department_name || '').trim().toLowerCase()
    return name !== 'program management' && name !== 'system administration'
  })

  const handleAssignDept = async () => {
    // validate then open confirmation modal (show block details inside modal)
    setAllocErrorDialog(null)
    if (!program) { setAllocErrorDialog('No program selected'); return }
    if (!allocDeptId) { setAllocErrorDialog('Select a department'); return }
    const amt = parseFloat(allocAmount)
    if (isNaN(amt) || amt <= 0) { setAllocErrorDialog('Enter valid amount'); return }
    // Client-side check against chair cap before confirming
    const cap = Number(chairBudget?.allocated_budget ?? 0)
    let blocked = false
    let details = null
    if (cap > 0) {
      const existing = Number(chairDepartmentBudgets.find(b => b.department_id === allocDeptId)?.allocated_budget ?? 0)
      const currentSum = deptAllocatedSum
      const newSum = currentSum - existing + amt
      if (newSum > cap) {
        blocked = true
        const overBy = newSum - cap
        const remainingBefore = cap - (currentSum - existing)
        details = { requested: amt, available: Math.max(0, remainingBefore), overBy }
      }
    }
    setAllocBlocked(blocked)
    setAllocBlockDetails(details)
    setConfirmOpen(true)
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

  const handleDeptChange = (v: string) => {
    setAllocDeptId(v)
    const existing = chairDepartmentBudgets.find(b => b.department_id === v)
    setAllocAmount(existing ? String(existing.allocated_budget ?? '') : '')
  }

  const confirmAssign = async () => {
    // performs the actual PATCH call
    if (allocBlocked) {
      setAllocErrorDialog('Allocation blocked — allocation exceeds chair budget cap. Adjust allocations first.');
      return
    }
    setAllocSubmitting(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || ''
      const amt = parseFloat(allocAmount)
      const res = await fetch(`${API}/budgets/chairs/${userId}/departments/${allocDeptId}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ allocated_budget: amt })
      })
      if (!res.ok) {
        let raw = 'Failed to assign'
        try { const d = await res.json(); raw = d?.error || d?.message || JSON.stringify(d) } catch (e) { const txt = await res.text(); raw = txt || raw }
        console.error('Assign dept failed:', raw)
        let friendly = 'Allocation failed.'
        const lraw = String(raw).toLowerCase()
        if (/department allocations exceed/i.test(raw) || /exceed.*chair.*cap/i.test(raw) || (lraw.includes('exceed') && lraw.includes('cap'))) {
          friendly = 'Allocation failed — exceeds the chair budget cap.'
        } else if (lraw.includes('cap limit') || lraw.includes('cap')) {
          friendly = 'Allocation failed — cap limit reached.'
        }
        setAllocErrorDialog(`${friendly}\n\nDetails: ${raw}`)
        setToast({ message: friendly, type: 'error' })
        setConfirmOpen(false)
        return
      }
      const newItem = await res.json()
      setChairDepartmentBudgets(prev => {
        const idx = prev.findIndex(p => p.department_id === newItem.department_id)
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = {
            id: newItem.id,
            department_id: newItem.department_id,
            department_name: newItem.department_name,
            allocated_budget: newItem.allocated_budget,
            spent_budget: newItem.spent_budget,
          }
          return copy
        }
        return [
          ...prev,
          {
            id: newItem.id,
            department_id: newItem.department_id,
            department_name: newItem.department_name,
            allocated_budget: newItem.allocated_budget,
            spent_budget: newItem.spent_budget,
          }
        ]
      })
      setAllocAmount('')
      setAllocDeptId('')
      await fetchData()
      setConfirmOpen(false)
      setAllocBlocked(false)
      setAllocBlockDetails(null)
      setToast({ message: 'Department allocation saved successfully!', type: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign allocation'
      console.error(error)
      setAllocErrorDialog(message)
      setToast({ message: message, type: 'error' })
    } finally { setAllocSubmitting(false) }
  }

  const promptRevertAllocation = (deptId: string, deptName?: string) => {
    setRevertDialog({ deptId, deptName })
  }

  const handleRevertAllocation = async () => {
    if (!revertDialog) return
    setRevertSubmitting(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id || ''
      const res = await fetch(`${API}/budgets/chairs/${userId}/departments/${revertDialog.deptId}`, {
        method: 'DELETE', headers: authHeaders()
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to revert')
      }
      // remove from local state
      setChairDepartmentBudgets(prev => prev.filter(p => p.department_id !== revertDialog.deptId))
      await fetchData()
      setToast({ message: 'Department allocation reverted.', type: 'success' })
      setRevertDialog(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to revert allocation'
      console.error(err)
      setToast({ message: msg, type: 'error' })
    } finally {
      setRevertSubmitting(false)
    }
  }

  const handleReview = async (req: RequestRecord, status: 'approved' | 'rejected') => {
    setReviewSubmitting(true)
    try {
      const body = { status }
      const res = await fetch(`${API}/requests/${req.id}/review`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Review failed') }
      // on approve, show slip
      if (status === 'approved') {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setApprovedSlip({
          ...req,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        } as RequestRecord)
      }
      await fetchData()
      setToast({ message: status === 'approved' ? 'Request approved successfully!' : 'Request rejected successfully!', type: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      setToast({ message, type: 'error' })
      console.error(error)
    } finally { setReviewSubmitting(false) }
  }

  const printSlip = () => { window.print() }

  const handleBudgetReview = async () => {
    if (!budgetReviewReq) return
    if (!canChairReviewBudgetRequest(budgetReviewReq.workflow_stage)) {
      setToast({ message: 'This request has already been reviewed.', type: 'error' })
      return
    }
    if (budgetReviewStatus === 'declined' && !budgetReviewNotes.trim()) {
      setError('Please add review notes when declining a budget request.')
      return
    }
    setBudgetReviewSubmitting(true)
    try {
      const body: Record<string, unknown> = { approval_status: budgetReviewStatus }
      if (budgetReviewNotes.trim()) body.review_notes = budgetReviewNotes.trim()
      const res = await fetch(`${API}/budget-requests/${budgetReviewReq.id}/review`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Budget review failed')
      }
      const updated = await res.json()
      if (budgetReviewStatus === 'approved') {
        setApprovedBudgetSlip(updated)
      }
      setBudgetReviewReq(null)
      setBudgetReviewNotes('')
      setBudgetReviewStatus('approved')
      await fetchData()
      setToast({ message: budgetReviewStatus === 'approved' ? 'Budget request approved successfully.' : 'Budget request declined successfully.', type: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Budget review failed'
      setError(message)
      setToast({ message, type: 'error' })
    } finally {
      setBudgetReviewSubmitting(false)
    }
  }

  const handleDeleteBudgetRequest = async () => {
    if (!budgetDeleteReq) return
    setBudgetDeleteSubmitting(true)
    try {
      const res = await fetch(`${API}/budget-requests/${budgetDeleteReq.id}`, {
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
      if (budgetReviewReq?.id === budgetDeleteReq.id) {
        setBudgetReviewReq(null)
      }
      setBudgetDeleteReq(null)
      await fetchData()
      setToast({ message: 'Budget request deleted successfully.', type: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete budget request'
      setToast({ message, type: 'error' })
    } finally {
      setBudgetDeleteSubmitting(false)
    }
  }

  const spent = Number(chairBudget?.spent_budget ?? 0)
  const allocated = Number(chairBudget?.allocated_budget ?? 0)
  const deptAllocatedSum = chairDepartmentBudgets.reduce((s, b) => s + Number(b.allocated_budget || 0), 0)
  const pctDept = allocated > 0 ? Math.min(100, Math.round((deptAllocatedSum / allocated) * 100)) : 0

  const getDeptColor = (index: number, id?: string) => {
    const palette = [
      '#60A5FA', // blue-400
      '#34D399', // green-400
      '#F59E0B', // amber-500
      '#F97316', // orange-500
      '#EF4444', // red-500
      '#A78BFA', // purple-400
      '#06B6D4', // cyan-400
      '#F472B6', // pink-400
    ]
    // deterministic pick by id if available
    if (id) {
      let sum = 0
      for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
      return palette[sum % palette.length]
    }
    return palette[index % palette.length]
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`rounded-lg shadow-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {toast.message}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Management</h1>
            <p className="text-slate-500 mt-1">Manage program allocations and review budget requests</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</Button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {/* Top cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm text-slate-500">Available Budget</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(Math.max(0, allocated - spent - deptAllocatedSum))}</div>
            <div className="mt-3">
              <div className="text-xs text-slate-500">Overall Budget:</div>
              <div className="text-2xl font-extrabold text-slate-900">{chairBudget ? formatCurrency(Number(chairBudget.allocated_budget || 0)) : '—'}</div>
              <div className="text-xs text-slate-500 mt-1">Given budget by admin: {chairBudget ? formatCurrency(Number(chairBudget.allocated_budget || 0)) : '—'}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Allocated to departments / Total</div>
                <div className="text-lg font-semibold text-slate-900 mt-1">{formatCurrency(deptAllocatedSum)} / {formatCurrency(allocated)}</div>
                <div className="text-xs text-slate-500 mt-1">Remaining: {formatCurrency(Math.max(0, allocated - deptAllocatedSum - spent))}</div>
              </div>
              <div className="text-sm text-slate-500">Dept Allocated: {pctDept}%</div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden relative">
              {allocated > 0 && chairDepartmentBudgets.length > 0 ? (
                <div className="flex h-3 rounded-full overflow-hidden">
                  {chairDepartmentBudgets.map((d, i) => {
                    const val = Number(d.allocated_budget || 0)
                    const widthPct = Math.min(100, (val / allocated) * 100)
                    if (widthPct <= 0) return null
                    const color = getDeptColor(i, d.department_id || d.id)
                    return (
                      <div
                        key={d.id}
                        title={`${d.department_name || d.department_id}: ${formatCurrency(val)}`}
                        style={{ width: `${widthPct}%`, backgroundColor: color }}
                        className="h-3"
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="h-3" />
              )}
            </div>
            {/* Legend showing department colors */}
            {chairDepartmentBudgets.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                {chairDepartmentBudgets.map((d, i) => {
                  const val = Number(d.allocated_budget || 0)
                  if (val <= 0) return null
                  const color = getDeptColor(i, d.department_id || d.id)
                  return (
                    <div key={d.id} className="flex items-center gap-2 bg-white border border-slate-100 rounded px-2 py-1">
                      <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 3 }} />
                      <div className="text-xs text-slate-600">{d.department_name || d.department_id} — <span className="font-medium">{formatCurrency(val)}</span></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Department allocation form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-700">Department Allocation (Annual cap)</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <div className="text-xs text-slate-500">Department</div>
              <Select value={allocDeptId} onValueChange={(v) => handleDeptChange(v)}>
                <SelectTrigger className="w-full border-slate-300"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {visibleDepartments.map(d => <SelectItem key={d.id} value={d.id}>{d.department_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Amount (₱)</div>
                <div className="text-xs text-blue-600 font-medium">= {formatNumberLabel(allocAmount)}</div>
              </div>
              <div className="mt-1">
                <Input type="number" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} placeholder="0.00" className="border-slate-300 w-full" />
              </div>
            </div>
            <div>
              <Button onClick={handleAssignDept} className="w-full bg-[#BA0021] hover:bg-[#930018] text-white" disabled={!allocDeptId || allocSubmitting}>{allocSubmitting ? 'Saving…' : 'Assign'}</Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Allocated</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Spent</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chairDepartmentBudgets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No department allocations yet.</td>
                  </tr>
                ) : (
                  chairDepartmentBudgets.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2">{item.department_name || item.department_id}</td>
                      <td className="px-3 py-2">{formatCurrency(item.allocated_budget)}</td>
                      <td className="px-3 py-2">{formatCurrency(item.spent_budget)}</td>
                      <td className="px-3 py-2 align-bottom">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                                <MoreVertical className="h-4 w-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                              <DropdownMenuItem onClick={() => setViewDept(item)}>View details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => promptRevertAllocation(item.department_id || '', item.department_name)} className="text-red-600">Revert allocation</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium">Budget Requests</h3>
              <p className="text-xs text-slate-500 mt-1">Review Project Head submissions and provide chair feedback.</p>
            </div>
            <div className="text-xs text-slate-500">Chair Review</div>
          </div>
          {loading ? (
            <div className="py-8 text-slate-400">Loading…</div>
          ) : budgetRequests.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No budget requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgetRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-slate-900 truncate">{request.project_name || request.project_id}</p>
                        <p className="text-xs text-slate-400 truncate">{request.reason}</p>
                      </td>
                      <td className="px-4 py-3">{request.requested_by_name || '—'}</td>
                      <td className="px-4 py-3">{formatCurrency(Number(request.amount || 0))}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${request.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : request.status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {budgetStageLabel(request.workflow_stage)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Budget request actions">
                              <MoreVertical className="h-4 w-4 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-slate-200">
                            <DropdownMenuItem onClick={() => {
                              setBudgetReviewReq(request)
                              setBudgetReviewStatus('approved')
                              setBudgetReviewNotes(request.review_notes || '')
                            }}>View details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approval slip dialog */}
        <Dialog open={!!approvedSlip} onOpenChange={() => setApprovedSlip(null)}>
          <DialogContent className="max-w-md print:max-w-full">
            <DialogHeader>
              <DialogTitle>Approval Slip</DialogTitle>
            </DialogHeader>
            {approvedSlip && (
              <div className="space-y-3 p-2">
                <div className="text-sm text-slate-600">Request ID: <span className="font-semibold">{approvedSlip.id}</span></div>
                <div className="text-sm text-slate-600">Project: <span className="font-semibold">{approvedSlip.project_name || approvedSlip.project_id}</span></div>
                <div className="text-sm text-slate-600">Amount: <span className="font-semibold">{formatCurrency(approvedSlip.estimated_budget || approvedSlip.amount)}</span></div>
                <div className="text-sm text-slate-600">Approved By: <span className="font-semibold">{approvedSlip.approved_by}</span></div>
                <div className="text-sm text-slate-600">Approved At: <span className="font-semibold">{new Date(approvedSlip.approved_at).toLocaleString()}</span></div>
                <div className="pt-4">
                  <Button onClick={printSlip} className="mr-2">Print Slip</Button>
                  <Button variant="outline" onClick={() => setApprovedSlip(null)}>Close</Button>
                </div>
              </div>
            )}
            <DialogFooter />
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!budgetReviewReq}
          onOpenChange={() => {
            setBudgetReviewReq(null)
            setBudgetReviewStatus('approved')
            setBudgetReviewNotes('')
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Budget Request</DialogTitle>
              <DialogDescription>Approve or reject the request from the Project Head.</DialogDescription>
            </DialogHeader>
            {budgetReviewReq && (
              <div className="space-y-4 mt-1">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">{budgetReviewReq.project_name || budgetReviewReq.project_id}</p>
                  <p>Amount: {formatCurrency(budgetReviewReq.amount)}</p>
                  <p>Department: {budgetReviewReq.department_name || budgetReviewReq.department_id || '—'}</p>
                  <p>Department Allocated: {formatCurrency(Number(budgetReviewReq.department_allocated_budget || 0))}</p>
                  <p>Department Spent: {formatCurrency(Number(budgetReviewReq.department_spent_budget || 0))}</p>
                  <p>Department Remaining: {formatCurrency(Number(budgetReviewReq.department_remaining_budget || 0))}</p>
                  <p>
                    Remaining After Approval:{' '}
                    {formatCurrency(Number(budgetReviewReq.department_remaining_budget || 0) - Number(budgetReviewReq.amount || 0))}
                  </p>
                  <p>Stage: {budgetStageLabel(budgetReviewReq.workflow_stage)}</p>
                  <p>Document: {budgetReviewReq.document_name || budgetReviewReq.document_url || '—'}</p>
                  {budgetReviewReq.reviewed_by_name && <p>Reviewed by: {budgetReviewReq.reviewed_by_name}</p>}
                  {budgetReviewReq.review_notes && <p>Review notes: {budgetReviewReq.review_notes}</p>}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {budgetReviewReq.document_url && (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-300"
                        onClick={() => window.open(getBudgetRequestDocumentUrl(budgetReviewReq.document_url), '_blank', 'noopener,noreferrer')}
                      >
                        <FileText className="h-4 w-4 mr-1.5" /> View file
                      </Button>
                    )}
                  </div>
                </div>

                {!canChairReviewBudgetRequest(budgetReviewReq.workflow_stage) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    This request has already moved past chair review.
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Decision</Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => canChairReviewBudgetRequest(budgetReviewReq.workflow_stage) && setBudgetReviewStatus('approved')}
                      disabled={!canChairReviewBudgetRequest(budgetReviewReq.workflow_stage) || budgetReviewSubmitting}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${budgetReviewStatus === 'approved' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:border-green-300'} ${!canChairReviewBudgetRequest(budgetReviewReq.workflow_stage) || budgetReviewSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => canChairReviewBudgetRequest(budgetReviewReq.workflow_stage) && setBudgetReviewStatus('declined')}
                      disabled={!canChairReviewBudgetRequest(budgetReviewReq.workflow_stage) || budgetReviewSubmitting}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${budgetReviewStatus === 'declined' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:border-red-300'} ${!canChairReviewBudgetRequest(budgetReviewReq.workflow_stage) || budgetReviewSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <X className="h-4 w-4" /> Decline
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Review Notes</Label>
                  <Textarea
                    placeholder="Add chair feedback or review notes"
                    value={budgetReviewNotes}
                    onChange={(event) => setBudgetReviewNotes(event.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setBudgetReviewReq(null)
                setBudgetReviewStatus('approved')
                setBudgetReviewNotes('')
              }}>Cancel</Button>
              <Button
                onClick={handleBudgetReview}
                disabled={budgetReviewSubmitting || !canChairReviewBudgetRequest(budgetReviewReq?.workflow_stage)}
                className={budgetReviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              >
                {budgetReviewSubmitting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving...</> : budgetReviewStatus === 'approved' ? <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve Request</> : <><X className="h-4 w-4 mr-1.5" /> Decline Request</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={!!approvedBudgetSlip} onOpenChange={() => setApprovedBudgetSlip(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Budget Approval Slip</DialogTitle>
            </DialogHeader>
            {approvedBudgetSlip && (
              <div className="space-y-3 p-2">
                <div className="text-sm text-slate-600">Slip No: <span className="font-semibold">{approvedBudgetSlip.chair_slip_number || 'Generated'}</span></div>
                <div className="text-sm text-slate-600">Request ID: <span className="font-semibold">{approvedBudgetSlip.id}</span></div>
                <div className="text-sm text-slate-600">Project: <span className="font-semibold">{approvedBudgetSlip.project_name || approvedBudgetSlip.project_id}</span></div>
                <div className="text-sm text-slate-600">Amount: <span className="font-semibold">{formatCurrency(Number(approvedBudgetSlip.amount || 0))}</span></div>
                <div className="text-sm text-slate-600">Generated At: <span className="font-semibold">{approvedBudgetSlip.chair_slip_generated_at ? new Date(approvedBudgetSlip.chair_slip_generated_at).toLocaleString() : 'Now'}</span></div>
                <div className="pt-4">
                  <Button onClick={() => window.print()} className="mr-2">Print Slip</Button>
                  <Button variant="outline" onClick={() => setApprovedBudgetSlip(null)}>Close</Button>
                </div>
              </div>
            )}
            <DialogFooter />
          </DialogContent>
        </Dialog>
        <Dialog open={!!budgetDeleteReq} onOpenChange={() => setBudgetDeleteReq(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Budget Request</DialogTitle>
              <DialogDescription>This will permanently delete the request and its uploaded document.</DialogDescription>
            </DialogHeader>
            {budgetDeleteReq && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{budgetDeleteReq.project_name || budgetDeleteReq.project_id}</p>
                <p>Amount: {formatCurrency(Number(budgetDeleteReq.amount || 0))}</p>
                <p>Stage: {budgetStageLabel(budgetDeleteReq.workflow_stage)}</p>
                <p>Document: {budgetDeleteReq.document_name || budgetDeleteReq.document_url || '—'}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setBudgetDeleteReq(null)} disabled={budgetDeleteSubmitting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteBudgetRequest} disabled={budgetDeleteSubmitting}>
                {budgetDeleteSubmitting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Deleting...</> : 'Delete request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Revert allocation confirm dialog */}
        <Dialog open={!!revertDialog} onOpenChange={() => setRevertDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Revert Allocation</DialogTitle>
              <div className="text-sm text-slate-600">Are you sure you want to revert the allocation for <strong>{revertDialog?.deptName || ''}</strong>? This will return the funds to your available budget.</div>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-300">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleRevertAllocation} disabled={revertSubmitting}>{revertSubmitting ? 'Reverting...' : 'Revert'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* View department allocation details dialog */}
        <Dialog open={!!viewDept} onOpenChange={() => setViewDept(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Department Allocation</DialogTitle>
            </DialogHeader>
            {viewDept && (
              <div className="space-y-3 p-2">
                <div className="text-sm text-slate-600">Department: <span className="font-semibold">{viewDept.department_name || viewDept.department_id}</span></div>
                <div className="text-sm text-slate-600">Allocated: <span className="font-semibold">{formatCurrency(viewDept.allocated_budget)}</span></div>
                <div className="text-sm text-slate-600">Spent: <span className="font-semibold">{formatCurrency(viewDept.spent_budget)}</span></div>
                <div className="text-sm text-slate-600">Record ID: <span className="font-semibold">{viewDept.id}</span></div>
                <div className="pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </div>
              </div>
            )}
            <DialogFooter />
          </DialogContent>
        </Dialog>
        {/* Allocation error dialog */}
        <Dialog open={!!allocErrorDialog} onOpenChange={() => setAllocErrorDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Allocation Error</DialogTitle>
            </DialogHeader>
            <div className="p-2">
              <pre className="whitespace-pre-wrap text-sm text-slate-700">{allocErrorDialog}</pre>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Confirm allocation dialog */}
        <Dialog open={confirmOpen} onOpenChange={(open) => {
          setConfirmOpen(open)
          if (!open) {
            setAllocBlocked(false)
            setAllocBlockDetails(null)
            setAllocErrorDialog(null)
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Allocation</DialogTitle>
            </DialogHeader>
            <div className="p-2 text-sm text-slate-700">
              Are you sure you want to allocate <strong>{formatCurrency(Number(allocAmount || 0))}</strong> to <strong>{departments.find(d => d.id === allocDeptId)?.department_name || ''}</strong>?
            </div>
            {allocBlocked && allocBlockDetails && (
              <div className="p-3 bg-red-50 border border-red-100 rounded mb-3">
                <div className="text-sm font-semibold text-red-700">Allocation blocked — exceeds chair budget cap.</div>
                <div className="text-sm text-slate-700 mt-2">Requested: {formatCurrency(allocBlockDetails.requested)}</div>
                <div className="text-sm text-slate-700">Available for this chair: {formatCurrency(allocBlockDetails.available)}</div>
                <div className="text-sm text-slate-700">Over by: {formatCurrency(allocBlockDetails.overBy)}</div>
                <div className="mt-2 text-sm text-red-700">Adjust department allocations or increase the cap before confirming.</div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-300">Cancel</Button>
              </DialogClose>
              <Button onClick={confirmAssign} disabled={allocSubmitting || allocBlocked}>{allocSubmitting ? 'Saving...' : 'Confirm'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
