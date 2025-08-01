export interface Project {
  id: string
  name: string
  description: string | null
  userId: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  _count?: {
    clips: number
    uploads: number
  }
}

export interface Upload {
  id: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  duration: number | null
  projectId: string
  status: UploadStatus
  createdAt: string
  updatedAt: string
}

export interface Clip {
  id: string
  title: string
  description: string | null
  startTime: number
  endTime: number
  transcript: string
  hashtags: string[]
  score: number | null
  projectId: string
  uploadId: string
  status: ClipStatus
  videoUrl: string | null
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ProcessingJob {
  id: string
  uploadId: string
  type: ProcessingType
  status: ProcessingStatus
  result: any | null
  errorMessage: string | null
  externalJobId: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'ERROR'

export type UploadStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'ERROR'

export type ClipStatus = 'IDENTIFIED' | 'GENERATING' | 'READY' | 'ERROR'

export type ProcessingType = 'TRANSCRIPTION' | 'AI_ANALYSIS' | 'VIDEO_GENERATION'

export type ProcessingStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR'

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UploadFileRequest {
  projectId: string
  file: File
}

export interface GenerateClipRequest {
  clipId: string
}

export interface ClipAnalysisResult {
  clips: Array<{
    startTime: number
    endTime: number
    title: string
    transcript: string