"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/TextArea';
import { PhilippinePeso, FileText, Calendar, Building2, CheckCircle2, UploadCloud, Printer } from 'lucide-react';
import { API_URL } from '@/shared/lib/api-config';

type Allocation = {
  allocated: number;
  spent: number;
  remaining: number;
  percent: number;
};

type RequestItem = {
  id: string;
  projectName: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'declined';
};

type ReportItem = {
  id: string;
  name: string;
  uploadedAt: string;
  uploader: string;
  url?: string;
};

type DepartmentSummary = {
  id: string;
  department_code?: string;
  department_name?: string;
};

type ChairDepartmentAllocationRaw = {
  department_id?: string;
  allocated_budget?: number;
  spent_budget?: number;
};

type RequestRaw = {
  id: string;
  request_title?: string;
  project_name?: string;
  project_id?: string;
  created_at?: string;
  estimated_budget?: number;
  status?: string;
};

export default function ProjectHeadBudgetManagementPage() {
  const API = `${API_URL}/api/v1`;

  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [amount, setAmount] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function authHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const chairID = user.assigned_program_chair_id;
        const userDepartment = String(user.department || '').toLowerCase();

        // Determine the current project head's department ID.
        let departmentId = '';
        const deptRes = await fetch(`${API}/departments`, { headers: authHeaders() });
        let departments: DepartmentSummary[] = [];
        if (deptRes.ok) {
          const dd = await deptRes.json();
          departments = dd.departments || [];
          const matched = departments.find((d) =>
            String(d.department_code || '').toLowerCase() === userDepartment ||
            String(d.department_name || '').toLowerCase() === userDepartment
          );
          departmentId = matched?.id || '';
        }

        // Load this chair's per-department allocation (query specific department for accuracy)
        let nextAllocation: Allocation = { allocated: 0, spent: 0, remaining: 0, percent: 0 };
        if (chairID) {
          // If we have a departmentId, prefer the targeted fetch. Otherwise we'll fetch all and try fuzzy match.
          const allocRes = departmentId
            ? await fetch(`${API}/budgets/chair-departments?chair_id=${chairID}&department_id=${departmentId}`, { headers: authHeaders() })
            : await fetch(`${API}/budgets/chair-departments?chair_id=${chairID}`, { headers: authHeaders() });
          if (allocRes.ok) {
            const ad = await allocRes.json();
            const items: ChairDepartmentAllocationRaw[] = ad.chair_department_budgets || [];
            let mine: ChairDepartmentAllocationRaw | null = null;
            if (departmentId) {
              // if deptId was used, items should contain the single match
              mine = items.length > 0 ? items[0] : null;
            } else {
              // No departmentId — try to find by department name/code using the user's stored department string
              if (items.length > 0) {
                const needle = (userDepartment || '').trim().toLowerCase();
                mine = items.find((it) => {
                  const name = String(it.department_name || '').toLowerCase();
                  const codeMatch = departments.find(d => d.id === it.department_id)?.department_code || '';
                  const code = String(codeMatch || '').toLowerCase();
                  return name === needle || name.includes(needle) || code === needle || code.includes(needle);
                }) || null;
                // final fallback: exact department_id match if user.department stores an id string
                if (!mine && userDepartment) {
                  mine = items.find((it) => it.department_id === userDepartment) || null;
                }
              }
            }
            if (mine) {
              const allocated = Number(mine.allocated_budget || 0);
              const spent = Number(mine.spent_budget || 0);
              const remaining = Math.max(0, allocated - spent);
              const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
              nextAllocation = { allocated, spent, remaining, percent };
            }
          }
        }

        const reqRes = await fetch(`${API}/requests`, { headers: authHeaders() });
        let nextRequests: RequestItem[] = [];
        if (reqRes.ok) {
          const rd = await reqRes.json();
          const toStatus = (status?: string): RequestItem['status'] => {
            if (status === 'approved') return 'approved';
            if (status === 'rejected') return 'declined';
            return 'pending';
          };
          nextRequests = ((rd.requests || []) as RequestRaw[]).map((r) => ({
            id: r.id,
            projectName: r.request_title || r.project_name || r.project_id || 'Untitled',
            date: r.created_at ? String(r.created_at).split('T')[0] : '',
            amount: Number(r.estimated_budget || 0),
            status: toStatus(r.status),
          }));
        }

        if (!mounted) return;
        setAllocation(nextAllocation);
        setRequests(nextRequests);
        setReports([]);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setAllocation({ allocated: 0, spent: 0, remaining: 0, percent: 0 });
        setRequests([]);
        setReports([]);
      }
    })();
    return () => { mounted = false };
  }, [API]);

  const validateFile = (f: File) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (!allowed.includes(f.type)) return 'Only PDF/JPG/PNG allowed';
    if (f.size > maxBytes) return 'File too large (max 10MB)';
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return setFile(null);
    const err = validateFile(f);
    if (err) {
      alert(err);
      e.currentTarget.value = '';
      return setFile(null);
    }
    setFile(f);
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(v);

  const handleSubmit = async () => {
    if (!projectName || !amount || !dateNeeded || !details) {
      alert('Please fill required fields');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        request_title: projectName,
        request_description: details,
        requested_department: user.department || null,
        justification: details,
      };
      setUploadProgress(70);
      const res = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to submit request');
      }
      const createdRaw = await res.json();
      const created: RequestItem = {
        id: createdRaw.id,
        projectName,
        amount: Number(amount || 0),
        date: createdRaw.created_at ? String(createdRaw.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      setUploadProgress(100);
      // optimistic update
      setRequests(prev => [created, ...prev]);
      // reset form
      setProjectName(''); setAmount(''); setDateNeeded(''); setDetails(''); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const printSlip = (req: RequestItem) => {
    const w = window.open('', '_blank', 'width=700,height=900');
    if (!w) return alert('Popup blocked');
    w.document.write(`<!doctype html><html><head><title>Approval Slip</title><style>body{font-family:sans-serif;padding:20px}</style></head><body>`);
    w.document.write(`<h2>Approval Slip</h2>`);
    w.document.write(`<p><strong>Request ID:</strong> ${req.id}</p>`);
    w.document.write(`<p><strong>Project:</strong> ${req.projectName}</p>`);
    w.document.write(`<p><strong>Amount:</strong> ${formatCurrency(req.amount)}</p>`);
    w.document.write(`<p><strong>Date:</strong> ${req.date}</p>`);
    w.document.write(`<p><strong>Status:</strong> ${req.status}</p>`);
    w.document.write(`<hr/><p>Signature: ____________________</p>`);
    w.document.write(`</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const progressColor = (pct: number) => {
    if (pct < 50) return 'bg-green-500';
    if (pct < 85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Management</h1>
            <p className="text-slate-500 mt-1">Department budget overview and request submissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => { /* placeholder create action */ }}>
              <UploadCloud className="h-4 w-4 mr-1.5" /> Create Request
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Allocation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Department Allocation</CardTitle>
            <CardDescription>Quick overview of allocated vs spent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocation ? (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">ALLOCATED</p>
                    <p className="text-2xl font-semibold text-slate-900">{formatCurrency(allocation.allocated)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">REMAINING</p>
                    <p className="text-2xl font-semibold text-slate-900">{formatCurrency(allocation.remaining)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Spent</p>
                    <p className="text-lg font-medium text-slate-700">{formatCurrency(allocation.spent)}</p>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div className={`h-4 ${progressColor(allocation.percent)}`} style={{ width: `${allocation.percent}%` }} />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{allocation.percent}% used</p>
                </div>
              </div>
            ) : (
              <p>Loading allocation...</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit Budget Request</CardTitle>
                <CardDescription>Send a request to the assigned Program Chair</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Project Name</Label>
                    <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" />
                  </div>
                  <div>
                    <Label>Amount (PHP)</Label>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Date Needed</Label>
                    <Input type="date" value={dateNeeded} onChange={(e) => setDateNeeded(e.target.value)} />
                  </div>
                  <div>
                    <Label>Attach File</Label>
                    <input ref={fileInputRef} onChange={handleFileChange} type="file" className="text-sm" />
                  </div>
                </div>

                <div>
                  <Label>Details / Justification</Label>
                  <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Provide justification" />
                </div>

                {uploadProgress > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-3 bg-blue-600" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button onClick={() => { setProjectName(''); setAmount(''); setDateNeeded(''); setDetails(''); setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} variant="outline">Clear</Button>
                  <div className="flex-1" />
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 text-white">{isSubmitting ? 'Submitting...' : 'Submit Request'}</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests & Reports */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sent Requests</CardTitle>
                <CardDescription>Requests you&apos;ve submitted</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? <p className="text-sm text-slate-600">No requests found</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-600">
                      <tr><th>Id</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {requests.map(r => (
                        <tr key={r.id} className="border-t">
                          <td className="py-2 pr-4">{r.id}</td>
                          <td className="py-2 pr-4">{formatCurrency(r.amount)}</td>
                          <td className="py-2 pr-4">{r.date}</td>
                          <td className="py-2 pr-4"><span className={`px-2 py-1 rounded-full text-xs ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span></td>
                          <td className="py-2"><button onClick={() => printSlip(r)} className="text-sm text-blue-600 flex items-center gap-2"><Printer className="h-4 w-4"/> Print</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Uploaded budget reports</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? <p className="text-sm text-slate-600">No reports</p> : (
                  <ul className="text-sm space-y-2">
                    {reports.map(r => (
                      <li key={r.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-xs text-slate-600">{r.uploadedAt} • {r.uploader}</div>
                        </div>
                        <div>
                          <a className="text-blue-600">Download</a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
