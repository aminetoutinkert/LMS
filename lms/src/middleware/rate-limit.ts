import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

export function rateLimitMiddleware(req: NextRequest) {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  
  const client = rateLimit.get(ip) || { count: 0, timestamp: now };
  
  if (now - client.timestamp > WINDOW_MS) {
    client.count = 0;
    client.timestamp = now;
  }
  
  client.count++;
  rateLimit.set(ip, client);
  
  if (client.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' }
      }
    );
  }
  
  return null; // Return null if within limit
}
