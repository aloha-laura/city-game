import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/application/team.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    const teams = await TeamService.getTeamsWithPlayers(sessionId);
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

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

    const team = await TeamService.createTeam(sessionId);

    if (!team) {
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      );
    }

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    const success = await TeamService.deleteAllTeams(sessionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete all teams' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all teams:', error);
    return NextResponse.json(
      { error: 'Failed to delete all teams' },
      { status: 500 }
    );
  }
}
