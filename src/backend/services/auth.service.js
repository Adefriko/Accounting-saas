import crypto from 'crypto';
import { 
  queryUserByEmail, 
  queryUserById,
  queryInsertUser, 
  queryUpsertGoogleUser,
  queryUpdateUserProfile
} from '@/db/queries/users';

const SECRET_SALT = 'moneva_saas_salt_secret_key_2026';

/**
 * Hash password dengan salt menggunakan SHA-256 bawaan Node.js
 */
function hashPassword(password) {
  return crypto.createHmac('sha256', SECRET_SALT).update(password).digest('hex');
}

/**
 * Buat session token terenkripsi HMAC
 */
export function generateSessionToken(user) {
  const payload = `${user.id}:${user.email}:${Date.now()}`;
  const sig = crypto.createHmac('sha256', SECRET_SALT).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${sig}`;
}

/**
 * Verifikasi token session
 */
export function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [b64, sig] = token.split('.');
  try {
    const payload = Buffer.from(b64, 'base64').toString('utf-8');
    const expectedSig = crypto.createHmac('sha256', SECRET_SALT).update(payload).digest('hex');
    if (sig !== expectedSig) return null;
    const [id, email] = payload.split(':');
    return { id: parseInt(id, 10), email };
  } catch {
    return null;
  }
}

/**
 * Registrasi user baru
 */
export async function registerUser({ email, name, password, address = '' }) {
  if (!email || !name || !password) {
    throw new Error('Email, nama, dan kata sandi wajib diisi');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Format email tidak valid');
  }

  if (password.length < 6) {
    throw new Error('Kata sandi minimal 6 karakter');
  }

  const existing = await queryUserByEmail(cleanEmail);
  if (existing) {
    throw new Error('Email sudah terdaftar. Silakan login.');
  }

  const hashedPassword = hashPassword(password);
  const newUser = await queryInsertUser({
    email: cleanEmail,
    name: name.trim(),
    password: hashedPassword,
    address: address.trim(),
    provider: 'local'
  });

  const token = generateSessionToken(newUser);
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    avatar: newUser.avatar,
    address: newUser.address || '',
    provider: newUser.provider,
    token
  };
}

/**
 * Login user via email & password
 */
export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email dan kata sandi wajib diisi');
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await queryUserByEmail(cleanEmail);

  if (!user) {
    throw new Error('Email atau kata sandi tidak cocok');
  }

  if (user.provider === 'google' && !user.password) {
    throw new Error('Akun ini terdaftar dengan Google. Silakan klik Masuk dengan Google.');
  }

  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) {
    throw new Error('Email atau kata sandi tidak cocok');
  }

  const token = generateSessionToken(user);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    address: user.address || '',
    provider: user.provider,
    token
  };
}

/**
 * Login atau Registrasi Otomatis via Google
 */
export async function googleAuthUser({ email, name, avatar }) {
  if (!email) {
    throw new Error('Email Google tidak ditemukan');
  }

  const user = await queryUpsertGoogleUser({
    email: email.trim().toLowerCase(),
    name: (name || 'Pengguna Google').trim(),
    avatar: avatar || ''
  });

  const token = generateSessionToken(user);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    address: user.address || '',
    provider: 'google',
    token
  };
}

/**
 * Update detail akun dan alamat bisnis
 */
export async function updateUserProfile({ id, name, address }) {
  if (!id) {
    throw new Error('ID user tidak valid');
  }
  const updated = await queryUpdateUserProfile({ id, name, address });
  if (!updated) {
    throw new Error('Pengguna tidak ditemukan');
  }
  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    avatar: updated.avatar,
    address: updated.address || '',
    provider: updated.provider,
    created_at: updated.created_at
  };
}

/**
 * Ambil detail profil user berdasarkan ID
 */
export async function getUserProfile(id) {
  const user = await queryUserById(id);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    address: user.address || '',
    provider: user.provider,
    created_at: user.created_at
  };
}
