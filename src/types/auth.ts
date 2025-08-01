export interface User {
  id: string
  email: string
  name: string | null
  subscriptionTier: 'STARTER' | 'PRO' | 'AGENCY'
  minutesUsed: number
  minutesLimit: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token?: string
}

export interface SessionUser {
  id: string
  email: string
  name: string | null
  subscriptionTier: 'STARTER' | 'PRO' | 'AGENCY'
}

export interface AuthError {
  error: string
  code?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
}
