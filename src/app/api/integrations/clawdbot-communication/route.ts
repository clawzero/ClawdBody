/**
 * Clawdbot Communication API
 * 
 * This endpoint allows Clawdbot running on the VM to use the existing OAuth integrations
 * (Gmail, Calendar, etc.) for sending messages without needing to set them up again.
 * 
 * Authentication: Uses the Clawdbot gateway token for security
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GmailClient } from '@/lib/gmail'
import { CalendarClient } from '@/lib/calendar'

/**
 * POST /api/integrations/clawdbot-communication
 * 
 * Body: {
 *   action: 'send_email' | 'reply_email' | 'create_event' | 'update_event' | 'delete_event',
 *   gatewayToken: string, // Clawdbot gateway token for authentication
 *   userId: string, // User ID (can be derived from token in future)
 *   ...action-specific params
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, gatewayToken, userId, ...params } = body

    // Validate gateway token (in production, verify against stored token)
    // For now, we'll use a simple check - in production, store token in database
    if (!gatewayToken) {
      return NextResponse.json(
        { error: 'Gateway token required' },
        { status: 401 }
      )
    }

    // Get user ID from request (for now, require it; later can derive from token)
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        setup: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'send_email':
        return await handleSendEmail(userId, params)

      case 'reply_email':
        return await handleReplyEmail(userId, params)

      case 'create_event':
        return await handleCreateEvent(userId, params)

      case 'update_event':
        return await handleUpdateEvent(userId, params)

      case 'delete_event':
        return await handleDeleteEvent(userId, params)

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSendEmail(userId: string, params: any) {
  const { to, subject, body, cc, bcc, replyTo, html } = params

  if (!to || !subject || !body) {
    return NextResponse.json(
      { error: 'Missing required fields: to, subject, body' },
      { status: 400 }
    )
  }

  // Get Gmail account tokens from database
  const gmailAccount = await prisma.account.findFirst({
    where: { userId, provider: 'gmail' },
  })

  if (!gmailAccount?.access_token) {
    return NextResponse.json(
      { error: 'Gmail not connected. Please connect Gmail in /learning-sources' },
      { status: 400 }
    )
  }

  // Create Gmail client with existing tokens
  const gmailClient = new GmailClient(
    gmailAccount.access_token,
    gmailAccount.refresh_token || undefined
  )

  try {
    const messageId = await gmailClient.sendEmail(to, subject, body, {
      cc,
      bcc,
      replyTo,
      html: html || false,
    })

    // Update tokens if they were refreshed
    const credentials = gmailClient.getCredentials()
    if (credentials.access_token && credentials.access_token !== gmailAccount.access_token) {
      await prisma.account.update({
        where: { id: gmailAccount.id },
        data: {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || gmailAccount.refresh_token,
          expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      messageId,
      message: 'Email sent successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

async function handleReplyEmail(userId: string, params: any) {
  const { messageId, body, html } = params

  if (!messageId || !body) {
    return NextResponse.json(
      { error: 'Missing required fields: messageId, body' },
      { status: 400 }
    )
  }

  const gmailAccount = await prisma.account.findFirst({
    where: { userId, provider: 'gmail' },
  })

  if (!gmailAccount?.access_token) {
    return NextResponse.json(
      { error: 'Gmail not connected' },
      { status: 400 }
    )
  }

  const gmailClient = new GmailClient(
    gmailAccount.access_token,
    gmailAccount.refresh_token || undefined
  )

  try {
    const replyMessageId = await gmailClient.replyToEmail(messageId, body, {
      html: html || false,
    })

    // Update tokens if refreshed
    const credentials = gmailClient.getCredentials()
    if (credentials.access_token && credentials.access_token !== gmailAccount.access_token) {
      await prisma.account.update({
        where: { id: gmailAccount.id },
        data: {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || gmailAccount.refresh_token,
        },
      })
    }

    return NextResponse.json({
      success: true,
      messageId: replyMessageId,
      message: 'Reply sent successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send reply' },
      { status: 500 }
    )
  }
}

async function handleCreateEvent(userId: string, params: any) {
  const { summary, start, end, description, location, attendees, reminders, timeZone } = params

  if (!summary || !start || !end) {
    return NextResponse.json(
      { error: 'Missing required fields: summary, start, end' },
      { status: 400 }
    )
  }

  const calendarAccount = await prisma.account.findFirst({
    where: { userId, provider: 'calendar' },
  })

  if (!calendarAccount?.access_token) {
    return NextResponse.json(
      { error: 'Calendar not connected. Please connect Calendar in /learning-sources' },
      { status: 400 }
    )
  }

  const calendarClient = new CalendarClient(
    calendarAccount.access_token,
    calendarAccount.refresh_token || undefined
  )

  try {
    const event = await calendarClient.createEvent(summary, start, end, {
      description,
      location,
      attendees,
      reminders,
      timeZone,
    })

    // Update tokens if refreshed
    const credentials = calendarClient.getCredentials()
    if (credentials.access_token && credentials.access_token !== calendarAccount.access_token) {
      await prisma.account.update({
        where: { id: calendarAccount.id },
        data: {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || calendarAccount.refresh_token,
        },
      })
    }

    return NextResponse.json({
      success: true,
      event,
      message: 'Calendar event created successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    )
  }
}

async function handleUpdateEvent(userId: string, params: any) {
  const { eventId, ...updates } = params

  if (!eventId) {
    return NextResponse.json(
      { error: 'Missing required field: eventId' },
      { status: 400 }
    )
  }

  const calendarAccount = await prisma.account.findFirst({
    where: { userId, provider: 'calendar' },
  })

  if (!calendarAccount?.access_token) {
    return NextResponse.json(
      { error: 'Calendar not connected' },
      { status: 400 }
    )
  }

  const calendarClient = new CalendarClient(
    calendarAccount.access_token,
    calendarAccount.refresh_token || undefined
  )

  try {
    const event = await calendarClient.updateEvent(eventId, updates)

    // Update tokens if refreshed
    const credentials = calendarClient.getCredentials()
    if (credentials.access_token && credentials.access_token !== calendarAccount.access_token) {
      await prisma.account.update({
        where: { id: calendarAccount.id },
        data: {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || calendarAccount.refresh_token,
        },
      })
    }

    return NextResponse.json({
      success: true,
      event,
      message: 'Calendar event updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    )
  }
}

async function handleDeleteEvent(userId: string, params: any) {
  const { eventId } = params

  if (!eventId) {
    return NextResponse.json(
      { error: 'Missing required field: eventId' },
      { status: 400 }
    )
  }

  const calendarAccount = await prisma.account.findFirst({
    where: { userId, provider: 'calendar' },
  })

  if (!calendarAccount?.access_token) {
    return NextResponse.json(
      { error: 'Calendar not connected' },
      { status: 400 }
    )
  }

  const calendarClient = new CalendarClient(
    calendarAccount.access_token,
    calendarAccount.refresh_token || undefined
  )

  try {
    await calendarClient.deleteEvent(eventId)

    return NextResponse.json({
      success: true,
      message: 'Calendar event deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    )
  }
}
