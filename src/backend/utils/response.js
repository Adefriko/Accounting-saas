import { NextResponse } from 'next/server';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

/**
 * Helper response JSON sukses (selalu no-cache)
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { 
    status,
    headers: NO_CACHE_HEADERS 
  });
}

/**
 * Helper response JSON error (selalu no-cache)
 */
export function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { 
    status,
    headers: NO_CACHE_HEADERS 
  });
}
