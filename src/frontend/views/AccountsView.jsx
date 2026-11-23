'use client';

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  RotateCcw, 
  Info, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { formatRupiah } from '@/frontend/utils/formatters';
import Modal from '@/frontend/components/Modal';

export default function AccountsView({ 
  accounts = [], 
  onAddAccount, 
  onDeleteAccount, 
  onResetDatabase,
  onSeedStandardAccounts
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newAccount, setNewAccount] = useState({ account: '', type: 'Asset' });

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchSearch = acc.account.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || acc.type === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [accounts, searchTerm, selectedCategory]);

  const uniqueCategories = useMemo(() => {
    return new Set(accounts.map(a => a.type)).size;
  }, [accounts]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await onAddAccount(newAccount);
    if (success) {
      setNewAccount({ account: '', type: 'Asset' });
      setIsModalOpen(false);
    }
  };

  // Helper code generator simulation based on category
  const getAccountCode = (acc, idx) => {
    const prefixes = { Asset: '110', Liability: '210', Equity: '310', Revenue: '410', COGS: '510', Expense: '520' };
    const prefix = prefixes[acc.type] || '110';
    return `${prefix}${idx + 1}`;
  };

  const getNormalBalance = (type) => {
    return ['Asset', 'Expense', 'COGS'].includes(type) ? 'Debit' : 'Kredit';
  };

  const getPillClass = (type) => {
    const map = {
      Asset: 'status-pill-asset',
      Liability: 'status-pill-liab',
      Equity: 'status-pill-equity',
      Revenue: 'status-pill-revenue',
      COGS: 'status-pill-cogs',
      Expense: 'status-pill-expense'
    };
    return map[type] || 'status-pill-asset';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <span className="super-tag">BAGAN AKUN</span>
          <h1 className="page-title">Daftar Akun</h1>
          <p className="page-subtitle">Kelola klasifikasi akun untuk pencatatan keuangan bisnis yang teratur.</p>
        </div>

        <div className="page-actions">
          {accounts.length === 0 && onSeedStandardAccounts && (
            <button onClick={onSeedStandardAccounts} className="btn-moneva-outline" title="Gunakan daftar akun dasar siap pakai">
              <Sparkles size={15} style={{ color: 'var(--brand-teal)' }} />
              <span>Gunakan Akun Standar</span>
            </button>
          )}

          <button onClick={() => setIsModalOpen(true)} className="btn-moneva-primary">
            <Plus size={16} />
            <span>Tambah Akun</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="moneva-card">
        {/* Top Mini Stats Bar */}
        <div style={{ display: 'flex', gap: 40, borderBottom: '1px solid var(--border-light)', paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{accounts.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Akun</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{uniqueCategories}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Kategori Akun</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-teal)' }}>{accounts.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Akun Aktif</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari kode atau nama akun..."
              className="form-input-moneva"
              style={{ paddingLeft: 40 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: 200 }}>
            <select
              className="form-select-moneva"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="All">Semua kategori</option>
              {['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory !== 'All') && (
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="btn-moneva-outline"
              style={{ fontSize: 12.5 }}
            >
              <RotateCcw size={13} /> Reset filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="moneva-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>KODE</th>
                <th>NAMA AKUN</th>
                <th>KATEGORI</th>
                <th>SALDO NORMAL</th>
                <th>STATUS</th>
                <th className="text-right">SALDO BERJALAN</th>
                <th className="text-center" style={{ width: 90 }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc, idx) => (
                  <tr key={acc.account}>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {getAccountCode(acc, idx)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--brand-teal)' }}>
                        {acc.account}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${getPillClass(acc.type)}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {getNormalBalance(acc.type)}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-pill-active">
                        <span className="dot-indicator" /> Aktif
                      </span>
                    </td>
                    <td className="text-right" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                      {formatRupiah(acc.balance || 0)}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => onDeleteAccount(acc.account)}
                        className="btn-moneva-danger"
                        title="Hapus Akun"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Belum ada akun di database. Klik tombol <strong>+ Tambah Akun</strong> atau <strong>Gunakan Akun Standar</strong> di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Menampilkan {filteredAccounts.length} dari {accounts.length} akun</span>
          <span>Data terhubung langsung ke Neon PostgreSQL Cloud DB</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c', fontWeight: 700, fontSize: 14 }}>
            <AlertTriangle size={16} /> Zona Bahaya (Reset Database)
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Menghapus seluruh daftar akun dan transaksi secara permanen jika Anda ingin memulai ulang dari awal.
          </div>
        </div>
        <button onClick={onResetDatabase} className="btn-moneva-danger" style={{ padding: '8px 16px' }}>
          <RotateCcw size={13} /> Reset Semua Data
        </button>
      </div>

      {/* MODAL: Tambah Akun Keuangan Baru (Figma Spec) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Akun Keuangan Baru">
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: -6, marginBottom: 12 }}>
              Akun baru akan otomatis masuk ke dalam bagan akun dan dapat langsung digunakan pada transaksi jurnal.
            </p>

            <div className="form-group">
              <label className="form-label">Nama Akun Keuangan</label>
              <input
                type="text"
                placeholder="Contoh: Kas Operasional, Bank BCA, Piutang Dagang..."
                className="form-input-moneva"
                value={newAccount.account}
                onChange={e => setNewAccount({ ...newAccount, account: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategori / Klasifikasi Akun</label>
              <select
                className="form-select-moneva"
                value={newAccount.type}
                onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}
              >
                <option value="Asset">Asset (Aset / Harta / Kas / Bank)</option>
                <option value="Liability">Liability (Kewajiban / Utang Usaha)</option>
                <option value="Equity">Equity (Ekuitas / Modal Pemilik)</option>
                <option value="Revenue">Revenue (Pendapatan Usaha)</option>
                <option value="COGS">COGS (Harga Pokok Penjualan / HPP)</option>
                <option value="Expense">Expense (Beban Operasional &amp; Usaha)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-moneva-outline">
              Batal
            </button>
            <button type="submit" className="btn-moneva-primary">
              Simpan Akun
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
