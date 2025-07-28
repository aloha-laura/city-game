'use client';

import { useParams } from 'next/navigation';
import PlayerDashboard from '@/components/PlayerDashboard';
import styles from './page.module.css';

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  return (
    <div className={styles.container}>
      <PlayerDashboard playerId={playerId} />
    </div>
  );
}
