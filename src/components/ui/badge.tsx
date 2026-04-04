'use client'

export function Badge({ children }: any) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-900">
      {children}
    </span>
  )
}
