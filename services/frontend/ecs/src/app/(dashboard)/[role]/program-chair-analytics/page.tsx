"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import { 
  BarChart3,
  Calendar,
  Printer,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FolderKanban,
  Settings,
  Filter
} from 'lucide-react';

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-08-31');
  const [selectedDepartment, setSelectedDepartment] = useState('Engineering');
  const [selectedAnalytics, setSelectedAnalytics] = useState('funds');

  // Sample analytics data
  const analyticsData = {
    Engineering: {
      funds: {
        totalAllocated: 850000,
        totalSpent: 638000,
        remaining: 212000,
        utilizationRate: 75,
        breakdown: [
          { month: 'May', allocated: 200000, spent: 150000 },
          { month: 'June', allocated: 220000, spent: 165000 },
          { month: 'July', allocated: 210000, spent: 158000 },
          { month: 'August', allocated: 220000, spent: 165000 }
        ],
        categories: [
          { name: 'Personnel', amount: 350000, percentage: 55 },
          { name: 'Equipment', amount: 180000, percentage: 28 },
          { name: 'Software', amount: 75000, percentage: 12 },
          { name: 'Training', amount: 33000, percentage: 5 }
        ]
      },
      projects: {
        total: 12,
        completed: 7,
        ongoing: 4,
        delayed: 1,
        onTimeRate: 85,
        breakdown: [
          { month: 'May', total: 3, completed: 2, ongoing: 1 },
          { month: 'June', total: 3, completed: 1, ongoing: 2 },
          { month: 'July', total: 3, completed: 2, ongoing: 1 },
          { month: 'August', total: 3, completed: 2, ongoing: 1 }
        ],
        topProjects: [
          { name: 'Digital Transformation Initiative', status: 'Ongoing', progress: 75, budget: 150000 },
          { name: 'Product Line Extension', status: 'Ongoing', progress: 55, budget: 175000 },
          { name: 'API Integration v3.0', status: 'Completed', progress: 100, budget: 120000 }
        ]
      },
      services: {
        totalDelivered: 45,
        onTime: 39,
        delayed: 6,
        satisfactionRate: 92,
        breakdown: [
          { month: 'May', delivered: 10, onTime: 9, delayed: 1 },
          { month: 'June', delivered: 12, onTime: 10, delayed: 2 },
          { month: 'July', delivered: 11, onTime: 10, delayed: 1 },
          { month: 'August', delivered: 12, onTime: 10, delayed: 2 }
        ],
        serviceTypes: [
          { name: 'Software Development', count: 18, avgTime: 15 },
          { name: 'System Maintenance', count: 12, avgTime: 8 },
          { name: 'Technical Consultation', count: 10, avgTime: 5 },
          { name: 'Code Review', count: 5, avgTime: 3 }
        ]
      }
    },
    Marketing: {
      funds: {
        totalAllocated: 620000,
        totalSpent: 485000,
        remaining: 135000,
        utilizationRate: 78,
        breakdown: [
          { month: 'May', allocated: 150000, spent: 118000 },
          { month: 'June', allocated: 155000, spent: 121000 },
          { month: 'July', allocated: 157000, spent: 123000 },
          { month: 'August', allocated: 158000, spent: 123000 }
        ],
        categories: [
          { name: 'Advertising', amount: 220000, percentage: 45 },
          { name: 'Content Creation', amount: 145000, percentage: 30 },
          { name: 'Events', amount: 72500, percentage: 15 },
          { name: 'Tools & Software', amount: 47500, percentage: 10 }
        ]
      },
      projects: {
        total: 8,
        completed: 5,
        ongoing: 2,
        delayed: 1,
        onTimeRate: 80,
        breakdown: [
          { month: 'May', total: 2, completed: 1, ongoing: 1 },
          { month: 'June', total: 2, completed: 1, ongoing: 1 },
          { month: 'July', total: 2, completed: 2, ongoing: 0 },
          { month: 'August', total: 2, completed: 1, ongoing: 1 }
        ],
        topProjects: [
          { name: 'Market Expansion Strategy', status: 'Ongoing', progress: 45, budget: 120000 },
          { name: 'Customer Experience Enhancement', status: 'Delayed', progress: 60, budget: 80000 },
          { name: 'Brand Refresh Campaign', status: 'Completed', progress: 100, budget: 95000 }
        ]
      },
      services: {
        totalDelivered: 35,
        onTime: 31,
        delayed: 4,
        satisfactionRate: 89,
        breakdown: [
          { month: 'May', delivered: 8, onTime: 7, delayed: 1 },
          { month: 'June', delivered: 9, onTime: 8, delayed: 1 },
          { month: 'July', delivered: 9, onTime: 8, delayed: 1 },
          { month: 'August', delivered: 9, onTime: 8, delayed: 1 }
        ],
        serviceTypes: [
          { name: 'Campaign Management', count: 12, avgTime: 20 },
          { name: 'Social Media', count: 10, avgTime: 12 },
          { name: 'Content Writing', count: 8, avgTime: 10 },
          { name: 'Analytics Reporting', count: 5, avgTime: 6 }
        ]
      }
    },
    Research: {
      funds: {
        totalAllocated: 580000,
        totalSpent: 425000,
        remaining: 155000,
        utilizationRate: 73,
        breakdown: [
          { month: 'May', allocated: 140000, spent: 102000 },
          { month: 'June', allocated: 145000, spent: 106000 },
          { month: 'July', allocated: 147000, spent: 107000 },
          { month: 'August', allocated: 148000, spent: 110000 }
        ],
        categories: [
          { name: 'Research Personnel', amount: 240000, percentage: 56 },
          { name: 'Equipment & Lab', amount: 130000, percentage: 31 },
          { name: 'Materials', amount: 38000, percentage: 9 },
          { name: 'Publications', amount: 17000, percentage: 4 }
        ]
      },
      projects: {
        total: 6,
        completed: 3,
        ongoing: 2,
        delayed: 1,
        onTimeRate: 75,
        breakdown: [
          { month: 'May', total: 1, completed: 1, ongoing: 0 },
          { month: 'June', total: 2, completed: 1, ongoing: 1 },
          { month: 'July', total: 2, completed: 1, ongoing: 1 },
          { month: 'August', total: 1, completed: 0, ongoing: 1 }
        ],
        topProjects: [
          { name: 'AI Research Integration', status: 'Ongoing', progress: 45, budget: 200000 },
          { name: 'Data Analytics Platform', status: 'Ongoing', progress: 50, budget: 160000 },
          { name: 'User Behavior Study', status: 'Completed', progress: 100, budget: 85000 }
        ]
      },
      services: {
        totalDelivered: 28,
        onTime: 25,
        delayed: 3,
        satisfactionRate: 94,
        breakdown: [
          { month: 'May', delivered: 7, onTime: 6, delayed: 1 },
          { month: 'June', delivered: 7, onTime: 7, delayed: 0 },
          { month: 'July', delivered: 7, onTime: 6, delayed: 1 },
          { month: 'August', delivered: 7, onTime: 6, delayed: 1 }
        ],
        serviceTypes: [
          { name: 'Data Analysis', count: 12, avgTime: 14 },
          { name: 'Research Reports', count: 8, avgTime: 21 },
          { name: 'User Testing', count: 5, avgTime: 10 },
          { name: 'Statistical Analysis', count: 3, avgTime: 8 }
        ]
      }
    },
    Operations: {
      funds: {
        totalAllocated: 720000,
        totalSpent: 590000,
        remaining: 130000,
        utilizationRate: 82,
        breakdown: [
          { month: 'May', allocated: 175000, spent: 143000 },
          { month: 'June', allocated: 180000, spent: 148000 },
          { month: 'July', allocated: 182000, spent: 149000 },
          { month: 'August', allocated: 183000, spent: 150000 }
        ],
        categories: [
          { name: 'Infrastructure', amount: 295000, percentage: 50 },
          { name: 'Personnel', amount: 177000, percentage: 30 },
          { name: 'Maintenance', amount: 88500, percentage: 15 },
          { name: 'Security', amount: 29500, percentage: 5 }
        ]
      },
      projects: {
        total: 10,
        completed: 6,
        ongoing: 3,
        delayed: 1,
        onTimeRate: 82,
        breakdown: [
          { month: 'May', total: 2, completed: 1, ongoing: 1 },
          { month: 'June', total: 3, completed: 2, ongoing: 1 },
          { month: 'July', total: 3, completed: 2, ongoing: 1 },
          { month: 'August', total: 2, completed: 1, ongoing: 1 }
        ],
        topProjects: [
          { name: 'Infrastructure Modernization', status: 'Ongoing', progress: 80, budget: 180000 },
          { name: 'Security Compliance Audit', status: 'Delayed', progress: 85, budget: 95000 },
          { name: 'Employee Training Program', status: 'Completed', progress: 100, budget: 65000 }
        ]
      },
      services: {
        totalDelivered: 52,
        onTime: 47,
        delayed: 5,
        satisfactionRate: 90,
        breakdown: [
          { month: 'May', delivered: 12, onTime: 11, delayed: 1 },
          { month: 'June', delivered: 13, onTime: 12, delayed: 1 },
          { month: 'July', delivered: 13, onTime: 12, delayed: 1 },
          { month: 'August', delivered: 14, onTime: 12, delayed: 2 }
        ],
        serviceTypes: [
          { name: 'IT Support', count: 20, avgTime: 4 },
          { name: 'System Updates', count: 15, avgTime: 6 },
          { name: 'Security Checks', count: 10, avgTime: 8 },
          { name: 'Training Sessions', count: 7, avgTime: 12 }
        ]
      }
    }
  };

  const departments = ['Engineering', 'Marketing', 'Research', 'Operations'];
  const analyticsTypes = [
    { value: 'funds', label: 'Funds Analytics' },
    { value: 'projects', label: 'Projects Analytics' },
    { value: 'services', label: 'Services Analytics' }
  ];

  const currentData = analyticsData[selectedDepartment as keyof typeof analyticsData][selectedAnalytics as keyof typeof analyticsData.Engineering];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generateReportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDepartment}_${selectedAnalytics}_${startDate}_to_${endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    const dateRange = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    let content = `
ANALYTICS REPORT
Department: ${selectedDepartment}
Analytics Type: ${selectedAnalytics.toUpperCase()}
Date Range: ${dateRange}
Generated: ${new Date().toLocaleString()}

====================================
`;

    if (selectedAnalytics === 'funds') {
      const data = currentData as typeof analyticsData.Engineering.funds;
      content += `
FUNDS ANALYTICS SUMMARY

Total Allocated: $${data.totalAllocated.toLocaleString()}
Total Spent: $${data.totalSpent.toLocaleString()}
Remaining: $${data.remaining.toLocaleString()}
Utilization Rate: ${data.utilizationRate}%

Monthly Breakdown:
`;
      data.breakdown.forEach(item => {
        content += `${item.month}: Allocated: $${item.allocated.toLocaleString()}, Spent: $${item.spent.toLocaleString()}\n`;
      });

      content += `\nExpense Categories:\n`;
      data.categories.forEach(cat => {
        content += `${cat.name}: $${cat.amount.toLocaleString()} (${cat.percentage}%)\n`;
      });
    } else if (selectedAnalytics === 'projects') {
      const data = currentData as typeof analyticsData.Engineering.projects;
      content += `
PROJECTS ANALYTICS SUMMARY

Total Projects: ${data.total}
Completed: ${data.completed}
Ongoing: ${data.ongoing}
Delayed: ${data.delayed}
On-Time Rate: ${data.onTimeRate}%

Monthly Breakdown:
`;
      data.breakdown.forEach(item => {
        content += `${item.month}: Total: ${item.total}, Completed: ${item.completed}, Ongoing: ${item.ongoing}\n`;
      });

      content += `\nTop Projects:\n`;
      data.topProjects.forEach(proj => {
        content += `${proj.name}: ${proj.status} - ${proj.progress}% complete, Budget: $${proj.budget.toLocaleString()}\n`;
      });
    } else if (selectedAnalytics === 'services') {
      const data = currentData as typeof analyticsData.Engineering.services;
      content += `
SERVICES ANALYTICS SUMMARY

Total Services Delivered: ${data.totalDelivered}
On-Time: ${data.onTime}
Delayed: ${data.delayed}
Satisfaction Rate: ${data.satisfactionRate}%

Monthly Breakdown:
`;
      data.breakdown.forEach(item => {
        content += `${item.month}: Delivered: ${item.delivered}, On-Time: ${item.onTime}, Delayed: ${item.delayed}\n`;
      });

      content += `\nService Types:\n`;
      data.serviceTypes.forEach(service => {
        content += `${service.name}: ${service.count} services, Avg Time: ${service.avgTime} days\n`;
      });
    }

    return content;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

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

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print-container {
            padding: 20px;
          }
        }
      `}</style>

      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 text-lg">Analyze department performance by date range</p>
          </div>
          <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics Report
          </Badge>
        </div>

        {/* Filters Section */}
        <Card className="bg-white border-slate-200 shadow-lg no-print">
          <CardHeader>
            <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
              <Filter className="h-6 w-6" />
              Report Filters
            </CardTitle>
            <CardDescription className="text-slate-600">
              Select department, analytics type, and date range to generate report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Department Selection */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Department
                </Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept} className="text-slate-900">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Analytics Type */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Analytics Type
                </Label>
                <Select value={selectedAnalytics} onValueChange={setSelectedAnalytics}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {analyticsTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-slate-900">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Start Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  End Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button onClick={handleDownload} variant="outline" className="border-slate-300">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Content */}
        <div className="print-container">
          {/* Print Header */}
          <div className="hidden print:block mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Report</h1>
            <div className="text-slate-600 space-y-1">
              <p>Department: <span className="font-semibold text-slate-900">{selectedDepartment}</span></p>
              <p>Analytics Type: <span className="font-semibold text-slate-900">{selectedAnalytics.charAt(0).toUpperCase() + selectedAnalytics.slice(1)}</span></p>
              <p>Period: <span className="font-semibold text-slate-900">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span></p>
              <p>Generated: <span className="font-semibold text-slate-900">{new Date().toLocaleString()}</span></p>
            </div>
            <hr className="my-4 border-slate-300" />
          </div>

          {/* Funds Analytics */}
          {selectedAnalytics === 'funds' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Total Allocated</span>
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency((currentData as typeof analyticsData.Engineering.funds).totalAllocated)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Total Spent</span>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency((currentData as typeof analyticsData.Engineering.funds).totalSpent)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Remaining</span>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency((currentData as typeof analyticsData.Engineering.funds).remaining)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Utilization Rate</span>
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.funds).utilizationRate}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Breakdown */}
              <Card className="bg-white border-slate-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-slate-900">Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(currentData as typeof analyticsData.Engineering.funds).breakdown.map((item, index) => (
                      <div key={index} className="border-b border-slate-200 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">{item.month}</h4>
                          <Badge className="bg-blue-100 text-blue-700">
                            {Math.round((item.spent / item.allocated) * 100)}% utilized
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Allocated: </span>
                            <span className="font-semibold text-slate-900 mono">{formatCurrency(item.allocated)}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Spent: </span>
                            <span className="font-semibold text-slate-900 mono">{formatCurrency(item.spent)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(item.spent / item.allocated) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expense Categories */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(currentData as typeof analyticsData.Engineering.funds).categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900">{category.name}</span>
                            <span className="text-sm font-semibold text-slate-700">{category.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-4 font-semibold text-slate-900 mono">{formatCurrency(category.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Projects Analytics */}
          {selectedAnalytics === 'projects' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Total Projects</span>
                      <FolderKanban className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.projects).total}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Completed</span>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.projects).completed}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Ongoing</span>
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.projects).ongoing}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">On-Time Rate</span>
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.projects).onTimeRate}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Breakdown */}
              <Card className="bg-white border-slate-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-slate-900">Monthly Project Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(currentData as typeof analyticsData.Engineering.projects).breakdown.map((item, index) => (
                      <div key={index} className="border-b border-slate-200 pb-4 last:border-0">
                        <h4 className="text-lg font-semibold text-slate-900 mb-3">{item.month}</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="text-slate-600 block mb-1">Total</span>
                            <span className="text-2xl font-bold text-blue-600">{item.total}</span>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="text-slate-600 block mb-1">Completed</span>
                            <span className="text-2xl font-bold text-green-600">{item.completed}</span>
                          </div>
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <span className="text-slate-600 block mb-1">Ongoing</span>
                            <span className="text-2xl font-bold text-amber-600">{item.ongoing}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Projects */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Key Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(currentData as typeof analyticsData.Engineering.projects).topProjects.map((project, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">{project.name}</h4>
                          <Badge className={
                            project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            project.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-slate-600">Progress: </span>
                            <span className="font-semibold text-slate-900">{project.progress}%</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Budget: </span>
                            <span className="font-semibold text-slate-900 mono">{formatCurrency(project.budget)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.status === 'Completed' ? 'bg-green-600' :
                              project.status === 'Delayed' ? 'bg-red-600' :
                              'bg-blue-600'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Services Analytics */}
          {selectedAnalytics === 'services' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Total Delivered</span>
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.services).totalDelivered}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">On-Time</span>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.services).onTime}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Delayed</span>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.services).delayed}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Satisfaction Rate</span>
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {(currentData as typeof analyticsData.Engineering.services).satisfactionRate}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Breakdown */}
              <Card className="bg-white border-slate-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-slate-900">Monthly Service Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(currentData as typeof analyticsData.Engineering.services).breakdown.map((item, index) => (
                      <div key={index} className="border-b border-slate-200 pb-4 last:border-0">
                        <h4 className="text-lg font-semibold text-slate-900 mb-3">{item.month}</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="text-slate-600 block mb-1">Delivered</span>
                            <span className="text-2xl font-bold text-blue-600">{item.delivered}</span>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="text-slate-600 block mb-1">On-Time</span>
                            <span className="text-2xl font-bold text-green-600">{item.onTime}</span>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <span className="text-slate-600 block mb-1">Delayed</span>
                            <span className="text-2xl font-bold text-red-600">{item.delayed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Service Types */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Service Types Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(currentData as typeof analyticsData.Engineering.services).serviceTypes.map((service, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{service.name}</h4>
                          <Badge className="bg-blue-100 text-blue-700">
                            {service.count} services
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          Average Completion Time: <span className="font-semibold text-slate-900">{service.avgTime} days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}