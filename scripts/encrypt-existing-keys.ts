/**
 * Migration script to encrypt existing unencrypted keys in the database
 * 
 * Usage:
 * 1. Set ENCRYPTION_KEY environment variable (or use a .env file)
 * 2. Run: npx tsx scripts/encrypt-existing-keys.ts
 * 
 * This script will:
 * - Find all SetupState records with unencrypted sensitive fields
 * - Find all VM records with unencrypted awsPrivateKey
 * - Encrypt those fields and update the records
 * 
 * The script is idempotent - already encrypted values will be skipped.
 */

import { PrismaClient } from '@prisma/client'
import { 
  encrypt, 
  isEncrypted,
  encryptUserData,
  isUserDataEncrypted,
  generateEncryptionKey,
  SETUP_STATE_SENSITIVE_FIELDS,
  VM_SENSITIVE_FIELDS,
  USER_SENSITIVE_FIELDS,
} from '../src/lib/encryption'

const prisma = new PrismaClient()

async function main() {
  // Check if encryption keys are set
  const nodeEnv = process.env.NODE_ENV as string
  
  if (!process.env.ENCRYPTION_KEY && nodeEnv !== 'development') {
    if (nodeEnv !== 'development') {
      process.exit(1)
    }
  }
  
  if (!process.env.USER_DATA_ENCRYPTION_KEY && nodeEnv !== 'development') {
    if (nodeEnv !== 'development') {
      process.exit(1)
    }
  }
  
  // Process SetupState records
  const setupStates = await prisma.setupState.findMany()
  let setupStateUpdated = 0
  let setupStateSkipped = 0
  
  for (const state of setupStates) {
    const updates: Record<string, string> = {}
    let hasUpdates = false
    
    for (const field of SETUP_STATE_SENSITIVE_FIELDS) {
      const value = state[field as keyof typeof state] as string | null
      
      if (value && !isEncrypted(value)) {
        updates[field] = encrypt(value)
        hasUpdates = true
      }
    }
    
    if (hasUpdates) {
      await prisma.setupState.update({
        where: { id: state.id },
        data: updates,
      })
      setupStateUpdated++
    } else {
      setupStateSkipped++
    }
  }
  
  // Process VM records
  const vms = await prisma.vM.findMany()
  let vmUpdated = 0
  let vmSkipped = 0
  
  for (const vm of vms) {
    const updates: Record<string, string> = {}
    let hasUpdates = false
    
    for (const field of VM_SENSITIVE_FIELDS) {
      const value = vm[field as keyof typeof vm] as string | null
      
      if (value && !isEncrypted(value)) {
        updates[field] = encrypt(value)
        hasUpdates = true
      }
    }
    
    if (hasUpdates) {
      await prisma.vM.update({
        where: { id: vm.id },
        data: updates,
      })
      vmUpdated++
    } else {
      vmSkipped++
    }
  }
  
  // Process User records (emails)
  const users = await prisma.user.findMany()
  let userUpdated = 0
  let userSkipped = 0
  
  for (const user of users) {
    if (user.email && !isUserDataEncrypted(user.email)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: encryptUserData(user.email) },
      })
      userUpdated++
    } else {
      userSkipped++
    }
  }
}

main()
  .catch((error) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
