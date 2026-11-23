'use client';

import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [googleModal, setGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Handle Local Email/Password Auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mendaftar');

        const loggedUser = data.user || data.data?.user || data;
        onLoginSuccess(loggedUser);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Email atau kata sandi salah');

        const loggedUser = data.user || data.data?.user || data;
        onLoginSuccess(loggedUser);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth / Quick Login
  const handleGoogleAuth = async (emailInput, nameInput) => {
    setErrorMsg('');
    setLoading(true);

    const targetEmail = (emailInput || googleEmail || 'user.moneva@gmail.com').trim();
    const targetName = (nameInput || googleName || 'Pengguna Google').trim();

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetEmail)}`
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal masuk dengan Google');

      setGoogleModal(false);
      const loggedUser = data.user || data.data?.user || data;
      onLoginSuccess(loggedUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for instant preview
  const handleDemoLogin = async () => {
    await handleGoogleAuth('owner.tamanaster@moneva.id', 'Adefriko R (Owner)');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-container">
        {/* Left Showcase Panel (Figma Design Spec) */}
        <div className="auth-showcase-panel">
          <div className="auth-showcase-top">
            <div className="auth-showcase-brand">
              <div className="brand-icon-moneva">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                </svg>
              </div>
              <span className="brand-name-moneva" style={{ fontSize: '1.4rem' }}>moneva</span>
            </div>

            <div>
              <h2 className="auth-showcase-heading">
                Kelola keuangan usaha Anda dengan lebih tenang &amp; terkontrol
              </h2>
              <p className="auth-showcase-desc" style={{ marginTop: '10px' }}>
                Sistem pembukuan dan akuntansi modern untuk UMKM. Pantau laba rugi, posisi kas, dan neraca dalam satu layar.
              </p>
            </div>

            {/* Mini Financial Growth Sparkline Preview */}
            <div className="auth-preview-card">
              <div className="auth-preview-header">
                <span className="auth-preview-label">Ringkasan Arus Kas</span>
                <span className="auth-preview-trend">▲ +14.2% MoM</span>
              </div>
              <div className="auth-preview-value">Rp 128.500.000</div>
              <div className="auth-preview-chart-sim">
                <div className="preview-bar" style={{ height: '40%' }}></div>
                <div className="preview-bar" style={{ height: '55%' }}></div>
                <div className="preview-bar" style={{ height: '50%' }}></div>
                <div className="preview-bar" style={{ height: '70%' }}></div>
                <div className="preview-bar" style={{ height: '65%' }}></div>
                <div className="preview-bar" style={{ height: '85%' }}></div>
                <div className="preview-bar" style={{ height: '75%' }}></div>
                <div className="preview-bar" style={{ height: '100%' }}></div>
              </div>
            </div>

            {/* 3 Value Points */}
            <div className="auth-features-list">
              <div className="auth-feature-item">
                <span className="auth-feature-check">✓</span>
                <span>Pencatatan Jurnal Otomatis &amp; Selalu Seimbang</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-check">✓</span>
                <span>Laporan Laba Rugi, Neraca, &amp; Arus Kas Real-time</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-check">✓</span>
                <span>100% Sesuai Standar Akuntansi Keuangan</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11.5px', color: '#006d5b', opacity: 0.8, paddingTop: '20px' }}>
            © Moneva Accounting Platform. Hak Cipta Dilindungi.
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div className="auth-header">
            <h1 className="auth-title">
              {mode === 'login' ? 'Masuk ke Moneva' : 'Buat Akun Bisnis'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login' 
                ? 'Kelola keuangan usaha jadi lebih mudah dan teratur.' 
                : 'Mulai pembukuan rapi untuk bisnis Anda dalam hitungan menit.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setErrorMsg(''); }}
            >
              Masuk
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setErrorMsg(''); }}
            >
              Daftar Baru
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="auth-error-box">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="auth-social-section">
            <button
              type="button"
              className="btn-google-auth"
              onClick={() => setGoogleModal(true)}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            <div className="auth-divider">
              <span>atau masuk dengan email</span>
            </div>
          </div>

          {/* Form Fields with Slide Transition */}
          <form key={mode} onSubmit={handleSubmit} className="auth-form tab-slide-enter">
            {mode === 'register' && (
              <div className="auth-field">
                <label>Nama Lengkap / Nama Bisnis</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="Contoh: Taman Aster Shoes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label>Alamat Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="nama@bisnis.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Kata Sandi</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Moneva' : 'Daftar Akun Baru'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo Fast Track Button */}
          <div className="auth-demo-box">
            <div className="demo-header">
              <Sparkles size={16} className="text-teal" />
              <span>Akses Cepat Pengujian:</span>
            </div>
            <button
              type="button"
              className="btn-demo-quick"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Coba Akun Demo Langsung (1-Klik)
            </button>
          </div>

          <div className="auth-footer-note">
            <ShieldCheck size={14} />
            <span>Tersimpan aman &amp; terenkripsi di Neon Cloud Database</span>
          </div>
        </div>
      </div>

      {/* Google Sign In Dialog */}
      {googleModal && (
        <div className="modal-overlay" onClick={() => setGoogleModal(false)}>
          <div className="google-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <div className="google-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <h3>Pilih Akun Google</h3>
              <p>Gunakan akun Google Anda untuk melanjutkan ke Moneva</p>
            </div>

            <div className="google-account-list">
              <button
                type="button"
                className="google-account-item"
                onClick={() => handleGoogleAuth('adefriko.dev@gmail.com', 'Adefriko R')}
              >
                <div className="google-user-avatar">AR</div>
                <div className="google-user-info">
                  <strong>Adefriko R</strong>
                  <span>adefriko.dev@gmail.com</span>
                </div>
                <CheckCircle2 size={16} className="text-teal" />
              </button>

              <button
                type="button"
                className="google-account-item"
                onClick={() => handleGoogleAuth('tamanaster.shoes@gmail.com', 'Taman Aster Shoes')}
              >
                <div className="google-user-avatar" style={{ background: '#0284c7' }}>TA</div>
                <div className="google-user-info">
                  <strong>Taman Aster Shoes</strong>
                  <span>tamanaster.shoes@gmail.com</span>
                </div>
              </button>
            </div>

            <div className="google-custom-input">
              <label>Atau masukkan email Google Anda:</label>
              <input
                type="email"
                placeholder="nama@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="Nama Anda (opsional)"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                style={{ marginTop: '8px' }}
              />
              <button
                type="button"
                className="btn-google-confirm"
                onClick={() => handleGoogleAuth()}
                disabled={loading || !googleEmail.includes('@')}
              >
                Lanjutkan Masuk
              </button>
            </div>

            <button
              type="button"
              className="btn-modal-cancel"
              onClick={() => setGoogleModal(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
