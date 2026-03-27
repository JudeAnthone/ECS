"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/Select';
import { Search, Printer, Plus } from 'lucide-react';

const API = 'http://localhost:8081/api/v1';
function getToken() { return localStorage.getItem('auth_token'); }
function authHeaders() { return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }; }

function formatCurrency(v?: number) {
  if (v === undefined || v === null) return '₱0.00';
  return `₱${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminBudgetManagementPage() {
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [chairs, setChairs] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [allocProgramId, setAllocProgramId] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocError, setAllocError] = useState('');

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
      const pRes = await fetch(`${API}/programs`, { headers: authHeaders() });
      if (pRes.ok) {
        const pd = await pRes.json(); setPrograms(pd.programs || []);
      } else { setPrograms([]); }

      // program chairs
      const cRes = await fetch(`${API}/users/by-role?role=program_chair`, { headers: authHeaders() });
      if (cRes.ok) { const cd = await cRes.json(); setChairs(cd.users || []); } else setChairs([]);

      // budget requests list
      const rRes = await fetch(`${API}/budget-requests`, { headers: authHeaders() });
      if (rRes.ok) { const rd = await rRes.json(); setRequests(rd.requests || []); } else setRequests([]);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const groupedByChair = React.useMemo(() => {
    const map = new Map<string, { chair?: any; allocated: number; spent: number }>();
    programs.forEach(p => {
      const key = p.program_chair_id || '__unassigned__';
      const entry = map.get(key) || { chair: undefined, allocated: 0, spent: 0 };
      entry.allocated += Number(p.budget_allocation || 0);
      entry.spent += Number(p.spent_budget || 0);
      map.set(key, entry);
    });
    // attach chair meta
    for (const [k, v] of map.entries()) {
      v.chair = chairs.find(c => c.id === k) || (k === '__unassigned__' ? { id: k, first_name: 'Unassigned', last_name: '' } : undefined);
    }
    const arr = Array.from(map.values());
    // Ensure we always render three cards (pad with placeholders)
    while (arr.length < 3) arr.push({ chair: { first_name: 'N/A', last_name: '' }, allocated: 0, spent: 0 });
    return arr.slice(0, 3);
  }, [programs, chairs]);

  const handleAllocate = async () => {
    setAllocError('');
    if (!allocProgramId) { setAllocError('Select a program'); return; }
    const amt = parseFloat(allocAmount);
    if (isNaN(amt) || amt <= 0) { setAllocError('Enter a valid amount'); return; }
    try {
      // PATCH program budget_allocation
      const res = await fetch(`${API}/programs/${allocProgramId}/budget`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ budget_allocation: amt })
      });
      if (res.ok) {
        await loadAll(); setAllocAmount(''); setAllocProgramId('');
      } else {
        const txt = await res.text(); let msg = 'Failed to allocate'; try { msg = JSON.parse(txt).error || msg; } catch { msg = txt; }
        setAllocError(msg);
      }
    } catch (e) { setAllocError('Network error'); }
  };

  const handlePrintRequests = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Management</h1>
            <p className="text-slate-500 mt-1">Overview of allocated budgets, assign allocations, and view budget requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadAll} variant="outline">Refresh</Button>
            <Button onClick={handlePrintRequests} className="flex items-center gap-2"><Printer className="w-4 h-4" /> Print Requests</Button>
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
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 min-h-[120px]">
            <div className="text-sm text-slate-600">Program Chair</div>
            <div className="text-lg font-semibold mt-1">{g.chair ? `${g.chair.first_name} ${g.chair.last_name}`.trim() : '—'}</div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="text-xs text-slate-500">Allocated</div>
              <div className="text-sm font-bold">{loading ? '—' : formatCurrency(g.allocated)}</div>
              <div className="text-xs text-slate-500">Remaining</div>
              <div className={`text-sm font-bold ${g.allocated - g.spent < 0 ? 'text-red-600' : 'text-green-700'}`}>{loading ? '—' : formatCurrency(g.allocated - g.spent)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-700">Assign / Allocate Budget</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-xs text-slate-500">Program</div>
            <Select value={allocProgramId} onValueChange={v => setAllocProgramId(v)}>
              <SelectTrigger className="w-full border-slate-300"><SelectValue placeholder="Select program" /></SelectTrigger>
              <SelectContent>
                {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-slate-500">Amount (₱)</div>
            <Input type="number" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} placeholder="0.00" className="border-slate-300" />
          </div>
          <div>
            <Button onClick={handleAllocate} className="w-full">Allocate</Button>
          </div>
        </div>
        {allocError && <div className="mt-3 text-sm text-red-600">{allocError}</div>}
      </div>

      {/* Budget requests table */}
      <div ref={printRef} className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Budget Requests</h3>
          <div className="text-xs text-slate-500">Read-only for Admin (printable)</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-6">No budget requests yet.</TableCell>
              </TableRow>
            )}
            {requests.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.project_name || r.project_id}</TableCell>
                <TableCell>{r.requested_by_name || r.requested_by}</TableCell>
                <TableCell>{formatCurrency(r.amount)}</TableCell>
                <TableCell>{(r.status || '').toUpperCase()}</TableCell>
                <TableCell>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
