'use client';

import { 
  LayoutDashboard, 
  BookOpen, 
  FileSpreadsheet, 
  TrendingUp, 
  Bell
} from 'lucide-react';

export default function Navbar({ activeMenu, onSelectMenu }) {
  const navItems = [
    { id: 'Dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'Chart of Accounts', label: 'Daftar Akun', icon: BookOpen },
    { id: 'Input Journal', label: 'Jurnal Umum', icon: FileSpreadsheet },
    { id: 'Laporan Keuangan', label: 'Laporan', icon: TrendingUp },
  ];

  return (
    <header className="topbar">
      <div className="topbar-content">
        {/* Brand Logo */}
        <div className="brand-wrapper" onClick={() => onSelectMenu('Dashboard')}>
          <div className="brand-icon-moneva">
            {/* Asterisk / Sparkle Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
            </svg>
          </div>
          <span className="brand-name-moneva">moneva</span>
        </div>

        {/* Navigation Pills */}
        <nav className="nav-pills">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id || (item.id === 'Laporan Keuangan' && [
              'Income Statement', 'Balance Sheet', 'Cashflow', 'General Ledger', 'Trial Balance'
            ].includes(activeMenu));

            return (
              <button
                key={item.id}
                onClick={() => onSelectMenu(item.id)}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Workspace & User Profile */}
        <div className="topbar-right">
          <span className="prototype-tag">PROTOTYPE · LIVE DATA</span>

          <button className="icon-btn" title="Notifikasi">
            <Bell size={16} />
          </button>

          <div className="workspace-badge">
            <div className="workspace-avatar">TA</div>
            <div className="workspace-info">
              <span className="workspace-label">Workspace</span>
              <span className="workspace-name">Taman Aster Shoes</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
