import { 
  queryAllRecurringRules, 
  queryRecurringRuleById, 
  queryInsertRecurringRule, 
  queryDeleteRecurringRule, 
  queryUpdateRuleLastRun 
} from '@/db/queries/recurring';
import { queryInsertTransaction } from '@/db/queries/transactions';
import { queryAllAccounts, queryInsertAccount } from '@/db/queries/accounts';

/**
 * Service mengambil semua aturan jurnal otomatis
 */
export async function getAllRecurringRules() {
  return await queryAllRecurringRules();
}

/**
 * Service membuat aturan jurnal otomatis baru
 */
export async function createRecurringRule({
  name,
  category = 'Operasional',
  frequency = 'monthly',
  day_of_month = 1,
  debit,
  credit,
  amount,
  description = ''
}) {
  if (!name || !debit || !credit || amount === undefined || amount === null) {
    throw new Error('Nama transaksi, akun debit, akun kredit, dan nominal wajib diisi');
  }

  if (debit.trim() === credit.trim()) {
    throw new Error('Akun Debit dan Credit tidak boleh sama!');
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Nominal transaksi harus lebih dari 0!');
  }

  const numDay = parseInt(day_of_month, 10) || 1;
  const validDay = Math.min(31, Math.max(1, numDay));

  const rule = await queryInsertRecurringRule({
    name,
    category,
    frequency,
    day_of_month: validDay,
    debit,
    credit,
    amount: numAmount,
    description: description || `Transaksi Rutin: ${name}`,
    is_active: true
  });

  return { rule, message: `Aturan jurnal otomatis '${name}' berhasil dibuat!` };
}

/**
 * Service menghapus aturan jurnal otomatis
 */
export async function removeRecurringRule(ruleId) {
  const id = parseInt(ruleId, 10);
  if (isNaN(id)) throw new Error('ID aturan tidak valid');

  const existing = await queryRecurringRuleById(id);
  if (!existing) throw new Error('Aturan jurnal tidak ditemukan');

  await queryDeleteRecurringRule(id);
  return { message: `Aturan jurnal '${existing.name}' berhasil dihapus!` };
}

/**
 * Service mengeksekusi 1 aturan jurnal otomatis ke Jurnal Umum
 */
export async function executeRecurringRule(ruleId, customDate) {
  const id = parseInt(ruleId, 10);
  if (isNaN(id)) throw new Error('ID aturan tidak valid');

  const rule = await queryRecurringRuleById(id);
  if (!rule) throw new Error('Aturan jurnal tidak ditemukan');

  const todayStr = customDate || new Date().toISOString().split('T')[0];
  const txDesc = `[Auto-Jurnal] ${rule.name}${rule.description ? ` - ${rule.description}` : ''}`;

  // Masukkan langsung ke tabel transactions
  await queryInsertTransaction(
    todayStr,
    rule.debit,
    rule.credit,
    rule.amount,
    txDesc
  );

  // Update riwayat tanggal eksekusi
  await queryUpdateRuleLastRun(id, todayStr);

  return {
    rule_id: id,
    name: rule.name,
    amount: rule.amount,
    date: todayStr,
    message: `⚡ Jurnal otomatis '${rule.name}' sebesar Rp ${rule.amount.toLocaleString('id-ID')} berhasil dibukukan ke Jurnal Umum!`
  };
}

/**
 * Service mengeksekusi SEMUA aturan aktif sekaligus (1-Klik Batch Auto Post)
 */
export async function executeAllRecurringRules(customDate) {
  const rules = await queryAllRecurringRules();
  const activeRules = rules.filter(r => r.is_active);

  if (activeRules.length === 0) {
    throw new Error('Tidak ada aturan jurnal otomatis aktif yang dapat dieksekusi.');
  }

  const todayStr = customDate || new Date().toISOString().split('T')[0];
  let totalAmount = 0;

  for (const rule of activeRules) {
    const txDesc = `[Auto-Jurnal] ${rule.name}${rule.description ? ` - ${rule.description}` : ''}`;
    await queryInsertTransaction(
      todayStr,
      rule.debit,
      rule.credit,
      rule.amount,
      txDesc
    );
    await queryUpdateRuleLastRun(rule.id, todayStr);
    totalAmount += rule.amount;
  }

  return {
    executed_count: activeRules.length,
    total_amount: totalAmount,
    date: todayStr,
    message: `⚡ Sukses! ${activeRules.length} transaksi rutin (Total Rp ${totalAmount.toLocaleString('id-ID')}) otomatis dibukukan ke Jurnal Umum!`
  };
}

/**
 * Service memuat paket template standar Jurnal Otomatis khusus UMKM
 */
export async function seedDefaultUMKMRules() {
  // Pastikan akun-akun yang dibutuhkan tersedia di tabel accounts
  const requiredAccounts = [
    { account: 'Kas', type: 'Asset' },
    { account: 'Bank BCA', type: 'Asset' },
    { account: 'Beban Gaji', type: 'Expense' },
    { account: 'Beban Sewa', type: 'Expense' },
    { account: 'Beban Listrik dan Air', type: 'Expense' },
    { account: 'Beban Perlengkapan', type: 'Expense' }
  ];

  const existingAccounts = await queryAllAccounts();
  const accNames = new Set(existingAccounts.map(a => a.account.trim().toLowerCase()));

  for (const acc of requiredAccounts) {
    if (!accNames.has(acc.account.toLowerCase())) {
      try {
        await queryInsertAccount(acc.account, acc.type);
      } catch {
        // Abaikan jika sudah ada
      }
    }
  }

  // Template Aturan Rutin UMKM
  const defaultRules = [
    {
      name: 'Gaji Karyawan & Staf',
      category: 'Ketenagakerjaan',
      frequency: 'monthly',
      day_of_month: 25,
      debit: 'Beban Gaji',
      credit: 'Bank BCA',
      amount: 3500000,
      description: 'Pembayaran rutin gaji staf operasional'
    },
    {
      name: 'Sewa Toko / Ruko Usaha',
      category: 'Sewa Tempat',
      frequency: 'monthly',
      day_of_month: 1,
      debit: 'Beban Sewa',
      credit: 'Kas',
      amount: 1500000,
      description: 'Sewa tempat usaha operasional toko'
    },
    {
      name: 'Listrik, Air & WiFi Internet',
      category: 'Utilitas',
      frequency: 'monthly',
      day_of_month: 10,
      debit: 'Beban Listrik dan Air',
      credit: 'Kas',
      amount: 450000,
      description: 'Biaya operasional utilitas bulanan'
    },
    {
      name: 'Pembelian Perlengkapan Toko',
      category: 'Perlengkapan',
      frequency: 'monthly',
      day_of_month: 5,
      debit: 'Beban Perlengkapan',
      credit: 'Kas',
      amount: 750000,
      description: 'Restock kantong, lakban, dan ATK operasional'
    }
  ];

  const existingRules = await queryAllRecurringRules();
  const existingRuleNames = new Set(existingRules.map(r => r.name.trim().toLowerCase()));

  let seededCount = 0;
  for (const r of defaultRules) {
    if (!existingRuleNames.has(r.name.toLowerCase())) {
      await queryInsertRecurringRule(r);
      seededCount++;
    }
  }

  return {
    seeded_count: seededCount,
    message: `Berhasil menambahkan ${seededCount} template transaksi rutin UMKM!`
  };
}
