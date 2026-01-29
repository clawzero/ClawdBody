import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrgoClient } from '@/lib/orgo'
import { decrypt } from '@/lib/encryption'

/**
 * POST /api/setup/orgo/delete-api-key - Delete the Orgo API key
 * This will:
 * 1. Delete all Orgo VMs from ClawdBody (not from Orgo itself)
 * 2. Clear the Orgo API key and related fields from the setup state
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current setup state to verify we have an API key
    const setupState = await prisma.setupState.findUnique({
      where: { userId: session.user.id },
      select: { 
        orgoApiKey: true,
        orgoComputerId: true,
      },
    })

    if (!setupState?.orgoApiKey) {
      return NextResponse.json({ error: 'No Orgo API key found' }, { status: 400 })
    }

    // Optionally, try to delete the computer from Orgo if one exists in the setup state
    // (This is the legacy single-computer setup)
    if (setupState.orgoComputerId) {
      try {
        const orgoClient = new OrgoClient(decrypt(setupState.orgoApiKey))
        await orgoClient.deleteComputer(setupState.orgoComputerId)
      } catch (error) {
        // Ignore errors - computer might already be deleted or not exist
        console.warn('Failed to delete Orgo computer from API:', error)
      }
    }

    // Delete all Orgo VMs from our database for this user
    // Note: This only removes them from ClawdBody, not from the user's Orgo account
    const deletedVMs = await prisma.vM.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'orgo',
      },
    })

    // Clear the Orgo API key and related fields from setup state
    await prisma.setupState.update({
      where: { userId: session.user.id },
      data: {
        orgoApiKey: null,
        orgoProjectId: null,
        orgoProjectName: null,
        orgoComputerId: null,
        orgoComputerUrl: null,
        // Reset VM-related flags if the provider was Orgo
        vmCreated: false,
        clawdbotInstalled: false,
        telegramConfigured: false,
        gatewayStarted: false,
        vmProvider: null,
        vmStatus: null,
        status: 'pending',
      },
    })

    return NextResponse.json({ 
      success: true, 
      deletedVMs: deletedVMs.count,
      message: `Orgo API key deleted. ${deletedVMs.count} VM(s) removed from ClawdBody.`
    })
  } catch (error) {
    console.error('Failed to delete Orgo API key:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete Orgo API key' },
      { status: 500 }
    )
  }
}
