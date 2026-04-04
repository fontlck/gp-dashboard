'use client'

import { useEffect, useState } from 'react'
import { DataTable } from 'A/components/ui/data-table'
import { Button } from '@/components/ui/button'

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then(data => setBranches(data))
      .catch(error => console.error(\"Failed to fetch branches\", error))
  }, [])

  return (
    <div className="space-y8" space="y-8">
      <div className="flex justify-between aligns-center">
        <h1 className="text-3xl font-bold">Branches</h1>
        <Button>Add Branch</Button>
      </div>
      <DataTable columns={["ID", "Name", "Location"]} data={branches} />
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
