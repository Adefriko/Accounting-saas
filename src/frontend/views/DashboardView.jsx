'use client';

import { 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Info, 
  ChevronRight,
  BookOpen,
  FileSpreadsheet,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatRupiah } from '@/frontend/utils/formatters';

export default function DashboardView({ 
  data, 
  transactions = [],
  accounts = [],
  onOpenNewJournal, 
  onNavigate,
  onSeedStandardAccounts
}) {
  const totalRevenue = data?.total_revenue || 0;
  const totalExpense = data?.total_expense || 0;
  const netProfit = data?.net_profit || 0;
  const cashAvailable = data?.cash_available || 0;
  const revenueGrowth = data?.revenue_growth_mom || 0;
  const expenseGrowth = data?.expense_growth_mom || 0;
  const profitMargin = data?.profit_margin ? Number(data.profit_margin).toFixed(1) : '0.0';
  const targetPercent = data?.target_cash_percent ? Number(data.target_cash_percent).toFixed(1) : '0.0';

  // Chart data directly from DB monthly aggregation
  const chartData = (data?.chart_data && data.chart_data.length > 0)
    ? data.chart_data
    : [
        { name: 'Jan', pemasukan: 0, pengeluaran: 0 },
        { name: 'Feb', pemasukan: 0, pengeluaran: 0 },
        { name: 'Mar', pemasukan: 0, pengeluaran: 0 },
        { name: 'Apr', pemasukan: 0, pengeluaran: 0 },
        { name: 'Mei', pemasukan: 0, pengeluaran: 0 },
        { name: 'Jun', pemasukan: 0, pengeluaran: 0 },
        { name: 'Jul', pemasukan: 0, pengeluaran: 0 }
      ];

  const recentTransactions = (data?.recent_transactions && data.recent_transactions.length > 0)
    ? data.recent_transactions
    : transactions.slice(0, 4);

  const isCashHealthy = cashAvailable >= 0;

  return (
    <div>
      {/* Page Header (Moneva Greeting Style) */}
      <div className="page-header">
        <div className="page-header-text">
          <span className="super-tag">Hai, pengelola usaha! 👋</span>
          <h1 className="page-title">Keuangan usahamu, makin jelas.</h1>
          <p className="page-subtitle">Pantau pemasukan, pengeluaran, dan aktivitas usahamu di satu tempat langsung dari database cloud.</p>
        </div>

        <div className="page-actions">
          <div className="btn-moneva-outline" style={{ cursor: 'default' }}>
            <Calendar size={15} style={{ color: 'var(--text-secondary)' }} />
            <span>November 2026</span>
          </div>

          <button onClick={onOpenNewJournal} className="btn-moneva-primary">
            <Plus size={16} />
            <span>Catat Jurnal</span>
          </button>
        </div>
      </div>

      {/* Empty Database Prompt if fresh DB */}
      {accounts.length === 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={22} style={{ color: '#16a34a' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#15803d' }}>Database Baru Terdeteksi</div>
              <div style={{ fontSize: 12.5, color: '#166534' }}>Mulai dengan membuat akun keuangan Anda atau gunakan paket template akun standar.</div>
            </div>
          </div>
          {onSeedStandardAccounts && (
            <button onClick={onSeedStandardAccounts} className="btn-moneva-primary" style={{ background: '#16a34a' }}>
              Gunakan Akun Standar Siap Pakai
            </button>
          )}
        </div>
      )}

      {/* 4 Metric Cards Row (100% Real DB Data) */}
      <div className="metrics-row-moneva">
        {/* Card 1: Total Pemasukan */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-teal">
              <TrendingUp size={20} />
            </div>
            <span className={`trend-badge ${revenueGrowth >= 0 ? 'trend-badge-teal' : 'trend-badge-rose'}`}>
              {revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(totalRevenue)}</div>
          <div className="metric-desc-moneva">Total pemasukan</div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-orange">
              <Receipt size={20} />
            </div>
            <span className={`trend-badge ${expenseGrowth >= 0 ? 'trend-badge-orange' : 'trend-badge-teal'}`}>
              {expenseGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(expenseGrowth).toFixed(1)}%
            </span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(totalExpense)}</div>
          <div className="metric-desc-moneva">Total pengeluaran</div>
        </div>

        {/* Card 3: Laba Bersih */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-blue">
              <CreditCard size={20} />
            </div>
            <span className="trend-badge trend-badge-teal">
              Margin: {profitMargin}%
            </span>
          </div>
          <div className="metric-value-moneva" style={{ color: netProfit >= 0 ? 'var(--text-dark)' : 'var(--brand-rose)' }}>
            {formatRupiah(netProfit)}
          </div>
          <div className="metric-desc-moneva">Laba bersih</div>
        </div>

        {/* Card 4: Kas Tersedia */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-purple">
              <Wallet size={20} />
            </div>
            <span className={`trend-badge ${isCashHealthy ? 'trend-badge-teal' : 'trend-badge-rose'}`}>
              {targetPercent}% Target
            </span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(cashAvailable)}</div>
          <div className="metric-desc-moneva">Kas tersedia (Saldo Aktiva)</div>
        </div>
      </div>

      {/* Middle Section: Chart Arus Uang (Left) + Ringkasan Kas (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 20, marginBottom: 24 }}>
        {/* Arus Uang Usaha Card */}
        <div className="moneva-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Arus uang usaha</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#007a64' }} /> Pemasukan
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} /> Pengeluaran
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Perbandingan uang masuk dan keluar dari database transaksi
          </p>

          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pemasukanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007a64" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#007a64" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="pengeluaranGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)} jt` : v} 
                />
                <Tooltip 
                  formatter={(val) => formatRupiah(val)}
                  contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Area type="monotone" dataKey="pemasukan" stroke="#007a64" strokeWidth={2.5} fillOpacity={1} fill="url(#pemasukanGrad)" />
                <Area type="monotone" dataKey="pengeluaran" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#pengeluaranGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ringkasan Kas Card */}
        <div className="moneva-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Ringkasan kas</h3>
              <span className={`status-pill ${isCashHealthy ? 'status-pill-active' : 'status-pill-cogs'}`}>
                <span className="dot-indicator" /> {isCashHealthy ? 'Sehat' : 'Perlu Perhatian'}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Saldo kas dan target simpanan
            </p>

            {/* Inner Mint Box */}
            <div style={{ background: '#e6f4f1', borderRadius: 'var(--radius-md)', padding: 18, marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: '#006d5b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Kas tersedia
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#004d40', margin: '4px 0 10px' }}>
                {formatRupiah(cashAvailable)}
              </div>
              <div style={{ fontSize: 11.5, color: '#006d5b', marginBottom: 6 }}>
                Sasaran kas operasional: Rp 50.000.000
              </div>
              <div style={{ width: '100%', height: 7, background: 'rgba(0, 109, 91, 0.15)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.max(0, targetPercent))}%`, height: '100%', background: '#006d5b', borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: 11, color: '#006d5b', fontWeight: 600, marginTop: 6 }}>
                {targetPercent}% dari target
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <Info size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--brand-teal)' }} />
              <span>Kelola dana operasional secara berkala agar pengeluaran tetap terpantau.</span>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('Laporan Keuangan')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              color: 'var(--brand-teal)', 
              fontSize: 13, 
              fontWeight: 600, 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '8px 0', 
              marginTop: 12 
            }}
          >
            <span>Lihat laporan lengkap</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Bottom Section: Aktivitas Terbaru (Left) + Aksi Cepat (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 20 }}>
        {/* Aktivitas Terbaru Card */}
        <div className="moneva-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Aktivitas terbaru</h3>
            <button 
              onClick={() => onNavigate('Input Journal')}
              style={{ background: 'none', border: 'none', color: 'var(--brand-teal)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Semua jurnal <ChevronRight size={14} />
            </button>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Catatan transaksi yang baru ditambahkan ke database
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      background: 'var(--bg-teal-subtle)', 
                      color: 'var(--brand-teal)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)' }}>
                        {tx.description || `${tx.debit} ➔ ${tx.credit}`}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        [D] {tx.debit} · {tx.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--brand-teal)' }}>
                    + {formatRupiah(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Belum ada transaksi di database. Klik <strong>Catat jurnal baru</strong> di samping untuk memulai.
              </div>
            )}
          </div>
        </div>

        {/* Aksi Cepat Card (2x2 Grid) */}
        <div className="moneva-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>Aksi cepat</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Biar urusan administrasi makin simpel
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div 
              onClick={onOpenNewJournal}
              style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px 14px', cursor: 'pointer', transition: 'all 0.15s', background: '#fff' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-teal)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              <div style={{ color: 'var(--brand-teal)', marginBottom: 10 }}><Plus size={20} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>Catat jurnal baru</div>
            </div>

            <div 
              onClick={() => onNavigate('Chart of Accounts')}
              style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px 14px', cursor: 'pointer', transition: 'all 0.15s', background: '#fff' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-teal)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              <div style={{ color: 'var(--brand-teal)', marginBottom: 10 }}><BookOpen size={20} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>Tambah akun</div>
            </div>

            <div 
              onClick={() => onNavigate('Laporan Keuangan')}
              style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px 14px', cursor: 'pointer', transition: 'all 0.15s', background: '#fff' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-teal)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              <div style={{ color: 'var(--brand-teal)', marginBottom: 10 }}><TrendingUp size={20} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>Lihat laporan</div>
            </div>

            <div 
              onClick={() => onNavigate('Chart of Accounts')}
              style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px 14px', cursor: 'pointer', transition: 'all 0.15s', background: '#fff' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-teal)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              <div style={{ color: 'var(--brand-teal)', marginBottom: 10 }}><FileSpreadsheet size={20} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>Kelola akun</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
