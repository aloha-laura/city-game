'use client';

import { useParams } from 'next/navigation';
import PhotoGallery from '@/components/PhotoGallery';

export default function PhotosPage() {
  const params = useParams();
  const currentPlayerId = params.currentPlayerId as string;
  return <PhotoGallery playerId={currentPlayerId} />;
}
