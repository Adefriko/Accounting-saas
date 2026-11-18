'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import ToastContainer from '@/frontend/components/ToastContainer';
import LoadingSpinner from '@/frontend/components/LoadingSpinner';
import AuthScreen from '@/frontend/components/AuthScreen';
import AccountModal from '@/frontend/components/AccountModal';

import DashboardView from '@/frontend/views/DashboardView';
import AccountsView from '@/frontend/views/AccountsView';
import JournalView from '@/frontend/views/JournalView';
import RecurringJournalView from '@/frontend/views/RecurringJournalView';
import ReportsView from '@/frontend/views/ReportsView';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [dashboardData, setDashboardData] = useState(null);
  const [ledgerAccount, setLedgerAccount] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [trialBalanceData, setTrialBalanceData] = useState(null);
  const [incomeStatementData, setIncomeStatementData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [cashflowAccount, setCashflowAccount] = useState('');
  const [cashflowData, setCashflowData] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser?.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
    if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);
    return headers;
  }, [currentUser]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('moneva_user_session');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      console.warn('Session error');
    } finally {
      setAuthChecking(false);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('moneva_user_session', JSON.stringify(user));
      if (typeof document !== 'undefined') {
        document.cookie = `moneva_session=${encodeURIComponent(user.token || user.id)}; path=/; max-age=604800; SameSite=Lax`;
      }
    } catch (e) { console.error(e); }
    addToast(`Selamat datang, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAccountModalOpen(false);
    try {
      localStorage.removeItem('moneva_user_session');
      if (typeof document !== 'undefined') document.cookie = 'moneva_session=; path=/; max-age=0;';
    } catch (e) { console.error(e); }
    addToast('Anda telah keluar dari Moneva.', 'info');
  };

  // API Fetch Handlers
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/accounts?t=${Date.now()}`, { headers: getAuthHeaders(), cache: 'no-store' });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setAccounts(Array.isArray(data) ? data : []);
    } catch { addToast('Gagal memuat akun', 'error'); }
  }, [getAuthHeaders, addToast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions?t=${Date.now()}`, { headers: getAuthHeaders(), cache: 'no-store' });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setTransactions(Array.isArray(data) ? data : []);
    } catch { console.error('Error fetching tx'); }
  }, [getAuthHeaders]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?t=${Date.now()}`, { headers: getAuthHeaders(), cache: 'no-store' });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setDashboardData(data);
    } catch { addToast('Koneksi database bermasalah', 'error'); } 
    finally { setLoading(false); }
  }, [getAuthHeaders, addToast]);

  const fetchRecurringRules = useCallback(async () => {
    try {
      const res = await fetch(`/api/recurring?t=${Date.now()}`, { headers: getAuthHeaders(), cache: 'no-store' });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setRecurringRules(Array.isArray(data) ? data : []);
    } catch { console.error('Error fetching recurring'); }
  }, [getAuthHeaders]);

  const fetchReports = useCallback(async () => {
    try {
      const ts = Date.now();
      const [isRes, bsRes, tbRes, cfRes] = await Promise.all([
        fetch(`/api/income-statement?t=${ts}`, { headers: getAuthHeaders(), cache: 'no-store' }),
        fetch(`/api/balance-sheet?t=${ts}`, { headers: getAuthHeaders(), cache: 'no-store' }),
        fetch(`/api/trial-balance?t=${ts}`, { headers: getAuthHeaders(), cache: 'no-store' }),
        fetch(cashflowAccount ? `/api/cashflow?account=${encodeURIComponent(cashflowAccount)}&t=${ts}` : `/api/cashflow?t=${ts}`, { headers: getAuthHeaders(), cache: 'no-store' })
      ]);
      if (isRes.ok) setIncomeStatementData(await isRes.json());
      if (bsRes.ok) setBalanceSheetData(await bsRes.json());
      if (tbRes.ok) setTrialBalanceData(await tbRes.json());
      if (cfRes.ok) {
        const cfData = await cfRes.json();
        setCashflowData(cfData);
        if (cfData.selected_account && !cashflowAccount) setCashflowAccount(cfData.selected_account);
      }
    } catch { console.error('Error fetching reports'); }
  }, [cashflowAccount, getAuthHeaders]);

  const fetchLedger = useCallback(async (accName) => {
    if (!accName) {
      setLedgerData(null);
      return;
    }
    try {
      const res = await fetch(`/api/ledger?account=${encodeURIComponent(accName)}&t=${Date.now()}`, { headers: getAuthHeaders(), cache: 'no-store' });
      if (res.ok) setLedgerData(await res.json());
      else setLedgerData(null);
    } catch { setLedgerData(null); }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (currentUser) {
      fetchAccounts();
      fetchTransactions();
      fetchDashboard();
      fetchRecurringRules();
    }
  }, [currentUser, fetchAccounts, fetchTransactions, fetchDashboard, fetchRecurringRules]);

  useEffect(() => {
    if (!currentUser) return;
    if (activeMenu === 'Dashboard') { fetchDashboard(); fetchTransactions(); fetchAccounts(); }
    else if (activeMenu === 'Chart of Accounts') { fetchAccounts(); }
    else if (activeMenu === 'Input Journal') { fetchAccounts(); fetchTransactions(); }
    else if (activeMenu === 'Jurnal Otomatis') { fetchRecurringRules(); fetchAccounts(); }
    else if (activeMenu === 'Laporan Keuangan') {
      fetchAccounts(); fetchTransactions(); fetchReports();
      if (accounts.length > 0 && !ledgerAccount) {
        setLedgerAccount(accounts[0].account);
        fetchLedger(accounts[0].account);
      } else if (accounts.length > 0 && ledgerAccount) {
        fetchLedger(ledgerAccount);
      } else {
        setLedgerAccount('');
        setLedgerData(null);
      }
    }
  }, [currentUser, activeMenu, ledgerAccount, cashflowAccount, accounts.length, fetchAccounts, fetchTransactions, fetchDashboard, fetchRecurringRules, fetchReports, fetchLedger]);

  // Action Handlers
  const handleAddAccount = async (payload) => {
    try {
      const res = await fetch('/api/accounts', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await Promise.all([fetchAccounts(), fetchDashboard(), fetchReports()]);
        return true;
      }
      addToast(data.error || 'Gagal menambah akun', 'error'); return false;
    } catch { addToast('Kesalahan server', 'error'); return false; }
  };

  const handleSeedStandardAccounts = async () => {
    try {
      const res = await fetch('/api/accounts', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ action: 'seed' }) });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await Promise.all([fetchAccounts(), fetchDashboard(), fetchReports()]);
      } else addToast(data.error || 'Gagal menambahkan akun standar', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  const handleDeleteAccount = async (name) => {
    if (!window.confirm(`Hapus akun '${name}'?`)) return;
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(name)}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await Promise.all([fetchAccounts(), fetchDashboard(), fetchReports()]);
      } else addToast(data.error || 'Gagal menghapus akun', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  const handleAddTransaction = async (txPayload) => {
    try {
      const res = await fetch('/api/transactions', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(txPayload) });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await Promise.all([fetchTransactions(), fetchAccounts(), fetchDashboard(), fetchReports()]);
        return true;
      }
      addToast(data.error || 'Gagal menyimpan transaksi', 'error'); return false;
    } catch { addToast('Kesalahan server', 'error'); return false; }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Batalkan transaksi ini?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await Promise.all([fetchTransactions(), fetchAccounts(), fetchDashboard(), fetchReports()]);
      } else addToast(data.error || 'Gagal menghapus', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  // Recurring Action Handlers
  const handleAddRecurringRule = async (rulePayload) => {
    try {
      const res = await fetch('/api/recurring', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(rulePayload) });
      const data = await res.json();
      if (res.ok) { addToast(data.message); await fetchRecurringRules(); return true; }
      addToast(data.error || 'Gagal menambah aturan rutin', 'error'); return false;
    } catch { addToast('Kesalahan server', 'error'); return false; }
  };

  const handleDeleteRecurringRule = async (id, name) => {
    if (!window.confirm(`Hapus aturan jurnal otomatis '${name}'?`)) return;
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) { addToast(data.message); await fetchRecurringRules(); }
      else addToast(data.error || 'Gagal menghapus aturan', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  const handleExecuteRecurringRule = async (id) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: 'POST', headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await Promise.all([fetchTransactions(), fetchAccounts(), fetchDashboard(), fetchRecurringRules(), fetchReports()]);
      } else addToast(data.error || 'Gagal mengeksekusi', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  const handleExecuteAllRecurring = async () => {
    try {
      const res = await fetch('/api/recurring', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ action: 'execute_all' }) });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await Promise.all([fetchTransactions(), fetchAccounts(), fetchDashboard(), fetchRecurringRules(), fetchReports()]);
      } else addToast(data.error || 'Gagal mengeksekusi rutin', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  const handleSeedDefaultRecurring = async () => {
    try {
      const res = await fetch('/api/recurring', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ action: 'seed' }) });
      const data = await res.json();
      if (res.ok) { addToast(data.message); await Promise.all([fetchRecurringRules(), fetchAccounts()]); }
      else addToast(data.error || 'Gagal memuat template', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('🔴 PERINGATAN: Apakah Anda yakin ingin mereset seluruh database?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST', headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        setIncomeStatementData(null);
        setBalanceSheetData(null);
        setTrialBalanceData(null);
        setCashflowData(null);
        setLedgerData(null);
        setCashflowAccount('');
        setLedgerAccount('');
        await Promise.all([
          fetchAccounts(),
          fetchTransactions(),
          fetchDashboard(),
          fetchRecurringRules(),
          fetchReports()
        ]);
        setActiveMenu('Dashboard');
      } else addToast(data.error || 'Gagal melakukan reset', 'error');
    } catch { addToast('Kesalahan server', 'error'); }
  };

  if (authChecking) {
    return (
      <div className="app-wrapper flex-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Menyiapkan sesi aplikasi Moneva..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-wrapper">
        <ToastContainer toasts={toasts} />
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <ToastContainer toasts={toasts} />

      <Navbar
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />

      {isAccountModalOpen && (
        <AccountModal
          user={currentUser}
          onClose={() => setIsAccountModalOpen(false)}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            try { localStorage.setItem('moneva_user_session', JSON.stringify(updated)); }
            catch (e) { console.error(e); }
          }}
          onLogout={handleLogout}
          onSwitchAccount={() => { setIsAccountModalOpen(false); handleLogout(); }}
        />
      )}

      <main className="main-container">
        {loading && activeMenu === 'Dashboard' && !dashboardData ? (
          <LoadingSpinner message="Menghubungkan & mengambil data pembukuan dari cloud database..." />
        ) : (
          <div key={activeMenu} className="feature-slide-enter">
            {activeMenu === 'Dashboard' && (
              <DashboardView
                data={dashboardData}
                transactions={transactions}
                accounts={accounts}
                onOpenNewJournal={() => setActiveMenu('Input Journal')}
                onNavigate={setActiveMenu}
                onSeedStandardAccounts={handleSeedStandardAccounts}
              />
            )}

            {activeMenu === 'Chart of Accounts' && (
              <AccountsView
                accounts={accounts}
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
                onResetDatabase={handleResetDatabase}
                onSeedStandardAccounts={handleSeedStandardAccounts}
              />
            )}

            {activeMenu === 'Input Journal' && (
              <JournalView
                accounts={accounts}
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onNavigateToAccounts={() => setActiveMenu('Chart of Accounts')}
              />
            )}

            {activeMenu === 'Jurnal Otomatis' && (
              <RecurringJournalView
                rules={recurringRules}
                accounts={accounts}
                onAddRule={handleAddRecurringRule}
                onDeleteRule={handleDeleteRecurringRule}
                onExecuteRule={handleExecuteRecurringRule}
                onExecuteAll={handleExecuteAllRecurring}
                onSeedDefaultRules={handleSeedDefaultRecurring}
                onNavigateToJournal={() => setActiveMenu('Input Journal')}
              />
            )}

            {activeMenu === 'Laporan Keuangan' && (
              <ReportsView
                incomeStatementData={incomeStatementData}
                balanceSheetData={balanceSheetData}
                cashflowData={cashflowData}
                ledgerData={ledgerData}
                trialBalanceData={trialBalanceData}
                accounts={accounts}
                ledgerAccount={ledgerAccount}
                onSelectLedgerAccount={acc => { setLedgerAccount(acc); fetchLedger(acc); }}
                cashflowAccount={cashflowAccount}
                onSelectCashflowAccount={acc => { setCashflowAccount(acc); fetchReports(); }}
              />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
