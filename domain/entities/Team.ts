import { Team as TeamType } from '../types';

export class Team {
  private constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly name: string,
    public readonly color: string | undefined,
    public readonly createdAt: Date
  ) {}

  static create(data: TeamType): Team {
    return new Team(
      data.id,
      data.sessionId,
      data.name,
      data.color,
      data.createdAt
    );
  }

  static isValidName(name: string): boolean {
    return name.trim().length >= 1 && name.trim().length <= 50;
  }

  static generateName(teamNumber: number): string {
    return `Team ${teamNumber}`;
  }

  static generateColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  toJSON(): TeamType {
    return {
      id: this.id,
      sessionId: this.sessionId,
      name: this.name,
      color: this.color,
      createdAt: this.createdAt,
    };
  }
}
