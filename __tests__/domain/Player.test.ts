import { Player } from '@/domain/entities/Player';

describe('Player - Business Rules', () => {
  describe('Player name validation', () => {
    it('should accept valid player names', () => {
      expect(Player.isValidName('John Doe')).toBe(true);
      expect(Player.isValidName('Alice')).toBe(true);
      expect(Player.isValidName('Bob123')).toBe(true);
      expect(Player.isValidName('AB')).toBe(true);
    });

    it('should reject empty or whitespace-only names', () => {
      expect(Player.isValidName('')).toBe(false);
      expect(Player.isValidName('   ')).toBe(false);
      expect(Player.isValidName('\t\n')).toBe(false);
    });

    it('should reject names with only 1 character', () => {
      expect(Player.isValidName('A')).toBe(false);
    });

    it('should reject names longer than 50 characters', () => {
      const tooLongName = 'A'.repeat(51);
      expect(Player.isValidName(tooLongName)).toBe(false);
    });

    it('should accept names with exactly 50 characters', () => {
      const maxLengthName = 'A'.repeat(50);
      expect(Player.isValidName(maxLengthName)).toBe(true);
    });
  });

  describe('Player role validation', () => {
    it('should accept valid player roles', () => {
      expect(Player.isValidRole('admin')).toBe(true);
      expect(Player.isValidRole('player')).toBe(true);
    });

    it('should reject invalid player roles', () => {
      expect(Player.isValidRole('moderator')).toBe(false);
      expect(Player.isValidRole('guest')).toBe(false);
      expect(Player.isValidRole('')).toBe(false);
      expect(Player.isValidRole('ADMIN')).toBe(false);
    });
  });

  describe('Critical business rule: admin identification', () => {
    it('should correctly identify admin players', () => {
      expect(Player.isAdmin('admin')).toBe(true);
    });

    it('should correctly identify non-admin players', () => {
      expect(Player.isAdmin('player')).toBe(false);
    });

    it('should return false for invalid roles', () => {
      expect(Player.isAdmin('moderator')).toBe(false);
      expect(Player.isAdmin('')).toBe(false);
    });
  });

  describe('Critical business rule: admin role management', () => {
    it('should correctly identify admin role', () => {
      expect(Player.isAdmin('admin')).toBe(true);
      expect(Player.isAdmin('player')).toBe(false);
    });

    it('should allow multiple players with admin role', () => {
      const admin1Role = 'admin';
      const admin2Role = 'admin';

      expect(Player.isAdmin(admin1Role)).toBe(true);
      expect(Player.isAdmin(admin2Role)).toBe(true);
    });
  });
});
