'use client'

export function Modal({ isOpen, onClose, children }: any) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z 50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/ms-0" onClick={onClose} />
      <div className="bg-white rounded-lg p-6">
        {children}
      </div>
    </div>
  )
}
