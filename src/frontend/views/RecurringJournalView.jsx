'use client';

import { useState, useMemo } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Clock,
  Play,
  Layers,
  HelpCircle
} from 'lucide-react';
import { formatRupiah } from '@/frontend/utils/formatters';
import Modal from '@/frontend/components/Modal';

export default function RecurringJournalView({
  rules = [],
  accounts = [],
  onAddRule,
  onDeleteRule,
  onExecuteRule,
  onExecuteAll,
  onSeedDefaultRules,
  onNavigateToJournal
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    category: 'Operasional',
    frequency: 'monthly',
    day_of_month: 25,
    debit: accounts[0]?.account || '',
    credit: accounts[1]?.account || accounts[0]?.account || '',
    amount: '',
    description: ''
  });

  // Hitung total estimasi pengeluaran rutin per bulan
  const totalMonthlyCommitment = useMemo(() => {
    return rules.filter(r => r.is_active).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [rules]);

  const handleOpenAddModal = () => {
    setNewRule({
      name: '',
      category: 'Operasional',
      frequency: 'monthly',
      day_of_month: 25,
      debit: accounts[0]?.account || '',
      credit: accounts[1]?.account || accounts[0]?.account || '',
      amount: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const targetDebit = newRule.debit || accounts[0]?.account || '';
    const targetCredit = newRule.credit || (accounts[1]?.account || accounts[0]?.account || '');
    
    const success = await onAddRule({
      ...newRule,
      debit: targetDebit,
      credit: targetCredit
    });
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleTriggerAll = async () => {
    if (!window.confirm(`⚡ Jalankan ${rules.length} transaksi rutin sekaligus sekarang ke Jurnal Umum?`)) return;
    setExecuting(true);
    try {
      await onExecuteAll();
    } finally {
      setExecuting(false);
    }
  };

  const handleTriggerSingle = async (rule) => {
    if (!window.confirm(`⚡ Bukukan transaksi '${rule.name}' sebesar ${formatRupiah(rule.amount)} ke Jurnal Umum sekarang?`)) return;
    setExecuting(true);
    try {
      await onExecuteRule(rule.id);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="super-tag">OTOMASI PEMBUKUAN ENTERPRISE</span>
            <span className="badge-enterprise">AUTO-PILOT UMKM</span>
          </div>
          <h1 className="page-title">Jurnal Otomatis & Transaksi Rutin</h1>
          <p className="page-subtitle">
            Konsep pembukuan modern perusahaan besar: transaksi rutin (gaji, sewa ruko, utilitas) tidak perlu diinput ulang satu per satu.
          </p>
        </div>

        <div className="page-actions">
          {rules.length > 0 && (
            <button 
              onClick={handleTriggerAll} 
              className="btn-moneva-primary btn-auto-exec"
              disabled={executing}
              title="Eksekusi semua aturan rutin aktif ke Jurnal Umum hari ini"
            >
              <Zap size={16} />
              <span>{executing ? 'Memproses...' : 'Jalankan Semua Rutin (1-Klik)'}</span>
            </button>
          )}

          <button onClick={handleOpenAddModal} className="btn-moneva-outline">
            <Plus size={16} />
            <span>Tambah Aturan Rutin</span>
          </button>
        </div>
      </div>

      {/* Info Card / Metric Highlights */}
      <div className="metrics-row-moneva" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-teal">
              <Zap size={20} />
            </div>
            <span className="trend-badge trend-badge-teal">Otomasi Aktif</span>
          </div>
          <div className="metric-value-moneva">{rules.length} Aturan</div>
          <div className="metric-desc-moneva">Total jadwal transaksi rutin terdaftar</div>
        </div>

        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-orange">
              <Clock size={20} />
            </div>
            <span className="trend-badge trend-badge-orange">Beban Bulanan</span>
          </div>
          <div className="metric-value-moneva">{formatRupiah(totalMonthlyCommitment)}</div>
          <div className="metric-desc-moneva">Estimasi pengeluaran rutin terikat per bulan</div>
        </div>

        <div className="metric-card-moneva">
          <div className="metric-card-top">
            <div className="metric-icon-circle metric-icon-blue">
              <CheckCircle2 size={20} />
            </div>
            <span className="trend-badge trend-badge-teal">Sinkron Realtime</span>
          </div>
          <div className="metric-value-moneva" style={{ fontSize: 18, paddingTop: 4 }}>
            Terhubung ke Laporan
          </div>
          <div className="metric-desc-moneva">Sekali klik langsung update Laba Rugi & Neraca</div>
        </div>
      </div>

      {/* Empty State with UMKM Starter Presets */}
      {rules.length === 0 ? (
        <div className="moneva-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="auto-empty-icon">
            <Sparkles size={32} className="text-teal" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>
            Belum Ada Aturan Jurnal Otomatis
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Hemat waktu pembukuan bisnis Anda. Daripada menginput manual setiap akhir bulan, gunakan template transaksi rutin siap pakai untuk UMKM di bawah ini.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button 
              onClick={onSeedDefaultRules} 
              className="btn-moneva-primary"
              style={{ padding: '12px 24px', fontSize: 14 }}
            >
              <Zap size={16} />
              <span>Gunakan Paket Template Rutin UMKM (Gaji, Sewa, Listrik)</span>
            </button>
            <button 
              onClick={handleOpenAddModal} 
              className="btn-moneva-outline"
            >
              Buat Aturan Kustom
            </button>
          </div>
        </div>
      ) : (
        /* Rules List */
        <div className="moneva-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)' }}>
                Daftar Aturan Transaksi Rutin UMKM
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                Klik tombol <strong>Jalankan Sekarang</strong> pada salah satu transaksi, atau gunakan tombol <strong>Jalankan Semua Rutin</strong> di atas.
              </p>
            </div>

            <button 
              onClick={() => onNavigateToJournal()}
              className="btn-moneva-outline"
              style={{ fontSize: 12.5 }}
            >
              <span>Buka Jurnal Umum</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="recurring-grid">
            {rules.map(rule => (
              <div key={rule.id} className="recurring-item-card">
                <div className="recurring-item-top">
                  <div>
                    <span className="recurring-category-badge">{rule.category || 'Operasional'}</span>
                    <h4 className="recurring-item-title">{rule.name}</h4>
                  </div>
                  <div className="recurring-amount">
                    {formatRupiah(rule.amount)}
                  </div>
                </div>

                <div className="recurring-accounts-flow">
                  <span className="account-tag debit">[D] {rule.debit}</span>
                  <span className="flow-arrow">➔</span>
                  <span className="account-tag credit">[K] {rule.credit}</span>
                </div>

                {rule.description && (
                  <p className="recurring-desc">{rule.description}</p>
                )}

                <div className="recurring-item-footer">
                  <div className="recurring-schedule-info">
                    <Calendar size={13} />
                    <span>Jadwal: Tgl {rule.day_of_month} per bulan</span>
                    {rule.last_run && (
                      <span className="last-run-badge">Terakhir: {rule.last_run}</span>
                    )}
                  </div>

                  <div className="recurring-actions">
                    <button
                      type="button"
                      className="btn-exec-single"
                      onClick={() => handleTriggerSingle(rule)}
                      disabled={executing}
                      title="Posting otomatis transaksi ini ke Jurnal Umum hari ini"
                    >
                      <Play size={13} />
                      <span>Jalankan Sekarang</span>
                    </button>

                    <button
                      type="button"
                      className="btn-delete-icon"
                      onClick={() => onDeleteRule(rule.id, rule.name)}
                      title="Hapus aturan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tambah Aturan Rutin Baru */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Buat Aturan Jurnal Otomatis Baru"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nama Transaksi Rutin</label>
              <input
                type="text"
                placeholder="Contoh: Gaji Karyawan Toko / Sewa Kios"
                className="form-input-moneva"
                value={newRule.name}
                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select-moneva"
                  value={newRule.category}
                  onChange={e => setNewRule({ ...newRule, category: e.target.value })}
                >
                  <option value="Operasional">Operasional Usaha</option>
                  <option value="Ketenagakerjaan">Gaji & Karyawan</option>
                  <option value="Sewa Tempat">Sewa Toko / Ruko</option>
                  <option value="Utilitas">Listrik, Air & Internet</option>
                  <option value="Perlengkapan">Stok & Perlengkapan</option>
                  <option value="Penyusutan">Penyusutan Aset (Depresiasi)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Jatuh Tempo Rutin</label>
                <select
                  className="form-select-moneva"
                  value={newRule.day_of_month}
                  onChange={e => setNewRule({ ...newRule, day_of_month: parseInt(e.target.value, 10) })}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>Setiap Tanggal {d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#059669' }}>Akun Debit (Beban / Aset)</label>
                <select
                  className="form-select-moneva"
                  value={newRule.debit || accounts[0]?.account}
                  onChange={e => setNewRule({ ...newRule, debit: e.target.value })}
                  required
                >
                  {accounts.map(acc => (
                    <option key={`debit-${acc.id || acc.account}`} value={acc.account}>
                      {acc.account} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#ea580c' }}>Akun Credit (Kas / Bank)</label>
                <select
                  className="form-select-moneva"
                  value={newRule.credit || (accounts[1] ? accounts[1].account : accounts[0]?.account)}
                  onChange={e => setNewRule({ ...newRule, credit: e.target.value })}
                  required
                >
                  {accounts.map(acc => (
                    <option key={`credit-${acc.id || acc.account}`} value={acc.account}>
                      {acc.account} ({acc.type})
                    </option>
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
                value={newRule.amount}
                onChange={e => setNewRule({ ...newRule, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Keterangan Tambahan (Opsional)</label>
              <input
                type="text"
                placeholder="Catatan rincian transaksi..."
                className="form-input-moneva"
                value={newRule.description}
                onChange={e => setNewRule({ ...newRule, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-moneva-outline">
              Batal
            </button>
            <button type="submit" className="btn-moneva-primary">
              Simpan Aturan Otomatis
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
