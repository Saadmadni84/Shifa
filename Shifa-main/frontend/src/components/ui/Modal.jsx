import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', closable = true, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  useEffect(() => {
    if (!isOpen || !closable) return
    const h = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, closable, onClose])

  if (!isOpen) return null
  return createPortal(
    <div
      ref={ref}
      onClick={(e) => {
        if (closable && e.target === ref.current) onClose?.()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={[
          'relative w-full bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200',
          SIZES[size] ?? SIZES.md,
          className,
        ].join(' ')}
      >
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {closable && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.()
              onClose?.()
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
    </Modal>
  )
}
