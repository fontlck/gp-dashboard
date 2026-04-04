'use client'

import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
  }, [])

  if (!stats) return <div className="text-white p-8">Loading...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-lime-400">{stats.totalRevenue?.toLocaleString() || 0} THB</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Branches</p>
          <p className="text-2xl font-bold text-white">{stats.totalBranches || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Partners</p>
          <p className="text-2xl font-bold text-white">{stats.totalPartners || 0}</p>
        </div>
      </div>
    </div>
  )
}
