'use client';

import { useParams } from 'next/navigation';
import PhotoCapture from '@/components/PhotoCapture';

export default function CapturePage() {
  const params = useParams();
  const currentPlayerId = params.currentPlayerId as string;
  return <PhotoCapture playerId={currentPlayerId} />;
}
