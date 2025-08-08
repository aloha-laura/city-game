import { Team } from '@/domain/entities/Team';

describe('Team - Business Rules', () => {
  describe('Team name validation', () => {
    it('should accept valid team names', () => {
      expect(Team.isValidName('Team Alpha')).toBe(true);
      expect(Team.isValidName('The Warriors')).toBe(true);
      expect(Team.isValidName('A')).toBe(true);
    });

    it('should reject empty or whitespace-only names', () => {
      expect(Team.isValidName('')).toBe(false);
      expect(Team.isValidName('   ')).toBe(false);
      expect(Team.isValidName('\t\n')).toBe(false);
    });

    it('should reject names longer than 50 characters', () => {
      const tooLongName = 'A'.repeat(51);
      expect(Team.isValidName(tooLongName)).toBe(false);
    });

    it('should accept names with exactly 50 characters', () => {
      const maxLengthName = 'A'.repeat(50);
      expect(Team.isValidName(maxLengthName)).toBe(true);
    });
  });

  describe('Team name generation', () => {
    it('should generate sequential team names', () => {
      expect(Team.generateName(1)).toBe('Team 1');
      expect(Team.generateName(2)).toBe('Team 2');
      expect(Team.generateName(10)).toBe('Team 10');
    });

    it('should handle team number 0', () => {
      expect(Team.generateName(0)).toBe('Team 0');
    });
  });

  describe('Team color generation', () => {
    it('should generate a valid hex color', () => {
      const color = Team.generateColor();
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      expect(color).toMatch(hexColorRegex);
    });

    it('should generate colors from predefined palette', () => {
      const validColors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA07A',
        '#98D8C8',
        '#F7DC6F',
        '#BB8FCE',
        '#85C1E2',
      ];

      const generatedColors = new Set<string>();
      for (let i = 0; i < 100; i++) {
        generatedColors.add(Team.generateColor());
      }

      generatedColors.forEach(color => {
        expect(validColors).toContain(color);
      });
    });
  });

  describe('Critical business rule: team names must be unique identifiers', () => {
    it('should generate different names for different team numbers', () => {
      const team1Name = Team.generateName(1);
      const team2Name = Team.generateName(2);

      expect(team1Name).not.toBe(team2Name);
    });
  });
});
