import { initializeDatabase } from '@/db/schema';
import { 
  removeRecurringRule, 
  executeRecurringRule 
} from '@/backend/services/recurring.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/recurring/[id] (Eksekusi 1 Aturan Rutin)
export async function POST(request, { params }) {
  try {
    await initializeDatabase();
    const body = await request.json().catch(() => ({}));
    const result = await executeRecurringRule(params.id, body.date);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}

// DELETE /api/recurring/[id]
export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const result = await removeRecurringRule(params.id);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
