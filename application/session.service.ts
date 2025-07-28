import { supabase, TABLES } from '../infrastructure/database';
import { Session } from '../domain/types';

export class SessionService {
  static async getGlobalSession(): Promise<Session | null> {
    const { data, error } = await supabase
      .from(TABLES.SESSIONS)
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  }

  static async ensureGlobalSessionExists(): Promise<Session> {
    const existingSession = await this.getGlobalSession();

    if (existingSession) {
      return existingSession;
    }

    const { data, error } = await supabase
      .from(TABLES.SESSIONS)
      .insert({ name: 'Global Session' })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create global session');
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  }
}
