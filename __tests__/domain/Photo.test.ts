import { PhotoEntity } from '@/domain/entities/Photo';
import { PhotoStatus } from '@/domain/types';

describe('PhotoEntity - Business Rules', () => {
  describe('Photo status validation', () => {
    it('should accept valid photo statuses', () => {
      const validStatuses: PhotoStatus[] = ['pending', 'approved', 'rejected'];

      validStatuses.forEach(status => {
        expect(PhotoEntity.isValidStatus(status)).toBe(true);
      });
    });

    it('should reject invalid photo statuses', () => {
      const invalidStatuses = ['in_progress', 'cancelled', 'archived', ''];

      invalidStatuses.forEach(status => {
        expect(PhotoEntity.isValidStatus(status)).toBe(false);
      });
    });
  });

  describe('Photo review business logic', () => {
    it('should allow review only for pending photos', () => {
      expect(PhotoEntity.canBeReviewed('pending')).toBe(true);
    });

    it('should NOT allow review for approved photos', () => {
      expect(PhotoEntity.canBeReviewed('approved')).toBe(false);
    });

    it('should NOT allow review for rejected photos', () => {
      expect(PhotoEntity.canBeReviewed('rejected')).toBe(false);
    });
  });

  describe('Critical business rule: only pending photos can change status', () => {
    it('should prevent double-approval of photos', () => {
      const alreadyApprovedPhoto: PhotoStatus = 'approved';

      expect(PhotoEntity.canBeReviewed(alreadyApprovedPhoto)).toBe(false);
    });

    it('should prevent re-reviewing rejected photos', () => {
      const alreadyRejectedPhoto: PhotoStatus = 'rejected';

      expect(PhotoEntity.canBeReviewed(alreadyRejectedPhoto)).toBe(false);
    });
  });
});
