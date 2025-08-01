export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: Date;
  };
  usage: {
    uploadsThisMonth: number;
    processingMinutesThisMonth: number;
    storageUsedMB: number;
  };
  limits: {
    maxUploadsPerMonth: number;
    maxProcessingMinutesPerMonth: number;
    maxStorageMB: number;
  };
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  uploads: Upload[];
  clips: Clip[];
  status: 'active' | 'archived';
  settings: {
    autoProcessing: boolean;
    clipDuration: number;
    qualityPreset: 'low' | 'medium' | 'high';
  };
}

export interface Upload {
  id: string;
  projectId: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  duration: number;
  format: string;
  resolution: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  processingProgress: number;
  url: string;
  thumbnailUrl?: string;
  metadata: {
    codec: string;
    bitrate: number;
    frameRate: number;
    aspectRatio: string;
  };
  error?: string;
}

export interface Clip {
  id: string;
  uploadId: string;
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  startTime: number;
  endTime: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'processing' | 'ready' | 'failed';
  url?: string;
  thumbnailUrl?: string;
  viralScore: number;
  tags: string[];
  analytics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  };
  aiAnalysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    keyMoments: Array<{
      timestamp: number;
      description: string;
      confidence: number;
    }>;
    transcription?: string;
  };
}

export interface ProcessingJob {
  id: string;
  userId: string;
  uploadId?: string;
  clipId?: string;
  type: 'upload_processing' | 'clip_generation' | 'ai_analysis' | 'transcription';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: Record<string, unknown>;
  estimatedTimeRemaining?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalUploads: number;
  totalClips: number;
  totalViews: number;
  storageUsed: number;
  processingMinutesUsed: number;
  recentActivity: Array<{
    id: string;
    type: 'upload' | 'clip_created' | 'project_created';
    description: string;
    timestamp: Date;
    projectId?: string;
    uploadId?: string;
    clipId?: string;
  }>;
  topPerformingClips: Array<{
    id: string;
    name: string;
    viralScore: number;
    views: number;
    thumbnailUrl?: string;
  }>;
  usageOverTime: Array<{
    date: string;
    uploads: number;
    clips: number;
    views: number;
  }>;
}

export interface NotificationSettings {
  email: {
    processingComplete: boolean;
    viralClipDetected: boolean;
    weeklyReport: boolean;
    systemUpdates: boolean;
  };
  push: {
    processingComplete: boolean;
    viralClipDetected: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: {
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
    showTutorials: boolean;
  };
}

export interface UploadProgress {
  uploadId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ClipGenerationRequest {
  uploadId: string;
  settings: {
    duration: number;
    minViralScore: number;
    maxClips: number;
    includeTranscription: boolean;
    qualityPreset: 'low' | 'medium' | 'high';
  };
}

export interface SearchFilters {
  projectId?: string;
  status?: Upload['status'] | Clip['status'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  minViralScore?: number;
  maxViralScore?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'viralScore' | 'duration' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export type FileUploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type UserRole = 'user' | 'admin';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: FormValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ToastMessage {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime?: number;
    lastChecked: Date;