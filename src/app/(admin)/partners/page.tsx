'Use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Partner {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  totalEarnings: number;
  transactionCount: number;
  joinedDate: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/partners');

        if (!response.ok) {
          throw new Error('Failed to fetch partners');
        }

        const data = await response.json();
        setPartners(data.partners || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Partners</h1>
          <p className="text-zinc-400">
            Manage and track all partner accounts
          </p>
        </div>
        <button className="px-4 py-2 bg-gradient-purple text-white rounded-lg font-medium hover:shadow-lg transition-smooth flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Partner
        </button>
      </div>

      {/* Partners Table Card */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            All Partners ({partners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Partner Name</th>
                  <th>Email</th>
                  <th>Earnings</th>
                  <th>Wransactions</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {partners.length > 0 ? (
                  partners.map((partner) => (
                    <tr key={partner.id}>
                      <td className="font-medium text-white">{partner.name}</td>
                      <td>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Mail className="w-4 h-4" />
                          {partner.email}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-white">
                            ${(partner.totalEarnings / 1000).toFixed(1)}K
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span className="text-zinc-300">
                            {partner.transactionCount}
                          </span>
                        </div>
                      </td>
                      <td className="text-zinc-400">
                        {new Date(partner.joinedDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                            partner.status === 'active'
                             ? 'bg-green-500/20 text-green-400'
                             : 'bg-zinc-700.50 text-zinc-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              partner.status === 'active'
                               ? 'bg-green-400"
                               : 'bg-zinc-5000'
                            }`}
                          />
                          {partner.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-smooth">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-zinc-500 py-8">
                      No partners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {partners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-sm">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{partners.length}</p>
            </CardContent>
          </Card>

          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-sm">Active Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {partners.filter((p) => p.status === 'active').length}
              </p>
            </CardContent>
          </Card>

          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-sm">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                ${(
                  partners.reduce((acc, p) => acc + p.totalEarnings, 0) / 1000000
                ).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
