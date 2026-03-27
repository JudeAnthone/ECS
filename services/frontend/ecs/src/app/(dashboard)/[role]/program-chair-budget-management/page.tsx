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
  PhilippinePeso,
  FileText,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/Dialog';
import { Loader2, Check, X } from 'lucide-react';

export default function ProgramChairBudgetManagementPage() {
  const API = 'http://localhost:8081/api/v1'

  const [program, setProgram] = useState<any | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [allocDeptId, setAllocDeptId] = useState('')
  const [allocAmount, setAllocAmount] = useState('')
  const [allocSubmitting, setAllocSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Slip modal
  const [approvedSlip, setApprovedSlip] = useState<any | null>(null)
  const [reviewingRequest, setReviewingRequest] = useState<any | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

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
      let fetchedProgram: any = null
      const progRes = await fetch(`${API}/programs/program-chair/${userId}`, { headers: authHeaders() })
      if (progRes.ok) {
        const d = await progRes.json()
        fetchedProgram = (d.programs && d.programs[0]) || null
        setProgram(fetchedProgram)
      }

      // Fetch departments
      const deptRes = await fetch(`${API}/departments`, { headers: authHeaders() })
      if (deptRes.ok) {
        const dd = await deptRes.json()
        setDepartments(dd.departments || [])
      }

      // Fetch requests and filter using the freshly fetched program (avoid depending on state)
      const reqRes = await fetch(`${API}/requests`, { headers: authHeaders() })
      if (reqRes.ok) {
        const rd = await reqRes.json()
        const all = rd.requests || []
        const filtered = fetchedProgram ? all.filter((r: any) => r.assigned_program_id === fetchedProgram.id || r.assigned_program_id == null) : all
        setRequests(filtered)
      }
    } catch (e) {
      setError('Failed to load data')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const formatCurrency = (v?: number) => {
    if (v === undefined || v === null) return '₱0.00'
    return `₱${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleAssignDept = async () => {
    if (!program) return alert('No program selected')
    if (!allocDeptId) return alert('Select a department')
    const amt = parseFloat(allocAmount)
    if (isNaN(amt) || amt <= 0) return alert('Enter valid amount')
    setAllocSubmitting(true)
    try {
      // best-effort API call; backend may not have this endpoint yet
      const res = await fetch(`${API}/programs/${program.id}/departments/${allocDeptId}/allocation`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ allocation: amt })
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to assign')
      }
      setAllocAmount('')
      setAllocDeptId('')
      await fetchData()
      alert('Department allocation saved')
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Failed to assign allocation')
    } finally { setAllocSubmitting(false) }
  }

  const handleReview = async (req: any, status: 'approved' | 'rejected') => {
    setReviewingRequest(req)
    setReviewSubmitting(true)
    try {
      const body: any = { status }
      const res = await fetch(`${API}/requests/${req.id}/review`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Review failed') }
      // on approve, show slip
      if (status === 'approved') setApprovedSlip({ ...req, approved_at: new Date().toISOString(), approved_by: JSON.parse(localStorage.getItem('user') || '{}').id })
      await fetchData()
    } catch (e: any) {
      alert(e.message || 'Action failed')
      console.error(e)
    } finally { setReviewSubmitting(false); setReviewingRequest(null) }
  }

  const printSlip = () => { window.print() }

  const spent = program?.spent_budget ?? 0
  const allocated = program?.budget_allocation ?? 0
  const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
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
            <div className="text-sm text-slate-500">Allocated Budget (Program)</div>
            <div className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(allocated)}</div>
            <div className="text-xs text-slate-500 mt-2">Program: {program?.program_name ?? '—'}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Spent / Allocated</div>
                <div className="text-lg font-semibold text-slate-900 mt-1">{formatCurrency(spent)} / {formatCurrency(allocated)}</div>
                <div className="text-xs text-slate-500 mt-1">Remaining: {formatCurrency(Math.max(0, allocated - spent))}</div>
              </div>
              <div className="text-sm text-slate-500">Usage: {pct}%</div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden">
              <div style={{ width: `${pct}%` }} className={`h-3 ${pct >= 90 ? 'bg-red-600' : pct >= 30 ? 'bg-amber-400' : 'bg-green-600'}`} />
            </div>
          </div>
        </div>

        {/* Department allocation form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-700">Department Allocation (Annual cap)</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <div className="text-xs text-slate-500">Department</div>
              <Select value={allocDeptId} onValueChange={v => setAllocDeptId(v)}>
                <SelectTrigger className="w-full border-slate-300"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.department_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-slate-500">Amount (₱)</div>
              <Input type="number" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} placeholder="0.00" className="border-slate-300" />
            </div>
            <div>
              <Button onClick={handleAssignDept} className="w-full" disabled={allocSubmitting}>{allocSubmitting ? 'Saving…' : 'Assign'}</Button>
            </div>
          </div>
        </div>

        {/* Requests table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Budget Requests</h3>
            <div className="text-xs text-slate-500">Approve or decline project requests</div>
          </div>
          {loading ? (
            <div className="py-8 text-slate-400">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No budget requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Request ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested By</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">{r.id}</td>
                      <td className="px-4 py-3">{r.project_name || r.project_id}</td>
                      <td className="px-4 py-3">{r.requested_by_name || r.requested_by}</td>
                      <td className="px-4 py-3">{formatCurrency(r.estimated_budget || r.amount)}</td>
                      <td className="px-4 py-3">{(r.status || '').toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleReview(r, 'approved')} disabled={reviewSubmitting}>
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleReview(r, 'rejected')} disabled={reviewSubmitting}>
                            <X className="w-4 h-4 text-red-600" />
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
      </div>
    </div>
  )
}
