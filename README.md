# City Game - Team Management Application

Web application to organize city games with team and player management.

## Architecture

The project follows a simplified **Domain-Driven Design (DDD)** architecture:

```
city-game/
├── domain/              # Pure business logic
│   ├── entities/        # Entities with validation
│   └── types.ts         # TypeScript types
│
├── application/         # Business services
│   ├── player.service.ts
│   ├── team.service.ts
│   └── session.service.ts
│
├── infrastructure/      # Data access
│   └── database.ts      # Supabase configuration
│
├── app/                 # Next.js pages
│   ├── page.tsx         # Home page
│   ├── admin/           # Admin interface
│   ├── player/          # Player interface
│   └── api/             # API Routes
│
├── components/          # Reusable components
└── database/            # SQL scripts
```

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free)

## Installation

### 1. Create a Supabase project and configure the database

1. Go to [supabase.com](https://supabase.com)
2. Create an account and a new project
3. In the **SQL Editor** tab
4. Open the `database/schema.sql` file from this project
5. Copy all the content of `database/schema.sql` and run it in the SQL editor
6. Configure the environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the application locally

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000)
