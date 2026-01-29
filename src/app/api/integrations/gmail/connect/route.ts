import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GitHubClient } from '@/lib/github'
import { GmailClient, getGmailAuthUrl, getGmailTokens } from '@/lib/gmail'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Gmail integration is currently unavailable without vault repository
    return NextResponse.json(
      { error: 'Gmail integration is temporarily unavailable. Please check back later.' },
      { status: 503 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to connect Gmail' },
      { status: 500 }
    )
  }
}

