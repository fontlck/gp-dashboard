'use client'

import { useEffect, useState } from 'react'

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/partners')
      .then((res) => res.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Partners</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner: any) => (
          <div key={partner.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
            <p className="text-lime-400 text-sm mt-1">{partner.revenueSharePercent}% Revenue Share</p>
            <p className="text-zinc-400 text-sm">{partner.isVatRegistered ? 'VAT Registered' : 'Non-VAT'}</p>
          </div>
        ))}
        {partners.length === 0 && (
          <p className="text-zinc-400">No partners found.</p>
        )}
      </div>
    </div>
  )
}
