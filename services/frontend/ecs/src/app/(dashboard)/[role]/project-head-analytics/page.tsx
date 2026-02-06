"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/Table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog';
import { 
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  Download,
  Calendar
} from 'lucide-react';

export default function ReportsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const reports = [
    {
      id: 'RPT001',
      title: 'Q1 2026 Financial Performance Report',
      category: 'Financial',
      department: 'Finance',
      generatedBy: 'Lisa Anderson',
      dateGenerated: '2026-01-31',
      description: 'Comprehensive financial analysis for Q1 2026 including revenue, expenses, and profit margins.',
      fileSize: '2.4 MB',
      pages: 45,
      content: `
Q1 2026 FINANCIAL PERFORMANCE REPORT

Executive Summary:
The first quarter of 2026 has shown strong financial performance across all key metrics. Total revenue reached $5.2M, representing a 15% increase over Q4 2025.

Key Highlights:
- Total Revenue: $5,200,000
- Operating Expenses: $3,100,000
- Net Profit: $2,100,000
- Profit Margin: 40.4%

Revenue Breakdown by Department:
- Engineering: $2,100,000 (40%)
- Marketing: $1,560,000 (30%)
- Operations: $1,040,000 (20%)
- Research: $520,000 (10%)

Expense Analysis:
Personnel costs remain the largest expense category at 45% of total expenses. Infrastructure and technology investments accounted for 25% of expenses.

Budget Utilization:
All departments maintained expenditures within allocated budgets. Engineering department showed exceptional budget management with only 74% utilization.

Conclusion:
Q1 2026 results exceed projections and demonstrate strong organizational performance. Continued focus on efficiency and growth initiatives recommended for Q2.
      `
    },
    {
      id: 'RPT002',
      title: 'Project Completion Analysis - January 2026',
      category: 'Project Management',
      department: 'Operations',
      generatedBy: 'Marcus Rodriguez',
      dateGenerated: '2026-01-30',
      description: 'Analysis of all projects completed in January 2026 with performance metrics and insights.',
      fileSize: '1.8 MB',
      pages: 32,
      content: `
PROJECT COMPLETION ANALYSIS - JANUARY 2026

Overview:
This report analyzes all projects completed during January 2026, evaluating performance against key metrics including timeline adherence, budget compliance, and quality standards.

Projects Completed: 8
On-Time Completion Rate: 87.5%
Budget Compliance Rate: 75%

Completed Projects:
1. Employee Training Program (PRJ008)
   - Status: Completed on time
   - Budget: Under by 5%
   - Quality Score: 9.2/10

2. Customer Portal Enhancement Phase 1
   - Status: Completed 3 days early
   - Budget: On target
   - Quality Score: 9.5/10

Performance Analysis:
The 87.5% on-time completion rate exceeds the organizational target of 85%. Budget overruns in 2 projects were primarily due to scope changes requested by stakeholders.

Resource Utilization:
Team members averaged 92% utilization across all completed projects. No significant resource bottlenecks were identified.

Lessons Learned:
- Early stakeholder engagement reduced scope changes
- Agile methodology improved delivery timelines
- Cross-functional collaboration enhanced quality

Recommendations:
Continue emphasis on early planning and stakeholder alignment to maintain high completion rates in upcoming quarters.
      `
    },
    {
      id: 'RPT003',
      title: 'Security Audit Report - 2026',
      category: 'Security',
      department: 'Operations',
      generatedBy: 'James Foster',
      dateGenerated: '2026-01-29',
      description: 'Comprehensive security audit covering all systems and protocols.',
      fileSize: '3.1 MB',
      pages: 58,
      content: `
SECURITY AUDIT REPORT - 2026

Executive Summary:
This comprehensive security audit evaluates the organization's cybersecurity posture, identifies vulnerabilities, and provides recommendations for improvement.

Scope:
- Network infrastructure
- Application security
- Data protection measures
- Access control systems
- Incident response procedures

Findings:
Overall Security Score: 8.5/10

Strengths:
- Multi-factor authentication implemented across all systems
- Regular security updates and patch management
- Encrypted data storage and transmission
- Comprehensive backup and disaster recovery systems

Areas for Improvement:
1. Enhanced monitoring for suspicious activities
2. Additional employee security training
3. Third-party vendor security assessments

Compliance Status:
The organization maintains full compliance with ISO 27001, SOC 2, and GDPR requirements.

Vulnerability Assessment:
Critical vulnerabilities: 0
High-risk vulnerabilities: 2 (remediated)
Medium-risk vulnerabilities: 5 (in progress)
Low-risk vulnerabilities: 12

Recommendations:
1. Implement advanced threat detection system
2. Conduct quarterly security awareness training
3. Establish vendor security certification program
4. Enhance incident response automation

Conclusion:
The organization demonstrates strong security practices with room for continued improvement in proactive threat detection and employee awareness.
      `
    },
    {
      id: 'RPT004',
      title: 'Employee Performance Review - 2025',
      category: 'Human Resources',
      department: 'HR',
      generatedBy: 'Patricia Martinez',
      dateGenerated: '2026-01-28',
      description: 'Annual employee performance review summary and analysis.',
      fileSize: '1.5 MB',
      pages: 28,
      content: `
EMPLOYEE PERFORMANCE REVIEW - 2025

Summary:
This report summarizes the annual performance review process for 2025, highlighting key metrics, achievements, and areas for development.

Participation Rate: 100%
Average Performance Rating: 4.2/5.0
Employees Exceeding Expectations: 45%
Employees Meeting Expectations: 50%
Employees Needing Improvement: 5%

Department Performance:
- Engineering: 4.4/5.0
- Marketing: 4.1/5.0
- Research: 4.5/5.0
- Operations: 4.0/5.0
- Finance: 4.3/5.0

Key Achievements:
- 23% increase in productivity metrics
- 18% reduction in project delivery time
- 95% employee satisfaction score
- 12 internal promotions

Development Areas:
Common development needs identified include advanced technical skills, leadership development, and communication enhancement.

Training Initiatives:
Based on review feedback, new training programs will be launched in Q1 2026 covering:
- Leadership development
- Technical certification programs
- Cross-functional collaboration

Retention Analysis:
Employee retention rate: 94%
Top performers retention: 98%

Recommendations:
Continue investment in professional development and maintain focus on career growth opportunities to sustain high performance levels.
      `
    },
    {
      id: 'RPT005',
      title: 'Market Research Analysis Report',
      category: 'Marketing',
      department: 'Marketing',
      generatedBy: 'Marcus Rodriguez',
      dateGenerated: '2026-01-27',
      description: 'Comprehensive market research and competitor analysis.',
      fileSize: '2.7 MB',
      pages: 41,
      content: `
MARKET RESEARCH ANALYSIS REPORT

Introduction:
This report provides comprehensive market research findings and competitor analysis to inform strategic decision-making for market expansion initiatives.

Market Size and Growth:
Total Addressable Market: $850M
Serviceable Market: $340M
Year-over-Year Growth: 12%

Competitive Landscape:
Primary Competitors: 5
Market Share Distribution:
- Company A: 28%
- Company B: 22%
- Our Organization: 18%
- Company C: 15%
- Others: 17%

Customer Insights:
Survey responses: 1,250 participants
Customer Satisfaction: 87%
Net Promoter Score: 42

Key Findings:
- Growing demand for integrated solutions
- Price sensitivity decreasing in premium segment
- Strong preference for cloud-based services
- Increased focus on security and compliance

Opportunities:
1. Geographic expansion into Southeast Asian markets
2. Product line extension for enterprise clients
3. Strategic partnerships with complementary providers

Threats:
- Emerging competitors with disruptive technologies
- Regulatory changes in target markets
- Economic uncertainty affecting budgets

Strategic Recommendations:
1. Accelerate product development for enterprise segment
2. Invest in regional presence in high-growth markets
3. Enhance customer support and success programs
4. Develop strategic alliance partnerships

Conclusion:
Market conditions favor expansion with careful attention to competitive positioning and customer needs.
      `
    },
    {
      id: 'RPT006',
      title: 'Infrastructure Capacity Planning Report',
      category: 'Technical',
      department: 'Operations',
      generatedBy: 'David Kim',
      dateGenerated: '2026-01-26',
      description: 'IT infrastructure capacity analysis and future planning recommendations.',
      fileSize: '1.9 MB',
      pages: 35,
      content: `
INFRASTRUCTURE CAPACITY PLANNING REPORT

Executive Summary:
This report evaluates current infrastructure capacity, forecasts future needs, and provides recommendations for capacity expansion and optimization.

Current Infrastructure Status:
Server Utilization: 67%
Storage Utilization: 72%
Network Bandwidth Usage: 58%
Database Performance: Optimal

Growth Projections:
Based on current trends and business plans:
- 30% increase in user base expected in 2026
- 45% growth in data storage requirements
- 25% increase in processing demands

Capacity Analysis:
Current infrastructure can support growth for next 8-10 months without significant expansion.

Critical Thresholds:
- Server capacity: 6 months until critical
- Storage capacity: 8 months until critical
- Network bandwidth: 12 months until critical

Recommended Actions:
1. Immediate: Implement storage optimization (expected 15% capacity gain)
2. Q2 2026: Add 3 application servers
3. Q3 2026: Expand storage array by 50TB
4. Q4 2026: Upgrade network infrastructure

Cost Projections:
Immediate optimizations: $45,000
Server expansion: $180,000
Storage expansion: $125,000
Network upgrade: $220,000
Total investment: $570,000

ROI Analysis:
Proactive capacity management will prevent service disruptions valued at estimated $2.1M in lost productivity and revenue.

Conclusion:
Strategic infrastructure investments recommended to support business growth while maintaining high availability and performance standards.
      `
    }
  ];

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      report.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Financial':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Project Management':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Security':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Human Resources':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Marketing':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Technical':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePrintReport = (report: any) => {
    // Set the report for viewing first
    setSelectedReport(report);
    
    // Small delay to ensure content is rendered
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDownloadReport = (report: any) => {
    // Create a text file with the report content
    const content = `
${report.title}
Report ID: ${report.id}
Generated By: ${report.generatedBy}
Date: ${report.dateGenerated}
Department: ${report.department}
Category: ${report.category}

${report.content}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${report.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get unique categories
  const categories = Array.from(new Set(reports.map(r => r.category))).sort();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .table-row-hover:hover {
          background-color: rgba(59, 130, 246, 0.05);
          transition: all 0.2s ease;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>

      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Reports Library
            </h1>
            <p className="text-slate-600 text-lg">View and print generated reports</p>
          </div>
          <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
            <FileText className="h-4 w-4 mr-2" />
            {filteredReports.length} Reports
          </Badge>
        </div>

        {/* Main Content */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 text-2xl mb-2">Available Reports</CardTitle>
                <CardDescription className="text-slate-600">
                  Search and filter reports by category or ID
                </CardDescription>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by ID, title, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px] bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-slate-900">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-slate-900">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedCategory !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredReports.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{reports.length}</span> reports
              </p>
            </div>

            {/* Reports Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold">Report ID</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Title</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Category</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Department</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Generated By</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Date</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Details</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No reports found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report.id} className="table-row-hover border-slate-200">
                        <TableCell className="font-semibold text-slate-900 mono">
                          {report.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-slate-900 font-semibold">{report.title}</p>
                            <p className="text-slate-500 text-xs">{report.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getCategoryColor(report.category)} border font-medium`}>
                            {report.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {report.department}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                              {report.generatedBy.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-slate-900 font-medium text-sm">{report.generatedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-slate-700 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span className="mono">{new Date(report.dateGenerated).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-500">
                            <p>{report.fileSize}</p>
                            <p>{report.pages} pages</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReport(report)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintReport(report)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport(report)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900">{selectedReport?.title}</DialogTitle>
            <DialogDescription className="text-slate-600">
              Report ID: {selectedReport?.id} | Generated by {selectedReport?.generatedBy} on {selectedReport?.dateGenerated}
            </DialogDescription>
          </DialogHeader>
          <div id="print-content" className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className={`${getCategoryColor(selectedReport?.category)} border`}>
                {selectedReport?.category}
              </Badge>
              <span className="text-sm text-slate-600">Department: {selectedReport?.department}</span>
              <span className="text-sm text-slate-600">{selectedReport?.pages} pages</span>
              <span className="text-sm text-slate-600">{selectedReport?.fileSize}</span>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <pre className="text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedReport?.content}
              </pre>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => handlePrintReport(selectedReport)}
              className="border-slate-300"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadReport(selectedReport)}
              className="border-slate-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setIsViewDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}