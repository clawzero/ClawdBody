import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GitHubClient } from '@/lib/github'
import { GmailClient } from '@/lib/gmail'

/**
 * Sync Gmail messages for the current user
 * This endpoint is called when user clicks "Resync" button
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
