/**
 * Map nama akun ke tipe akunnya
 */
export function buildAccountTypeMap(accounts) {
  const map = {};
  for (const acc of accounts) {
    map[acc.account] = acc.type;
  }
  return map;
}

/**
 * 1. Kalkulasi Data Dashboard Finansial (100% Terintegrasi Real DB)
 */
export function calculateDashboardData(transactions, accounts) {
  const accTypes = buildAccountTypeMap(accounts);

  // 1. Hitung total kas tersedia saat ini (Total saldo semua akun Aset)
  let cashAvailable = 0;
  for (const acc of accounts) {
    if (acc.type === 'Asset') {
      let debit = 0;
      let credit = 0;
      for (const tx of transactions) {
        if (tx.debit === acc.account) debit += tx.amount;
        if (tx.credit === acc.account) credit += tx.amount;
      }
      cashAvailable += (debit - credit);
    }
  }

  // 2. Kelompokkan transaksi bulanan
  const monthlyData = {};
  const MONTHS_LABEL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const mIdx = d.getMonth();
    const y = d.getFullYear();
    const sortKey = tx.date.substring(0, 7); // YYYY-MM
    const mStr = `${MONTHS_LABEL[mIdx]} ${y}`;

    if (!monthlyData[sortKey]) {
      monthlyData[sortKey] = {
        name: MONTHS_LABEL[mIdx],
        Month: mStr,
        sortKey,
        Revenue: 0,
        COGS: 0,
        Expense: 0,
        CashIn: 0,
        CashOut: 0,
        pemasukan: 0,
        pengeluaran: 0
      };
    }

    const amt = tx.amount;
    if (accTypes[tx.credit] === 'Revenue') {
      monthlyData[sortKey].Revenue += amt;
      monthlyData[sortKey].pemasukan += amt;
    }
    if (accTypes[tx.debit] === 'COGS') {
      monthlyData[sortKey].COGS += amt;
      monthlyData[sortKey].pengeluaran += amt;
    }
    if (accTypes[tx.debit] === 'Expense') {
      monthlyData[sortKey].Expense += amt;
      monthlyData[sortKey].pengeluaran += amt;
    }
    if (accTypes[tx.debit] === 'Asset') {
      monthlyData[sortKey].CashIn += amt;
    }
    if (accTypes[tx.credit] === 'Asset') {
      monthlyData[sortKey].CashOut += amt;
    }
  }

  const sortedMonths = Object.values(monthlyData).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // Hitung profit, margin, and growth
  for (let i = 0; i < sortedMonths.length; i++) {
    const m = sortedMonths[i];
    m.GrossProfit = m.Revenue - m.COGS;
    m.NetProfit = m.GrossProfit - m.Expense;
    m.Growth = i === 0 ? 0 : (sortedMonths[i - 1].Revenue > 0
      ? ((m.Revenue - sortedMonths[i - 1].Revenue) / sortedMonths[i - 1].Revenue * 100) : 0);
    m.GrossMargin = m.Revenue > 0 ? (m.GrossProfit / m.Revenue * 100) : 0;
    m.NetMargin = m.Revenue > 0 ? (m.NetProfit / m.Revenue * 100) : 0;
  }

  // Ambil data bulan terkini atau total akumulasi
  const latestMonth = sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1] : null;
  const prevMonth = sortedMonths.length > 1 ? sortedMonths[sortedMonths.length - 2] : null;

  // Total keseluruhan
  let totalRevenueAllTime = 0;
  let totalExpenseAllTime = 0;
  for (const tx of transactions) {
    if (accTypes[tx.credit] === 'Revenue') totalRevenueAllTime += tx.amount;
    if (accTypes[tx.debit] === 'Expense' || accTypes[tx.debit] === 'COGS') totalExpenseAllTime += tx.amount;
  }
  const netProfitAllTime = totalRevenueAllTime - totalExpenseAllTime;

  // Pertumbuhan Revenue MoM
  const revenueMoM = (latestMonth && prevMonth && prevMonth.Revenue > 0)
    ? (((latestMonth.Revenue - prevMonth.Revenue) / prevMonth.Revenue) * 100)
    : 0;

  // Pertumbuhan Pengeluaran MoM
  const expenseMoM = (latestMonth && prevMonth && prevMonth.Expense > 0)
    ? (((latestMonth.Expense - prevMonth.Expense) / prevMonth.Expense) * 100)
    : 0;

  // Laba bersih MoM
  const profitMargin = totalRevenueAllTime > 0
    ? ((netProfitAllTime / totalRevenueAllTime) * 100)
    : 0;

  // Target kas operasional
  const targetCash = 50000000;
  const targetCashPercent = targetCash > 0 ? Math.min(100, Math.max(0, (cashAvailable / targetCash) * 100)) : 0;

  // Alokasi beban (Expense Breakdown per akun)
  const expenseDetails = {};
  for (const tx of transactions) {
    if (accTypes[tx.debit] === 'Expense') {
      expenseDetails[tx.debit] = (expenseDetails[tx.debit] || 0) + tx.amount;
    }
  }
  const expenseBreakdown = Object.entries(expenseDetails).map(([account, amount]) => ({ account, amount }));

  // Transaksi terbaru terurut tanggal & id descending
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .slice(0, 5);

  return {
    empty: transactions.length === 0,
    total_revenue: totalRevenueAllTime,
    total_expense: totalExpenseAllTime,
    net_profit: netProfitAllTime,
    cash_available: cashAvailable,
    revenue_growth_mom: revenueMoM,
    expense_growth_mom: expenseMoM,
    profit_margin: profitMargin,
    target_cash: targetCash,
    target_cash_percent: targetCashPercent,
    monthly_data: sortedMonths,
    chart_data: sortedMonths,
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
export function calculateBalanceSheetData(transactions, accounts) {
  if (!transactions.length || !accounts.length) return { empty: true };

  const accTypes = buildAccountTypeMap(accounts);
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
export function calculateCashflowData(transactions, accounts, selectedAccount) {
  if (!transactions.length || !accounts.length) return { empty: true };

  const assetAccounts = accounts.filter(a => a.type === 'Asset').map(a => a.account);
  if (!assetAccounts.length) return { empty: true, error: 'Belum ada akun bertipe Asset' };

  const selected = assetAccounts.includes(selectedAccount) ? selectedAccount : assetAccounts[0];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
