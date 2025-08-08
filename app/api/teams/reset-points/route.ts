import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/application/team.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId field is required' },
        { status: 400 }
      );
    }

    const success = await TeamService.resetAllPoints(sessionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset points' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting points:', error);
    return NextResponse.json(
      { error: 'Failed to reset points' },
      { status: 500 }
    );
  }
}
