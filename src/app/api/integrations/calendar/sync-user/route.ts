import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GitHubClient } from '@/lib/github'
import { CalendarClient } from '@/lib/calendar'

/**
 * Sync Calendar events for the current user
 * This endpoint is called when user clicks "Resync" button
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
