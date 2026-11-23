'use client';

import { 
  LayoutDashboard, 
  BookOpen, 
  FileSpreadsheet, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Footer({ onNavigate }) {
  const handleNav = (menuName) => {
    if (onNavigate) {
      onNavigate(menuName);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer-moneva" aria-label="Footer Informasi Situs">
      <div className="footer-container">
        {/* Top 4-Column Grid */}
        <div className="footer-top-grid">
          {/* Brand & Identity Column */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <div className="brand-icon-moneva">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                </svg>
              </div>
              <span className="brand-name-moneva">moneva</span>
            </div>

            <p className="footer-desc">
              Platform akuntansi dan pembukuan modern berbasis web untuk UMKM dan bisnis berkembang di Indonesia.
            </p>

            <div className="footer-status-badge">
              <span className="footer-status-dot"></span>
              <span>Sistem Aktif (Cloud Database Terkoneksi)</span>
            </div>
          </div>

          {/* Column 1: Modul Operasional */}
          <div>
            <h4 className="footer-col-title">Modul Utama</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => handleNav('Dashboard')} className="footer-link-btn">
                  <LayoutDashboard size={14} /> Beranda Finansial
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('Chart of Accounts')} className="footer-link-btn">
                  <BookOpen size={14} /> Bagan Akun (COA)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('Input Journal')} className="footer-link-btn">
                  <FileSpreadsheet size={14} /> Jurnal Umum
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('Jurnal Otomatis')} className="footer-link-btn">
                  <Zap size={14} /> Jurnal Otomatis
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Laporan Keuangan */}
          <div>
            <h4 className="footer-col-title">Laporan Keuangan</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => handleNav('Laporan Keuangan')} className="footer-link-btn">
                  <TrendingUp size={14} /> Laba Rugi (P&amp;L)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('Laporan Keuangan')} className="footer-link-btn">
                  <TrendingUp size={14} /> Neraca (Balance Sheet)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('Laporan Keuangan')} className="footer-link-btn">
                  <TrendingUp size={14} /> Arus Kas (Cash Flow)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('Laporan Keuangan')} className="footer-link-btn">
                  <TrendingUp size={14} /> Buku Besar &amp; Neraca Saldo
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Standar & Keamanan */}
          <div>
            <h4 className="footer-col-title">Standar &amp; Keamanan</h4>
            <ul className="footer-links-list">
              <li style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} style={{ color: '#006d5b' }} />
                <span>Double-Entry Bookkeeping</span>
              </li>
              <li style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} style={{ color: '#006d5b' }} />
                <span>Standar SAK EMKM Indonesia</span>
              </li>
              <li style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} style={{ color: '#006d5b' }} />
                <span>Neon PostgreSQL Serverless</span>
              </li>
              <li style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} style={{ color: '#006d5b' }} />
                <span>Validasi Sesi &amp; Keamanan Data</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copy">
            © {new Date().getFullYear()} Moneva Accounting SaaS. Hak Cipta Dilindungi.
          </div>

          <div className="footer-meta-links">
            <span className="footer-meta-item">Format Mata Uang: IDR (Rp)</span>
            <span className="footer-meta-item">•</span>
            <span className="footer-meta-item">Versi 1.0 (Production Ready)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
