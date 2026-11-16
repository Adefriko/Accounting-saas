import { initializeDatabase } from '@/db/schema';
import { registerUser } from '@/backend/services/auth.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

export async function POST(request) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const user = await registerUser(body);
    return successResponse({ user, message: 'Registrasi berhasil!' }, 201);
  } catch (error) {
    const isConflict = error.message.includes('sudah terdaftar');
    return errorResponse(error.message, isConflict ? 409 : 400);
  }
}
