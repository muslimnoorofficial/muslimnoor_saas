# Setup Local Supabase with Docker

This guide will help you run Supabase locally for development without needing to connect to the cloud instance.

## Prerequisites
- Docker & Docker Compose installed
- Node.js 18+

## Quick Setup (2 minutes)

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
# or
npm install -g @supabase/cli
```

### 2. Create `.env.local` in workspace root
```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MTcwMDAwMDAwfQ.XXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoxNzAwMDAwMDB9.XXXXXXX
```

### 3. Start Local Supabase
```bash
cd /path/to/workspace
supabase start

# Output will show:
# Started supabase local development server.
# 
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54432/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
```

### 4. Verify Connection
```bash
# Access Supabase Studio at http://localhost:54323
# Default credentials: admin@example.com / password
```

### 5. Run Database Migrations
```bash
# Apply all migrations
supabase migration list  # See all migrations
supabase db pull        # Pull schema from migrations

# Or run specific migrations
psql postgresql://postgres:postgres@localhost:54432/postgres \
  -f supabase/migrations/001_initial_schema.sql

psql postgresql://postgres:postgres@localhost:54432/postgres \
  -f supabase/migrations/002_user_devices.sql
```

## Environment Setup

### For Admin Dashboard (`apps/admin/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MTcwMDAwMDAwfQ.XXXXXXX
```

### For Backend API (`apps/api/.env.local`)
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MTcwMDAwMDAwfQ.XXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoxNzAwMDAwMDB9.XXXXXXX
```

## Full Development Stack

### Terminal 1: Supabase
```bash
supabase start
# Keep running in background
```

### Terminal 2: Backend API
```bash
cd apps/api
pnpm install
pnpm dev
# Runs on http://localhost:3001 by default
```

### Terminal 3: Queue Worker
```bash
cd apps/api
pnpm start:worker
# Processes notification jobs
```

### Terminal 4: Admin Dashboard
```bash
cd apps/admin
pnpm install
pnpm dev
# Runs on http://localhost:3000
```

## Testing Flow

### 1. Verify Backend is Running
```bash
curl http://localhost:3001/health
# Should return 200 OK
```

### 2. Create Test Event via API
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-id" \
  -d '{
    "title": "Test Event",
    "startLocal": "2024-04-20T14:00",
    "endLocal": "2024-04-20T15:00",
    "timeZone": "America/New_York",
    "location": "Test Mosque",
    "contactEmail": "admin@example.com",
    "contactPhone": "555-1234"
  }'
```

### 3. Check Database
```bash
# Access Supabase Studio at http://localhost:54323
# Navigate to Table Editor → events
# You should see your created event
```

## Troubleshooting

### Supabase won't start
```bash
# Check Docker is running
docker ps

# Reset Supabase
supabase stop
rm -rf ~/.supabase
supabase start
```

### Connection refused on 54321
```bash
# Check if port is in use
lsof -i :54321

# Kill and restart
supabase stop
supabase start
```

### Database migrations failing
```bash
# Check migration status
supabase migration list

# View specific migration
cat supabase/migrations/002_user_devices.sql

# Manually run in Supabase Studio SQL Editor
```

### JWT Token Issues
```bash
# Use the pre-generated tokens from supabase/migrations
# Or generate new ones in Supabase Studio → Authentication → API
```

## Production vs Local

| Feature | Local | Cloud |
|---------|-------|-------|
| Database | PostgreSQL in Docker | Hosted on Supabase |
| Persistence | Local filesystem | Cloud storage |
| Access | localhost:54321 | https://your-project.supabase.co |
| Cost | Free (local compute) | $ per month |
| Collateral | None | Upload required |
| Setup time | 2 minutes | Manual configuration |

## Stopping Local Supabase

```bash
supabase stop

# Wipe all data and start fresh
supabase stop --remove-volumes
supabase start
```

Good luck with local testing! 🚀
