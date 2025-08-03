'use client';

import { useEffect, useState } from 'react';
import styles from './AdminPhotoReview.module.css';
import { PhotoWithDetails } from '@/domain/types';

type AdminPhotoReviewProps = {
  sessionId: string;
  reviewerId: string;
};

export default function AdminPhotoReview({
  sessionId,
  reviewerId,
}: AdminPhotoReviewProps) {
  const [photos, setPhotos] = useState<PhotoWithDetails[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPhotos();
  }, [sessionId]);

  const loadPhotos = async () => {
    try {
      const response = await fetch(
        `/api/photos?sessionId=${sessionId}&status=pending`
      );
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

  const handleReview = async (action: 'approve' | 'reject') => {
    if (photos.length === 0) return;

    const currentPhoto = photos[currentIndex];
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch(`/api/photos/${currentPhoto.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reviewerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} photo`);
      }

      const updatedPhotos = photos.filter((_, index) => index !== currentIndex);
      setPhotos(updatedPhotos);

      if (currentIndex >= updatedPhotos.length && updatedPhotos.length > 0) {
        setCurrentIndex(updatedPhotos.length - 1);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} photo`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading photos...</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>No photos to review</h2>
          <p>All photos have been reviewed!</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Photo Review</h2>
        <span className={styles.counter}>
          {currentIndex + 1} / {photos.length}
        </span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.photoCard}>
        <div className={styles.photoWrapper}>
          <img
            src={currentPhoto.imageUrl}
            alt="Photo to review"
            className={styles.photo}
          />
        </div>

        <div className={styles.photoInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Photographer:</span>
            <span className={styles.value}>{currentPhoto.photographer.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Target player:</span>
            <span className={styles.value}>{currentPhoto.targetPlayer.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Date:</span>
            <span className={styles.value}>
              {new Date(currentPhoto.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => handleReview('reject')}
            className={styles.rejectButton}
            disabled={isProcessing}
          >
            ✗ Reject
          </button>
          <button
            onClick={() => handleReview('approve')}
            className={styles.approveButton}
            disabled={isProcessing}
          >
            ✓ Approve
          </button>
        </div>
      </div>

      {photos.length > 1 && (
        <div className={styles.navigation}>
          <button
            onClick={handlePrevious}
            className={styles.navButton}
            disabled={currentIndex === 0 || isProcessing}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className={styles.navButton}
            disabled={currentIndex === photos.length - 1 || isProcessing}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
