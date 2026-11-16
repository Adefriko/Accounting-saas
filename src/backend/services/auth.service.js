import crypto from 'crypto';
import { 
  queryUserByEmail, 
  queryInsertUser, 
  queryUpsertGoogleUser 
} from '@/db/queries/users';

/**
 * Hash password dengan salt menggunakan SHA-256 bawaan Node.js
 */
function hashPassword(password, salt = 'moneva_saas_salt') {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

/**
 * Registrasi user baru
 */
export async function registerUser({ email, name, password }) {
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
    provider: 'local'
  });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    avatar: newUser.avatar,
    provider: newUser.provider
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

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    provider: user.provider
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

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    provider: 'google'
  };
}
