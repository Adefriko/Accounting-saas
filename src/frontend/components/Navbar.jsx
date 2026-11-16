'use client';

import { 
  LayoutDashboard, 
  BookOpen, 
  FileSpreadsheet, 
  TrendingUp, 
  LogOut, 
  UserCircle2
} from 'lucide-react';

export default function Navbar({ 
  activeMenu, 
  onSelectMenu, 
  currentUser, 
  onLogout,
  onOpenAccount 
}) {
  const navItems = [
    { id: 'Dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'Chart of Accounts', label: 'Daftar Akun', icon: BookOpen },
    { id: 'Input Journal', label: 'Jurnal Umum', icon: FileSpreadsheet },
    { id: 'Laporan Keuangan', label: 'Laporan', icon: TrendingUp },
  ];

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="topbar">
      <div className="topbar-content">
        {/* Brand Logo */}
        <div className="brand-wrapper" onClick={() => onSelectMenu('Dashboard')}>
          <div className="brand-icon-moneva">
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

        {/* Right Section: 1 Single Unified User Profile */}
        <div className="topbar-right">
          {/* Single Account Badge (Opens "Keterangan Akun Saya") */}
          <div 
            className="workspace-badge single-account-badge" 
            onClick={onOpenAccount}
            title="Klik untuk membuka Keterangan Akun Saya & Alamat Bisnis"
          >
            <div className="workspace-avatar">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                />
              ) : (
                initials
              )}
            </div>
            <div className="workspace-info">
              <span className="workspace-label">
                {currentUser?.provider === 'google' ? 'Google Account' : 'Akun Bisnis'}
              </span>
              <span className="workspace-name">
                {currentUser?.name || 'Taman Aster Shoes'}
              </span>
            </div>
            <div className="badge-user-icon">
              <UserCircle2 size={16} className="text-secondary" />
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button 
              className="icon-btn btn-logout" 
              onClick={onLogout}
              title="Keluar / Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
