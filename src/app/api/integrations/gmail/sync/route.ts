import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GitHubClient } from '@/lib/github'
import { GmailClient } from '@/lib/gmail'

/**
 * Sync Gmail messages for all users with Gmail connected
 * This endpoint can be called by a cron job every 12 hours
 */
export async function POST(request: NextRequest) {
  try {
    // Gmail sync is currently unavailable without vault repository
    return NextResponse.json(
      { error: 'Gmail sync is temporarily unavailable. Please check back later.' },
      { status: 503 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync Gmail' },
      { status: 500 }
    )
  }
}
