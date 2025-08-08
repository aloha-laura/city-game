# City Game

A web application for organizing city games where teams explore the city and take photos of opposing team members to earn points.

## About

This is an MVP for a city game where players are divided into teams and walk around the city. The main mechanic is taking photos of players from opposing teams to score points. Admins validate the photos in real-time and award points to teams.

This can be extended in the future to include photo challenges and other game modes.

## Installation

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works fine)

### Setup

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - In the SQL Editor, run the content of `database/schema.sql`

2. **Configure environment variables**

   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

The app will be available at [http://localhost:3000](http://localhost:3000)
