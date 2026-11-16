'use client';

import { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Save, 
  CheckCircle2,
  Building2,
  Calendar
} from 'lucide-react';

export default function AccountModal({ 
  user, 
  onClose, 
  onUpdateUser, 
  onLogout,
  onSwitchAccount 
}) {
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Simpan perubahan profil & alamat akun
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`,
          'x-user-id': String(user?.id || '')
        },
        body: JSON.stringify({ name, address })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui keterangan akun');

      const updatedUser = data.user || data.data?.user;
      if (updatedUser) {
        onUpdateUser({
          ...user,
          ...updatedUser
        });
      }
      setSuccessMsg('Keterangan akun dan alamat berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Hari ini';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window account-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="account-modal-header-title">
            <User size={20} className="text-teal" />
            <h2 className="modal-title">Keterangan Akun Saya</h2>
          </div>
          <button className="icon-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* User Profile Card */}
          <div className="account-profile-card">
            <div className="account-avatar-large">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="account-profile-details">
              <h3 className="account-profile-name">{user?.name || 'Pengguna Moneva'}</h3>
              <p className="account-profile-email">{user?.email}</p>
              <div className="account-badges">
                <span className="account-pill-provider">
                  {user?.provider === 'google' ? 'Google Account' : 'Email/Password'}
                </span>
                <span className="account-pill-status">
                  <ShieldCheck size={12} /> Sesi Aktif
                </span>
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="account-alert-success">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="auth-error-box">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Keterangan Akun & Alamat */}
          <form onSubmit={handleSaveProfile} className="account-form">
            <div className="auth-field">
              <label>Nama Bisnis / Pemilik Akun</label>
              <div className="auth-input-wrapper">
                <Building2 size={16} className="auth-input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT Taman Aster Sejahtera"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Alamat Email Terdaftar</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Alamat Akun / Lokasi Operasional Bisnis</label>
              <div className="auth-input-wrapper" style={{ alignItems: 'flex-start' }}>
                <MapPin size={16} className="auth-input-icon" style={{ marginTop: '12px' }} />
                <textarea
                  className="account-textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Boulevard Aster No. 25, Blok B4, Kel. Jatirasa, Kec. Jatiasih, Kota Bekasi 17424"
                  rows={3}
                />
              </div>
              <span className="field-hint">
                Alamat resmi akun ini akan terhubung dengan kop laporan dan invoice bisnis Anda.
              </span>
            </div>

            <button
              type="submit"
              className="btn-moneva-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Keterangan Akun'}</span>
            </button>
          </form>

          {/* Session & Info Meta */}
          <div className="account-meta-grid">
            <div className="account-meta-item">
              <Calendar size={14} className="text-secondary" />
              <span>Bergabung: <strong>{memberSince}</strong></span>
            </div>
            <div className="account-meta-item">
              <ShieldCheck size={14} className="text-teal" />
              <span>Keamanan: <strong>HMAC SHA-256 Cloud</strong></span>
            </div>
          </div>

          {/* Login & Logout Management */}
          <div className="account-auth-actions">
            <h4>Manajemen Sesi Akun</h4>
            <div className="account-auth-buttons">
              <button
                type="button"
                className="btn-moneva-outline"
                onClick={onSwitchAccount}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Ganti Akun / Login Baru
              </button>
              <button
                type="button"
                className="btn-moneva-danger"
                onClick={onLogout}
                style={{ flex: 1, justifyContent: 'center', padding: '10px 14px' }}
              >
                <LogOut size={16} />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
