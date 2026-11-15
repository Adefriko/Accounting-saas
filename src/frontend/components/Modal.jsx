'use client';

import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button 
            onClick={onClose} 
            className="icon-btn" 
            style={{ width: 30, height: 30 }}
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
