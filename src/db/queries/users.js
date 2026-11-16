import { getDb } from '../index';

/**
 * Mencari user berdasarkan email
 */
export async function queryUserByEmail(email) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, name, password, avatar, provider, created_at 
    FROM users 
    WHERE LOWER(email) = LOWER(${email.trim()}) 
    LIMIT 1
  `;
  return rows[0] || null;
}

/**
 * Mencari user berdasarkan ID
 */
export async function queryUserById(id) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, name, avatar, provider, created_at 
    FROM users 
    WHERE id = ${id} 
    LIMIT 1
  `;
  return rows[0] || null;
}

/**
 * Mendaftarkan user baru (Email/Password)
 */
export async function queryInsertUser({ email, name, password, avatar = '', provider = 'local' }) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO users (email, name, password, avatar, provider) 
    VALUES (${email.trim().toLowerCase()}, ${name.trim()}, ${password}, ${avatar}, ${provider})
    RETURNING id, email, name, avatar, provider, created_at
  `;
  return rows[0];
}

/**
 * Mendaftarkan / update user dari Google Login
 */
export async function queryUpsertGoogleUser({ email, name, avatar = '' }) {
  const sql = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const existing = await queryUserByEmail(cleanEmail);
  if (existing) {
    if (avatar && !existing.avatar) {
      await sql`UPDATE users SET avatar = ${avatar} WHERE id = ${existing.id}`;
      existing.avatar = avatar;
    }
    return existing;
  }

  const rows = await sql`
    INSERT INTO users (email, name, password, avatar, provider) 
    VALUES (${cleanEmail}, ${cleanName}, '', ${avatar}, 'google')
    RETURNING id, email, name, avatar, provider, created_at
  `;
  return rows[0];
}
