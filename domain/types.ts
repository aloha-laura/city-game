export type PlayerRole = 'admin' | 'player';
export type PhotoStatus = 'pending' | 'approved' | 'rejected';

export interface Session {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Player {
  id: string;
  sessionId: string;
  name: string;
  role: PlayerRole;
  createdAt: Date;
}

export interface Team {
  id: string;
  sessionId: string;
  name: string;
  color?: string;
  points: number;
  createdAt: Date;
}

export interface Photo {
  id: string;
  sessionId: string;
  photographerId: string;
  targetPlayerId: string;
  imageUrl: string;
  status: PhotoStatus;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface TeamAssignment {
  playerId: string;
  teamId: string;
  assignedAt: Date;
}

export interface PlayerWithTeam extends Player {
  team?: Team;
}

export interface TeamWithPlayers extends Team {
  players: Player[];
}

export interface PhotoWithDetails extends Photo {
  photographer: Player;
  targetPlayer: Player;
}
