# Database Migration Instructions

## Changes Made

This update transitions the authentication from GitHub to Google and removes the vault repository dependency.

### Schema Changes

The following fields have been removed from the database:
- `SetupState.vaultRepoName`
- `SetupState.vaultRepoUrl`
- `SetupState.repoCreated`
- `SetupState.repoCloned`
- `SetupState.gitSyncConfigured`
- `VM.repoCloned`
- `VM.gitSyncConfigured`

### Migration Steps

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Create Migration (Interactive):**
   ```bash
   npx prisma migrate dev --name remove_vault_repo_fields
   ```
   
   This will:
   - Create a new migration file
   - Apply the migration to your development database
   - Regenerate Prisma Client

3. **For Production Deployment:**
   ```bash
   npx prisma migrate deploy
   ```

### Authentication Changes

- **Old:** Users signed in with GitHub OAuth
- **New:** Users sign in with Google OAuth

### Environment Variables

Update your `.env` file:
- Remove: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Keep/Add: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Configure OAuth consent screen first if prompted
5. Configure credentials:
   - **Application type:** Web application
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google` (or your production URL)
6. Copy Client ID and Client Secret to `.env`

### Breaking Changes

- **Integrations Disabled:** Gmail, Calendar, and GitHub integrations are currently unavailable as they depended on the vault repository. They still appear in the UI but are marked as unavailable.
- **No Vault Repository:** VMs are no longer connected to a GitHub vault repository. The vault functionality will be re-implemented in a future update.
- **Simplified Setup:** The setup process now only provisions the VM and installs Clawdbot, without any Git sync or repository cloning steps.

### Rollback (if needed)

If you need to rollback:
1. Revert code changes
2. Run: `npx prisma migrate resolve --rolled-back <migration_name>`
3. Restore previous schema
4. Run: `npx prisma migrate dev`
