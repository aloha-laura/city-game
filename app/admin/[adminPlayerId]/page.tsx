'use client';

import { useParams } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import styles from './page.module.css';

export default function AdminPage() {
  const params = useParams();
  const adminPlayerId = params.adminPlayerId as string;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>
          Manage players and create teams
        </p>
      </header>
      <AdminDashboard playerId={adminPlayerId} />
    </div>
  );
}
