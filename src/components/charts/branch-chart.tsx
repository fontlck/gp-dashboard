'use client'

export function BranchChart({ data }: { data?: any[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Branch Performance</h3>
      <p className="text-zinc-400 text-sm">Chart will render when data is available.</p>
    </div>
  )
}
