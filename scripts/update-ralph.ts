#!/usr/bin/env ts-node
/**
 * Script to update Ralph Wiggum on the Orgo VM
 * Downloads latest from Gist, installs Pillow, and restarts Ralph
 */

import { PrismaClient } from '@prisma/client'
import { OrgoClient } from '../src/lib/orgo'

const prisma = new PrismaClient()
const RALPH_GIST_URL = 'https://gist.githubusercontent.com/Prakshal-Jain/660d4b056a0f2554a663a171fda40c9f/raw/9840198380b8d0bae3b7397caf6519be3644b45c/ralph_wiggum.py'

async function main() {
  try {
    // Get the latest setup state (you might want to add userId filtering)
    const setupStates = await prisma.setupState.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    if (setupStates.length === 0) {
      process.exit(1)
    }

    const setupState = setupStates[0]
    
    if (!setupState.orgoComputerId) {
      process.exit(1)
    }

    const orgoApiKey = process.env.ORGO_API_KEY
    if (!orgoApiKey) {
      process.exit(1)
    }

    const orgoClient = new OrgoClient(orgoApiKey)
    const computerId = setupState.orgoComputerId

    // Step 1: Install Pillow
    const pillowResult = await orgoClient.bash(
      computerId,
      'pip3 install Pillow --break-system-packages'
    )
    if (pillowResult.exit_code !== 0) {
    }

    // Step 2: Stop any running Ralph processes
    const stopResult = await orgoClient.bash(
      computerId,
      'killall -9 python3 2>/dev/null; rm -f /tmp/ralph_task.lock; echo "Stopped"'
    )

    // Step 3: Download updated Ralph script
    const downloadResult = await orgoClient.bash(
      computerId,
      `curl -fsSL "${RALPH_GIST_URL}" -o ~/ralph_wiggum.py && chmod +x ~/ralph_wiggum.py && head -5 ~/ralph_wiggum.py`
    )
    if (downloadResult.exit_code !== 0) {
      throw new Error('Failed to download Ralph script')
    }

    // Step 4: Verify Pillow is available
    const verifyPillow = await orgoClient.bash(
      computerId,
      'python3 -c "import PIL; print(\'Pillow OK\')"'
    )

    // Step 5: Restart Ralph
    const startResult = await orgoClient.bash(
      computerId,
      '(bash -c "~/start-ralph.sh >/dev/null 2>&1 &") && sleep 2 && echo "Ralph started"'
    )

    // Step 6: Check if Ralph is running
    const checkResult = await orgoClient.bash(
      computerId,
      'ps aux | grep -E "[r]alph_wiggum.py" && echo "✓ Ralph is running" || echo "✗ Ralph not found in process list"'
    )

  } catch (error) {
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

