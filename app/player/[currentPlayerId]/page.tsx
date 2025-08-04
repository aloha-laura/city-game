'use client';

import { useParams } from 'next/navigation';
import PlayerDashboard from '@/components/PlayerDashboard';
import styles from './page.module.css';

export default function PlayerPage() {
  const params = useParams();
  const currentPlayerId = params.currentPlayerId as string;

  return (
    <div className={styles.container}>
      <PlayerDashboard playerId={currentPlayerId} />
    </div>
  );
}
