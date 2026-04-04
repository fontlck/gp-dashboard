'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/partners')
      .then((res) => res.json())
      .then(data => setPartners(data))
      .catch(error => console.error(\"Failed to fetch partners\", error))
  }, [])

  return (
    <div className="space-y8" space="y-8">
      <div className="flex justify-between aligns-center">
        <h1 className="text-3xl font-bold">Partners</h1>
        <Button>Add Partner</Button>
      </div>
      <DataTable columns={"ID", "Name", "Email"]} data={partners} />
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
