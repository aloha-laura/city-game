import { Session as SessionType } from '../types';

export class Session {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date
  ) {}

  static create(data: SessionType): Session {
    return new Session(data.id, data.name, data.createdAt);
  }

  toJSON(): SessionType {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}
