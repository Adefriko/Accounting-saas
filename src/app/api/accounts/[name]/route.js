import { initializeDatabase } from '@/db/schema';
import { removeAccount } from '@/backend/services/accounts.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DELETE /api/accounts/[name]
export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const accountName = decodeURIComponent(params.name);
    const result = await removeAccount(accountName);
    return successResponse(result);
  } catch (error) {
    const isNotFound = error.message.includes('tidak ditemukan');
    const isBadRequest = error.message.includes('digunakan') || error.message.includes('wajib');
    const status = isNotFound ? 404 : (isBadRequest ? 400 : 500);
    return errorResponse(error.message, status);
  }
}
