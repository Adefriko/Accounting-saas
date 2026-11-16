import { initializeDatabase } from '@/db/schema';
import { googleAuthUser } from '@/backend/services/auth.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

export async function POST(request) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { email, name, avatar } = body;

    if (!email) {
      return errorResponse('Email Google wajib disertakan', 400);
    }

    const user = await googleAuthUser({ email, name, avatar });
    return successResponse({ user, message: 'Autentikasi Google berhasil' });
  } catch (error) {
    return errorResponse(error.message || 'Gagal login via Google', 400);
  }
}
