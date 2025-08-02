import { NextRequest, NextResponse } from 'next/server';
import { PhotoService } from '@/application/photo.service';
import { PlayerService } from '@/application/player.service';
import { TeamService } from '@/application/team.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, reviewerId } = body;

    if (!action || !reviewerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const photo = await PhotoService.getPhotoById(id);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    let success = false;

    if (action === 'approve') {
      success = await PhotoService.approvePhoto(id, reviewerId);
      if (success) {
        const photographer = await PlayerService.getPlayerWithTeam(
          photo.photographerId
        );
        if (photographer?.team) {
          await TeamService.incrementTeamPoints(photographer.team.id);
        }
      }
    } else {
      success = await PhotoService.rejectPhoto(id, reviewerId);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update photo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}
