'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { BarChart } from '@/components/charts/bar-chart'
import { RevenueChart } from '@/components/charts/revenue-chart'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className="space-y8" space="y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
