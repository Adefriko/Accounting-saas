import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/db/schema';
import { getAllAccounts } from '@/backend/services/accounts.service';
import { getAllTransactions } from '@/backend/services/transactions.service';
import { calculateDashboardData } from '@/backend/services/accounting.service';
import { errorResponse } from '@/backend/utils/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/dashboard
export async function GET() {
  try {
    await initializeDatabase();
    const [accounts, transactions] = await Promise.all([
      getAllAccounts(),
      getAllTransactions()
    ]);
    const dashboardData = calculateDashboardData(transactions, accounts);
    return NextResponse.json(dashboardData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
