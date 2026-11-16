import { X } from 'lucide-react'

export default function Modal({ title, onClose, wide, children }) {
  return (
    <div className="ov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' modal-wide' : '')}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</h3>
          <button
            className="btn s sm"
            onClick={onClose}
            style={{ width: 28, height: 28, padding: 0, display: 'grid', placeItems: 'center', borderRadius: 8 }}
            title="Close dialog"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
