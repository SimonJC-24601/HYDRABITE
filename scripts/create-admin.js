const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...')

    // Default admin credentials
    const adminEmail = 'admin@viralclipfinder.com'
    const adminPassword = 'admin123456'
    const adminName = 'System Administrator'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      // Update existing user to admin role
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      })
      console.log('✅ Existing user updated to admin role!')
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'ADMIN',
          subscriptionTier: 'AGENCY',
          minutesUsed: 0,
          minutesLimit: 9999
        }
      })
      console.log('✅ Admin user created successfully!')
    }

    console.log('\n📋 Admin Login Credentials:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('\n🌐 Access admin panel at: /admin/login')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()