'use client'

import { useEffect, useState } from 'react'

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Branches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch: any) => (
          <div key={branch.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">{branch.name}</h3>
            <p className="text-zinc-400 text-sm mt-1">{branch.code}</p>
          </div>
        ))}
        {branches.length === 0 && (
          <p className="text-zinc-400">No branches found. Upload CSV data first.</p>
        )}
      </div>
    </div>
  )
}
