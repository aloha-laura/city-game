import { NextRequest, NextResponse } from 'next/server';
import { PhotoService } from '@/application/photo.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const photographerId = searchParams.get('photographerId');
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');

    if (photographerId) {
      const photos = await PhotoService.getPlayerPhotos(photographerId);
      return NextResponse.json(photos);
    }

    if (sessionId && status === 'pending') {
      const photos = await PhotoService.getPendingPhotos(sessionId);
      return NextResponse.json(photos);
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const photographerId = formData.get('photographerId') as string;
    const targetPlayerId = formData.get('targetPlayerId') as string;
    const file = formData.get('file') as File;

    if (!sessionId || !photographerId || !targetPlayerId || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const imageUrl = await PhotoService.uploadImage(file, sessionId);
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    const photo = await PhotoService.createPhoto(
      sessionId,
      photographerId,
      targetPlayerId,
      imageUrl
    );

    if (!photo) {
      return NextResponse.json(
        { error: 'Failed to create photo' },
        { status: 500 }
      );
    }

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    );
  }
}
