# Clawdbot Communication Integration

## Overview

Clawdbot can now use the existing OAuth integrations (Gmail, Calendar) to send messages, create calendar events, and more **without needing to set them up again**. The tokens are already stored in your database and are automatically used when Clawdbot makes communication requests.

## How It Works

1. **OAuth tokens are stored** in the database when you connect Gmail/Calendar in `/learning-sources`
2. **Clawdbot calls an API endpoint** from the VM to use these tokens
3. **No additional OAuth setup needed** - Clawdbot reuses the existing connections

## Setup

The setup is automatic! When Clawdbot is configured, it receives:
- API endpoint URL
- User ID
- Gateway token for authentication
- Helper script at `/home/user/clawd/send_communication.sh`

## Usage in Clawdbot

Clawdbot can use the communication features via the helper script or by calling the API directly.

### Sending Emails

```bash
/home/user/clawd/send_communication.sh send_email \
  --to "recipient@example.com" \
  --subject "Subject line" \
  --body "Email body text"
```

### Replying to Emails

```bash
/home/user/clawd/send_communication.sh reply_email \
  --message-id "MESSAGE_ID" \
  --body "Reply message"
```

### Creating Calendar Events

```bash
/home/user/clawd/send_communication.sh create_event \
  --summary "Meeting Title" \
  --start "2024-01-15T10:00:00Z" \
  --end "2024-01-15T11:00:00Z" \
  --description "Meeting description" \
  --location "Conference Room A" \
  --attendees "colleague@example.com"
```

### Updating Calendar Events

```bash
/home/user/clawd/send_communication.sh update_event \
  --event-id "EVENT_ID" \
  --summary "Updated Title" \
  --description "Updated description"
```

### Deleting Calendar Events

```bash
/home/user/clawd/send_communication.sh delete_event \
  --event-id "EVENT_ID"
```

## API Endpoint

The API endpoint is available at:
```
POST /api/integrations/clawdbot-communication
```

**Authentication:** Uses the Clawdbot gateway token

**Request Body:**
```json
{
  "action": "send_email" | "reply_email" | "create_event" | "update_event" | "delete_event",
  "gatewayToken": "gateway-token-from-config",
  "userId": "user-id",
  ...action-specific-params
}
```

## Environment Variables

The following environment variables are set on the VM for Clawdbot:
- `SAMANTHA_API_URL` - Base URL of the API
- `SAMANTHA_USER_ID` - User ID for API calls
- `SAMANTHA_GATEWAY_TOKEN` - Gateway token for authentication

## How Clawdbot Uses It

Clawdbot is configured with instructions in `CLAUDE.md` that tell it about these communication capabilities. When a user asks Clawdbot to:
- "Send an email to..."
- "Schedule a meeting..."
- "Reply to that email..."

Clawdbot will automatically use the helper script or make API calls to perform these actions using the existing OAuth tokens.

## Security

- Gateway token is used for authentication
- Tokens are stored securely in the database
- OAuth tokens are automatically refreshed when needed
- All communication actions are logged

## Troubleshooting

If Clawdbot can't send emails or create calendar events:

1. **Check if integrations are connected:**
   - Go to `/learning-sources`
   - Verify Gmail/Calendar show as "Connected"

2. **Check the helper script:**
   ```bash
   ls -la /home/user/clawd/send_communication.sh
   chmod +x /home/user/clawd/send_communication.sh  # If needed
   ```

3. **Test the API manually:**
   ```bash
   /home/user/clawd/send_communication.sh send_email \
     --to "test@example.com" \
     --subject "Test" \
     --body "Test message"
   ```

4. **Check environment variables:**
   ```bash
   echo $SAMANTHA_API_URL
   echo $SAMANTHA_USER_ID
   ```

## Future Enhancements

- Slack integration (when implemented)
- GitHub issue/PR creation
- Notion page creation
- More communication channels
