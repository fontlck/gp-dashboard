'use client'

export function StatCard({ label, value }: any) {
  return (
    <div className="rounded-lg bg-surface-volatile p-4">
      <p className="text-sm text-gray-500">{\label}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  )
}
