import { initializeDatabase } from '@/db/schema';
import { resetAllData } from '@/backend/services/transactions.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/reset
export async function POST() {
  try {
    await initializeDatabase();
    const result = await resetAllData();
    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
