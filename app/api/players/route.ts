import { NextRequest, NextResponse } from 'next/server';
import { PlayerService } from '@/application/player.service';
import { PlayerRole } from '@/domain/types';

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

    const players = await PlayerService.getPlayersWithTeams(sessionId);
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, name, role } = body;

    if (!sessionId || !name || !role) {
      return NextResponse.json(
        { error: 'sessionId, name and role fields are required' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'player') {
      return NextResponse.json(
        { error: 'role must be "admin" or "player"' },
        { status: 400 }
      );
    }

    const player = await PlayerService.createPlayer(
      sessionId,
      name,
      role as PlayerRole
    );

    if (!player) {
      return NextResponse.json(
        { error: 'Failed to create player' },
        { status: 500 }
      );
    }

    return NextResponse.json(player, { status: 201 });
  } catch (error: any) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create player' },
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

    const success = await PlayerService.deleteAllPlayers(sessionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete all players' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all players:', error);
    return NextResponse.json(
      { error: 'Failed to delete all players' },
      { status: 500 }
    );
  }
}
