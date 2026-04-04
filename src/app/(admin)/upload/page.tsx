'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      setSuccess(true)
      setFile(null)
    } catch (err) {
      setError('Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Upload CSV</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
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
        {success && <p className="text-lime-400 mt-4">File uploaded successfully!</p>}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-6 bg-lime-500 hover:bg-lime-400 text-black font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
