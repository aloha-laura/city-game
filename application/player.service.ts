import { supabase, TABLES } from '../infrastructure/database';
import { Player, PlayerRole, PlayerWithTeam } from '../domain/types';
import { Player as PlayerEntity } from '../domain/entities';

export class PlayerService {
  static async createPlayer(
    sessionId: string,
    name: string,
    role: PlayerRole
  ): Promise<Player | null> {
    if (!PlayerEntity.isValidName(name)) {
      throw new Error('Name must be between 2 and 50 characters');
    }

    if (!PlayerEntity.isValidRole(role)) {
      throw new Error('Role must be "admin" or "player"');
    }

    const { data, error } = await supabase
      .from(TABLES.PLAYERS)
      .insert({
        session_id: sessionId,
        name: name.trim(),
        role,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating player:', error);
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      role: data.role,
      createdAt: new Date(data.created_at),
    };
  }

  static async getPlayerById(playerId: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from(TABLES.PLAYERS)
      .select('*')
      .eq('id', playerId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      role: data.role,
      createdAt: new Date(data.created_at),
    };
  }

  static async getPlayerWithTeam(
    playerId: string
  ): Promise<PlayerWithTeam | null> {
    const { data, error } = await supabase
      .from(TABLES.PLAYERS)
      .select(
        `
        *,
        team_assignments (
          team_id,
          teams (*)
        )
      `
      )
      .eq('id', playerId)
      .single();

    if (error || !data) {
      console.error('Error fetching player:', error);
      return null;
    }

    const player: PlayerWithTeam = {
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      role: data.role,
      createdAt: new Date(data.created_at),
    };

    if (data.team_assignments && data.team_assignments.teams) {
      const teamData = data.team_assignments.teams;
      player.team = {
        id: teamData.id,
        sessionId: teamData.session_id,
        name: teamData.name,
        color: teamData.color,
        points: teamData.points || 0,
        createdAt: new Date(teamData.created_at),
      };
    }

    return player;
  }

  static async getOpponentPlayers(playerId: string): Promise<Player[]> {
    const player = await this.getPlayerWithTeam(playerId);
    if (!player) return [];

    if (!player.team) {
      return [];
    }

    const { data, error } = await supabase
      .from(TABLES.PLAYERS)
      .select(
        `
        *,
        team_assignments (
          team_id
        )
      `
      )
      .eq('session_id', player.sessionId)
      .neq('id', playerId);

    if (error || !data) {
      console.error('Error fetching opponent players:', error);
      return [];
    }

    const opponents = data.filter((row) => {
      if (!row.team_assignments) return false;
      return row.team_assignments.team_id !== player.team!.id;
    });

    return opponents.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      name: row.name,
      role: row.role,
      createdAt: new Date(row.created_at),
    }));
  }

  static async getPlayersBySession(sessionId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from(TABLES.PLAYERS)
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching players:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      name: row.name,
      role: row.role,
      createdAt: new Date(row.created_at),
    }));
  }

  static async deletePlayer(playerId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.PLAYERS)
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error('Error deleting player:', error);
      return false;
    }

    return true;
  }

  static async deleteAllPlayers(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.PLAYERS)
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting all players:', error);
      return false;
    }

    return true;
  }

  static async getPlayersWithTeams(
    sessionId: string
  ): Promise<PlayerWithTeam[]> {
    const { data, error } = await supabase
      .from(TABLES.PLAYERS)
      .select(
        `
        *,
        team_assignments (
          team_id,
          teams (*)
        )
      `
      )
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching players:', error);
      return [];
    }

    return data.map((row) => {
      const player: PlayerWithTeam = {
        id: row.id,
        sessionId: row.session_id,
        name: row.name,
        role: row.role,
        createdAt: new Date(row.created_at),
      };

      if (row.team_assignments && row.team_assignments.teams) {
        const teamData = row.team_assignments.teams;
        player.team = {
          id: teamData.id,
          sessionId: teamData.session_id,
          name: teamData.name,
          color: teamData.color,
          points: teamData.points || 0,
          createdAt: new Date(teamData.created_at),
        };
      }

      return player;
    });
  }
}
