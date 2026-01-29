const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSignups() {
  try {
    const totalUsers = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

  } catch (error) {
  } finally {
    await prisma.$disconnect()
  }
}

checkSignups()
