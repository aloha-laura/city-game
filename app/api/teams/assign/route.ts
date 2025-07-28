import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/application/team.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, teamId } = body;

    if (!playerId || !teamId) {
      return NextResponse.json(
        { error: 'playerId and teamId fields are required' },
        { status: 400 }
      );
    }

    const success = await TeamService.assignPlayerToTeam(playerId, teamId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to assign player to team' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning player:', error);
    return NextResponse.json(
      { error: 'Failed to assign player to team' },
      { status: 500 }
    );
  }
}
