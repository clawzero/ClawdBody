# Bidirectional Communication Setup

## Overview

Yes! The same OAuth setup used for gathering data from Gmail, Calendar, and other sources can be **reused for communication** without needing to do the setup again. The tokens are already stored in your database and can be used for both reading and writing.

## What Changed

### 1. Updated OAuth Scopes

The OAuth scopes have been updated to include write permissions:

**Gmail:**
- ✅ `gmail.readonly` (existing - for reading emails)
- ✅ `gmail.send` (new - for sending emails)
- ✅ `gmail.compose` (new - for composing emails)

**Calendar:**
- ✅ `calendar.readonly` (existing - for reading events)
- ✅ `calendar.events` (new - for creating/updating/deleting events)

### 2. New Communication Methods

**GmailClient** now supports:
- `sendEmail()` - Send new emails
- `replyToEmail()` - Reply to existing emails

**CalendarClient** now supports:
- `createEvent()` - Create calendar events
- `updateEvent()` - Update existing events
- `deleteEvent()` - Delete events

### 3. Example API Route

A new API route at `/api/integrations/communication` demonstrates how to use these features.

## Important Notes

### For Existing Users

If you've already connected Gmail or Calendar with the old read-only scopes, you'll need to **re-authenticate** to get the new write permissions:

1. Go to `/learning-sources`
2. Disconnect the integration (if possible) or just click "Connect" again
3. Re-authorize with the new scopes
4. Your tokens will be updated in the database

### For New Users

New connections will automatically include both read and write permissions - no additional setup needed!

## Usage Examples

### Sending an Email

```typescript
// Using the API route
const response = await fetch('/api/integrations/communication', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'send',
    to: 'recipient@example.com',
    subject: 'Hello from Cloudbot',
    body: 'This email was sent automatically!',
    html: false, // optional
  }),
})
```

### Creating a Calendar Event

```typescript
// Using the API route
const response = await fetch('/api/integrations/communication', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    summary: 'Team Meeting',
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T11:00:00Z',
    description: 'Discussing project updates',
    location: 'Conference Room A',
    attendees: ['colleague@example.com'],
    reminders: [
      { method: 'email', minutes: 15 },
      { method: 'popup', minutes: 5 },
    ],
  }),
})
```

### Using the Client Classes Directly

```typescript
import { GmailClient } from '@/lib/gmail'
import { CalendarClient } from '@/lib/calendar'
import { prisma } from '@/lib/prisma'

// Get tokens from database
const gmailAccount = await prisma.account.findFirst({
  where: { userId: userId, provider: 'gmail' },
})

// Create client with existing tokens
const gmailClient = new GmailClient(
  gmailAccount.access_token,
  gmailAccount.refresh_token
)

// Send email
await gmailClient.sendEmail(
  'recipient@example.com',
  'Subject',
  'Body text'
)

// Create calendar event
const calendarAccount = await prisma.account.findFirst({
  where: { userId: userId, provider: 'calendar' },
})

const calendarClient = new CalendarClient(
  calendarAccount.access_token,
  calendarAccount.refresh_token
)

await calendarClient.createEvent(
  'Meeting Title',
  new Date('2024-01-15T10:00:00Z'),
  new Date('2024-01-15T11:00:00Z'),
  {
    description: 'Meeting description',
    location: 'Location',
    attendees: ['attendee@example.com'],
  }
)
```

## How It Works

1. **Token Storage**: OAuth tokens are stored in the `Account` table in your database
2. **Token Reuse**: The same tokens used for reading data can be used for writing
3. **Automatic Refresh**: The OAuth2 clients automatically refresh expired tokens
4. **No Additional Setup**: Once connected, communication features work immediately

## Future Integrations

The same pattern can be applied to other integrations:

- **Slack**: Add `chat:write` scope to send messages
- **GitHub**: Already has write access for repos, can add issue/PR creation
- **Notion**: Add write permissions when implemented

## Security Considerations

- Tokens are stored securely in your database
- OAuth tokens are scoped to specific permissions
- Users must explicitly authorize write permissions
- All communication actions are logged (can be extended with audit logging)
