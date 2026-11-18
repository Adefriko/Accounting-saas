/**
 * Map nama akun ke tipe akunnya (case-insensitive & trimmed)
 */
export function buildAccountTypeMap(accounts) {
  const map = {};
  for (const acc of accounts) {
    if (acc?.account) {
      map[acc.account.trim()] = acc.type;
      map[acc.account.trim().toLowerCase()] = acc.type;
    }
  }
  return map;
}

/**
 * 1. Kalkulasi Data Dashboard Finansial (100% Terintegrasi Real DB)
 */
export function calculateDashboardData(transactions, accounts) {
  const accTypes = buildAccountTypeMap(accounts);
  const getType = (name) => {
    if (!name) return '';
    const clean = String(name).trim();
    return accTypes[clean] || accTypes[clean.toLowerCase()] || '';
  };

  // 1. Hitung total kas tersedia saat ini (Total saldo semua akun Aset)
  let cashAvailable = 0;
  for (const acc of accounts) {
    if (acc.type === 'Asset') {
      let debit = 0;
      let credit = 0;
      const targetAcc = acc.account.trim().toLowerCase();
      for (const tx of transactions) {
        if (String(tx.debit).trim().toLowerCase() === targetAcc) debit += (tx.amount || 0);
        if (String(tx.credit).trim().toLowerCase() === targetAcc) credit += (tx.amount || 0);
      }
      cashAvailable += (debit - credit);
    }
  }

  // 2. Kelompokkan transaksi bulanan
  const monthlyData = {};
  const MONTHS_LABEL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();

  for (const tx of transactions) {
    if (!tx.date) continue;
    const dateStr = String(tx.date).split('T')[0];
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10) || currentYear;
    const mIdx = (parseInt(parts[1], 10) || 1) - 1;
    if (mIdx < 0 || mIdx > 11) continue;

    const sortKey = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
    const mStr = `${MONTHS_LABEL[mIdx]} ${y}`;

    if (!monthlyData[sortKey]) {
      monthlyData[sortKey] = {
        name: MONTHS_LABEL[mIdx],
        Month: mStr,
        sortKey,
        Revenue: 0,
        Expense: 0,
        COGS: 0,
        pemasukan: 0,
        pengeluaran: 0
      };
    }

    const amt = Number(tx.amount) || 0;
    const debitType = getType(tx.debit);
    const creditType = getType(tx.credit);

    // Pencatatan Pendapatan / Uang Masuk Usaha
    if (creditType === 'Revenue') {
      monthlyData[sortKey].Revenue += amt;
      monthlyData[sortKey].pemasukan += amt;
    } else if (debitType === 'Asset' && creditType !== 'Asset') {
      monthlyData[sortKey].pemasukan += amt;
    }

    // Pencatatan Beban / Pengeluaran Usaha
    if (debitType === 'Expense' || debitType === 'COGS') {
      monthlyData[sortKey].Expense += amt;
      monthlyData[sortKey].pengeluaran += amt;
    } else if (creditType === 'Asset' && debitType !== 'Asset') {
      monthlyData[sortKey].pengeluaran += amt;
    }
  }

  // 3. Bangun 12 bulan penuh tahun berjalan agar grafik Recharts selalu memiliki garis kurva terhubung
  const fullChartTimeline = [];
  for (let m = 0; m < 12; m++) {
    const sortKey = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
    const found = monthlyData[sortKey];
    fullChartTimeline.push({
      name: MONTHS_LABEL[m],
      Month: `${MONTHS_LABEL[m]} ${currentYear}`,
      sortKey,
      pemasukan: found ? found.pemasukan : 0,
      pengeluaran: found ? found.pengeluaran : 0,
      Revenue: found ? found.Revenue : 0,
      Expense: found ? found.Expense : 0
    });
  }

  // Total keseluruhan All Time
  let totalRevenueAllTime = 0;
  let totalExpenseAllTime = 0;
  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    const creditType = getType(tx.credit);
    const debitType = getType(tx.debit);
    if (creditType === 'Revenue') totalRevenueAllTime += amt;
    else if (debitType === 'Asset' && creditType !== 'Asset') totalRevenueAllTime += amt;

    if (debitType === 'Expense' || debitType === 'COGS') totalExpenseAllTime += amt;
    else if (creditType === 'Asset' && debitType !== 'Asset') totalExpenseAllTime += amt;
  }
  const netProfitAllTime = totalRevenueAllTime - totalExpenseAllTime;

  // Laba bersih MoM
  const profitMargin = totalRevenueAllTime > 0
    ? ((netProfitAllTime / totalRevenueAllTime) * 100)
    : 0;

  // Target kas operasional (Rp 50 Juta)
  const targetCash = 50000000;
  const targetCashPercent = targetCash > 0 ? Math.min(100, Math.max(0, (cashAvailable / targetCash) * 100)) : 0;

  // Alokasi beban (Expense Breakdown per akun)
  const expenseDetails = {};
  for (const tx of transactions) {
    if (['Expense', 'COGS'].includes(getType(tx.debit))) {
      expenseDetails[tx.debit] = (expenseDetails[tx.debit] || 0) + (Number(tx.amount) || 0);
    }
  }
  const expenseBreakdown = Object.entries(expenseDetails).map(([account, amount]) => ({ account, amount }));

  // Transaksi terbaru terurut tanggal & id descending
  const recentTransactions = [...transactions]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.id - a.id))
    .slice(0, 5);

  return {
    empty: transactions.length === 0,
    total_revenue: totalRevenueAllTime,
    total_expense: totalExpenseAllTime,
    net_profit: netProfitAllTime,
    cash_available: cashAvailable,
    revenue_growth_mom: 0,
    expense_growth_mom: 0,
    profit_margin: profitMargin,
    target_cash: targetCash,
    target_cash_percent: targetCashPercent,
    monthly_data: fullChartTimeline,
    chart_data: fullChartTimeline,
    expense_breakdown: expenseBreakdown,
    recent_transactions: recentTransactions
  };
}

/**
 * 2. Kalkulasi Buku Besar (General Ledger)
 */
export function calculateLedgerData(transactions, accounts, accountName) {
  const acc = accounts.find(a => a.account === accountName);
  if (!acc) return { error: 'Akun tidak ditemukan' };

  const accType = acc.type;
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  const entries = [];
  let balance = 0;

  for (const tx of sorted) {
    let debitVal = 0;
    let creditVal = 0;
    let isRelevant = false;

    if (tx.debit === accountName) {
      debitVal = tx.amount;
      isRelevant = true;
      balance += ['Asset', 'Expense', 'COGS'].includes(accType) ? debitVal : -debitVal;
    } else if (tx.credit === accountName) {
      creditVal = tx.amount;
      isRelevant = true;
      balance += ['Asset', 'Expense', 'COGS'].includes(accType) ? -creditVal : creditVal;
    }

    if (isRelevant) {
      entries.push({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        debit: debitVal,
        credit: creditVal,
        balance
      });
    }
  }

  return { account: accountName, type: accType, entries };
}

/**
 * 3. Kalkulasi Neraca Saldo (Trial Balance)
 */
export function calculateTrialBalanceData(transactions, accounts) {
  if (!transactions.length || !accounts.length) {
    return { empty: true, entries: [], total_debit: 0, total_credit: 0, balanced: true };
  }

  const entries = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (const acc of accounts) {
    const sumDebit = transactions.filter(tx => tx.debit === acc.account).reduce((s, tx) => s + tx.amount, 0);
    const sumCredit = transactions.filter(tx => tx.credit === acc.account).reduce((s, tx) => s + tx.amount, 0);

    let debitBalance = 0;
    let creditBalance = 0;

    if (['Asset', 'Expense', 'COGS'].includes(acc.type)) {
      const saldo = sumDebit - sumCredit;
      if (saldo > 0) debitBalance = saldo;
      else if (saldo < 0) creditBalance = Math.abs(saldo);
    } else {
      const saldo = sumCredit - sumDebit;
      if (saldo > 0) creditBalance = saldo;
      else if (saldo < 0) debitBalance = Math.abs(saldo);
    }

    if (debitBalance > 0 || creditBalance > 0) {
      entries.push({ account: acc.account, type: acc.type, debit: debitBalance, credit: creditBalance });
      totalDebit += debitBalance;
      totalCredit += creditBalance;
    }
  }

  return {
    empty: false,
    entries,
    total_debit: totalDebit,
    total_credit: totalCredit,
    balanced: Math.round(totalDebit * 100) === Math.round(totalCredit * 100)
  };
}

/**
 * 4. Kalkulasi Laporan Laba Rugi (Income Statement) - Detail Per Akun & Matriks
 */
export function calculateIncomeStatementData(transactions, accounts) {
  const accTypes = buildAccountTypeMap(accounts);
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const categories = ['Revenue', 'Cost of Goods Sold', 'Gross Profit', 'Operating Expenses', 'Net Profit'];

  const grid = {};
  for (const cat of categories) {
    grid[cat] = {};
    for (const m of [...MONTHS, 'Full Year']) grid[cat][m] = 0;
  }

  // Akumulasi rincian per akun
  const revenueDetails = {};
  const expenseDetails = {};
  const cogsDetails = {};

  for (const tx of transactions) {
    const month = MONTHS[new Date(tx.date).getMonth()];
    const amt = tx.amount;

    if (accTypes[tx.credit] === 'Revenue') {
      grid['Revenue'][month] += amt;
      grid['Revenue']['Full Year'] += amt;
      revenueDetails[tx.credit] = (revenueDetails[tx.credit] || 0) + amt;
    }
    if (accTypes[tx.debit] === 'COGS') {
      grid['Cost of Goods Sold'][month] += amt;
      grid['Cost of Goods Sold']['Full Year'] += amt;
      cogsDetails[tx.debit] = (cogsDetails[tx.debit] || 0) + amt;
    }
    if (accTypes[tx.debit] === 'Expense') {
      grid['Operating Expenses'][month] += amt;
      grid['Operating Expenses']['Full Year'] += amt;
      expenseDetails[tx.debit] = (expenseDetails[tx.debit] || 0) + amt;
    }
  }

  for (const m of [...MONTHS, 'Full Year']) {
    grid['Gross Profit'][m] = grid['Revenue'][m] - grid['Cost of Goods Sold'][m];
    grid['Net Profit'][m] = grid['Gross Profit'][m] - grid['Operating Expenses'][m];
  }

  const rows = categories.map(cat => {
    const row = { Kategori: cat };
    for (const m of [...MONTHS, 'Full Year']) row[m] = grid[cat][m];
    return row;
  });

  const totalRevenue = grid['Revenue']['Full Year'] || 0;
  const totalCogs = grid['Cost of Goods Sold']['Full Year'] || 0;
  const totalExpense = grid['Operating Expenses']['Full Year'] || 0;
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpense;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  const revenueAccounts = Object.entries(revenueDetails).map(([account, amount]) => ({ account, amount }));
  const expenseAccounts = Object.entries(expenseDetails).map(([account, amount]) => ({ account, amount }));
  const cogsAccounts = Object.entries(cogsDetails).map(([account, amount]) => ({ account, amount }));

  return {
    empty: transactions.length === 0,
    months: [...MONTHS, 'Full Year'],
    rows,
    total_revenue: totalRevenue,
    total_cogs: totalCogs,
    gross_profit: grossProfit,
    total_expense: totalExpense,
    net_profit: netProfit,
    net_margin: netMargin,
    revenue_accounts: revenueAccounts,
    expense_accounts: expenseAccounts,
    cogs_accounts: cogsAccounts
  };
}

/**
 * 5. Kalkulasi Neraca (Balance Sheet)
 */
export function calculateBalanceSheetData(transactions = [], accounts = []) {
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  if (!transactions.length || !accounts.length) {
    return { empty: true, months: MONTHS, rows: [] };
  }

  const accTypes = buildAccountTypeMap(accounts);

  const assetAccs = accounts.filter(a => a.type === 'Asset').map(a => a.account);
  const liabAccs = accounts.filter(a => a.type === 'Liability').map(a => a.account);
  const eqAccs = accounts.filter(a => a.type === 'Equity').map(a => a.account);

  function calcBalance(accList, groupType, monthLimit) {
    let bal = 0;
    for (const tx of transactions) {
      const txMonth = new Date(tx.date).getMonth();
      if (txMonth > monthLimit) continue;
      const debit = accList.includes(tx.debit) ? tx.amount : 0;
      const credit = accList.includes(tx.credit) ? tx.amount : 0;
      bal += groupType === 'Asset' ? (debit - credit) : (credit - debit);
    }
    return bal;
  }

  function calcRetainedEarnings(monthLimit) {
    let rev = 0;
    let cogs = 0;
    let exp = 0;
    for (const tx of transactions) {
      const txMonth = new Date(tx.date).getMonth();
      if (txMonth > monthLimit) continue;
      if (accTypes[tx.credit] === 'Revenue') rev += tx.amount;
      if (accTypes[tx.debit] === 'COGS') cogs += tx.amount;
      if (accTypes[tx.debit] === 'Expense') exp += tx.amount;
    }
    return rev - cogs - exp;
  }

  function makeRow(title, accList, groupType, isRE = false) {
    const row = { Account: title, is_header: false, is_total: false, is_check: false };
    for (let i = 0; i < MONTHS.length; i++) {
      row[MONTHS[i]] = isRE ? calcRetainedEarnings(i) : calcBalance(accList, groupType, i);
    }
    return row;
  }

  const rows = [];

  // ASSETS
  rows.push({ Account: 'ASSETS', is_header: true, is_total: false, is_check: false });
  for (const acc of assetAccs) rows.push(makeRow(`  ${acc}`, [acc], 'Asset'));
  const totalAssets = makeRow('Total Assets', assetAccs, 'Asset');
  totalAssets.is_total = true;
  rows.push(totalAssets);
  rows.push({ Account: '', is_spacer: true });

  // LIABILITIES
  rows.push({ Account: 'LIABILITIES', is_header: true, is_total: false, is_check: false });
  for (const acc of liabAccs) rows.push(makeRow(`  ${acc}`, [acc], 'Liability'));
  const totalLiab = makeRow('Total Liabilities', liabAccs, 'Liability');
  totalLiab.is_total = true;
  rows.push(totalLiab);
  rows.push({ Account: '', is_spacer: true });

  // SHAREHOLDER'S EQUITY
  rows.push({ Account: "SHAREHOLDER'S EQUITY", is_header: true, is_total: false, is_check: false });
  for (const acc of eqAccs) rows.push(makeRow(`  ${acc}`, [acc], 'Equity'));
  rows.push(makeRow('  Retained Earnings', [], '', true));

  const totalEq = { Account: 'Total Equity', is_header: false, is_total: true, is_check: false };
  for (let i = 0; i < MONTHS.length; i++) {
    totalEq[MONTHS[i]] = calcBalance(eqAccs, 'Equity', i) + calcRetainedEarnings(i);
  }
  rows.push(totalEq);
  rows.push({ Account: '', is_spacer: true });

  // TOTAL L&E + CHECK
  const totalLE = { Account: 'Total Liabilities & Equity', is_header: false, is_total: true, is_check: false };
  const checkRow = { Account: 'Check', is_header: false, is_total: false, is_check: true };
  for (const m of MONTHS) {
    totalLE[m] = totalLiab[m] + totalEq[m];
    checkRow[m] = totalAssets[m] - totalLE[m];
  }
  rows.push(totalLE);
  rows.push(checkRow);

  return { empty: false, months: MONTHS, rows };
}

/**
 * 6. Kalkulasi Arus Kas (Cashflow Statement)
 */
export function calculateCashflowData(transactions = [], accounts = [], selectedAccount = '') {
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  if (!transactions.length || !accounts.length) {
    return { empty: true, months: [...MONTHS, 'Full Year'], rows: [], available_accounts: [] };
  }

  const assetAccounts = accounts.filter(a => a.type === 'Asset').map(a => a.account);
  if (!assetAccounts.length) {
    return { empty: true, months: [...MONTHS, 'Full Year'], rows: [], available_accounts: [], error: 'Belum ada akun bertipe Asset' };
  }

  const selected = assetAccounts.includes(selectedAccount) ? selectedAccount : assetAccounts[0];

  const grid = {
    'Cash In (Uang Masuk)': {},
    'Cash Out (Uang Keluar)': {},
    'Net Cashflow': {}
  };
  for (const cat of Object.keys(grid)) {
    for (const m of [...MONTHS, 'Full Year']) grid[cat][m] = 0;
  }

  for (const tx of transactions) {
    const month = MONTHS[new Date(tx.date).getMonth()];
    if (tx.debit === selected) {
      grid['Cash In (Uang Masuk)'][month] += tx.amount;
      grid['Cash In (Uang Masuk)']['Full Year'] += tx.amount;
    } else if (tx.credit === selected) {
      grid['Cash Out (Uang Keluar)'][month] += tx.amount;
      grid['Cash Out (Uang Keluar)']['Full Year'] += tx.amount;
    }
  }

  for (const m of [...MONTHS, 'Full Year']) {
    grid['Net Cashflow'][m] = grid['Cash In (Uang Masuk)'][m] - grid['Cash Out (Uang Keluar)'][m];
  }

  const rows = Object.keys(grid).map(cat => {
    const row = { Kategori: cat };
    for (const m of [...MONTHS, 'Full Year']) row[m] = grid[cat][m];
    return row;
  });

  return {
    empty: false,
    selected_account: selected,
    available_accounts: assetAccounts,
    months: [...MONTHS, 'Full Year'],
    rows
  };
}
