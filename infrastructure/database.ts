import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required. Check your .env.local file'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLES = {
  SESSIONS: 'sessions',
  PLAYERS: 'players',
  TEAMS: 'teams',
  TEAM_ASSIGNMENTS: 'team_assignments',
} as const;
