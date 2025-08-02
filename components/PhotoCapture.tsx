'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PhotoCapture.module.css';
import { Player } from '@/domain/types';

type PhotoCaptureProps = {
  playerId: string;
};

export default function PhotoCapture({ playerId }: PhotoCaptureProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [opponents, setOpponents] = useState<Player[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    loadSession();
    loadOpponents();

    return () => {
      console.log('Component unmounting, stopping camera');
      if (stream) {
        stream.getTracks().forEach((track) => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
      }
    };
  }, [playerId, stream]);

  const loadSession = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error('Failed to load session');
      const data = await response.json();
      setSessionId(data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
    }
  };

  const loadOpponents = async () => {
    try {
      const response = await fetch(`/api/players/${playerId}/opponents`);
      if (!response.ok) {
        throw new Error('Failed to load opponents');
      }
      const data = await response.json();
      setOpponents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load opponents');
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera with facingMode:', facingMode);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      console.log('Camera stream obtained:', mediaStream);
      console.log('Stream active:', mediaStream.active);
      console.log('Video tracks:', mediaStream.getVideoTracks());

      setStream(mediaStream);
      setIsCameraActive(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        console.log('Video element srcObject set');

        video.addEventListener('loadedmetadata', () => {
          console.log('loadedmetadata event fired');
        });

        video.addEventListener('canplay', () => {
          console.log('canplay event fired');
        });

        video.addEventListener('playing', () => {
          console.log('playing event fired');
        });

        try {
          console.log('Attempting to play video...');
          await video.play();
          console.log('Video play() succeeded');

          setTimeout(() => {
            console.log('Checking video dimensions after 1s...');
            console.log('videoWidth:', video.videoWidth);
            console.log('videoHeight:', video.videoHeight);
            console.log('readyState:', video.readyState);

            if (video.videoWidth > 0 && video.videoHeight > 0) {
              console.log('Video is ready!');
              setIsVideoReady(true);
            } else {
              console.error('Video dimensions still 0 after 1s');
              setError('Camera not responding. Please try again.');
            }
          }, 1000);
        } catch (playError) {
          console.error('Error playing video:', playError);
          setError('Failed to start video playback');
        }
      }
      setError('');
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Failed to access camera: ${err.message}. Please allow camera permissions.`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    await new Promise(resolve => setTimeout(resolve, 100));
    await startCamera();
  };

  const capturePhoto = () => {
    console.log('Capturing photo...');
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      setError('Camera not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    console.log('Video dimensions:', video.videoWidth, video.videoHeight);

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video dimensions are 0');
      setError('Camera not ready, please wait...');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob');
        return;
      }

      console.log('Photo captured successfully');
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      setCapturedFile(file);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async () => {
    if (!capturedFile || !selectedOpponent) {
      setError('Please capture a photo and select an opponent');
      return;
    }

    if (!sessionId) {
      setError('Session not loaded, please wait');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Submitting photo...', {
        fileName: capturedFile.name,
        fileSize: capturedFile.size,
        fileType: capturedFile.type,
        sessionId,
        playerId,
        selectedOpponent,
      });

      const formData = new FormData();
      formData.append('file', capturedFile);
      formData.append('sessionId', sessionId);
      formData.append('photographerId', playerId);
      formData.append('targetPlayerId', selectedOpponent);

      console.log('Sending request to /api/photos...');
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to submit photo');
      }

      const data = await response.json();
      console.log('Photo submitted successfully:', data);

      router.push(`/player/${playerId}`);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit photo');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCapturedFile(null);
    setPreviewUrl(null);
    setSelectedOpponent('');
    setError('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Capture Photo</h1>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.captureSection}>
          {!isCameraActive && !previewUrl && (
            <div className={styles.capturePrompt}>
              <button
                onClick={startCamera}
                className={styles.captureButton}
                disabled={isLoading}
              >
                📷 Open Camera
              </button>
            </div>
          )}

          {isCameraActive && (
            <div className={styles.cameraSection}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.video}
              />
              {!isVideoReady && (
                <div className={styles.loadingVideo}>
                  Preparing camera...
                </div>
              )}
              <div className={styles.cameraControls}>
                <button
                  onClick={switchCamera}
                  className={styles.switchButton}
                  disabled={isLoading || !isVideoReady}
                  title="Switch camera"
                >
                  🔄 Switch
                </button>
                <button
                  onClick={capturePhoto}
                  className={styles.captureButton}
                  disabled={isLoading || !isVideoReady}
                >
                  {isVideoReady ? '📸 Take Photo' : '⏳ Loading...'}
                </button>
              </div>
            </div>
          )}

          {previewUrl && (
            <div className={styles.previewSection}>
              <img
                src={previewUrl}
                alt="Captured photo"
                className={styles.preview}
              />
              <button
                onClick={handleCancel}
                className={styles.retakeButton}
                disabled={isLoading}
              >
                ↻ Retake
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className={styles.canvas} />
        </div>

        {previewUrl && (
          <div className={styles.targetSection}>
            <label htmlFor="opponent" className={styles.label}>
              Select opponent player:
            </label>
            <select
              id="opponent"
              value={selectedOpponent}
              onChange={(e) => setSelectedOpponent(e.target.value)}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="">Choose a player...</option>
              {opponents.map((opponent) => (
                <option key={opponent.id} value={opponent.id}>
                  {opponent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.actions}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
            disabled={isLoading}
          >
            Back
          </button>
          {previewUrl && (
            <button
              onClick={handleSubmit}
              className={styles.submitButton}
              disabled={!selectedOpponent || isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Photo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
