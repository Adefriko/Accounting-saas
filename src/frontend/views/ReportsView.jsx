'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  Scale, 
  Wallet, 
  BookMarked,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '@/frontend/utils/formatters';

export default function ReportsView({
  incomeStatementData,
  balanceSheetData,
  cashflowData,
  ledgerData,
  trialBalanceData,
  accounts = [],
  ledgerAccount,
  onSelectLedgerAccount,
  cashflowAccount,
  onSelectCashflowAccount
}) {
  const [activeReportTab, setActiveReportTab] = useState('Laba Rugi'); // Laba Rugi | Neraca | Arus Kas | Buku Besar | Neraca Saldo

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `laporan_${activeReportTab.toLowerCase().replace(/\s+/g, '_')}.csv`;

    if (activeReportTab === 'Laba Rugi' && incomeStatementData?.rows) {
      headers = ['Kategori', ...incomeStatementData.months];
      rows = incomeStatementData.rows.map(r => [
        `"${r.Kategori}"`,
        ...incomeStatementData.months.map(m => r[m])
      ]);
    } else if (activeReportTab === 'Neraca' && balanceSheetData?.rows) {
      headers = ['Akun / Klasifikasi', ...balanceSheetData.months];
      rows = balanceSheetData.rows.filter(r => !r.is_spacer).map(r => [
        `"${r.Account.trim()}"`,
        ...balanceSheetData.months.map(m => r[m] || 0)
      ]);
    } else if (activeReportTab === 'Arus Kas' && cashflowData?.rows) {
      headers = ['Kategori Aliran Kas', ...cashflowData.months];
      rows = cashflowData.rows.map(r => [
        `"${r.Kategori}"`,
        ...cashflowData.months.map(m => r[m])
      ]);
    } else if (activeReportTab === 'Neraca Saldo' && trialBalanceData?.entries) {
      headers = ['Akun Keuangan', 'Tipe', 'Debit', 'Kredit'];
      rows = trialBalanceData.entries.map(e => [
        `"${e.account}"`,
        e.type,
        e.debit,
        e.credit
      ]);
    }

    if (headers.length > 0) {
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 100% Real DB Data for Laba Rugi
  const revenueAccounts = incomeStatementData?.revenue_accounts || [];
  const expenseAccounts = incomeStatementData?.expense_accounts || [];
  const cogsAccounts = incomeStatementData?.cogs_accounts || [];

  const totalRevenue = incomeStatementData?.total_revenue || 0;
  const totalExpense = (incomeStatementData?.total_expense || 0) + (incomeStatementData?.total_cogs || 0);
  const netProfit = incomeStatementData?.net_profit || 0;
  const netMargin = incomeStatementData?.net_margin || '0.0';

  const expenseRatio = totalRevenue > 0 ? Math.min(100, (totalExpense / totalRevenue) * 100) : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <span className="super-tag">INSIGHT KEUANGAN</span>
          <h1 className="page-title">Laporan Keuangan</h1>
          <p className="page-subtitle">Lihat ringkasan posisi dan kinerja keuangan dengan tampilan yang mudah dipahami.</p>
        </div>

        <div className="page-actions">
          <div className="btn-moneva-outline" style={{ cursor: 'default' }}>
            <Calendar size={15} style={{ color: 'var(--text-secondary)' }} />
            <span>November 2026</span>
          </div>

          <button onClick={handleExportCSV} className="btn-moneva-outline">
            <Download size={15} />
            <span>Ekspor CSV</span>
          </button>

          <button onClick={handlePrint} className="btn-moneva-primary">
            <Printer size={15} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation Pills (Moneva Style) */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#f1f5f9', padding: 4, borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        {[
          { id: 'Laba Rugi', label: 'Laba Rugi' },
          { id: 'Neraca', label: 'Neraca' },
          { id: 'Arus Kas', label: 'Arus Kas' },
          { id: 'Buku Besar', label: 'Buku Besar' },
          { id: 'Neraca Saldo', label: 'Neraca Saldo' }
        ].map(tab => {
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? 'var(--brand-teal)' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tabs Content with Slide Animation */}
      <div key={activeReportTab} className="tab-slide-enter">
        {/* TAB 1: LABA RUGI (Matches Reference 04-Laporan-Keuangan-Desktop.png) */}
        {activeReportTab === 'Laba Rugi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 24 }}>
          {/* Left Column: Laporan Laba Rugi Breakdown Real DB Data */}
          <div className="moneva-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)' }}>Laporan Laba Rugi</h3>
              <span className="status-pill status-pill-active">
                <span className="dot-indicator" /> Ringkasan
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 20 }}>Akumulasi Periode Berjalan dari Database</p>

            {/* Section 1: Pendapatan */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', marginBottom: 8 }}>
                Pendapatan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 14px' }}>
                {revenueAccounts.length > 0 ? (
                  revenueAccounts.map(r => (
                    <div key={r.account} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-body)' }}>
                      <span>{r.account}</span>
                      <span style={{ fontWeight: 600 }}>{formatRupiah(r.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Belum ada pencatatan pendapatan di database.
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 13.5, color: 'var(--text-dark)', marginTop: 10 }}>
                <span>Total pendapatan</span>
                <span style={{ color: 'var(--brand-teal)' }}>{formatRupiah(totalRevenue)}</span>
              </div>
            </div>

            {/* Section 2: Beban Usaha & HPP */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', marginBottom: 8 }}>
                Beban usaha & HPP
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 14px' }}>
                {[...expenseAccounts, ...cogsAccounts].length > 0 ? (
                  [...expenseAccounts, ...cogsAccounts].map(e => (
                    <div key={e.account} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-body)' }}>
                      <span>{e.account}</span>
                      <span style={{ fontWeight: 600 }}>{formatRupiah(e.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Belum ada pencatatan beban atau HPP di database.
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 13.5, color: 'var(--text-dark)', marginTop: 10 }}>
                <span>Total beban</span>
                <span style={{ color: 'var(--brand-orange)' }}>{formatRupiah(totalExpense)}</span>
              </div>
            </div>

            {/* Section 3: Laba Bersih Highlight Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-teal-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-teal)' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--brand-teal)' }}>Laba bersih</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#004d40' }}>{formatRupiah(netProfit)}</span>
            </div>
          </div>

          {/* Right Column: Sorotan Bulan Ini (Matches Reference 04) */}
          <div className="moneva-card" style={{ marginBottom: 0, height: 'fit-content' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>Sorotan periode ini</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 20 }}>Margin laba bersih</p>

            <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--brand-teal)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {netMargin}%
            </div>

            <div style={{ margin: '12px 0 24px' }}>
              <span className={`trend-badge ${netProfit >= 0 ? 'trend-badge-teal' : 'trend-badge-rose'}`} style={{ padding: '4px 10px', fontSize: 12 }}>
                {netProfit >= 0 ? 'Performa positif' : 'Perlu efisiensi'}
              </span>
            </div>

            {/* Comparison Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pendapatan</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{formatRupiah(totalRevenue)}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: totalRevenue > 0 ? '100%' : '0%', height: '100%', background: 'var(--brand-teal)', borderRadius: 10 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Beban</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{formatRupiah(totalExpense)}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${expenseRatio}%`, height: '100%', background: 'var(--brand-orange)', borderRadius: 10 }} />
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              Laporan laba rugi dihitung secara akrual otomatis dari seluruh transaksi jurnal debit & kredit yang telah Anda input ke database Neon PostgreSQL.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NERACA (BALANCE SHEET) */}
      {activeReportTab === 'Neraca' && (
        <div className="moneva-card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>Balance Sheet (Neraca Akumulasi)</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 20 }}>Posisi Aset, Liabilitas, dan Ekuitas per Bulan dari Database</p>

          <div className="table-container">
            <table className="moneva-table">
              <thead>
                <tr>
                  <th>NAMA AKUN / KLASIFIKASI</th>
                  {balanceSheetData?.months?.map(m => (
                    <th key={m} className="text-right">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {balanceSheetData?.rows?.map((row, i) => {
                  if (row.is_spacer) return <tr key={i}><td colSpan={13} style={{ height: 12, padding: 0, border: 'none' }} /></tr>;
                  return (
                    <tr key={i} style={{ 
                      fontWeight: row.is_header || row.is_total ? 700 : 400,
                      background: row.is_total ? '#f8fafc' : 'transparent',
                      color: row.is_header ? 'var(--brand-teal)' : 'var(--text-dark)'
                    }}>
                      <td>{row.Account}</td>
                      {balanceSheetData.months.map(m => (
                        <td key={m} className="text-right">
                          {row.is_header ? '' : (row[m] === 0 ? '-' : formatRupiah(row[m]))}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ARUS KAS (CASHFLOW) */}
      {activeReportTab === 'Arus Kas' && (
        <div className="moneva-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Laporan Arus Kas</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Pelacakan uang masuk dan keluar pada kas/bank</p>
            </div>
            {cashflowData?.available_accounts?.length > 0 && (
              <div style={{ width: 220 }}>
                <select 
                  className="form-select-moneva"
                  value={cashflowAccount}
                  onChange={e => onSelectCashflowAccount(e.target.value)}
                >
                  {cashflowData.available_accounts.map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="table-container">
            <table className="moneva-table">
              <thead>
                <tr>
                  <th>KATEGORI ALIRAN KAS</th>
                  {cashflowData?.months?.map(m => (
                    <th key={m} className="text-right">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cashflowData?.rows?.map((row, i) => (
                  <tr key={i} style={{ fontWeight: row.Kategori === 'Net Cashflow' ? 700 : 500, background: row.Kategori === 'Net Cashflow' ? 'var(--bg-teal-subtle)' : 'transparent' }}>
                    <td style={{ color: row.Kategori === 'Net Cashflow' ? 'var(--brand-teal)' : 'var(--text-dark)' }}>{row.Kategori}</td>
                    {cashflowData.months.map(m => (
                      <td key={m} className="text-right">{formatRupiah(row[m])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BUKU BESAR (GENERAL LEDGER) */}
      {activeReportTab === 'Buku Besar' && (
        <div className="moneva-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Buku Besar (General Ledger)</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Riwayat mutasi dan saldo berjalan per akun dari database</p>
            </div>
            {accounts.length > 0 && (
              <div style={{ width: 220 }}>
                <select 
                  className="form-select-moneva"
                  value={ledgerAccount}
                  onChange={e => onSelectLedgerAccount(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc.account} value={acc.account}>{acc.account} ({acc.type})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="table-container">
            <table className="moneva-table">
              <thead>
                <tr>
                  <th>TANGGAL</th>
                  <th>KETERANGAN</th>
                  <th className="text-right">DEBIT</th>
                  <th className="text-right">KREDIT</th>
                  <th className="text-right">SALDO BERJALAN</th>
                </tr>
              </thead>
              <tbody>
                {ledgerData?.entries?.length > 0 ? (
                  ledgerData.entries.map((e, idx) => (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-secondary)' }}>{e.date}</td>
                      <td style={{ fontWeight: 500 }}>{e.description || '-'}</td>
                      <td className="text-right" style={{ color: '#059669', fontWeight: 600 }}>
                        {e.debit > 0 ? formatRupiah(e.debit) : '-'}
                      </td>
                      <td className="text-right" style={{ color: '#ea580c', fontWeight: 600 }}>
                        {e.credit > 0 ? formatRupiah(e.credit) : '-'}
                      </td>
                      <td className="text-right" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                        {formatRupiah(e.balance)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      Belum ada mutasi transaksi untuk akun ini di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: NERACA SALDO (TRIAL BALANCE) */}
      {activeReportTab === 'Neraca Saldo' && (
        <div className="moneva-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Trial Balance (Neraca Saldo)</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Pengecekan keseimbangan debit dan kredit buku besar</p>
            </div>
            {trialBalanceData && (
              <span className={`status-pill ${trialBalanceData.balanced ? 'status-pill-active' : 'status-pill-cogs'}`}>
                {trialBalanceData.balanced ? '✓ KESEIMBANGAN SEIMBANG (BALANCED)' : '✕ TIDAK SEIMBANG'}
              </span>
            )}
          </div>

          <div className="table-container">
            <table className="moneva-table">
              <thead>
                <tr>
                  <th>AKUN KEUANGAN</th>
                  <th>KATEGORI</th>
                  <th className="text-right">DEBIT (SALDO)</th>
                  <th className="text-right">KREDIT (SALDO)</th>
                </tr>
              </thead>
              <tbody>
                {trialBalanceData?.entries?.length > 0 ? (
                  trialBalanceData.entries.map((e, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{e.account}</td>
                      <td><span className="status-pill status-pill-asset">{e.type}</span></td>
                      <td className="text-right" style={{ color: '#059669', fontWeight: 600 }}>
                        {e.debit > 0 ? formatRupiah(e.debit) : '-'}
                      </td>
                      <td className="text-right" style={{ color: '#ea580c', fontWeight: 600 }}>
                        {e.credit > 0 ? formatRupiah(e.credit) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      Belum ada data neraca saldo di database.
                    </td>
                  </tr>
                )}
              </tbody>
              {trialBalanceData && !trialBalanceData.empty && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                    <td colSpan={2}>TOTAL SALDO</td>
                    <td className="text-right" style={{ color: '#059669', fontSize: 14 }}>
                      {formatRupiah(trialBalanceData.total_debit)}
                    </td>
                    <td className="text-right" style={{ color: '#ea580c', fontSize: 14 }}>
                      {formatRupiah(trialBalanceData.total_credit)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
