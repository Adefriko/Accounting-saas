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
import ReportsView from '@/frontend/views/ReportsView';

export default function HomePage() {
  // Auth & Session States
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Navigation & Core States
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Feature specific states
  const [dashboardData, setDashboardData] = useState(null);
  const [ledgerAccount, setLedgerAccount] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [trialBalanceData, setTrialBalanceData] = useState(null);
  const [incomeStatementData, setIncomeStatementData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [cashflowAccount, setCashflowAccount] = useState('');
  const [cashflowData, setCashflowData] = useState(null);

  // Helper auth header
  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser?.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
    if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);
    return headers;
  }, [currentUser]);

  // Toast Helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Check stored user session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('moneva_user_session');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      console.warn('Session parsing error');
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
    } catch (e) {
      console.error(e);
    }
    addToast(`Selamat datang, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAccountModalOpen(false);
    try {
      localStorage.removeItem('moneva_user_session');
      if (typeof document !== 'undefined') {
        document.cookie = 'moneva_session=; path=/; max-age=0;';
      }
    } catch (e) {
      console.error(e);
    }
    addToast('Anda telah keluar dari Moneva.', 'info');
  };

  // ==========================================
  // FETCH API HANDLERS (TERPROTEKSI AUTH)
  // ==========================================
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts', { headers: getAuthHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setAccounts(Array.isArray(data) ? data : []);
      else addToast(data.error || 'Gagal memuat akun', 'error');
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  }, [getAuthHeaders, addToast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions', { headers: getAuthHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setTransactions(Array.isArray(data) ? data : []);
      else addToast(data.error || 'Gagal memuat transaksi', 'error');
    } catch {
      console.error('Error fetching transactions');
    }
  }, [getAuthHeaders, addToast]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard', { headers: getAuthHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok) setDashboardData(data);
      else addToast(data.error || 'Gagal memuat dashboard', 'error');
    } catch {
      addToast('Koneksi database bermasalah', 'error');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, addToast]);

  const fetchLedger = useCallback(async (accName) => {
    if (!accName) return;
    try {
      const res = await fetch(`/api/ledger?account=${encodeURIComponent(accName)}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setLedgerData(data);
    } catch {
      console.error('Error fetching ledger');
    }
  }, [getAuthHeaders]);

  const fetchTrialBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/trial-balance', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setTrialBalanceData(data);
    } catch {
      console.error('Error fetching trial balance');
    }
  }, [getAuthHeaders]);

  const fetchIncomeStatement = useCallback(async () => {
    try {
      const res = await fetch('/api/income-statement', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setIncomeStatementData(data);
    } catch {
      console.error('Error fetching income statement');
    }
  }, [getAuthHeaders]);

  const fetchBalanceSheet = useCallback(async () => {
    try {
      const res = await fetch('/api/balance-sheet', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setBalanceSheetData(data);
    } catch {
      console.error('Error fetching balance sheet');
    }
  }, [getAuthHeaders]);

  const fetchCashflow = useCallback(async (accName) => {
    try {
      const url = accName ? `/api/cashflow?account=${encodeURIComponent(accName)}` : '/api/cashflow';
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setCashflowData(data);
        if (data.selected_account && !cashflowAccount) setCashflowAccount(data.selected_account);
      }
    } catch {
      console.error('Error fetching cashflow');
    }
  }, [cashflowAccount, getAuthHeaders]);

  // Initial load when logged in
  useEffect(() => {
    if (currentUser) {
      fetchAccounts();
      fetchTransactions();
      fetchDashboard();
    }
  }, [currentUser, fetchAccounts, fetchTransactions, fetchDashboard]);

  // Tab switch effect
  useEffect(() => {
    if (!currentUser) return;
    if (activeMenu === 'Dashboard') {
      fetchDashboard();
      fetchTransactions();
    } else if (activeMenu === 'Chart of Accounts') {
      fetchAccounts();
    } else if (activeMenu === 'Input Journal') {
      fetchAccounts();
      fetchTransactions();
    } else if (activeMenu === 'Laporan Keuangan') {
      fetchAccounts();
      fetchTransactions();
      fetchIncomeStatement();
      fetchBalanceSheet();
      fetchCashflow(cashflowAccount);
      fetchTrialBalance();
      if (accounts.length > 0 && !ledgerAccount) {
        setLedgerAccount(accounts[0].account);
        fetchLedger(accounts[0].account);
      } else if (ledgerAccount) {
        fetchLedger(ledgerAccount);
      }
    }
  }, [
    currentUser, activeMenu, ledgerAccount, cashflowAccount, accounts.length,
    fetchAccounts, fetchTransactions, fetchDashboard, fetchLedger,
    fetchTrialBalance, fetchIncomeStatement, fetchBalanceSheet, fetchCashflow
  ]);

  // ==========================================
  // ACTION HANDLERS (DB MUTATIONS)
  // ==========================================
  const handleAddAccount = async (payload) => {
    if (!payload.account.trim()) {
      addToast('Nama akun tidak boleh kosong!', 'error');
      return false;
    }
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await fetchAccounts();
        await fetchDashboard();
        return true;
      }
      addToast(data.error || 'Gagal menambah akun', 'error');
      return false;
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
      return false;
    }
  };

  const handleSeedStandardAccounts = async () => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'seed' })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await fetchAccounts();
        await fetchDashboard();
      } else addToast(data.error || 'Gagal menambahkan akun standar', 'error');
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  const handleDeleteAccount = async (accountName) => {
    if (!window.confirm(`Hapus akun '${accountName}'?`)) return;
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(accountName)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await fetchAccounts();
        await fetchDashboard();
      } else addToast(data.error || 'Gagal menghapus akun', 'error');
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  const handleAddTransaction = async (txPayload) => {
    if (txPayload.debit === txPayload.credit) {
      addToast('Akun Debit dan Credit tidak boleh sama!', 'error');
      return false;
    }
    const amt = parseFloat(txPayload.amount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Nominal harus lebih dari 0!', 'error');
      return false;
    }
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(txPayload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await fetchTransactions();
        await fetchAccounts();
        await fetchDashboard();
        return true;
      }
      addToast(data.error || 'Gagal menyimpan transaksi', 'error');
      return false;
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
      return false;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Batalkan transaksi ini?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await fetchTransactions();
        await fetchAccounts();
        await fetchDashboard();
      } else addToast(data.error || 'Gagal menghapus transaksi', 'error');
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('🔴 PERINGATAN: Apakah Anda yakin ingin mereset seluruh database?')) return;
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        await fetchAccounts();
        await fetchTransactions();
        await fetchDashboard();
        setActiveMenu('Dashboard');
      } else addToast(data.error || 'Gagal melakukan reset', 'error');
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  // Loading Session Spinner
  if (authChecking) {
    return (
      <div className="app-wrapper flex-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Menyiapkan sesi aplikasi Moneva..." />
      </div>
    );
  }

  // Not Logged In -> Show Auth Screen
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

      {/* Moneva Topbar Navigation with Akun Saya */}
      <Navbar
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />

      {/* Modal Keterangan Akun Saya & Alamat */}
      {isAccountModalOpen && (
        <AccountModal
          user={currentUser}
          onClose={() => setIsAccountModalOpen(false)}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            try {
              localStorage.setItem('moneva_user_session', JSON.stringify(updated));
            } catch (e) {
              console.error(e);
            }
          }}
          onLogout={handleLogout}
          onSwitchAccount={() => {
            setIsAccountModalOpen(false);
            handleLogout();
          }}
        />
      )}

      {/* Main View Area */}
      <main className="main-container">
        {loading && activeMenu === 'Dashboard' && !dashboardData ? (
          <LoadingSpinner message="Menghubungkan & mengambil data pembukuan dari cloud database..." />
        ) : (
          <>
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

            {activeMenu === 'Laporan Keuangan' && (
              <ReportsView
                incomeStatementData={incomeStatementData}
                balanceSheetData={balanceSheetData}
                cashflowData={cashflowData}
                ledgerData={ledgerData}
                trialBalanceData={trialBalanceData}
                accounts={accounts}
                ledgerAccount={ledgerAccount}
                onSelectLedgerAccount={acc => {
                  setLedgerAccount(acc);
                  fetchLedger(acc);
                }}
                cashflowAccount={cashflowAccount}
                onSelectCashflowAccount={acc => {
                  setCashflowAccount(acc);
                  fetchCashflow(acc);
                }}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
