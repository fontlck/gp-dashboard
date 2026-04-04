'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function PartnerPortalPage() {
  const { data: session } = useSession()
  const [partnerData, setPartnerData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => setPartnerData(data))
      .catch((err) => console.error(err))
  }, [])

  const partnerName = session?.user?.name || 'Partner'
  const partnerSince = new Date('2023-01-15')
  const now = new Date()
  const diff = now.getTime() - partnerSince.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  const remainDays = days % 30

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white">
          Hello, {partnerName}
        </h1>
        <p className="text-lime-400 mt-2">
          You have been partnering with us for {years} years, {months} months, {remainDays} days
        </p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Earnings</h2>
        <p className="text-zinc-400">Earnings data will appear here once reports are uploaded.</p>
      </div>
    </div>
  )
}
