'Use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from 'A/components/ui/card';

interface Report {
  id: string;
  name: string;
  type: 'sales' | 'refund' | 'partner' | 'branch';
  period: string;
  generatedDate: string;
  recordCount: number;
  status: 'completed' | 'pending';
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reports');

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const reportTypeColors = {
    sales: 'bg-blue-500/20 text-blue-400',
    refund: 'bg-red-500/20 text-red-400',
    partner: 'bg-purple-500.20 text-purple-400',
    branch: 'bg-indigo-500.20 text-indigo-400',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-zinc-800/50 rounded-lg animate-shimmer w-1/3" />
        <div className="h-96 bg-zinc-800/50 rounded-xl animate-shimmer" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card variant="premium">
          <CardContent className="py-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-zinc-400">
          View and download sales and performance reports
        </p>
      </div>

      {/* Filters */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Search Reports
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Report Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="sales">Sales Reports</option>
              <option value="refund">Refund Reports</option>
              <option value="partner">Partner Reports</option>
              <option value="branch">Branch Reports</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Generated Reports ({filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Records</th>
                  <th>Generated</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td className="font-medium text-white">{report.name}</td>
                      <td>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            reportTypeColors[
                              report.type as keyof typeof reportTypeColors
                            ]
                          }`}
                        >
                          {report.type.charAt(0).toUpperCase() +
                            report.type.slice(1)}
                        </span>
                      </td>
                      <td className="text-zinc-400">{report.period}</td>
                      <td className="text-zinc-300">
                        {report.recordCount.toLocaleString()}
                      </td>
                      <td className="text-zinc-500">
                        {new Date(report.generatedDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                            report.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              report.status === 'completed'
                                ? 'bg-green-400'
                                : 'bg-yellow-400'
                            }`}
                          />
                          {report.status === 'completed'
                            ? 'Completed'
                            : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          disabled={report.status !== 'completed'}
                          className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-medium text-sm transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-zinc-500 py-8">
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Generate Report CTA */}
      {filteredReports.length === 0 && selectedType === 'all' && !searchQuery && (
        <Card variant="premium">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">No reports generated yet</p>
            <button className="px-4 py-2 bg-gradient-purple text-white rounded-lg font-medium hover:shadow-lg transition-smooth">
              Generate First Report
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  
  Hattt:
      status: 'completed' | 'pending';
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);