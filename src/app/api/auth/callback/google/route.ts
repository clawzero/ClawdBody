import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GitHubClient } from '@/lib/github'
import { GmailClient, getGmailTokens } from '@/lib/gmail'
import { CalendarClient, getCalendarTokens } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const scope = searchParams.get('scope') || ''

    if (error) {
      // Determine which service failed based on scope
      const isCalendar = scope.includes('calendar')
      const service = isCalendar ? 'calendar' : 'gmail'
      return NextResponse.redirect(new URL(`/learning-sources?error=${service}_auth_failed`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/learning-sources?error=no_code', request.url))
    }

    // Check if this is a Calendar or Gmail connection based on scope
    const isCalendar = scope.includes('calendar.readonly') || scope.includes('calendar')
    
    // Route to appropriate handler
    if (isCalendar) {
      return handleCalendarCallback(request, session.user.id, code)
    } else {
      return handleGmailCallback(request, session.user.id, code)
    }

  } catch (error: any) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(new URL('/learning-sources?error=callback_failed', request.url))
  }
}

async function handleCalendarCallback(request: NextRequest, userId: string, code: string) {
  try {
    // Exchange code for tokens
    const tokens = await getCalendarTokens(code)

    // Store Calendar account in database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'calendar',
          providerAccountId: userId,
        },
      },
      create: {
        userId: userId,
        type: 'oauth',
        provider: 'calendar',
        providerAccountId: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
      },
    })

    // Calendar integration is currently unavailable without vault repo
    // Just store the tokens for future use
    try {
      const calendarClient = new CalendarClient(
        tokens.access_token,
        tokens.refresh_token
      )

      const calendarEmail = await calendarClient.getUserCalendarEmail()

      // Create or update Integration record
      await prisma.integration.upsert({
        where: {
          userId_provider: {
            userId: userId,
            provider: 'calendar',
          },
        },
        create: {
          userId: userId,
          provider: 'calendar',
          status: 'pending',
          lastSyncedAt: new Date(),
          syncEnabled: false,
          metadata: JSON.stringify({ email: calendarEmail }),
        },
        update: {
          status: 'pending',
          lastSyncedAt: new Date(),
          syncEnabled: false,
          metadata: JSON.stringify({ email: calendarEmail }),
        },
      })

      return NextResponse.redirect(new URL('/learning-sources?calendar_connected=true', request.url))
    } catch (error: any) {
      console.error('Calendar connection error:', error)
      return NextResponse.redirect(new URL('/learning-sources?error=calendar_connection_failed', request.url))
    }
  } catch (error: any) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(new URL('/learning-sources?error=calendar_callback_failed', request.url))
  }
}

async function handleGmailCallback(request: NextRequest, userId: string, code: string) {
  try {
    // Exchange code for tokens
    const tokens = await getGmailTokens(code)

    // Get user to find email
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    // Store Gmail account in database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'gmail',
          providerAccountId: user?.email || userId,
        },
      },
      create: {
        userId: userId,
        type: 'oauth',
        provider: 'gmail',
        providerAccountId: user?.email || userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
      },
    })

    // Gmail integration is currently unavailable without vault repo
    // Just store the tokens for future use
    try {
      const gmailClient = new GmailClient(
        tokens.access_token,
        tokens.refresh_token
      )

      // Get user's email address
      const userEmail = await gmailClient.getUserEmail()

      // Create or update Integration record
      await prisma.integration.upsert({
        where: {
          userId_provider: {
            userId: userId,
            provider: 'gmail',
          },
        },
        create: {
          userId: userId,
          provider: 'gmail',
          status: 'pending',
          lastSyncedAt: new Date(),
          syncEnabled: false,
          metadata: JSON.stringify({ email: userEmail }),
        },
        update: {
          status: 'pending',
          lastSyncedAt: new Date(),
          syncEnabled: false,
          metadata: JSON.stringify({ email: userEmail }),
        },
      })

      return NextResponse.redirect(new URL('/learning-sources?gmail_connected=true', request.url))
    } catch (error: any) {
      console.error('Gmail connection error:', error)
      return NextResponse.redirect(new URL('/learning-sources?error=gmail_connection_failed', request.url))
    }
  } catch (error: any) {
    console.error('Gmail callback error:', error)
    return NextResponse.redirect(new URL('/learning-sources?error=gmail_callback_failed', request.url))
  }
}

