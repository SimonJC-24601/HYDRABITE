import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle database errors
export function handleDatabaseError(error: any): { error: string; status: number } {
  console.error('Database error:', error)
  
  if (error.code === 'P2002') {
    return { error: 'A record with this information already exists', status: 409 }
  }
  
  if (error.code === 'P2025') {
    return { error: 'Record not found', status: 404 }
  }
  
  return { error: 'Database operation failed', status: 500 }
}
