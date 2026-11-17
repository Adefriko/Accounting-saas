import { getDb } from '../index';

/**
 * Mengambil semua aturan jurnal otomatis
 */
export async function queryAllRecurringRules() {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, category, frequency, day_of_month, debit, credit, amount, description, is_active, last_run, created_at 
    FROM recurring_rules 
    ORDER BY id ASC
  `;
  return rows.map(r => ({
    ...r,
    amount: parseFloat(r.amount),
    last_run: r.last_run ? (r.last_run instanceof Date ? r.last_run.toISOString().split('T')[0] : String(r.last_run).split('T')[0]) : null
  }));
}

/**
 * Mencari aturan berdasarkan ID
 */
export async function queryRecurringRuleById(id) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, category, frequency, day_of_month, debit, credit, amount, description, is_active, last_run, created_at 
    FROM recurring_rules 
    WHERE id = ${id} 
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    amount: parseFloat(r.amount),
    last_run: r.last_run ? (r.last_run instanceof Date ? r.last_run.toISOString().split('T')[0] : String(r.last_run).split('T')[0]) : null
  };
}

/**
 * Menambahkan aturan jurnal otomatis baru
 */
export async function queryInsertRecurringRule({
  name,
  category = 'Operasional',
  frequency = 'monthly',
  day_of_month = 1,
  debit,
  credit,
  amount,
  description = '',
  is_active = true
}) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO recurring_rules (name, category, frequency, day_of_month, debit, credit, amount, description, is_active) 
    VALUES (
      ${name.trim()}, 
      ${category}, 
      ${frequency}, 
      ${day_of_month}, 
      ${debit.trim()}, 
      ${credit.trim()}, 
      ${amount}, 
      ${description.trim()}, 
      ${is_active}
    )
    RETURNING id, name, category, frequency, day_of_month, debit, credit, amount, description, is_active, created_at
  `;
  return rows[0];
}

/**
 * Update tanggal eksekusi terakhir
 */
export async function queryUpdateRuleLastRun(id, dateStr) {
  const sql = getDb();
  await sql`
    UPDATE recurring_rules 
    SET last_run = ${dateStr} 
    WHERE id = ${id}
  `;
}

/**
 * Hapus aturan jurnal otomatis
 */
export async function queryDeleteRecurringRule(id) {
  const sql = getDb();
  await sql`
    DELETE FROM recurring_rules 
    WHERE id = ${id}
  `;
}
