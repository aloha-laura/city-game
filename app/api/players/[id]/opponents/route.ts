import { NextRequest, NextResponse } from 'next/server';
import { PlayerService } from '@/application/player.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const opponents = await PlayerService.getOpponentPlayers(id);
    return NextResponse.json(opponents);
  } catch (error) {
    console.error('Error fetching opponent players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opponent players' },
      { status: 500 }
    );
  }
}
