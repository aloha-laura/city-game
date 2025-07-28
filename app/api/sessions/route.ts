import { NextResponse } from 'next/server';
import { SessionService } from '@/application/session.service';

export async function GET() {
  try {
    const session = await SessionService.ensureGlobalSessionExists();
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
