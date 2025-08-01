export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  totalUploads: number
  totalClips: number
  storageUsed: number
}

export interface UserWithStats {
  id: string
  email: string
  name: string | null
  role: string
  subscriptionTier: string
  minutesUsed: number
  minutesLimit: number
  projectCount: number
  createdAt: Date
}

export interface AdminAuthRequest {
  email: string
  password: string
}

export interface AdminAuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string | null
    role: string
  }
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  subscriptionTier: 'STARTER' | 'PRO' | 'AGENCY'
  minutesUsed: number
  minutesLimit: number
  createdAt: Date
  updatedAt: Date
  projects: AdminProject[]
  _count?: {
    projects: number
  }
}

export interface AdminProject {
  id: string
  name: string
  description: string | null
  status: 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
  createdAt: Date
  updatedAt: Date
  userId: string
  user: {
    id: string
    email: string
    name: string | null
    subscriptionTier: string
  }
  uploads: AdminUpload[]
  clips: AdminClip[]
  _count: {
    uploads: number
    clips: number
  }
}

export interface AdminUpload {
  id: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  duration: number | null
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
  createdAt: Date
  updatedAt: Date
  projectId: string
  processingJobs: AdminProcessingJob[]
}

export interface AdminClip {
  id: string
  title: string
  description: string | null
  startTime: number
  endTime: number
  transcript: string
  hashtags: string[]
  score: number | null
  status: 'IDENTIFIED' | 'GENERATING' | 'READY' | 'ERROR'
  videoUrl: string | null
  thumbnailUrl: string | null
  createdAt: Date
  updatedAt: Date
  projectId: string
  uploadId: string
}

export interface AdminProcessingJob {
  id: string
  uploadId: string
  type: 'TRANSCRIPTION' | 'AI_ANALYSIS' | 'VIDEO_GENERATION'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR'
  result: any
  errorMessage: string | null
  externalJobId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AdminActivity {
  id: string
  type: 'USER_SIGNUP' | 'PROJECT_CREATED' | 'UPLOAD_COMPLETED' | 'CLIP_GENERATED' | 'USER_SUSPENDED' | 'USER_DELETED'
  description: string
  timestamp: Date
  userId?: string
  userName?: string | null
  userEmail?: string
  metadata?: Record<string, any>
}

export interface AdminDashboardStats {
  users: {
    total: number
    active: number
    recent: number
    subscriptions: Record<string, number>
  }
  content: {
    projects: number
    uploads: number
    clips: number
  }
  storage: {
    totalGB: number
    totalBytes: number
  }
  generatedAt: string
}

export interface AdminUsersResponse {
  users: UserWithStats[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AdminProjectsResponse {
  projects: AdminProject[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    totalProjects: number
    avgScore: number
  }
}

export interface AdminActivityResponse {
  activities: AdminActivity[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface AdminUserUpdateRequest {
  name?: string
  subscriptionTier?: 'STARTER' | 'PRO' | 'AGENCY'
  minutesLimit?: number
  role?: 'USER' | 'ADMIN'
}

export interface AdminUserActionRequest {
  action: 'suspend' | 'delete' | 'promote' | 'demote' | 'activate'
  reason?: string
}

export interface AdminSystemHealth {
  status: 'healthy' | 'warning' | 'error'
  services: {
    database: 'online' | 'offline' | 'degraded'
    storage: 'online' | 'offline' | 'degraded'
    processing: 'online' | 'offline' | 'degraded'
  }
  metrics: {
    uptime: number
    responseTime: number
    errorRate: number
  }
  lastChecked: Date
}

export interface AdminNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  createdAt: Date
  read: boolean
  actionUrl?: string
}

export interface AdminSettings {
  general: {
    siteName: string
    siteUrl: string
    supportEmail: string
    maintenanceMode: boolean
  }
  limits: {
    starterMinutes: number
    proMinutes: number
    agencyMinutes: number
    maxFileSize: number
    maxProjectsPerUser: number
  }
  features: {
    allowSignups: boolean
    requireEmailVerification: boolean
    enableAnalytics: boolean
  }
  notifications: {
    emailNotifications: boolean