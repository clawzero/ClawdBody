# Samantha - Autonomous AI Agent

Samantha is an autonomous AI agent with **persistent memory**, **intelligent reasoning**, and the ability to **act** in the real world.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORGO VM                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              OBSIDIAN VAULT (GitHub Sync)               │    │
│  │  ├── tasks.md          ← P0 Priority Queue              │    │
│  │  ├── completed_tasks/  ← Archive                        │    │
│  │  ├── context/          ← Agent Memory                   │    │
│  │  └── integrations/     ← App Configs                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Claude   │  │ Browser  │  │ Orgo API │  │ Ralph Wiggum │    │
│  │ Code     │  │ Use      │  │ & Bash   │  │ Long Tasks   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Role | Technology |
|-----------|------|------------|
| **Memory** | Persistent knowledge base | Obsidian Vault + GitHub |
| **Mind** | Reasoning & decision making | Claude Code (terminal-based) |
| **Hands** | Browser & computer control | Orgo APIs |

### Task Priority System

| Priority | Source | Description |
|----------|--------|-------------|
| **P0** | `tasks.md` | Externally provided tasks (urgent) |
| **P1** | Inferred from vault | High priority inferred tasks |
| **P2** | Inferred from vault | Lower priority inferred tasks |

Tasks execute right-to-left (P0 → P1 → P2).

## Setup

### Prerequisites

- Node.js 18+
- GitHub account
- [Claude API key](https://console.anthropic.com/settings/keys)
- [Orgo API key](https://orgo.ai/workspaces)

### 1. Clone and Install

```bash
git clone <this-repo>
cd samantha
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
# Google OAuth App credentials (for authentication)
# Create at: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here  # Generate with: openssl rand -base64 32

# Orgo API Key (optional, if using Orgo as VM provider)
ORGO_API_KEY=sk_live_your_orgo_api_key

# Database (PostgreSQL)
# For local dev, use Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helloworld?schema=public"
# If using connection pooling (Vercel, Supabase), also set:
# DIRECT_URL="postgresql://..."

# Cron Job Secret (optional, for securing cron endpoints)
CRON_SECRET=your_cron_secret_here  # Generate with: openssl rand -base64 32
```

### 3. Set up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Configure OAuth consent screen first if prompted
5. Configure credentials:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### 5. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with Google.

## What Happens During Setup

1. **Google OAuth** - Sign in with your Google account
2. **API Keys** - Enter your Claude API key and choose a VM provider (Orgo/AWS/E2B)
3. **VM Provisioning** - Creates a VM with your selected provider
4. **VM Configuration**:
   - Installs Python and essential tools
   - Installs Anthropic SDK for Claude
   - Installs Clawdbot for autonomous task execution
   - Configures Telegram bot (optional)

## Integrations

**Note:** Gmail, Calendar, and GitHub integrations are currently unavailable as they require a vault repository. These features will be re-enabled in a future update.

**For Other Platforms:**
Set up a cron job to call:
```
POST /api/integrations/gmail/sync
Authorization: Bearer <CRON_SECRET>
```

Example cron schedule (every 12 hours):
```bash
0 */12 * * * curl -X POST https://your-domain.com/api/integrations/gmail/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Manual Sync:**
You can manually trigger a sync by calling:
```bash
curl -X POST http://localhost:3000/api/integrations/gmail/sync \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### Email Storage

- Emails are batched into files (50 emails per file)
- New emails from syncs are stored in `integrations/gmail/new-messages-<timestamp>.md`
- Sync history is logged in `integrations/gmail/sync-log.md`

## After Setup

### Adding Tasks

Edit `tasks.md` in your vault repository:

```markdown
## Active Tasks

- [ ] Book flight to NYC for March 15
  - Context: Prefer window seat, direct flights
  - Deadline: March 10

- [ ] Research best noise-canceling headphones under $300
  - Context: For daily commute and focus work
```

### Monitoring

- **VM Console**: View at your Orgo dashboard
- **Vault Repo**: Check GitHub for synced changes

## Vercel Deployment

### 1. Connect to Vercel

Since the repository is public, you can deploy directly:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `prakshaljain422@gmail.com` → Samantha
3. Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (pooled, use Vercel Postgres, Supabase, or PlanetScale) | ✅ |
| `DIRECT_URL` | Direct PostgreSQL connection (non-pooled, for migrations) | ✅ |
| `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://samantha.vercel.app`) | ✅ |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | ✅ |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App | ✅ |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App | ✅ |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | For Gmail/Calendar |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | For Gmail/Calendar |
| `ORGO_API_KEY` | From Orgo dashboard | For VM integration |
| `CRON_SECRET` | Generate with: `openssl rand -hex 16` | For cron jobs |
| `TELEGRAM_BOT_TOKEN` | From BotFather | Optional |
| `TELEGRAM_USER_ID` | Your Telegram user ID | Optional |

### 3. Set Up Production Database

**Option A: Vercel Postgres (Recommended)**
1. In Vercel Dashboard → Storage → Create Database → Postgres
2. It will auto-populate `DATABASE_URL`

**Option B: Supabase**
1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string to `DATABASE_URL`

### 4. Update OAuth Redirect URIs

Update your OAuth apps with production URLs:

**GitHub OAuth App:**
- Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`

**Google OAuth App:**
- Authorized redirect URIs:
  - `https://your-app.vercel.app/api/auth/callback/google`
  - `https://your-app.vercel.app/api/integrations/gmail/callback`
  - `https://your-app.vercel.app/api/integrations/calendar/callback`

### 5. Deploy

Push to GitHub and Vercel will automatically build and deploy:

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

## Development

```bash
# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Reference

### Orgo API
- [Documentation](https://docs.orgo.ai)
- Endpoints for VM management, bash execution, screenshots

## License

MIT


