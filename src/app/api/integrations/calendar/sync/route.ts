import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GitHubClient } from '@/lib/github'
import { CalendarClient } from '@/lib/calendar'

/**
 * Sync Calendar events for all users with Calendar connected
 * This endpoint can be called by a cron job every 12 hours
 */
export async function POST(request: NextRequest) {
  try {
    // Calendar sync is currently unavailable without vault repository
    return NextResponse.json(
      { error: 'Calendar sync is temporarily unavailable. Please check back later.' },
      { status: 503 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync Calendar' },
      { status: 500 }
    )
  }
}
