import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, wide, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const modalNode = (
    <div
      className="ov modal-portal-root"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}
    >
      <div className={'modal' + (wide ? ' modal-wide' : '')}>
        <div className="modal-head row" style={{ justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</h3>
          <button
            className="btn s sm modal-close-btn"
            onClick={onClose}
            style={{ width: 28, height: 28, padding: 0, display: 'grid', placeItems: 'center', borderRadius: 8, cursor: 'pointer' }}
            title="Close dialog"
            type="button"
          >
            <X size={15} />
          </button>
        </div>
        <div className="modal-content-scroll" style={{ overflowY: 'auto', overscrollBehavior: 'contain', paddingRight: '4px' }}>
          {children}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalNode, document.body)
  }
  return modalNode
}
