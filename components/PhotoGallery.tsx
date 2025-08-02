'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PhotoGallery.module.css';
import { Photo } from '@/domain/types';

type PhotoGalleryProps = {
  playerId: string;
};

export default function PhotoGallery({ playerId }: PhotoGalleryProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPhotos();
    const interval = setInterval(loadPhotos, 5000);
    return () => clearInterval(interval);
  }, [playerId]);

  const loadPhotos = async () => {
    try {
      const response = await fetch(`/api/photos?photographerId=${playerId}`);
      if (!response.ok) {
        throw new Error('Failed to load photos');
      }
      const data = await response.json();
      setPhotos(data);
      setIsLoading(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load photos');
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className={styles.statusApproved}>✓ Approved</span>;
      case 'rejected':
        return <span className={styles.statusRejected}>✗ Rejected</span>;
      case 'pending':
        return <span className={styles.statusPending}>⏳ Pending</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your photos...</div>
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
      <div className={styles.header}>
        <h1 className={styles.title}>My Photos</h1>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>
      </div>

      {photos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't captured any photos yet.</p>
          <button
            onClick={() => router.push(`/player/${playerId}/capture`)}
            className={styles.captureButton}
          >
            📷 Capture Photo
          </button>
        </div>
      ) : (
        <div className={styles.gallery}>
          {photos.map((photo) => (
            <div key={photo.id} className={styles.photoCard}>
              <div className={styles.photoWrapper}>
                <img
                  src={photo.imageUrl}
                  alt="Captured photo"
                  className={styles.photo}
                />
              </div>
              <div className={styles.photoInfo}>
                {getStatusBadge(photo.status)}
                <span className={styles.date}>
                  {new Date(photo.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.refreshInfo}>
          Updates automatically every 5 seconds
        </p>
      </div>
    </div>
  );
}
