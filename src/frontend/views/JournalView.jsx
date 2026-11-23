'use client';

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  CheckCircle2, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '@/frontend/utils/formatters';
import Modal from '@/frontend/components/Modal';

export default function JournalView({
  accounts = [],
  transactions = [],
  onAddTransaction,
  onDeleteTransaction,
  onNavigateToAccounts
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    debit: accounts[0]?.account || '',
    credit: accounts[1]?.account || accounts[0]?.account || '',
    amount: '',
    description: ''
  });

  // Calculate totals
  const totalDebit = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.debit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.credit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `JU-${t.id}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    }).sort((a, b) => b.id - a.id);
  }, [transactions, searchTerm]);

  const handleOpenModal = () => {
    setNewTx(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      debit: prev.debit || accounts[0]?.account || '',
      credit: prev.credit || accounts[1]?.account || accounts[0]?.account || ''
    }));
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const targetDebit = newTx.debit || accounts[0]?.account || '';
    const targetCredit = newTx.credit || (accounts[1]?.account || accounts[0]?.account || '');
    
    const success = await onAddTransaction({
      ...newTx,
      debit: targetDebit,
      credit: targetCredit
    });
    if (success) {
      setNewTx({
        date: new Date().toISOString().split('T')[0],
        debit: accounts[0]?.account || '',
        credit: accounts[1]?.account || accounts[0]?.account || '',
        amount: '',
        description: ''
      });
      setIsModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['No Jurnal', 'Tanggal', 'Akun Debit', 'Akun Kredit', 'Nominal', 'Keterangan'];
    const rows = transactions.map(t => [
      `JU-${t.id}`,
      t.date,
      `"${t.debit}"`,
      `"${t.credit}"`,
      t.amount,
      `"${t.description || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jurnal_umum_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <span className="super-tag">BUKU HARIAN</span>
          <h1 className="page-title">Jurnal Umum</h1>
          <p className="page-subtitle">Catatan riwayat mutasi debit dan kredit usaha.</p>
        </div>

        <div className="page-actions">
          <button onClick={handleExportCSV} className="btn-moneva-outline">
            <Download size={15} />
            <span>Ekspor CSV</span>
          </button>

          <button onClick={handleOpenModal} className="btn-moneva-primary">
            <Plus size={16} />
            <span>Catat Jurnal</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="moneva-card">
        {/* Top Summary Stat Bar */}
        <div style={{ display: 'flex', gap: 40, borderBottom: '1px solid var(--border-light)', paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{transactions.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Transaksi</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{formatRupiah(totalDebit)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Debit</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{formatRupiah(totalDebit)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Kredit</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari nomor atau keterangan..."
              className="form-input-moneva"
              style={{ paddingLeft: 40 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: 180 }}>
            <select className="form-select-moneva" disabled defaultValue="all">
              <option value="all">Semua periode</option>
            </select>
          </div>

          <div style={{ width: 180 }}>
            <select className="form-select-moneva" disabled defaultValue="all">
              <option value="all">Semua status</option>
            </select>
          </div>

          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="btn-moneva-outline" style={{ fontSize: 12.5 }}>
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="moneva-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>TANGGAL</th>
                <th style={{ width: 130 }}>NO. JURNAL</th>
                <th>KETERANGAN / PASANGAN AKUN</th>
                <th>STATUS</th>
                <th className="text-right">TOTAL DEBIT</th>
                <th className="text-right">TOTAL KREDIT</th>
                <th className="text-center" style={{ width: 90 }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{tx.date}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-dark)' }}>
                      JU-{String(tx.id).padStart(4, '0')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                        {tx.description || 'Transaksi Keuangan'}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        <span style={{ color: '#059669', fontWeight: 600 }}>[D] {tx.debit}</span>
                        {'  ➔  '}
                        <span style={{ color: '#ea580c', fontWeight: 600 }}>[K] {tx.credit}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-pill-active">
                        <span className="dot-indicator" /> Tercatat
                      </span>
                    </td>
                    <td className="text-right" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="text-right" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="btn-moneva-danger"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Belum ada riwayat transaksi jurnal. Klik <strong>+ Buat Jurnal Baru</strong> di atas untuk mencatat transaksi pertama Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Menampilkan {filteredTransactions.length} dari {transactions.length} jurnal</span>
          <span>{filteredTransactions.length > 0 ? 'Data tersinkronisasi' : ''}</span>
        </div>
      </div>

      {/* MODAL: Catat Jurnal Umum Baru (Figma Spec) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catat Jurnal Umum Baru">
        {accounts.length === 0 ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <AlertCircle size={36} style={{ color: 'var(--brand-orange)', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>Belum Ada Akun Terdaftar</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 16 }}>
              Anda perlu menambahkan akun di Daftar Akun terlebih dahulu sebelum membuat jurnal.
            </p>
            <button 
              onClick={() => { setIsModalOpen(false); onNavigateToAccounts(); }} 
              className="btn-moneva-primary"
              style={{ margin: '0 auto' }}
            >
              Buka Daftar Akun
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div className="modal-body">
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: -6, marginBottom: 12 }}>
                Pencatatan berpasangan standar. Pastikan mutasi debit dan kredit merefleksikan transaksi riil.
              </p>

              <div className="form-group">
                <label className="form-label">Tanggal Transaksi</label>
                <input
                  type="date"
                  className="form-input-moneva"
                  value={newTx.date}
                  onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#006d5b' }}>Akun Debit (+)</label>
                  <select
                    className="form-select-moneva"
                    value={newTx.debit || (accounts[0] ? accounts[0].account : '')}
                    onChange={e => setNewTx({ ...newTx, debit: e.target.value })}
                  >
                    {accounts.map(acc => (
                      <option key={acc.account} value={acc.account}>{acc.account} ({acc.type})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#ea580c' }}>Akun Kredit (-)</label>
                  <select
                    className="form-select-moneva"
                    value={newTx.credit || (accounts[1] ? accounts[1].account : accounts[0]?.account)}
                    onChange={e => setNewTx({ ...newTx, credit: e.target.value })}
                  >
                    {accounts.map(acc => (
                      <option key={acc.account} value={acc.account}>{acc.account} ({acc.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  className="form-input-moneva"
                  value={newTx.amount}
                  onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                  required
                  min="1"
                />
              </div>

              {/* Live Balanced Status Indicator (Figma Reference) */}
              <div style={{ 
                background: newTx.amount ? '#e6f4f1' : '#f8fafc', 
                border: `1px solid ${newTx.amount ? '#ccede6' : '#e2e8f0'}`, 
                borderRadius: 'var(--radius-sm)', 
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: newTx.amount ? '#006d5b' : 'var(--text-secondary)' }}>
                  <CheckCircle2 size={15} style={{ color: newTx.amount ? '#006d5b' : 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 600 }}>
                    {newTx.amount ? 'Status Jurnal: Seimbang (Balanced)' : 'Status: Menunggu input nominal'}
                  </span>
                </div>
                {newTx.amount && (
                  <span style={{ fontWeight: 700, color: '#004d40' }}>
                    {formatRupiah(Number(newTx.amount) || 0)}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Keterangan / Catatan Transaksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembayaran invoice deep clean pelanggan..."
                  className="form-input-moneva"
                  value={newTx.description}
                  onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-moneva-outline">
                Batal
              </button>
              <button type="submit" className="btn-moneva-primary">
                Simpan Transaksi
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
