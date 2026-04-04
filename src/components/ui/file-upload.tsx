'use client'

export function FileUpload({ onFileSelected }: any) {
  return (
    <input
      type="file"
      onChange={(e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) onFileSelected(file)
      }}
    />
  )
}
