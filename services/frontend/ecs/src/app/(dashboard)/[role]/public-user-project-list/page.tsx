"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Input } from "@/shared/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/Select";
import { Search, Calendar, DollarSign, Building2, AlertCircle } from "lucide-react";
import { useState } from "react";

// Types
interface Project {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "late";
  budget: number;
  department: string;
  description: string;
  deadline: string;
}

// Mock data - replace with your actual data source
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Campus Network Infrastructure Upgrade",
    status: "in-progress",
    budget: 250000,
    department: "IT Department",
    description: "Comprehensive upgrade of the university's network infrastructure including fiber optic installation, switch replacements, and wireless access point deployment across all buildings.",
    deadline: "2024-03-15"
  },
  {
    id: "2",
    title: "Student Information System Modernization",
    status: "late",
    budget: 180000,
    department: "Academic Affairs",
    description: "Migration from legacy student information system to cloud-based solution with improved UI/UX, mobile accessibility, and integrated analytics dashboard.",
    deadline: "2024-01-30"
  },
  {
    id: "3",
    title: "Research Lab Equipment Procurement",
    status: "completed",
    budget: 450000,
    department: "Research & Development",
    description: "Acquisition of advanced laboratory equipment for the engineering and science departments, including spectroscopy systems, 3D printers, and computational servers.",
    deadline: "2023-12-20"
  },
  {
    id: "4",
    title: "Library Digital Archive Initiative",
    status: "in-progress",
    budget: 95000,
    department: "Library Services",
    description: "Digitization of historical documents, thesis archives, and rare collections with implementation of digital asset management system and public access portal.",
    deadline: "2024-04-10"
  },
  {
    id: "5",
    title: "Campus Safety and Security Enhancement",
    status: "late",
    budget: 320000,
    department: "Security & Safety",
    description: "Installation of AI-powered CCTV systems, emergency response systems, access control upgrades, and integration with campus mobile app for real-time alerts.",
    deadline: "2024-02-01"
  },
  {
    id: "6",
    title: "Renewable Energy Solar Panel Installation",
    status: "in-progress",
    budget: 580000,
    department: "Facilities Management",
    description: "Implementation of solar panel systems on campus buildings to reduce energy costs and carbon footprint, including battery storage and smart grid integration.",
    deadline: "2024-05-30"
  }
];

export default function ProjectsViewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Get unique departments
  const departments = Array.from(new Set(mockProjects.map(p => p.department)));

  // Filter projects
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || project.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case "late":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Late
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Extension Projects Directory
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View all projects from higher-tier departments. Read-only access for monitoring and reference.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold">{filteredProjects.length}</span> of <span className="font-semibold">{mockProjects.length}</span> projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {project.title}
                  </CardTitle>
                  {getStatusBadge(project.status)}
                </div>
                <CardDescription className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Building2 className="h-4 w-4" />
                  {project.department}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(project.budget)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}