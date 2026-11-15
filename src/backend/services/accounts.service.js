import {
  queryAllAccounts,
  queryInsertAccount,
  queryAccountUsage,
  queryAccountByName,
  queryDeleteAccount
} from '@/db/queries/accounts';
import { queryAllTransactions } from '@/db/queries/transactions';

/**
 * Service mengambil semua akun lengkap dengan kalkulasi saldo berjalan dari riwayat transaksi DB
 */
export async function getAllAccounts() {
  const [accounts, transactions] = await Promise.all([
    queryAllAccounts(),
    queryAllTransactions()
  ]);

  return accounts.map(acc => {
    let sumDebit = 0;
    let sumCredit = 0;
    for (const tx of transactions) {
      if (tx.debit === acc.account) sumDebit += tx.amount;
      if (tx.credit === acc.account) sumCredit += tx.amount;
    }
    const isDebitNormal = ['Asset', 'Expense', 'COGS'].includes(acc.type);
    const balance = isDebitNormal ? (sumDebit - sumCredit) : (sumCredit - sumDebit);
    return {
      ...acc,
      balance
    };
  });
}

/**
 * Service membuat akun baru
 */
export async function createAccount({ account, type }) {
  if (!account || !type) {
    throw new Error('Nama dan tipe akun wajib diisi');
  }

  const trimmedName = account.trim();
  if (!trimmedName) {
    throw new Error('Nama akun tidak boleh kosong');
  }

  const validTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense'];
  if (!validTypes.includes(type)) {
    throw new Error(`Tipe akun tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`);
  }

  await queryInsertAccount(trimmedName, type);
  return { message: `Akun '${trimmedName}' berhasil ditambahkan!` };
}

/**
 * Service memasukkan daftar akun standar akuntansi secara otomatis (Template Starter)
 */
export async function seedStandardAccounts() {
  const defaultAccounts = [
    { account: 'Kas', type: 'Asset' },
    { account: 'Bank BCA', type: 'Asset' },
    { account: 'Piutang Usaha', type: 'Asset' },
    { account: 'Peralatan Usaha', type: 'Asset' },
    { account: 'Utang Usaha', type: 'Liability' },
    { account: 'Modal Pemilik', type: 'Equity' },
    { account: 'Pendapatan Jasa', type: 'Revenue' },
    { account: 'Pendapatan Lainnya', type: 'Revenue' },
    { account: 'Beban Perlengkapan', type: 'Expense' },
    { account: 'Beban Sewa', type: 'Expense' },
    { account: 'Beban Listrik dan Air', type: 'Expense' }
  ];

  const existing = await queryAllAccounts();
  const existingNames = new Set(existing.map(a => a.account));

  let added = 0;
  for (const item of defaultAccounts) {
    if (!existingNames.has(item.account)) {
      await queryInsertAccount(item.account, item.type);
      added++;
    }
  }

  return { message: `Berhasil menambahkan ${added} akun standar ke database!` };
}

/**
 * Service menghapus akun dengan proteksi integritas transaksi
 */
export async function removeAccount(accountName) {
  if (!accountName) {
    throw new Error('Nama akun wajib diisi');
  }

  // Cek apakah akun digunakan dalam transaksi
  const used = await queryAccountUsage(accountName);
  if (used && used.length > 0) {
    throw new Error('Akun tidak dapat dihapus karena masih digunakan dalam riwayat transaksi!');
  }

  // Cek apakah akun terdaftar
  const existing = await queryAccountByName(accountName);
  if (!existing || existing.length === 0) {
    throw new Error('Akun tidak ditemukan!');
  }

  await queryDeleteAccount(accountName);
  return { message: `Akun '${accountName}' berhasil dihapus!` };
}
