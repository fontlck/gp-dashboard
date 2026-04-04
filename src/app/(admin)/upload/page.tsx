'use client'

import { useState, useEffect } from 'react'

interface Branch {
  id: string
  name: string
  code: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBranches(data)
          if (data.length > 0) setSelectedBranch(data[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const handleUpload = async () => {
    if (!file || !selectedBranch) return
    setLoading(true)
    setError('')
    setSuccess(false)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('branchId', selectedBranch)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setSuccess(true)
      setMessage(data.message || 'Upload successful')
      setFile(null)
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Upload CSV</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Select Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>
        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-zinc-400"
          />
          {file && <p className="text-zinc-300 mt-2">{file.name}</p>}
        </div>
        {error && <p className="text-red-400 mt-4">{error}</p>}
        {success && <p className="text-lime-400 mt-4">{message}</p>}
        <button
          onClick={handleUpload}
          disabled={!file || !selectedBranch || loading}
          className="mt-6 bg-lime-500 hover:bg-lime-400 text-black font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
