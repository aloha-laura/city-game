'use client';

import { useEffect, useState } from 'react';
import styles from './PlayerDashboard.module.css';
import { PlayerWithTeam } from '@/domain/types';

type PlayerDashboardProps = {
  playerId: string;
};

export default function PlayerDashboard({ playerId }: PlayerDashboardProps) {
  const [player, setPlayer] = useState<PlayerWithTeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlayer();
    const interval = setInterval(loadPlayer, 5000);
    return () => clearInterval(interval);
  }, [playerId]);

  const loadPlayer = async () => {
    try {
      const response = await fetch(`/api/players/${playerId}`);
      if (!response.ok) {
        throw new Error('Failed to load player information');
      }
      const data = await response.json();
      setPlayer(data);
      setIsLoading(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Loading error');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className={styles.card}>
        <div className={styles.error}>{error || 'Player not found'}</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>Hello {player.name}!</h1>
        <span className={styles.role}>
          {player.role === 'admin' ? '👑 Admin' : '👤 Player'}
        </span>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Your team</h2>
        {player.team ? (
          <div
            className={styles.teamBadge}
            style={{ backgroundColor: player.team.color }}
          >
            <span className={styles.teamName}>{player.team.name}</span>
          </div>
        ) : (
          <div className={styles.noTeam}>
            <p>You are not assigned to a team yet</p>
            <p className={styles.waitMessage}>
              The admin will assign you to a team soon!
            </p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.refreshInfo}>
          This page automatically refreshes every 5 seconds
        </p>
      </div>
    </div>
  );
}
