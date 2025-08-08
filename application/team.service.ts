import { supabase, TABLES } from '../infrastructure/database';
import { Team, TeamWithPlayers } from '../domain/types';
import { Team as TeamEntity } from '../domain/entities';

export class TeamService {
  static async createTeam(sessionId: string): Promise<Team | null> {
    const { count } = await supabase
      .from(TABLES.TEAMS)
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    const teamNumber = (count || 0) + 1;
    const teamName = TeamEntity.generateName(teamNumber);
    const teamColor = TeamEntity.generateColor();

    const { data, error } = await supabase
      .from(TABLES.TEAMS)
      .insert({
        session_id: sessionId,
        name: teamName,
        color: teamColor,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating team:', error);
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      color: data.color,
      points: data.points || 0,
      createdAt: new Date(data.created_at),
    };
  }

  static async getTeamsBySession(sessionId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from(TABLES.TEAMS)
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      name: row.name,
      color: row.color,
      points: row.points || 0,
      createdAt: new Date(row.created_at),
    }));
  }

  static async getTeamById(teamId: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from(TABLES.TEAMS)
      .select('*')
      .eq('id', teamId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      name: data.name,
      color: data.color,
      points: data.points || 0,
      createdAt: new Date(data.created_at),
    };
  }

  static async incrementTeamPoints(teamId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_team_points', {
      team_id: teamId,
    });

    if (error) {
      const team = await this.getTeamById(teamId);
      if (!team) return false;

      const { error: updateError } = await supabase
        .from(TABLES.TEAMS)
        .update({ points: team.points + 1 })
        .eq('id', teamId);

      if (updateError) {
        console.error('Error incrementing team points:', updateError);
        return false;
      }
    }

    return true;
  }

  static async getTeamWithMembers(teamId: string): Promise<TeamWithPlayers | null> {
    const team = await this.getTeamById(teamId);
    if (!team) return null;

    const { data, error } = await supabase
      .from(TABLES.TEAM_ASSIGNMENTS)
      .select(
        `
        player_id,
        players (*)
      `
      )
      .eq('team_id', teamId);

    if (error) {
      console.error('Error fetching team members:', error);
      return { ...team, players: [] };
    }

    const players =
      data?.map((assignment: any) => ({
        id: assignment.players.id,
        sessionId: assignment.players.session_id,
        name: assignment.players.name,
        role: assignment.players.role,
        createdAt: new Date(assignment.players.created_at),
      })) || [];

    return { ...team, players };
  }

  static async assignPlayerToTeam(
    playerId: string,
    teamId: string
  ): Promise<boolean> {
    const { data: playerData, error: playerError } = await supabase
      .from(TABLES.PLAYERS)
      .select('id')
      .eq('id', playerId)
      .single();

    if (playerError || !playerData) {
      console.error('Player not found');
      return false;
    }

    const { data: teamData, error: teamError } = await supabase
      .from(TABLES.TEAMS)
      .select('id')
      .eq('id', teamId)
      .single();

    if (teamError || !teamData) {
      console.error('Team not found');
      return false;
    }

    await supabase
      .from(TABLES.TEAM_ASSIGNMENTS)
      .delete()
      .eq('player_id', playerId);

    const { error } = await supabase
      .from(TABLES.TEAM_ASSIGNMENTS)
      .insert({
        player_id: playerId,
        team_id: teamId,
      });

    if (error) {
      console.error('Error assigning player:', error);
      return false;
    }

    return true;
  }

  static async removePlayerFromTeam(playerId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.TEAM_ASSIGNMENTS)
      .delete()
      .eq('player_id', playerId);

    if (error) {
      console.error('Error removing player:', error);
      return false;
    }

    return true;
  }

  static async getTeamsWithPlayers(
    sessionId: string
  ): Promise<TeamWithPlayers[]> {
    const teams = await this.getTeamsBySession(sessionId);

    const teamsWithPlayers: TeamWithPlayers[] = [];

    for (const team of teams) {
      const { data, error } = await supabase
        .from(TABLES.TEAM_ASSIGNMENTS)
        .select(
          `
          player_id,
          players (*)
        `
        )
        .eq('team_id', team.id);

      if (error) {
        console.error('Error fetching players:', error);
        teamsWithPlayers.push({ ...team, players: [] });
        continue;
      }

      const players =
        data?.map((assignment: any) => ({
          id: assignment.players.id,
          sessionId: assignment.players.session_id,
          name: assignment.players.name,
          role: assignment.players.role,
          createdAt: new Date(assignment.players.created_at),
        })) || [];

      teamsWithPlayers.push({ ...team, players });
    }

    return teamsWithPlayers;
  }

  static async deleteTeam(teamId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.TEAMS)
      .delete()
      .eq('id', teamId);

    if (error) {
      console.error('Error deleting team:', error);
      return false;
    }

    return true;
  }

  static async deleteAllTeams(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.TEAMS)
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting all teams:', error);
      return false;
    }

    return true;
  }

  static async resetAllPoints(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from(TABLES.TEAMS)
      .update({ points: 0 })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error resetting all points:', error);
      return false;
    }

    return true;
  }
}
