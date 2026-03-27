"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/TextArea';
import { PhilippinePeso, FileText, Calendar, Building2, CheckCircle2, UploadCloud, Printer } from 'lucide-react';
import budgetService, { Allocation, RequestItem, ReportItem } from '@/shared/lib/budget-service';

export default function ProjectHeadBudgetManagementPage() {
  const deptId = 'dept-001'; // TODO: wire real dept id from route/session

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const alloc = await budgetService.getAllocation(deptId);
      const reqs = await budgetService.listRequests(deptId);
      const reps = await budgetService.listReports(deptId);
      if (!mounted) return;
      setAllocation(alloc);
      setRequests(reqs);
      setReports(reps);
    })();
    return () => { mounted = false };
  }, []);

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

    const fd = new FormData();
    fd.append('projectName', projectName);
    fd.append('amount', amount);
    fd.append('dateNeeded', dateNeeded);
    fd.append('details', details);
    fd.append('departmentId', deptId);
    if (file) fd.append('file', file);

    try {
      const created = await budgetService.createRequest(fd, (p) => setUploadProgress(p));
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
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Allocated</p>
                    <p className="text-xl font-semibold text-slate-900">{formatCurrency(allocation.allocated)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Spent</p>
                    <p className="text-xl font-semibold text-slate-900">{formatCurrency(allocation.spent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Remaining</p>
                    <p className="text-xl font-semibold text-slate-900">{formatCurrency(allocation.remaining)}</p>
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
                <CardDescription>Requests you've submitted</CardDescription>
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
