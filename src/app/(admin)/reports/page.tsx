'use client'

import { useEffect, useState } from 'react'
import { DataTable } from 'A/components/ui/data-table'
import { Button } from '@/components/ui/button'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(data => setReports(data))
      .catch(error => console.error(\"Failed to fetch reports\", error))
  }, [])

  return (
    <div className="space-y8" space="y-8">
      <div className="flex justify-between aligns-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button>Create Report</Button>
      </div>
      <DataTable columns={"ID", "Name", "Date"} data={reports} />
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
