/**
 * One-time Migration Script: claudeApiKey -> llmApiKey
 * 
 * Run this BEFORE pushing schema changes to migrate existing data.
 * 
 * Usage: 
 *   npx tsx scripts/migrate-claude-key.ts
 * 
 * Make sure your .env has the production POSTGRES_PRISMA_URL set!
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  console.log('🔄 Starting claudeApiKey -> llmApiKey migration...\n')

  try {
    // Step 1: Check if claudeApiKey column exists
    const columnCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'SetupState' 
        AND column_name = 'claudeApiKey'
      ) as exists
    `

    const claudeKeyExists = columnCheck[0]?.exists === true
    console.log(`📋 claudeApiKey column exists: ${claudeKeyExists}`)

    if (!claudeKeyExists) {
      console.log('\n✅ No migration needed - claudeApiKey column not found.')
      console.log('   The database is already using the new schema.')
      return
    }

    // Step 2: Check how many records need migration
    const recordsToMigrate = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "SetupState" 
      WHERE "claudeApiKey" IS NOT NULL
    `
    const count = Number(recordsToMigrate[0]?.count || 0)
    console.log(`📊 Records with claudeApiKey to migrate: ${count}`)

    if (count === 0) {
      console.log('\n✅ No data to migrate - all records already use new schema.')
      return
    }

    // Step 3: Add new columns if they don't exist
    console.log('\n📦 Ensuring new columns exist...')
    
    const llmApiKeyExists = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'SetupState' AND column_name = 'llmApiKey'
      ) as exists
    `
    
    if (!llmApiKeyExists[0]?.exists) {
      console.log('   Adding llmApiKey column...')
      await prisma.$executeRaw`ALTER TABLE "SetupState" ADD COLUMN "llmApiKey" TEXT`
    }

    const llmProviderExists = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'SetupState' AND column_name = 'llmProvider'
      ) as exists
    `
    
    if (!llmProviderExists[0]?.exists) {
      console.log('   Adding llmProvider column...')
      await prisma.$executeRaw`ALTER TABLE "SetupState" ADD COLUMN "llmProvider" TEXT`
    }

    const llmModelExists = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'SetupState' AND column_name = 'llmModel'
      ) as exists
    `
    
    if (!llmModelExists[0]?.exists) {
      console.log('   Adding llmModel column...')
      await prisma.$executeRaw`ALTER TABLE "SetupState" ADD COLUMN "llmModel" TEXT`
    }

    // Step 4: Migrate the data
    console.log('\n🔄 Migrating data...')
    
    const migrated = await prisma.$executeRaw`
      UPDATE "SetupState" 
      SET 
        "llmApiKey" = "claudeApiKey",
        "llmProvider" = 'anthropic',
        "llmModel" = 'anthropic/claude-sonnet-4-5'
      WHERE "claudeApiKey" IS NOT NULL
    `
    
    console.log(`   ✅ Migrated ${migrated} records`)

    // Step 5: Verify migration
    console.log('\n🔍 Verifying migration...')
    
    const verification = await prisma.$queryRaw<{ total: bigint, migrated: bigint }[]>`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "llmApiKey" IS NOT NULL THEN 1 END) as migrated
      FROM "SetupState"
      WHERE "claudeApiKey" IS NOT NULL
    `
    
    const total = Number(verification[0]?.total || 0)
    const migratedCount = Number(verification[0]?.migrated || 0)
    
    console.log(`   Total records with claudeApiKey: ${total}`)
    console.log(`   Records now with llmApiKey: ${migratedCount}`)

    if (total === migratedCount) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('\n📝 Next steps:')
      console.log('   1. Push your code changes')
      console.log('   2. Run `prisma db push` to sync the schema (this will drop claudeApiKey column)')
      console.log('   3. Your app will work with the new llmApiKey field')
    } else {
      console.log('\n⚠️  Warning: Some records may not have been migrated')
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
