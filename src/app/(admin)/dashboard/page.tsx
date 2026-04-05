'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart3, TrendingUp, AlertCircle, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardData {
  totalRevenue: number;
  netGP: number;
  totalRefunds: number;
  partnerPayouts: number;
  branchCount: number;
  partnerCount: number;
  recentUploads: Array<{
    id: string;
    fileName: string;
    uploadedAt: string;
    recordCount: number;
  }>;
  revenueChange: number;
  gpChange: number;
  refundChange: number;
  payoutChange: number;
}

interface RevenueTrendPoint {
  month: string;
  revenue: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);

        // Generate mock trend data based on total revenue
        const mockTrend = generateMockTrend(data.totalRevenue);
        setRevenueTrend(mockTrend);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateMockTrend = (totalRevenue: number): RevenueTrendPoint[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: Math.round(
        (totalRevenue / months.length) * (0.7 + Math.random() * 0.6)
      ),
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-zinc-800/50 rounded-lg animate-shimmer" />
        <div className="grid-stat">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-zinc-800/50 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card variant="premium">
          <CardContent className="flex items-center gap-4 py-8">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <p className="font-semibold text-white">Error Loading Dashboard</p>
              <p className="text-sm text-zinc-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {session?.user?.email?.split('@')[0] || 'Admin'}
        </h1>
        <p className="text-zinc-400">
          Here's your sales performance at a glance
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid-stat">
        <StatCard
          icon={BarChart3}
          label="Total Revenue"
          value={`$${(dashboardData.totalRevenue / 1000).toFixed(1)}K`}
          change={dashboardData.revenueChange}
          changeLabel="from last month"
          trend={dashboardData.revenueChange >= 0 ? 'up' : 'down'}
        />
        <StatCard
          icon={TrendingUp}
          label="Net GP"
          value={`$${(dashboardData.netGP / 1000).toFixed(1)}K`}
          change={dashboardData.gpChange}
          changeLabel="from last month"
          trend={dashboardData.gpChange >= 0 ? 'up' : 'down'}
        />
        <StatCard
          icon={AlertCircle}
          label="Total Refunds"
          value={`$${(dashboardData.totalRefunds / 1000).toFixed(1)}K`}
          change={Math.abs(dashboardData.refundChange)}
          changeLabel="from last month"
          trend={dashboardData.refundChange >= 0 ? 'up' : 'neutral'}
        />
        <StatCard
          icon={Users}
          label="Partner Payouts"
          value={`$${(dashboardData.partnerPayouts / 1000).toFixed(1)}K`}
          change={dashboardData.payoutChange}
          changeLabel="from last month"
          trend={dashboardData.payoutChange >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card variant="premium" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 p-4">
              {revenueTrend.map((point, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-gradient-purple rounded-t-lg transition-all hover:bg-opacity-80 hover:shadow-lg shadow-purple/20"
                    style={{
                      height: `${(point.revenue / Math.max(...revenueTrend.map(p => p.revenue))) * 100}%`,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-xs text-zinc-500">{point.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400 text-center">
                Average monthly revenue: $
                {(revenueTrend.reduce((acc, p) => acc + p.revenue, 0) / revenueTrend.length / 1000).toFixed(1)}K
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card variant="premium">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Branches</span>
                <span className="text-lg font-semibold text-white">
                  {dashboardData.branchCount}
                </span>
              </div>
              <div className="v-full bg-zinc-800/50 rounded-full h-2">
                <div
                  className="bg-gradient-purple rounded-full h-2"
                  style={{ width: `${Math.min((dashboardData.branchCount / 50) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Partners</span>
                <span className="text-lg font-semibold text-white">
                  {dashboardData.partnerCount}
                </span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div
                  className="bg-gradient-indigo rounded-full h-2"
                  style={{ width: `${Math.min((dashboardData.partnerCount / 100) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads Table */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Recent Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Records</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentUploads.length > 0 ? (
                  dashboardData.recentUploads.map((upload) => (
                    <tr key={upload.id}>
                      <td className="font-medium text-white">{upload.fileName}</td>
                      <td className="text-zinc-400">{upload.recordCount.toLocaleString()}</td>
                      <td className="text-zinc-500">
                        {new Date(upload.uploadedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-zinc-500 py-8">
                      No recent uploads
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
