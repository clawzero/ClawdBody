/**
 * Communication API
 * 
 * This demonstrates how to use the same OAuth tokens stored for data gathering
 * to also enable bidirectional communication (sending emails, creating calendar events, etc.)
 * 
 * The tokens are already stored in the Account table, so no additional setup is needed!
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GmailClient } from '@/lib/gmail'
import { CalendarClient } from '@/lib/calendar'

/**
 * Send an email
 * POST /api/integrations/communication/email
 * Body: { to, subject, body, cc?, bcc?, replyTo?, html? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    // Get Gmail account tokens from database (same tokens used for reading emails!)
    const gmailAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'gmail' },
    })

    if (!gmailAccount?.access_token) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect Gmail first in /learning-sources' },
        { status: 400 }
      )
    }

    // Create Gmail client with existing tokens
    const gmailClient = new GmailClient(
      gmailAccount.access_token,
      gmailAccount.refresh_token || undefined
    )

    // Handle different actions
    switch (action) {
      case 'send':
        if (!params.to || !params.subject || !params.body) {
          return NextResponse.json(
            { error: 'Missing required fields: to, subject, body' },
            { status: 400 }
          )
        }

        const messageId = await gmailClient.sendEmail(
          params.to,
          params.subject,
          params.body,
          {
            cc: params.cc,
            bcc: params.bcc,
            replyTo: params.replyTo,
            html: params.html || false,
          }
        )

        return NextResponse.json({
          success: true,
          messageId,
          message: 'Email sent successfully',
        })

      case 'reply':
        if (!params.messageId || !params.body) {
          return NextResponse.json(
            { error: 'Missing required fields: messageId, body' },
            { status: 400 }
          )
        }

        const replyMessageId = await gmailClient.replyToEmail(
          params.messageId,
          params.body,
          {
            html: params.html || false,
          }
        )

        return NextResponse.json({
          success: true,
          messageId: replyMessageId,
          message: 'Reply sent successfully',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "send" or "reply"' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Communication API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

/**
 * Calendar operations
 * POST /api/integrations/communication/calendar
 * Body: { action: 'create' | 'update' | 'delete', ...params }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    // Get Calendar account tokens from database (same tokens used for reading events!)
    const calendarAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'calendar' },
    })

    if (!calendarAccount?.access_token) {
      return NextResponse.json(
        { error: 'Calendar not connected. Please connect Calendar first in /learning-sources' },
        { status: 400 }
      )
    }

    // Create Calendar client with existing tokens
    const calendarClient = new CalendarClient(
      calendarAccount.access_token,
      calendarAccount.refresh_token || undefined
    )

    // Handle different actions
    switch (action) {
      case 'create':
        if (!params.summary || !params.start || !params.end) {
          return NextResponse.json(
            { error: 'Missing required fields: summary, start, end' },
            { status: 400 }
          )
        }

        const event = await calendarClient.createEvent(
          params.summary,
          params.start,
          params.end,
          {
            description: params.description,
            location: params.location,
            attendees: params.attendees,
            reminders: params.reminders,
            timeZone: params.timeZone,
          }
        )

        return NextResponse.json({
          success: true,
          event,
          message: 'Calendar event created successfully',
        })

      case 'update':
        if (!params.eventId) {
          return NextResponse.json(
            { error: 'Missing required field: eventId' },
            { status: 400 }
          )
        }

        const updatedEvent = await calendarClient.updateEvent(params.eventId, {
          summary: params.summary,
          start: params.start,
          end: params.end,
          description: params.description,
          location: params.location,
          attendees: params.attendees,
        })

        return NextResponse.json({
          success: true,
          event: updatedEvent,
          message: 'Calendar event updated successfully',
        })

      case 'delete':
        if (!params.eventId) {
          return NextResponse.json(
            { error: 'Missing required field: eventId' },
            { status: 400 }
          )
        }

        await calendarClient.deleteEvent(params.eventId)

        return NextResponse.json({
          success: true,
          message: 'Calendar event deleted successfully',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "create", "update", or "delete"' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform calendar operation' },
      { status: 500 }
    )
  }
}
