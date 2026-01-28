import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GitHubClient } from '@/lib/github'
import { GmailClient, getGmailTokens } from '@/lib/gmail'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/learning-sources?error=gmail_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/learning-sources?error=no_code', request.url))
    }

    // Exchange code for tokens
    const tokens = await getGmailTokens(code)

    // Store Gmail account in database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'gmail',
          providerAccountId: session.user.email || session.user.id,
        },
      },
      create: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'gmail',
        providerAccountId: session.user.email || session.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose',
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
      },
    })

    // Gmail integration is currently unavailable without vault repository
    // Just mark as pending for now
    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'gmail',
        },
      },
      create: {
        userId: session.user.id,
        provider: 'gmail',
        status: 'pending',
        lastSyncedAt: new Date(),
        syncEnabled: false,
      },
      update: {
        status: 'pending',
        lastSyncedAt: new Date(),
        syncEnabled: false,
      },
    })

    return NextResponse.redirect(new URL('/learning-sources?gmail_connected=true', request.url))

  } catch (error: any) {
    console.error('Gmail callback error:', error)
    return NextResponse.redirect(new URL('/learning-sources?error=gmail_callback_failed', request.url))
  }
}

