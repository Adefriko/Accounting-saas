import { initializeDatabase } from '@/db/schema';
import { loginUser } from '@/backend/services/auth.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

export async function POST(request) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const user = await loginUser(body);
    return successResponse({ user, message: 'Login berhasil!' });
  } catch (error) {
    return errorResponse(error.message, 401);
  }
}
