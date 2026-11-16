import { initializeDatabase } from '@/db/schema';
import { 
  getUserProfile, 
  updateUserProfile, 
  verifySessionToken 
} from '@/backend/services/auth.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

function getUserIdFromRequest(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token) {
    const verified = verifySessionToken(token);
    if (verified?.id) return verified.id;
  }
  const headerId = request.headers.get('x-user-id');
  if (headerId && !isNaN(parseInt(headerId, 10))) {
    return parseInt(headerId, 10);
  }
  return null;
}

export async function GET(request) {
  try {
    await initializeDatabase();
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return errorResponse('Sesi tidak valid atau telah berakhir. Silakan login kembali.', 401);
    }

    const user = await getUserProfile(userId);
    if (!user) {
      return errorResponse('Pengguna tidak ditemukan', 404);
    }

    return successResponse({ user });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(request) {
  try {
    await initializeDatabase();
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return errorResponse('Sesi tidak valid atau telah berakhir. Silakan login kembali.', 401);
    }

    const body = await request.json();
    const { name, address } = body;

    const updatedUser = await updateUserProfile({
      id: userId,
      name,
      address
    });

    return successResponse({ 
      user: updatedUser, 
      message: 'Keterangan akun dan alamat berhasil diperbarui!' 
    });
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
