'use client';

import { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';
import { PlayerWithTeam, TeamWithPlayers } from '@/domain/types';

type AdminDashboardProps = {
  playerId: string;
};

export default function AdminDashboard({ playerId }: AdminDashboardProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const sessionResponse = await fetch('/api/sessions');
      if (!sessionResponse.ok) throw new Error('Session error');
      const session = await sessionResponse.json();
      setSessionId(session.id);

      const playersResponse = await fetch(
        `/api/players?sessionId=${session.id}`
      );
      if (!playersResponse.ok) throw new Error('Players error');
      const playersData = await playersResponse.json();
      setPlayers(playersData);

      const teamsResponse = await fetch(`/api/teams?sessionId=${session.id}`);
      if (!teamsResponse.ok) throw new Error('Teams error');
      const teamsData = await teamsResponse.json();
      setTeams(teamsData);

      setIsLoading(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Loading error');
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async (playerIdToDelete: string) => {
    if (!confirm('Do you really want to delete this player?')) return;

    try {
      const response = await fetch(`/api/players/${playerIdToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete player');

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Deletion error');
    }
  };

  const handleCreateTeam = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) throw new Error('Failed to create team');

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Team creation error');
    }
  };

  const handleAssignPlayerToTeam = async (
    playerIdToAssign: string,
    teamId: string
  ) => {
    if (!teamId) return;

    try {
      const response = await fetch('/api/teams/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerIdToAssign, teamId }),
      });

      if (!response.ok) throw new Error('Failed to assign player');

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Assignment error');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Players</h2>
        {players.length === 0 ? (
          <p className={styles.emptyMessage}>No players yet</p>
        ) : (
          <div className={styles.playersList}>
            {players.map((player) => (
              <div key={player.id} className={styles.playerCard}>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>{player.name}</span>
                  <span className={styles.playerRole}>
                    {player.role === 'admin' ? '👑 Admin' : '👤 Player'}
                  </span>
                  {player.team && (
                    <span
                      className={styles.playerTeam}
                      style={{ backgroundColor: player.team.color }}
                    >
                      {player.team.name}
                    </span>
                  )}
                </div>
                <div className={styles.playerActions}>
                  <select
                    value={player.team?.id || ''}
                    onChange={(e) =>
                      handleAssignPlayerToTeam(player.id, e.target.value)
                    }
                    className={styles.select}
                  >
                    <option value="">No team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className={styles.deleteButton}
                    disabled={player.id === playerId}
                    title={
                      player.id === playerId
                        ? 'You cannot delete yourself'
                        : 'Delete this player'
                    }
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Teams</h2>
          <button onClick={handleCreateTeam} className={styles.createButton}>
            + Create team
          </button>
        </div>
        {teams.length === 0 ? (
          <p className={styles.emptyMessage}>No teams created</p>
        ) : (
          <div className={styles.teamsList}>
            {teams.map((team) => (
              <div
                key={team.id}
                className={styles.teamCard}
                style={{ borderLeftColor: team.color }}
              >
                <h3 className={styles.teamName}>{team.name}</h3>
                <div className={styles.teamPlayers}>
                  {team.players.length === 0 ? (
                    <p className={styles.emptyTeam}>No players</p>
                  ) : (
                    <ul className={styles.teamPlayersList}>
                      {team.players.map((player) => (
                        <li key={player.id} className={styles.teamPlayer}>
                          {player.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
