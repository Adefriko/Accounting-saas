'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-moneva">
      {toasts.map(t => (
        <div key={t.id} className={`toast-moneva ${t.type === 'error' ? 'toast-error' : ''}`}>
          {t.type === 'success' ? (
            <CheckCircle size={18} style={{ color: 'var(--brand-teal)', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ color: 'var(--brand-rose)', flexShrink: 0 }} />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
