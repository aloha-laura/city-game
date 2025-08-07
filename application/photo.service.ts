import { supabase, TABLES, STORAGE_BUCKETS } from '../infrastructure/database';
import { Photo, PhotoWithDetails, PhotoStatus } from '../domain/types';
import { PhotoEntity } from '../domain/entities/Photo';

export class PhotoService {
  static async uploadImage(file: File, sessionId: string): Promise<string | null> {
    const fileName = `${sessionId}/${Date.now()}-${file.name}`;

    console.log('Uploading to Supabase Storage:', {
      bucket: STORAGE_BUCKETS.PHOTOS,
      fileName,
      fileType: file.type,
      fileSize: file.size,
    });

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PHOTOS)
      .upload(fileName, file);

    if (error) {
      console.error('Supabase Storage error:', error);
      console.error('Error message:', error.message);
      return null;
    }

    console.log('Upload successful:', data);

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.PHOTOS)
      .getPublicUrl(data.path);

    console.log('Public URL:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  }

  static async createPhoto(
    sessionId: string,
    photographerId: string,
    targetPlayerId: string,
    imageUrl: string
  ): Promise<Photo | null> {
    const { data, error } = await supabase
      .from(TABLES.PHOTOS)
      .insert({
        session_id: sessionId,
        photographer_id: photographerId,
        target_player_id: targetPlayerId,
        image_url: imageUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating photo:', error);
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      photographerId: data.photographer_id,
      targetPlayerId: data.target_player_id,
      imageUrl: data.image_url,
      status: data.status,
      createdAt: new Date(data.created_at),
      reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
      reviewedBy: data.reviewed_by,
    };
  }

  static async getPlayerPhotos(photographerId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from(TABLES.PHOTOS)
      .select('*')
      .eq('photographer_id', photographerId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching player photos:', error);
      return [];
    }

    return data.map(photo => ({
      id: photo.id,
      sessionId: photo.session_id,
      photographerId: photo.photographer_id,
      targetPlayerId: photo.target_player_id,
      imageUrl: photo.image_url,
      status: photo.status,
      createdAt: new Date(photo.created_at),
      reviewedAt: photo.reviewed_at ? new Date(photo.reviewed_at) : undefined,
      reviewedBy: photo.reviewed_by,
    }));
  }

  static async getPendingPhotos(sessionId: string): Promise<PhotoWithDetails[]> {
    const { data, error } = await supabase
      .from(TABLES.PHOTOS)
      .select(`
        *,
        photographer:photographer_id(id, name, role),
        target_player:target_player_id(id, name, role)
      `)
      .eq('session_id', sessionId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching pending photos:', error);
      return [];
    }

    return data.map(photo => ({
      id: photo.id,
      sessionId: photo.session_id,
      photographerId: photo.photographer_id,
      targetPlayerId: photo.target_player_id,
      imageUrl: photo.image_url,
      status: photo.status,
      createdAt: new Date(photo.created_at),
      reviewedAt: photo.reviewed_at ? new Date(photo.reviewed_at) : undefined,
      reviewedBy: photo.reviewed_by,
      photographer: {
        id: photo.photographer.id,
        sessionId: photo.session_id,
        name: photo.photographer.name,
        role: photo.photographer.role,
        createdAt: new Date(),
      },
      targetPlayer: {
        id: photo.target_player.id,
        sessionId: photo.session_id,
        name: photo.target_player.name,
        role: photo.target_player.role,
        createdAt: new Date(),
      },
    }));
  }

  static async approvePhoto(photoId: string, reviewerId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.PHOTOS)
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq('id', photoId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error approving photo:', error);
      return false;
    }

    return true;
  }

  static async rejectPhoto(photoId: string, reviewerId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.PHOTOS)
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq('id', photoId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error rejecting photo:', error);
      return false;
    }

    return true;
  }

  static async getPhotoById(photoId: string): Promise<Photo | null> {
    const { data, error } = await supabase
      .from(TABLES.PHOTOS)
      .select('*')
      .eq('id', photoId)
      .single();

    if (error || !data) {
      console.error('Error fetching photo:', error);
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      photographerId: data.photographer_id,
      targetPlayerId: data.target_player_id,
      imageUrl: data.image_url,
      status: data.status,
      createdAt: new Date(data.created_at),
      reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
      reviewedBy: data.reviewed_by,
    };
  }
}
