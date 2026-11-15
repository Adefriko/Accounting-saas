'use client';

import { 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  Info, 
  ChevronRight,
  BookOpen,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatRupiah } from '@/frontend/utils/formatters';

export default function DashboardView({ 
  data, 
  transactions = [],
  onOpenNewJournal, 
  onNavigate 
}) {
  const monthlyData = data?.monthly_data || [];
  const latestMonth = monthlyData[monthlyData.length - 1] || {};

  const totalRevenue = latestMonth.Revenue || 0;
  const totalExpense = latestMonth.Expense || 0;
  const netProfit = latestMonth.NetProfit || (totalRevenue - totalExpense);
  const cashAvailable = latestMonth.CashIn ? (latestMonth.CashIn - (latestMonth.CashOut || 0)) : (totalRevenue * 1.5);

  // Chart data simulation or actual monthly data
  const chartData = monthlyData.length > 0 ? monthlyData.map(m => ({
    name: m.Month.split('-')[0],
    pemasukan: m.Revenue || m.CashIn || 0,
    pengeluaran: m.Expense || m.CashOut || 0
  })) : [
    { name: 'Mei', pemasukan: 13000000, pengeluaran: 7200000 },
    { name: 'Jun', pemasukan: 16500000, pengeluaran: 8100000 },
    { name: 'Jul', pemasukan: 15200000, pengeluaran: 8500000 },
    { name: 'Agu', pemasukan: 19800000, pengeluaran: 9400000 },
    { name: 'Sep', pemasukan: 18500000, pengeluaran: 9100000 },
    { name: 'Okt', pemasukan: 22400000, pengeluaran: 9900000 },
    { name: 'Nov', pemasukan: 28450000, pengeluaran: 11270000 }
  ];

  const recentTransactions = transactions.slice(0, 4);

  return (
    <div>
      {/* Page Header (Moneva Greeting Style) */}
      <div className="page-header">
        <div className="page-header-text">
          <span className="super-tag">Hai, pengelola usaha! 👋</span>
          <h1 className="page-title">Keuangan usahamu, makin jelas.</h1>
          <p className="page-subtitle">Pantau pemasukan, pengeluaran, dan aktivitas usahamu di satu tempat.</p>
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

      {/* 4 Metric Cards Row */}
      <div className="metrics-row-moneva">
        {/* Card 1: Total Pemasukan */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-teal">
              <TrendingUp size={20} />
            </div>
            <span className="trend-badge trend-badge-teal">
              <ArrowUpRight size={12} /> 12,8%
            </span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(totalRevenue || 28450000)}</div>
          <div className="metric-desc-moneva">Total pemasukan</div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-orange">
              <Receipt size={20} />
            </div>
            <span className="trend-badge trend-badge-orange">
              <ArrowUpRight size={12} /> 5,2%
            </span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(totalExpense || 11270000)}</div>
          <div className="metric-desc-moneva">Total pengeluaran</div>
        </div>

        {/* Card 3: Laba Bersih */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-blue">
              <CreditCard size={20} />
            </div>
            <span className="trend-badge trend-badge-teal">
              <ArrowUpRight size={12} /> 16,4%
            </span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(netProfit || 17180000)}</div>
          <div className="metric-desc-moneva">Laba bersih</div>
        </div>

        {/* Card 4: Kas Tersedia */}
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-purple">
              <Wallet size={20} />
            </div>
            <span className="trend-badge trend-badge-teal">
              <ArrowUpRight size={12} /> 8,0%
            </span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(cashAvailable || 42850000)}</div>
          <div className="metric-desc-moneva">Kas tersedia</div>
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
            Perbandingan uang masuk dan keluar selama 7 bulan
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
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={v => `${(v / 1000000).toFixed(0)} jt`} />
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
              <span className="status-pill status-pill-active">
                <span className="dot-indicator" /> Sehat
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
                {formatRupiah(cashAvailable || 42850000)}
              </div>
              <div style={{ fontSize: 11.5, color: '#006d5b', marginBottom: 6 }}>
                Sasaran kas operasional: Rp 50.000.000
              </div>
              <div style={{ width: '100%', height: 7, background: 'rgba(0, 109, 91, 0.15)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: '85.7%', height: '100%', background: '#006d5b', borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: 11, color: '#006d5b', fontWeight: 600, marginTop: 6 }}>
                85,7% dari target
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
            Catatan transaksi yang baru ditambahkan
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
                        {tx.debit} · {tx.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--brand-teal)' }}>
                    + {formatRupiah(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              /* Sample Mock Transactions from Reference */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)' }}>Penerimaan layanan deep clean</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Pemasukan / Transfer · 14 Nov 2026</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15803d' }}>+ Rp 375.000</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Receipt size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)' }}>Pembelian cairan pembersih</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Pengeluaran · 13 Nov 2026</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ea580c' }}>- Rp 185.000</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)' }}>Penerimaan paket express</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Pemasukan / Transfer · 12 Nov 2026</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15803d' }}>+ Rp 225.000</div>
                </div>
              </>
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
