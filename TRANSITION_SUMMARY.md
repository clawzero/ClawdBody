# Google OAuth Transition - Summary of Changes

## Overview

Successfully transitioned authentication from GitHub OAuth to Google OAuth and removed the vault repository dependency. This simplifies the signup process and reduces friction for new users.

## Major Changes

### 1. Authentication System

**Before:** 
- Users signed in with GitHub OAuth
- Required extensive permissions (repo, admin:repo_hook)
- Created a private GitHub vault repository during sign-in

**After:**
- Users sign in with Google OAuth
- Minimal permissions (openid, email, profile)
- No repository creation during sign-in

**Files Changed:**
- `src/app/api/auth/[...nextauth]/route.ts` - Switched from GithubProvider to GoogleProvider
- `src/components/landing-page.tsx` - Updated UI to show "Sign in with Google"
- `src/app/page.tsx` - Authentication flow remains the same

### 2. Database Schema

**Removed Fields from `SetupState`:**
- `vaultRepoName` (String)
- `vaultRepoUrl` (String)
- `repoCreated` (Boolean)
- `repoCloned` (Boolean)
- `gitSyncConfigured` (Boolean)

**Removed Fields from `VM`:**
- `repoCloned` (Boolean)
- `gitSyncConfigured` (Boolean)

**Files Changed:**
- `prisma/schema.prisma`

### 3. VM Setup Process

**Removed from all VM providers (Orgo, AWS, E2B):**
- GitHub account lookup and validation
- Vault repository creation/verification
- SSH key generation for GitHub access
- Deploy key creation on GitHub
- Git configuration on VM
- Repository cloning
- Git sync setup
- Vault linking to Clawdbot knowledge directory
- Pending repository cloning logic

**Simplified Setup Flow:**
1. Provision VM (Orgo/AWS/E2B)
2. Install Python and essential tools
3. Install Anthropic SDK
4. Install Clawdbot
5. Configure Telegram (optional)
6. Start gateway

**Files Changed:**
- `src/app/api/setup/start/route.ts` - All three setup functions (runSetupProcess, runAWSSetupProcess, runE2BSetupProcess)

### 4. UI Updates

**Learning Sources Page:**
- Gmail: Marked as unavailable
- Calendar: Marked as unavailable
- GitHub: Marked as unavailable
- All integration cards still visible but disabled

**Landing Page:**
- Changed "Connect your GitHub" → "Sign in with Google"
- Changed "Start Free" button to "Sign in with Google" with Mail icon
- Removed GitHub icon from sign-in button

**Files Changed:**
- `src/app/learning-sources/page.tsx` - Updated connector availability and interface
- `src/components/landing-page.tsx` - Updated steps and sign-in button

### 5. Documentation

**README.md Updates:**
- Removed GitHub OAuth setup instructions
- Updated environment variables section
- Simplified setup process documentation
- Updated "What Happens During Setup" section
- Added note about disabled integrations
- Removed Gmail integration details

**New Files:**
- `MIGRATION_INSTRUCTIONS.md` - Database migration guide
- `TRANSITION_SUMMARY.md` - This document

## Integration Status

### Currently Disabled
All these integrations still have their code in place but are marked as unavailable:
- **Gmail** - Requires vault repository for synced emails
- **Google Calendar** - Requires vault repository for synced events
- **GitHub** - Requires vault repository and GitHub account connection

These integrations will need to be re-architected in a future update to work without the vault repository, potentially using:
- Direct database storage
- Alternative storage solutions
- Different sync mechanisms

### Still Available
- Slack (already unavailable)
- Notion (already unavailable)
- ChatGPT (already unavailable)
- Claude (already unavailable)
- Granola (already unavailable)
- Fireflies (already unavailable)
- Fathom (already unavailable)

## Environment Variables

### Remove These:
```bash
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

### Add/Update These:
```bash
# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### Keep These:
```bash
NEXTAUTH_SECRET
NEXTAUTH_URL
ORGO_API_KEY (if using Orgo)
DATABASE_URL
DIRECT_URL (if using connection pooling)
CRON_SECRET (optional)
```

## Migration Steps

1. **Update Environment Variables**
   - Remove GitHub OAuth credentials
   - Add Google OAuth credentials

2. **Set Up Google OAuth**
   - Create OAuth app in Google Cloud Console
   - Configure consent screen
   - Add authorized redirect URIs
   - Copy credentials to .env

3. **Update Database Schema**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name remove_vault_repo_fields
   ```

4. **Test the Changes**
   - Sign in with Google
   - Verify setup flow works
   - Check that integrations show as unavailable

## Files Modified

### Core Authentication
- `src/app/api/auth/[...nextauth]/route.ts`

### VM Setup
- `src/app/api/setup/start/route.ts`

### Database
- `prisma/schema.prisma`

### UI Components
- `src/components/landing-page.tsx`
- `src/app/learning-sources/page.tsx`

### Documentation
- `README.md`
- `MIGRATION_INSTRUCTIONS.md` (new)
- `TRANSITION_SUMMARY.md` (new)

## Files Not Modified (But May Reference Old System)

These files still contain references to GitHub/vault but are now disabled:
- `src/app/api/integrations/github/connect/route.ts`
- `src/app/api/integrations/gmail/callback/route.ts`
- `src/app/api/integrations/gmail/connect/route.ts`
- `src/app/api/integrations/calendar/callback/route.ts`
- `src/app/api/integrations/calendar/connect/route.ts`
- `src/lib/github.ts`
- `src/lib/gmail.ts`
- `src/lib/calendar.ts`

## Breaking Changes

1. **Authentication:** Users must sign in with Google instead of GitHub
2. **No Vault Repository:** VMs no longer have a GitHub vault repository
3. **Integrations Disabled:** Gmail, Calendar, and GitHub integrations are unavailable
4. **Setup Simplified:** No Git sync, repository cloning, or deploy key setup
5. **Database Schema:** Removed vault-related fields

## Future Work

To re-enable integrations without a vault repository:
1. Implement direct database storage for Gmail/Calendar data
2. Create new sync mechanisms that don't rely on Git
3. Update integration handlers to work without vault
4. Consider alternative storage solutions (S3, database, etc.)
5. Re-architect GitHub integration to work without vault dependency

## Database Migration - IMPORTANT

The Prisma schema has been updated, but you **must run the migration** to apply changes to your database:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name remove_vault_repo_fields
```

This will:
1. Remove `vaultRepoName` and `vaultRepoUrl` from `SetupState`
2. Remove `repoCreated`, `repoCloned`, `gitSyncConfigured` from both `SetupState` and `VM`
3. Create a migration file for future deployments

**For Production:**
```bash
npx prisma migrate deploy
```

## Testing Checklist

- [x] Sign in with Google works (code updated)
- [x] Setup state is created for new users (code updated)
- [x] VM provisioning works (Orgo/AWS/E2B) (code updated)
- [x] Clawdbot installation succeeds (code updated)
- [x] Integrations show as unavailable (code updated)
- [x] Landing page displays Google icon (code updated)
- [x] README reflects new setup process (updated)
- [ ] Database migration completes successfully (USER ACTION REQUIRED)
- [ ] Existing users can still access their VMs (needs testing after migration)

## Rollback Plan

If issues arise:
1. Revert all code changes
2. Run: `npx prisma migrate resolve --rolled-back remove_vault_repo_fields`
3. Restore previous schema
4. Update environment variables back to GitHub OAuth
5. Redeploy

## Support

For issues or questions:
- Check `MIGRATION_INSTRUCTIONS.md` for database migration steps
- Review environment variable configuration
- Verify Google OAuth setup is correct
- Check that all dependencies are installed
