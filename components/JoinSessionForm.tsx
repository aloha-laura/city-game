'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './JoinSessionForm.module.css';
import { PlayerRole } from '@/domain/types';

export default function JoinSessionForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<PlayerRole>('player');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setIsLoading(true);

    try {
      const sessionResponse = await fetch('/api/sessions');
      if (!sessionResponse.ok) {
        throw new Error('Failed to fetch session');
      }
      const session = await sessionResponse.json();

      const playerResponse = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          name: name.trim(),
          role,
        }),
      });

      if (!playerResponse.ok) {
        const errorData = await playerResponse.json();
        throw new Error(errorData.error || 'Failed to create player');
      }

      const player = await playerResponse.json();

      localStorage.setItem('playerId', player.id);

      if (role === 'admin') {
        router.push(`/admin/${player.id}`);
      } else {
        router.push(`/player/${player.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className={styles.input}
          disabled={isLoading}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Role</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="role"
              value="player"
              checked={role === 'player'}
              onChange={(e) => setRole(e.target.value as PlayerRole)}
              disabled={isLoading}
              className={styles.radio}
            />
            <span>Player</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === 'admin'}
              onChange={(e) => setRole(e.target.value as PlayerRole)}
              disabled={isLoading}
              className={styles.radio}
            />
            <span>Admin</span>
          </label>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" disabled={isLoading} className={styles.button}>
        {isLoading ? 'Connecting...' : 'Join'}
      </button>
    </form>
  );
}
