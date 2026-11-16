import { getDb } from './index';

let initialized = false;

/**
 * Inisialisasi skema tabel database (hanya dieksekusi sekali jika belum ada)
 */
export async function initializeDatabase() {
  if (initialized) return;

  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255),
      avatar TEXT,
      address TEXT DEFAULT '',
      provider VARCHAR(50) DEFAULT 'local',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Pastikan kolom address tersedia jika tabel sudah ada sebelumnya
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`;
  } catch {
    // Abaikan jika sudah ada
  }

  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      account VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      debit VARCHAR(255) NOT NULL,
      credit VARCHAR(255) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      description TEXT DEFAULT ''
    )
  `;

  initialized = true;
}
