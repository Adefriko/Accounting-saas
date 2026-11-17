import { initializeDatabase } from '@/db/schema';
import { 
  getAllRecurringRules, 
  createRecurringRule, 
  executeAllRecurringRules, 
  seedDefaultUMKMRules 
} from '@/backend/services/recurring.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/recurring
export async function GET() {
  try {
    await initializeDatabase();
    const rules = await getAllRecurringRules();
    return successResponse(rules);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

// POST /api/recurring
export async function POST(request) {
  try {
    await initializeDatabase();
    const body = await request.json();

    if (body.action === 'seed') {
      const result = await seedDefaultUMKMRules();
      return successResponse(result, 201);
    }

    if (body.action === 'execute_all') {
      const result = await executeAllRecurringRules(body.date);
      return successResponse(result, 200);
    }

    const result = await createRecurringRule(body);
    return successResponse(result, 201);
  } catch (error) {
    const isValidation = error.message.includes('wajib') || 
                         error.message.includes('sama') || 
                         error.message.includes('lebih dari 0');
    return errorResponse(error.message, isValidation ? 400 : 500);
  }
}
