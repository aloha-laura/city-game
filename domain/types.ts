export type PlayerRole = 'admin' | 'player';

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
  createdAt: Date;
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
