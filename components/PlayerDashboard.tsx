'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PlayerDashboard.module.css';
import { PlayerWithTeam, TeamWithPlayers } from '@/domain/types';

type PlayerDashboardProps = {
  playerId: string;
};

export default function PlayerDashboard({ playerId }: PlayerDashboardProps) {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerWithTeam | null>(null);
  const [teamDetails, setTeamDetails] = useState<TeamWithPlayers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlayerData();
    const interval = setInterval(loadPlayerData, 5000);
    return () => clearInterval(interval);
  }, [playerId]);

  const loadPlayerData = async () => {
    try {
      const response = await fetch(`/api/players/${playerId}`);
      if (!response.ok) {
        throw new Error('Failed to load player information');
      }
      const data = await response.json();
      console.log('Player data:', data);
      setPlayer(data);

      if (data.team) {
        console.log('Team found, loading members for team:', data.team.id);
        const teamResponse = await fetch(`/api/teams/${data.team.id}/members`);
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          console.log('Team data with members:', teamData);
          setTeamDetails(teamData);
        } else {
          console.error('Failed to load team members:', teamResponse.status);
        }
      } else {
        console.log('No team assigned to player');
        setTeamDetails(null);
      }

      setIsLoading(false);
      setError('');
    } catch (err: any) {
      console.error('Error loading player data:', err);
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
        {player.team && teamDetails ? (
          <div className={styles.teamSection}>
            <div
              className={styles.teamBadge}
              style={{ backgroundColor: player.team.color }}
            >
              <span className={styles.teamName}>{player.team.name}</span>
              <span className={styles.teamPoints}>
                {teamDetails.points} {teamDetails.points === 1 ? 'point' : 'points'}
              </span>
            </div>

            <div className={styles.teamMembers}>
              <h3 className={styles.membersTitle}>Team members:</h3>
              <ul className={styles.membersList}>
                {teamDetails.players.map((member) => (
                  <li key={member.id} className={styles.member}>
                    {member.name}
                    {member.id === playerId && ' (you)'}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => router.push(`/player/${playerId}/capture`)}
                className={styles.captureButton}
              >
                📷 Capture Photo
              </button>
              <button
                onClick={() => router.push(`/player/${playerId}/photos`)}
                className={styles.galleryButton}
              >
                🖼️ My Photos
              </button>
            </div>
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
