import { Player as PlayerType, PlayerRole } from '../types';

export class Player {
  private constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly name: string,
    public readonly role: PlayerRole,
    public readonly createdAt: Date
  ) {}

  static create(data: PlayerType): Player {
    return new Player(
      data.id,
      data.sessionId,
      data.name,
      data.role,
      data.createdAt
    );
  }

  static isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50;
  }

  static isValidRole(role: string): role is PlayerRole {
    return role === 'admin' || role === 'player';
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isPlayer(): boolean {
    return this.role === 'player';
  }

  toJSON(): PlayerType {
    return {
      id: this.id,
      sessionId: this.sessionId,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}
