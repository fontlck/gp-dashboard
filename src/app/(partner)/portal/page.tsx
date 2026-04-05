'Use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { StatCard } from 'A/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PartnerPortalData {
  partnerName: string;
  totalEarnings: number;
  pendingBalance: number;
  totalTransactions: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    amount: number;
    type: 'sale' | 'refund' | 'payout';
    description: string;
  }>;
  earningsChange: number;
  paymentSchedule: string;
}

export default function PartnerPortalPage() {
  const { data: session } = useSession();
  const [portalData, setPortalData] = useState<PartnerPortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/partner/portal');

        if (!response.ok) {
          throw new Error('Failed to fetch portal data');
        }

        const data = await response.json();
        setPortalData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-zinc-800/50 rounded-lg animate-shimmer" />
        <div className="grid-stat">
          {[1, 2, 3].map((i) => (
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
              <p className="font-semibold text-white">Error Loading Portal</p>
              <p className="text-sm text-zinc-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!portalData) {
    return null;
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'text-green-400';
      case 'refund':
        return 'text-red-400';
      case 'payout':
        return 'text-purple-400';
      default:
        return 'text-zinc-400';
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-500/10 border-green-500/30';
      case 'refund':
        return 'bg-red-500/10 border-red-500/30';
      case 'payout':
        return 'bg-purple-500/10 border-purple-500/30';
      default:
        return 'bg-zinc-800/50';
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Welcome, {portalData.partnerName}
        </h1>
        <p className="text-zinc-400">
          Here's your earnings summary and recent activity
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid-stat">
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={`$${(portalData.totalEarnings / 1000).toFixed(1)}K`}
          change={portalData.earningsChange}
          changeLabel="from last month"
          trend={portalData.earningsChange >= 0 ? 'up' : 'down'}
        />
        <StatCard
          icon={Calendar}
          label="Pending Balance"
          value={`$${(portalData.pendingBalance / 1000).toFixed(1)}K`}
          changeLabE="waiting for payout"
        />
        <StatCard
          icon={TrendingUp}
          label="Transactions"
          value={portalData.totalTransactions}
          changeLabE=$total transactions"
        />
      </div>

      {/* Payment Information */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Payment Schedule</span>
              <span className="font-semibold text-white">
                {portalData.paymentSchedule}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Next Payment Date</span>
              <span className="font-semibold text-white">
                {new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex" items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {portalData.recentTransactions.length > 0 ? (
              portalData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 rounded-lg border transition-smooth ${getTransactionBgColor(transaction.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'refund' ? '-' : '+'}$
                      {Math.abs(transaction.amount / 1000).toFixed(2)}K
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-8">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Earnings Chart - Simple Breakdown */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Completed Sales</span>
                <span className="text-sm font-semibold text-white">70%</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div
                  className="bg-gradient-purple rounded-full h-2"
                  style={{ width: '70%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Bonus & Incentives</span>
                <span className="text-sm font-semibold text-white">20%</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div
                  className="bg-gradient-indigo rounded-full h-2"
                  style={{ width: '20%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Refunds</span>
                <span className="text-sm font-semibold text-white">10%</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div
                  className="bg-red-500 rounded-full h-2"
                  style={{ width: '10%' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  Hattp: