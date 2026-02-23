"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import {
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building2,
  Target,
  RefreshCw,
  Send,
  FolderOpen,
  XCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Users,
  MessageSquare,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/Dialog';

const API = 'http://localhost:8081/api/v1';
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

interface RequestRecord {
  id: string;
  request_title: string;
  request_description?: string | null;
  status: string;
  workflow_stage: string;
  estimated_budget?: number | null;
  requested_department?: string | null;
  target_beneficiaries?: string | null;
  justification?: string | null;
  review_notes?: string | null;
  program_chair_feedback?: string | null;
  assignment_notes?: string | null;
  project_head_response?: string | null;
  project_head_notes?: string | null;
  proposal_review_notes?: string | null;
  final_approval_notes?: string | null;
  reviewed_at?: string | null;
  department_assignment_date?: string | null;
  project_head_response_date?: string | null;
  proposal_submitted_date?: string | null;
  final_approval_date?: string | null;
  created_at: string;
  updated_at?: string;
}

interface Program {
  id: string;
  program_name: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    under_review: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function WorkflowBadge({ stage }: { stage: string }) {
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    program_chair_review: 'Chair Review',
    department_assigned: 'Dept. Assigned',
    project_head_response: 'Head Response',
    proposal_review: 'Proposal Review',
    final_approval: 'Final Approval',
  };
  const colors: Record<string, string> = {
    submitted: 'bg-slate-100 text-slate-600',
    program_chair_review: 'bg-blue-100 text-blue-700',
    department_assigned: 'bg-indigo-100 text-indigo-700',
    project_head_response: 'bg-violet-100 text-violet-700',
    proposal_review: 'bg-amber-100 text-amber-700',
    final_approval: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[stage] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[stage] ?? stage.replace(/_/g, ' ')}
    </span>
  );
}

const PREVIEW_COUNT = 5;

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-xs font-medium text-slate-500 col-span-1">{label}</dt>
      <dd className="text-xs text-slate-800 col-span-2 break-words">{String(value)}</dd>
    </div>
  );
}

function RequestDetailDialog({ req, open, onClose, fmtDate }: {
  req: RequestRecord | null;
  open: boolean;
  onClose: () => void;
  fmtDate: (d: string) => string;
}) {
  if (!req) return null;
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900 pr-6">{req.request_title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap gap-2 mt-1">
              <StatusBadge status={req.status} />
              <WorkflowBadge stage={req.workflow_stage} />
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">

          {/* Basic info */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Request Details</h3>
            <dl className="space-y-2 bg-slate-50 rounded-lg p-3">
              <DetailRow label="Submitted" value={fmtDate(req.created_at)} />
              <DetailRow label="Department" value={req.requested_department} />
              <DetailRow label="Est. Budget" value={req.estimated_budget != null ? `₱${Number(req.estimated_budget).toLocaleString()}` : null} />
              <DetailRow label="Target Beneficiaries" value={req.target_beneficiaries} />
            </dl>
          </section>

          {/* Description */}
          {req.request_description && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Description</h3>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{req.request_description}</p>
            </section>
          )}

          {/* Justification */}
          {req.justification && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Justification / Objectives</h3>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{req.justification}</p>
            </section>
          )}

          {/* Review / Feedback */}
          {(req.review_notes || req.program_chair_feedback || req.reviewed_at) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Program Chair Review</h3>
              <dl className="space-y-2 bg-blue-50 rounded-lg p-3">
                <DetailRow label="Reviewed" value={req.reviewed_at ? fmtDate(req.reviewed_at) : null} />
                <DetailRow label="Review Notes" value={req.review_notes} />
                <DetailRow label="Chair Feedback" value={req.program_chair_feedback} />
              </dl>
            </section>
          )}

          {/* Department / Assignment */}
          {(req.department_assignment_date || req.assignment_notes) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Department Assignment</h3>
              <dl className="space-y-2 bg-indigo-50 rounded-lg p-3">
                <DetailRow label="Assigned" value={req.department_assignment_date ? fmtDate(req.department_assignment_date) : null} />
                <DetailRow label="Assignment Notes" value={req.assignment_notes} />
              </dl>
            </section>
          )}

          {/* Project Head */}
          {(req.project_head_response || req.project_head_notes || req.project_head_response_date) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Project Head Response</h3>
              <dl className="space-y-2 bg-violet-50 rounded-lg p-3">
                <DetailRow label="Response Date" value={req.project_head_response_date ? fmtDate(req.project_head_response_date) : null} />
                <DetailRow label="Response" value={req.project_head_response} />
                <DetailRow label="Notes" value={req.project_head_notes} />
              </dl>
            </section>
          )}

          {/* Proposal */}
          {(req.proposal_submitted_date || req.proposal_review_notes) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Proposal Review</h3>
              <dl className="space-y-2 bg-amber-50 rounded-lg p-3">
                <DetailRow label="Submitted" value={req.proposal_submitted_date ? fmtDate(req.proposal_submitted_date) : null} />
                <DetailRow label="Review Notes" value={req.proposal_review_notes} />
              </dl>
            </section>
          )}

          {/* Final Approval */}
          {(req.final_approval_date || req.final_approval_notes) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Final Approval</h3>
              <dl className="space-y-2 bg-green-50 rounded-lg p-3">
                <DetailRow label="Date" value={req.final_approval_date ? fmtDate(req.final_approval_date) : null} />
                <DetailRow label="Notes" value={req.final_approval_notes} />
              </dl>
            </section>
          )}

        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

export default function PublicUserDashboard() {
  const params = useParams();
  const role = params?.role as string;

  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Derive username from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setUserName(u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username ?? '');
      }
    } catch { /* ignore */ }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, progRes] = await Promise.all([
        fetch(`${API}/requests`, { headers: authHeaders() }),
        fetch(`${API}/programs`, { headers: authHeaders() }),
      ]);
      if (reqRes.ok) {
        const d = await reqRes.json();
        setRequests(d.requests ?? []);
      }
      if (progRes.ok) {
        const d = await progRes.json();
        setPrograms(d.programs ?? d ?? []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const total = requests.length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const pending = requests.filter(r => !['approved', 'rejected'].includes(r.status)).length;
  const sorted = [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const recent = showAll ? sorted : sorted.slice(0, PREVIEW_COUNT);
  const hasMore = sorted.length > PREVIEW_COUNT;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {userName ? `Welcome back, ${userName}!` : 'My Dashboard'}
            </h1>
            <p className="text-slate-500 mt-1">
              Overview of your project requests and available programs.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href={`/${role}/public-user-request-form`}>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${role}/public-user-project-list`}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Browse Programs
              </Link>
            </Button>
            <button
              type="button"
              onClick={fetchData}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">My Requests</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 w-10 bg-slate-100 animate-pulse rounded" /> : (
                <div className="text-3xl font-bold text-blue-600">{total}</div>
              )}
              <p className="text-xs text-slate-500 mt-1">Total submitted</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 w-10 bg-slate-100 animate-pulse rounded" /> : (
                <div className="text-3xl font-bold text-green-600">{approved}</div>
              )}
              <p className="text-xs text-slate-500 mt-1">Requests approved</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 w-10 bg-slate-100 animate-pulse rounded" /> : (
                <div className="text-3xl font-bold text-yellow-600">{pending}</div>
              )}
              <p className="text-xs text-slate-500 mt-1">Under review</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 w-10 bg-slate-100 animate-pulse rounded" /> : (
                <div className="text-3xl font-bold text-red-500">{rejected}</div>
              )}
              <p className="text-xs text-slate-500 mt-1">Not approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Detail dialog */}
        <RequestDetailDialog
          req={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          fmtDate={fmtDate}
        />

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent Requests */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  My Recent Requests
                </CardTitle>
                <CardDescription>
                  {total > 0 ? `${total} total request${total !== 1 ? 's' : ''}` : 'Your latest submitted requests and their status'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${role}/public-user-request-form`}>View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />)}
                </div>
              ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FileText className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No requests yet.</p>
                  <Button asChild className="mt-3 bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                    <Link href={`/${role}/public-user-request-form`}>
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Submit your first request
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map(req => (
                    <div key={req.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{req.request_title}</p>
                        {req.requested_department && (
                          <p className="text-xs text-slate-500 mt-0.5">{req.requested_department}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">{fmtDate(req.created_at)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={req.status} />
                        <WorkflowBadge stage={req.workflow_stage} />
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="mt-0.5 flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-3 h-3" /> View Details
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Show more / less toggle */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setShowAll(v => !v)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-dashed border-slate-200 transition-colors"
                    >
                      {showAll ? (
                        <><ChevronUp className="w-4 h-4" /> Show less</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> Show {sorted.length - PREVIEW_COUNT} more request{sorted.length - PREVIEW_COUNT !== 1 ? 's' : ''}</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-slate-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link href={`/${role}/public-user-request-form`}>
                    <Send className="mr-2 h-4 w-4" /> Submit New Request
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/${role}/public-user-project-list`}>
                    <FolderOpen className="mr-2 h-4 w-4" /> Browse Programs
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/${role}/settings`}>
                    <Building2 className="mr-2 h-4 w-4" /> Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Active Programs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderOpen className="h-4 w-4 text-slate-500" />
                  Active Programs
                </CardTitle>
                <CardDescription>
                  {loading ? '...' : `${programs.filter(p => p.status === 'active').length} program${programs.filter(p => p.status === 'active').length !== 1 ? 's' : ''} open`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1,2].map(i => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded" />)}
                  </div>
                ) : programs.filter(p => p.status === 'active').length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">No active programs at this time.</p>
                ) : (
                  <div className="space-y-2">
                    {programs.filter(p => p.status === 'active').slice(0, 4).map(p => (
                      <div key={p.id} className="flex items-center gap-2 rounded-md border border-slate-100 px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <p className="text-sm text-slate-700 truncate">{p.program_name}</p>
                      </div>
                    ))}
                    {programs.filter(p => p.status === 'active').length > 4 && (
                      <Button variant="outline" className="w-full text-xs mt-1" size="sm" asChild>
                        <Link href={`/${role}/public-user-project-list`}>
                          See all {programs.filter(p => p.status === 'active').length} programs
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* How it works banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6 pb-6">
            <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs font-bold">?</span>
              How it works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Submit a Request', desc: 'Fill out the request form with your project details and objectives.' },
                { step: '2', title: 'Program Chair Review', desc: 'A program chair reviews your request and approves or provides feedback.' },
                { step: '3', title: 'Department Assignment', desc: 'Approved requests are assigned to a department and a project head.' },
                { step: '4', title: 'Proposal & Final Approval', desc: 'The project head prepares a proposal, which is submitted for final approval.' },
              ].map((item, i, arr) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="hidden sm:block w-px flex-1 bg-blue-200 mt-1" style={{ minHeight: '0' }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{item.title}</p>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}