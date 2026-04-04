'use client'

export function PieChart({ data }: { data?: any[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Revenue Distribution</h3>
      <p className="text-zinc-400 text-sm">Chart will render when data is available.</p>
    </div>
  )
}
