'use client'

import { useEffect, useState } from 'react'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-400">Reports will be displayed here once data is uploaded.</p>
      </div>
    </div>
  )
}
