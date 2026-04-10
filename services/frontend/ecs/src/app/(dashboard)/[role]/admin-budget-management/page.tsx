"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/TextArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/DropdownMenu';
import { Printer, MoreVertical, CheckCircle, XCircle, Loader2, Eye, FileText } from 'lucide-react';
import { API_URL } from '@/shared/lib/api-config';

const API = `${API_URL}/api/v1`;
function getToken() { return localStorage.getItem('auth_token'); }
function authHeaders() { return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }; }

function formatCurrency(v?: number) {
  if (v === undefined || v === null) return '₱0.00';
  return `₱${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumberLabel(s?: string) {
  if (!s) return '0';
  const n = Number(s);
  if (isNaN(n)) return '0';
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type ChairUser = {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
};

type ProgramChairBudget = {
  id: string;
  chair_id: string;
  chair_first_name?: string;
  chair_last_name?: string;
  allocated_budget: number;
  spent_budget: number;
};

type ChairDepartmentBudget = {
  id: string;
  chair_id: string;
  chair_first_name?: string;
  chair_last_name?: string;
  department_id: string;
  department_name?: string;
  allocated_budget: number;
  spent_budget: number;
};

type BudgetRequest = {
  id: string;
  project_name?: string;
  project_id?: string;
  requested_by_name?: string;
  requested_by?: string;
  amount?: number;
  status?: string;
  workflow_stage?: string;
  reason?: string;
  document_name?: string;
  document_url?: string;
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

function ChairAvatar({ chair, size = 'md' }: { chair?: ChairUser | null; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm';
  const initials = `${chair?.first_name?.[0] || ''}${chair?.last_name?.[0] || ''}`.toUpperCase();
  if (chair?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={chair.avatar_url} alt={`${chair.first_name} ${chair.last_name}`} className={`${sz} rounded-full object-cover shrink-0 border border-slate-200`} />
    );
  }
  return (
    <div className={`${sz} rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center shrink-0 border border-slate-300`}>{initials || 'PC'}</div>
  );
}

export default function AdminBudgetManagementPage() {
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
  const [chairs, setChairs] = useState<ChairUser[]>([]);
  const [programChairBudgets, setProgramChairBudgets] = useState<ProgramChairBudget[]>([]);
  
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [chairDeptList, setChairDeptList] = useState<ChairDepartmentBudget[]>([]);
  const [chairDetailsOpen, setChairDetailsOpen] = useState(false);
  const [selectedChair, setSelectedChair] = useState<ChairUser | null>(null);
  const [allChairDeptBudgets, setAllChairDeptBudgets] = useState<ChairDepartmentBudget[]>([]);

  const [allocChairId, setAllocChairId] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocError, setAllocError] = useState('');
  const [allocBlocked, setAllocBlocked] = useState(false);
  const [allocBlockDetails, setAllocBlockDetails] = useState<{ minRequired: number; deptSum: number; spent: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [budgetReviewReq, setBudgetReviewReq] = useState<BudgetRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  const [isAllocConfirmOpen, setIsAllocConfirmOpen] = useState(false);

  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // total budget (backend may expose this endpoint)
      const totRes = await fetch(`${API}/budgets/summary`, { headers: authHeaders() });
      if (totRes.ok) {
        const td = await totRes.json(); setTotalBudget(td.total ?? null);
      } else {
        setTotalBudget(null);
      }

      // programs (expect budget_allocation / spent_budget fields)
      // program chairs for selection
      const cRes = await fetch(`${API}/users/by-role?role=program_chair`, { headers: authHeaders() });
      if (cRes.ok) { const cd = await cRes.json(); setChairs(cd.users || []); } else setChairs([]);

      // admin-allocated budgets per chair
      const pcbRes = await fetch(`${API}/budgets/chairs`, { headers: authHeaders() });
      if (pcbRes.ok) {
        const bd = await pcbRes.json(); setProgramChairBudgets(bd.program_chair_budgets || []);
      } else setProgramChairBudgets([]);

      // fetch all chair->department allocations so we can compute remaining per chair
      try {
        const allDeptRes = await fetch(`${API}/budgets/chair-departments`, { headers: authHeaders() });
        if (allDeptRes.ok) {
          const ad = await allDeptRes.json(); setAllChairDeptBudgets(ad.chair_department_budgets || []);
        } else {
          setAllChairDeptBudgets([]);
        }
      } catch (e) {
        setAllChairDeptBudgets([]);
      }

      // budget requests list
      const rRes = await fetch(`${API}/budget-requests`, { headers: authHeaders() });
      if (rRes.ok) { const rd = await rRes.json(); setRequests(rd.requests || []); } else setRequests([]);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const openChairDetails = async (chairId: string, chair?: ChairUser | null) => {
    setSelectedChair(chair || null);
    setChairDeptList([]);
    setChairDetailsOpen(true);
    try {
      const res = await fetch(`${API}/budgets/chair-departments?chair_id=${chairId}`, { headers: authHeaders() });
      if (res.ok) {
        const d = await res.json();
        setChairDeptList(d.chair_department_budgets || []);
      } else {
        setChairDeptList([]);
      }
    } catch (err) {
      console.error('Failed to fetch chair departments', err);
      setChairDeptList([]);
    }
  }

  // ensure totalBudget equals the total allocated to program chairs (prefer DB chairs)
  useEffect(() => {
    let sum = 0;
    if (chairs && chairs.length > 0) {
      for (const c of chairs.slice(0, 3)) {
        const b = programChairBudgets.find((p) => p.chair_id === c.id);
        sum += Number(b?.allocated_budget || 0);
      }
    } else {
      sum = programChairBudgets.reduce((s, b) => s + Number(b.allocated_budget || 0), 0);
    }
    setTotalBudget(sum);
  }, [programChairBudgets, chairs]);

  const groupedByChair = React.useMemo(() => {
    const result: { chair: ChairUser | null; allocated: number; spent: number }[] = [];
    // Prefer using program chairs returned from the database
    if (chairs && chairs.length > 0) {
      const selected = chairs.slice(0, 3);
      for (const c of selected) {
        const b = programChairBudgets.find((p) => p.chair_id === c.id);
        const allocated = Number(b?.allocated_budget || 0);
        const spent = Number(b?.spent_budget || 0);
        const deptSum = allChairDeptBudgets.filter(d => d.chair_id === c.id).reduce((s, d) => s + Number(d.allocated_budget || 0), 0);
        result.push({ chair: c, allocated, spent, deptSum } as any);
      }
      while (result.length < 3) result.push({ chair: { id: '', first_name: 'N/A', last_name: '' }, allocated: 0, spent: 0 });
      return result;
    }

    // Fallback: use programChairBudgets if chairs list isn't available
    const arr = programChairBudgets.map((b) => {
      const chair = {
        first_name: b.chair_first_name || 'N/A',
        last_name: b.chair_last_name || '',
        id: b.chair_id,
      } as ChairUser;
      const allocated = Number(b.allocated_budget || 0);
      const spent = Number(b.spent_budget || 0);
      const deptSum = allChairDeptBudgets.filter(d => d.chair_id === b.chair_id).reduce((s, d) => s + Number(d.allocated_budget || 0), 0);
      return {
        chair,
        allocated,
        spent,
        deptSum,
      } as any;
    });
    while (arr.length < 3) arr.push({ chair: { id: '', first_name: 'N/A', last_name: '' }, allocated: 0, spent: 0 });
    return arr.slice(0, 3);
  }, [programChairBudgets, chairs]);

  const handleAllocate = async () => {
    // Validate first, then open confirmation dialog
    setAllocError('');
    if (!allocChairId) { setAllocError('Select a program chair'); return; }
    const amt = parseFloat(allocAmount);
    if (isNaN(amt) || amt <= 0) { setAllocError('Enter a valid amount'); return; }
    // pre-check against existing commitments (dept allocations + spent)
    const pb = programChairBudgets.find(p => p.chair_id === allocChairId);
    const spent = Number(pb?.spent_budget || 0);
    const deptSum = allChairDeptBudgets.filter(d => d.chair_id === allocChairId).reduce((s, d) => s + Number(d.allocated_budget || 0), 0);
    const minRequired = deptSum + spent;
    if (amt < minRequired) {
      setAllocBlocked(true);
      setAllocBlockDetails({ minRequired, deptSum, spent });
    } else {
      setAllocBlocked(false);
      setAllocBlockDetails(null);
    }
    setIsAllocConfirmOpen(true);
  };

  const confirmAllocate = async () => {
    // if blocked by commitments, don't proceed
    if (allocBlocked) {
      setAllocError('Cannot allocate: new cap is below current commitments. Adjust allocations first.');
      return;
    }
    setAllocError('');
    const amt = parseFloat(allocAmount);
    try {
      const res = await fetch(`${API}/budgets/chairs/${allocChairId}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ allocated_budget: amt })
      });
      if (res.ok) {
        setIsAllocConfirmOpen(false);
        await loadAll(); setAllocAmount(''); setAllocChairId('');
        setToast({ message: 'Budget allocated successfully!', type: 'success' });
        setToastVisible(true);
      } else {
        setAllocBlocked(false);
        setAllocBlockDetails(null);
        const txt = await res.text(); let msg = 'Failed to allocate'; try { msg = JSON.parse(txt).error || msg; } catch { msg = txt; }
        setAllocError(msg);
        setToast({ message: msg, type: 'error' });
        setToastVisible(true);
      }
    } catch (err) {
      setAllocError('Network error');
      setToast({ message: 'Network error', type: 'error' });
      setToastVisible(true);
    }
  };

  React.useEffect(() => {
    if (!toast) return;
    setToastVisible(true);
    const hideTimer = setTimeout(() => setToastVisible(false), 2700);
    const clearTimer = setTimeout(() => setToast(null), 3000);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [toast]);

  const handlePrintRequests = () => {
    window.print();
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === 'all') return true;
    return String(request.workflow_stage || '').toLowerCase() === statusFilter;
  });

  const exportRequestsCsv = () => {
    const header = ['Request ID', 'Project', 'Requested By', 'Amount', 'Status', 'Stage', 'Slip Number', 'Created At'];
    const rows = filteredRequests.map((request) => [
      request.id,
      request.project_name || request.project_id || '',
      request.requested_by_name || request.requested_by || '',
      String(Number(request.amount || 0).toFixed(2)),
      String(request.status || '').toUpperCase(),
      budgetStageLabel(request.workflow_stage),
      request.chair_slip_number || '',
      request.created_at || '',
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {toast && (
          <div className="fixed z-50 right-6 top-6">
            <div className={`rounded-lg shadow-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {toast.message}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Management</h1>
            <p className="text-slate-500 mt-1">Allocate annual budgets to Program Chairs and monitor their department allocations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadAll} variant="outline">Refresh</Button>
            <Button onClick={exportRequestsCsv} variant="outline">Export CSV</Button>
            <Button onClick={handlePrintRequests} className="flex items-center gap-2 bg-[#BA0021] hover:bg-[#930018] text-white"><Printer className="w-4 h-4" /> Print Requests</Button>
          </div>
        </div>

      {/* Total budget card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Total Budget (Academic Year)</div>
            <div className="text-3xl font-bold text-slate-900 mt-1">
              {loading ? 'Loading…' : (totalBudget !== null ? formatCurrency(totalBudget) : '—')}
            </div>
          </div>
          <div className="text-sm text-slate-500">Academic Year: <span className="font-medium">Current</span></div>
        </div>
      </div>

      {/* Three chair containers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {groupedByChair.map((g, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 min-h-[120px] relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <ChairAvatar chair={g.chair || null} size="md" />
                <div>
                  <div className="text-sm text-slate-600">Program Chair</div>
                  <div className="text-lg font-semibold mt-1">{g.chair ? `${g.chair.first_name} ${g.chair.last_name}`.trim() : '—'}</div>
                </div>
              </div>
              <div className="ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Chair actions">
                      <MoreVertical className="h-4 w-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-slate-200">
                    <DropdownMenuItem onClick={() => openChairDetails(g.chair?.id || '', g.chair)}>View details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="text-xs text-slate-500">Allocated</div>
              <div className="text-sm font-bold">{loading ? '—' : formatCurrency(g.allocated)}</div>
              <div className="text-xs text-slate-500 mt-1">Remaining</div>
              <div className="text-sm font-semibold">{loading ? '—' : formatCurrency((g as any).allocated - (g as any).deptSum - (g as any).spent)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-700">Assign / Allocate Budget</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-xs text-slate-500">Program Chair</div>
            <Select value={allocChairId} onValueChange={v => {
              setAllocChairId(v);
              setAllocError('');
              const pb = programChairBudgets.find(p => p.chair_id === v);
              if (pb) {
                setAllocAmount(String(Number(pb.allocated_budget || 0)));
              } else {
                setAllocAmount('');
              }
            }}>
              <SelectTrigger className="w-full border-slate-300"><SelectValue placeholder="Select program chair" /></SelectTrigger>
              <SelectContent>
                {chairs.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <ChairAvatar chair={c} size="sm" />
                      <span className="truncate">{`${c.first_name || ''} ${c.last_name || ''}`.trim()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Amount (₱)</div>
              <div className="text-xs text-[#BA0021] font-medium">= {formatNumberLabel(allocAmount)}</div>
            </div>
            <div className="mt-1">
              <Input type="number" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} placeholder="0.00" className="border-slate-300 w-full" />
            </div>
          </div>
          <div>
            <Button onClick={handleAllocate} className="w-full bg-[#BA0021] hover:bg-[#930018] text-white">Allocate</Button>
          </div>
        </div>
        {allocError && <div className="mt-3 text-sm text-red-600">{allocError}</div>}
      </div>

      <Dialog open={isAllocConfirmOpen} onOpenChange={(open) => {
        setIsAllocConfirmOpen(open);
        if (!open) {
          setAllocBlocked(false);
          setAllocBlockDetails(null);
          setAllocError('');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Allocation</DialogTitle>
            <DialogDescription>
              Are you sure you want to allocate <strong>₱{Number(allocAmount || 0).toLocaleString()}</strong> to this Program Chair?
            </DialogDescription>
          </DialogHeader>
          {allocBlocked && allocBlockDetails && (
            <div className="p-3 bg-red-50 border border-red-100 rounded mb-3">
              <div className="text-sm font-semibold text-red-700">Allocation blocked — insufficient funds for current commitments</div>
              <div className="text-sm text-slate-700 mt-2">Minimum required to cover current commitments: <strong>{formatCurrency(allocBlockDetails.minRequired)}</strong></div>
              <div className="text-xs text-slate-500">Departments total: {formatCurrency(allocBlockDetails.deptSum)} • Spent: {formatCurrency(allocBlockDetails.spent)}</div>
              <div className="mt-2 text-sm text-red-700">Please adjust department allocations or increase the cap before confirming.</div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-slate-300">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmAllocate} disabled={allocBlocked}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chair -> department allocations removed as not required by admin UI */}

      {/* Budget requests table */}
      <div ref={printRef} className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Budget Requests</h3>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'pending' | 'approved' | 'declined')}>
                <SelectTrigger className="w-[180px] border-slate-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-slate-500">Read-only surveillance and reporting</div>
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-6">No budget requests yet.</TableCell>
              </TableRow>
            )}
            {filteredRequests.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.project_name || r.project_id}</TableCell>
                <TableCell>{r.requested_by_name || r.requested_by}</TableCell>
                <TableCell>{formatCurrency(r.amount)}</TableCell>
                <TableCell>{(r.status || '').toUpperCase()}</TableCell>
                <TableCell>{budgetStageLabel(r.workflow_stage)}</TableCell>
                <TableCell>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Budget request actions">
                        <MoreVertical className="h-4 w-4 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-slate-200">
                      <DropdownMenuItem onClick={() => {
                        setBudgetReviewReq(r)
                      
                      }}>View details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
      {/* Chair details dialog (admin) */}
      <Dialog open={chairDetailsOpen} onOpenChange={(open) => { if (!open) setChairDetailsOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Program Chair Details</DialogTitle>
            <div className="text-sm text-slate-600">{selectedChair ? `${selectedChair.first_name || ''} ${selectedChair.last_name || ''}` : ''}</div>
          </DialogHeader>
          <div className="p-2">
            {/* find allocated/spent from programChairBudgets */}
            {(() => {
              const pb = selectedChair ? programChairBudgets.find(p => p.chair_id === selectedChair.id) : undefined;
              const allocated = Number(pb?.allocated_budget || 0);
              const spent = Number(pb?.spent_budget || 0);
              const deptSum = chairDeptList.reduce((s, d) => s + Number(d.allocated_budget || 0), 0);
              const remainingAfterDepts = allocated - deptSum;
              const remainingAfterSpent = allocated - deptSum - spent;
              return (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="text-xs text-slate-500">Total Allocation</div>
                    <div className="font-semibold">{formatCurrency(allocated)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-xs text-slate-500">Total Given to Departments</div>
                    <div className="font-semibold">{formatCurrency(deptSum)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-xs text-slate-500">Remaining after dept allocations</div>
                    <div className="font-semibold">{formatCurrency(remainingAfterDepts)}</div>
                  </div>
                  {/* removed 'Remaining after spent' per request */}
                  <div className="pt-2">
                    <div className="text-sm font-medium">Department allocations</div>
                    {chairDeptList.length === 0 ? (
                      <div className="text-sm text-slate-500 mt-2">No department allocations.</div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {chairDeptList.map(d => (
                          <div key={d.id} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                            <div className="text-sm">{d.department_name || d.department_id}</div>
                            <div className="text-sm font-medium">{formatCurrency(d.allocated_budget)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!budgetReviewReq}
        onOpenChange={() => {
          setBudgetReviewReq(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Budget Request Details</DialogTitle>
            <DialogDescription>Read-only surveillance view for monitoring and reporting.</DialogDescription>
          </DialogHeader>
          {budgetReviewReq && (
            <div className="space-y-4 mt-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{budgetReviewReq.project_name || budgetReviewReq.project_id}</p>
                <p>Amount: {formatCurrency(budgetReviewReq.amount)}</p>
                <p>Stage: {budgetStageLabel(budgetReviewReq.workflow_stage)}</p>
                <p>Status: {(budgetReviewReq.status || '').toUpperCase()}</p>
                <p>Document: {budgetReviewReq.document_name || budgetReviewReq.document_url || '—'}</p>
                {budgetReviewReq.reviewed_by_name && <p>Reviewed by: {budgetReviewReq.reviewed_by_name}</p>}
                {budgetReviewReq.review_notes && <p>Review notes: {budgetReviewReq.review_notes}</p>}
                {budgetReviewReq.chair_slip_number && <p>Slip No: {budgetReviewReq.chair_slip_number}</p>}
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
                  <Button type="button" variant="outline" className="border-slate-300" onClick={handlePrintRequests}>
                    <Printer className="h-4 w-4 mr-1.5" /> Print
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetReviewReq(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
