import { PhotoStatus } from '../types';

export class PhotoEntity {
  static isValidStatus(status: string): status is PhotoStatus {
    return ['pending', 'approved', 'rejected'].includes(status);
  }

  static canBeReviewed(status: PhotoStatus): boolean {
    return status === 'pending';
  }

  static isApproved(status: PhotoStatus): boolean {
    return status === 'approved';
  }

  static isRejected(status: PhotoStatus): boolean {
    return status === 'rejected';
  }
}
