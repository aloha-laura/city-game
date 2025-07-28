import JoinSessionForm from '@/components/JoinSessionForm';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>City Game</h1>
        <p className={styles.subtitle}>Join the game!</p>
        <JoinSessionForm />
      </main>
    </div>
  );
}
