"use client"

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/TextArea";
import { Badge } from "@/shared/components/ui/Badge";
import { Spinner } from "@/shared/components/ui/Spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/shared/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
} from "@/shared/components/ui/Dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/Select";

import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/Avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/components/ui/Card';
import { ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react';

const API = "http://localhost:8081/api/v1";


interface Program {
  id: string;
  program_name: string;
  status?: string;
  approval_status?: string;
  program_chair_id?: string;
}

interface Project {
  id: string;
  project_name: string;
  program_id?: string;
  approval_status?: string;
  created_at?: string;
  feedback?: string;
}

interface ProjectFormState {
  project_name: string;
  project_description: string;
  objectives: string;
  budget_allocated: string;
  start_date: string;
  end_date: string;
  program_id: string;
}

const emptyForm: ProjectFormState = {
  project_name: "",
  project_description: "",
  objectives: "",
  budget_allocated: "",
  start_date: "",
  end_date: "",
  program_id: "",
};


export default function StaffRequestProjectPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [requests, setRequests] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [programChair, setProgramChair] = useState<any>(null);
  // Fetch program chair info when program changes
  useEffect(() => {
    const selectedProgram = programs.find(p => p.id === form.program_id);
    if (selectedProgram?.program_chair_id) {
      fetch(`${API}/users/${selectedProgram.program_chair_id}`, { headers: authHeaders() })
        .then(res => res.ok ? res.json() : null)
        .then(data => setProgramChair(data?.user || null))
        .catch(() => setProgramChair(null));
    } else {
      setProgramChair(null);
    }
  }, [form.program_id, programs]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [progRes, reqRes] = await Promise.all([
          fetch(`${API}/programs`, { headers: authHeaders() }),
          fetch(`${API}/projects?mine=1`, { headers: authHeaders() }),
        ]);
        const progData = await progRes.json();
        const reqData = await reqRes.json();
        setPrograms(progData.programs || []);
        setRequests(reqData.projects || []);
      } catch {
        setPrograms([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [modalOpen]);


  function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  }


  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...form, budget_allocated: form.budget_allocated ? Number(form.budget_allocated) : null }),
      });
      if (!res.ok) throw new Error("Failed to submit request");
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setError("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  // Status counts
  const approvedCount = requests.filter(r => r.approval_status === 'approved' || r.approval_status === 'final approved').length;
  const rejectedCount = requests.filter(r => r.approval_status === 'rejected' || r.approval_status === 'final rejected').length;
  const pendingCount = requests.filter(r => !r.approval_status || r.approval_status === 'pending').length;
  const totalCount = requests.length;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Request a Project</h1>
        <Button onClick={() => setModalOpen(true)} className="bg-[#0a0a23] text-white font-semibold px-6 py-2 rounded-lg shadow">+ New Request</Button>
      </div>
      {/* Status Cards - styled like dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl bg-white shadow flex flex-row items-center gap-4 p-4 border-t-4 border-blue-500">
          <div className="flex items-center justify-center bg-blue-50 rounded-full h-12 w-12">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-700 leading-none">{totalCount}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">My Requests</div>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow flex flex-row items-center gap-4 p-4 border-t-4 border-yellow-400">
          <div className="flex items-center justify-center bg-yellow-50 rounded-full h-12 w-12">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600 leading-none">{pendingCount}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Pending</div>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow flex flex-row items-center gap-4 p-4 border-t-4 border-green-500">
          <div className="flex items-center justify-center bg-green-50 rounded-full h-12 w-12">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700 leading-none">{approvedCount}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Approved</div>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow flex flex-row items-center gap-4 p-4 border-t-4 border-red-500">
          <div className="flex items-center justify-center bg-red-50 rounded-full h-12 w-12">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-700 leading-none">{rejectedCount}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Rejected</div>
          </div>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Create Project Request</DialogTitle>
          </DialogHeader>
          {/* Program/Department Info Box */}
          <div className="mb-4 rounded-lg bg-slate-50 border border-slate-200 p-4">
            <div className="font-bold text-sm mb-1">
              Program: {programs.find(p => p.id === form.program_id)?.program_name || 'Select a Program'}
            </div>
            <div className="text-xs text-slate-700 mb-1">
              Department: College of Computer Studies (CCS)
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 mt-1">
              <span>Administered by:</span>
              <Avatar className="size-5">
                <AvatarImage src={programChair?.avatar_url || undefined} alt={programChair ? `${programChair.first_name} ${programChair.last_name}` : "Program Chair"} />
                <AvatarFallback>
                  {programChair
                    ? `${programChair.first_name?.[0] || ''}${programChair.last_name?.[0] || ''}`.toUpperCase()
                    : "PC"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{programChair ? `${programChair.first_name} ${programChair.last_name}` : "Program Chair"}</span>
            </div>
            {!form.program_id && (
              <div className="mt-3 p-2 rounded bg-red-100 text-red-700 text-xs font-semibold border border-red-300">
                No program selected. You cannot request a project until a program is selected.
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide">PROJECT NAME</label>
              <Input name="project_name" value={form.project_name} onChange={handleChange} required placeholder="Enter project name" disabled={!form.program_id} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide">DESCRIPTION</label>
              <Textarea name="project_description" value={form.project_description} onChange={handleChange} required placeholder="Short project description" disabled={!form.program_id} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide">OBJECTIVES</label>
              <Textarea name="objectives" value={form.objectives} onChange={handleChange} required placeholder="Project objectives" disabled={!form.program_id} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide">BUDGET</label>
                <Input name="budget_allocated" value={form.budget_allocated} onChange={handleChange} type="number" min="0" placeholder="0" disabled={!form.program_id} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide">START DATE</label>
                <Input name="start_date" value={form.start_date} onChange={handleChange} type="date" required placeholder="dd/mm/yyyy" disabled={!form.program_id} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide">END DATE</label>
                <Input name="end_date" value={form.end_date} onChange={handleChange} type="date" required placeholder="dd/mm/yyyy" disabled={!form.program_id} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide">PROGRAM</label>
              <Select value={form.program_id} onValueChange={val => setForm(f => ({ ...f, program_id: val }))} required>
                <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                <SelectContent>
                  {programs
                    .filter(p => p.status === 'active' && p.approval_status === 'approved')
                    .map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting || !form.program_id} className="bg-[#0a0a23] text-white font-semibold">{submitting ? <Spinner /> : "Submit Project Request"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="bg-white rounded-xl shadow-lg p-0">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-xl font-bold text-slate-900 mb-1">Project Requests</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Project Name</TableHead>
                    <TableHead className="font-bold text-slate-700">Program</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Created At</TableHead>
                    <TableHead className="font-bold text-slate-700">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-slate-400">No requests found.</TableCell></TableRow>
                  ) : requests.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.project_name}</TableCell>
                      <TableCell>{programs.find(p => p.id === r.program_id)?.program_name || '-'}</TableCell>
                      <TableCell><Badge>{r.approval_status || 'pending'}</Badge></TableCell>
                      <TableCell>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{r.approval_status === 'rejected' ? (r.feedback || '-') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
