import { PrismaClient } from '@prisma/client'
import type { User } from '@/types/auth'

const prisma = new PrismaClient()

export interface SubscriptionTier {
  name: 'STARTER' | 'PRO' | 'AGENCY'
  displayName: string
  price: number
  minutesLimit: number
  features: string[]
  maxTeamMembers: number
  priority: boolean
  apiAccess: boolean
  customBranding: boolean
  dedicatedSupport: boolean
}

export interface UsageStats {
  minutesUsed: number
  minutesRemaining: number
  percentageUsed: number
  resetDate: Date
  isOverLimit: boolean
}

export interface BillingInfo {
  currentTier: SubscriptionTier
  nextBillingDate: Date
  amount: number
  currency: string
  paymentMethod?: string
  invoiceHistory: Invoice[]
}

export interface Invoice {
  id: string
  date: Date
  amount: number
  status: 'paid' | 'pending' | 'failed'
  downloadUrl?: string
}

export interface UpgradeQuote {
  fromTier: SubscriptionTier
  toTier: SubscriptionTier
  proratedAmount: number
  nextBillingAmount: number
  effectiveDate: Date
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  STARTER: {
    name: 'STARTER',
    displayName: 'Starter',
    price: 49,
    minutesLimit: 120,
    features: [
      '120 minutes of processing',
      'Standard processing speed',
      'Basic caption styling',
      'Email support'
    ],
    maxTeamMembers: 1,
    priority: false,
    apiAccess: false,
    customBranding: false,
    dedicatedSupport: false
  },
  PRO: {
    name: 'PRO',
    displayName: 'Pro',
    price: 149,
    minutesLimit: 400,
    features: [
      '400 minutes of processing',
      'Priority processing queue',
      'Custom caption branding',
      'Team access (up to 3 users)',
      'Priority support'
    ],
    maxTeamMembers: 3,
    priority: true,
    apiAccess: false,
    customBranding: true,
    dedicatedSupport: false
  },
  AGENCY: {
    name: 'AGENCY',
    displayName: 'Agency',
    price: 399,
    minutesLimit: 1500,
    features: [
      '1,500 minutes of processing',
      'API access',
      'Dedicated support',
      'Team access (up to 10 users)',
      'White-label options',
      'Priority processing',
      'Custom branding'
    ],
    maxTeamMembers: 10,
    priority: true,
    apiAccess: true,
    customBranding: true,
    dedicatedSupport: true
  }
}

export class SubscriptionService {
  static getTierInfo(tierName: User['subscriptionTier']): SubscriptionTier {
    return SUBSCRIPTION_TIERS[tierName] || SUBSCRIPTION_TIERS.STARTER
  }

  static async getUserUsageStats(userId: string): Promise<UsageStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        minutesUsed: true,
        minutesLimit: true,
        subscriptionTier: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const tier = this.getTierInfo(user.subscriptionTier)
    const minutesRemaining = Math.max(0, user.minutesLimit - user.minutesUsed)
    const percentageUsed = (user.minutesUsed / user.minutesLimit) * 100
    const isOverLimit = user.minutesUsed >= user.minutesLimit

    // Calculate reset date (first day of next month)
    const now = new Date()
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return {
      minutesUsed: user.minutesUsed,
      minutesRemaining,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      resetDate,
      isOverLimit
    }
  }

  static async canProcessMinutes(userId: string, minutesToAdd: number): Promise<boolean> {
    const stats = await this.getUserUsageStats(userId)
    return stats.minutesRemaining >= minutesToAdd
  }

  static async addUsageMinutes(userId: string, minutes: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        minutesUsed: {
          increment: minutes
        }
      }
    })
  }

  static async resetMonthlyUsage(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        minutesUsed: 0
      }
    })
  }

  static async upgradeTier(userId: string, newTier: User['subscriptionTier']): Promise<void> {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    const newTierInfo = this.getTierInfo(newTier)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
        minutesLimit: newTierInfo.minutesLimit
      }
    })
  }

  static async downgradeTier(userId: string, newTier: User['subscriptionTier']): Promise<void> {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true, minutesUsed: true }
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    const newTierInfo = this.getTierInfo(newTier)
    
    // If user has used more minutes than new tier allows, reset to new limit
    const adjustedMinutesUsed = Math.min(currentUser.minutesUsed, newTierInfo.minutesLimit)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
        minutesLimit: newTierInfo.minutesLimit,
        minutesUsed: adjustedMinutesUsed
      }
    })
  }

  static calculateUpgradeQuote(
    currentTier: User['subscriptionTier'],
    targetTier: User['subscriptionTier'],
    billingCycleStart: Date = new Date()
  ): UpgradeQuote {
    const fromTierInfo = this.getTierInfo(currentTier)
    const toTierInfo = this.getTierInfo(targetTier)
    
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysPassed = now.getDate()
    const daysRemaining = daysInMonth - daysPassed
    
    // Calculate prorated amount for remaining days
    const dailyRateDifference = (toTierInfo.price - fromTierInfo.price) / daysInMonth
    const proratedAmount = Math.round(dailyRateDifference * daysRemaining * 100) / 100
    
    // Next billing will be full amount of new tier
    const nextBillingAmount = toTierInfo.price
    
    // Effective immediately
    const effectiveDate = new Date()
    
    return {
      fromTier: fromTierInfo,
      toTier: toTierInfo,
      proratedAmount: Math.max(0, proratedAmount),
      nextBillingAmount,
      effectiveDate
    }
  }

  static calculateDowngradeCredit(
    currentTier: User['subscriptionTier'],
    targetTier: User['subscriptionTier'],
    billingCycleStart: Date = new Date()
  ): number {
    const fromTierInfo = this.getTierInfo(currentTier)
    const toTierInfo = this.getTierInfo(targetTier)
    
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysPassed = now.getDate()
    const daysRemaining = daysInMonth - daysPassed
    
    // Calculate credit for remaining days
    const dailyRateDifference = (fromTierInfo.price - toTierInfo.price) / daysInMonth
    const creditAmount = Math.round(dailyRateDifference * daysRemaining * 100) / 100
    
    return Math.max(0, creditAmount)
  }

  static hasFeature(tier: User['subscriptionTier'], feature: string): boolean {
    const tierInfo = this.getTierInfo(tier)
    
    switch (feature) {
      case 'priority_processing':
        return tierInfo.priority
      case 'api_access':
        return tierInfo.apiAccess
      case 'custom_branding':
        return tierInfo.customBranding
      case 'dedicated_support':
        return tierInfo.dedicatedSupport
      case 'team_access':
        return tierInfo.maxTeamMembers > 1
      default:
        return false
    }
  }

  static getTeamMemberLimit(tier: User['subscriptionTier']): number {
    const tierInfo = this.getTierInfo(tier)
    return tierInfo.maxTeamMembers
  }

  static async getBillingInfo(userId: string): Promise<BillingInfo> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        createdAt: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentTier = this.getTierInfo(user.subscriptionTier)
    
    // Calculate next billing date (first day of next month)
    const now = new Date()
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    // Mock invoice history (in production, fetch from payment provider)
    const invoiceHistory: Invoice[] = [
      {
        id: 'inv_001',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        amount: currentTier.price,
        status: 'paid',
        downloadUrl: '/api/invoices/inv_001/download'
      }
    ]

    return {
      currentTier,
      nextBillingDate,
      amount: currentTier.price,
      currency: 'USD',
      paymentMethod: 'card_ending_4242',
      invoiceHistory
    }
  }

  static async processMonthlyBilling(): Promise<void> {
    // This would be called by a cron job on the first day of each month
    const users = await prisma.user.findMany({
      select: {
        id: true,
        subscriptionTier: true,
        minutesUsed: true
      }
    })

    for (const user of users) {
      try {
        // Reset monthly usage
        await this.resetMonthlyUsage(user.id)
        
        // In production, charge the user's payment method here
        // await chargePaymentMethod(user.id, tierInfo.price)
        
        console.log(`Processed billing for user ${user.id}`)
      } catch (error) {
        console.error(`Failed to process billing for user ${user.id}:`, error)
      }
    }
  }

  static getUsageWarningLevel(percentageUsed: number): 'none' | 'warning' | 'critical' | 'exceeded' {
    if (percentageUsed >= 100) return 'exceeded'
    if (percentageUsed >= 90) return 'critical'
    if (percentageUsed >= 75) return 'warning'
    return 'none'
  }

  static formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours === 0) {
      return `${remainingMinutes} min`
    }
    
    return `${hours}h ${remainingMinutes}m`
  }

  static async getUpgradeRecommendation(userId: string): Promise<User['subscriptionTier'] | null> {
    const stats = await this.getUserUsageStats(userId)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    })

    if (!user) return null

    // Recommend upgrade if user is consistently using >80% of their limit
    if (stats.percentageUsed > 80) {
      switch (user.subscriptionTier) {
        case 'STARTER':
          return 'PRO'
        case 'PRO':
          return 'AGENCY'
        default:
          return null
      }
    }

    return null