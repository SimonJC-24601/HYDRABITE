interface TranscriptionSegment {
  text: string
  start: number
  end: number
  confidence: number
}

interface TranscriptionResult {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text: string
  segments: TranscriptionSegment[]
  duration: number
  language: string
  confidence: number
  error?: string
}

interface TranscriptionRequest {
  audioUrl: string
  language?: string
  speakerLabels?: boolean
  punctuate?: boolean
}

export class TranscriptionError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'TranscriptionError'
  }
}

export async function submitTranscriptionJob(request: TranscriptionRequest): Promise<string> {
  try {
    // Simulate API call to transcription service
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        protocol: 'https',
        origin: 'api.assemblyai.com',
        path: '/v2/transcript',
        method: 'POST',
        headers: {
          'authorization': 'Bearer mock-api-key',
          'content-type': 'application/json',
        },
        body: {
          audio_url: request.audioUrl,
          language_code: request.language || 'en',
          speaker_labels: request.speakerLabels || false,
          punctuate: request.punctuate || true,
          format_text: true,
        },
      }),
    })

    if (!response.ok) {
      throw new TranscriptionError('Failed to submit transcription job', 'SUBMISSION_FAILED')
    }

    const result = await response.json()
    
    if (result.error) {
      throw new TranscriptionError(result.error, 'API_ERROR')
    }

    return result.id || `mock-job-${Date.now()}`
  } catch (error) {
    if (error instanceof TranscriptionError) {
      throw error
    }
    throw new TranscriptionError('Network error during transcription submission', 'NETWORK_ERROR')
  }
}

export async function getTranscriptionStatus(jobId: string): Promise<TranscriptionResult> {
  try {
    // Simulate API call to check transcription status
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        protocol: 'https',
        origin: 'api.assemblyai.com',
        path: `/v2/transcript/${jobId}`,
        method: 'GET',
        headers: {
          'authorization': 'Bearer mock-api-key',
        },
      }),
    })

    if (!response.ok) {
      throw new TranscriptionError('Failed to get transcription status', 'STATUS_CHECK_FAILED')
    }

    const result = await response.json()

    if (result.error) {
      throw new TranscriptionError(result.error, 'API_ERROR')
    }

    // Transform API response to our format
    return {
      id: result.id || jobId,
      status: mapApiStatus(result.status),
      text: result.text || '',
      segments: transformSegments(result.words || []),
      duration: result.audio_duration || 0,
      language: result.language_code || 'en',
      confidence: result.confidence || 0,
      error: result.error,
    }
  } catch (error) {
    if (error instanceof TranscriptionError) {
      throw error
    }
    throw new TranscriptionError('Network error during status check', 'NETWORK_ERROR')
  }
}

export async function simulateTranscription(audioUrl: string, duration: number): Promise<TranscriptionResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Generate mock transcript based on duration
  const mockSegments: TranscriptionSegment[] = []
  const wordsPerMinute = 150
  const totalWords = Math.floor((duration / 60) * wordsPerMinute)
  
  const sampleWords = [
    'Welcome', 'to', 'our', 'presentation', 'today', 'we', 'will', 'discuss',
    'the', 'future', 'of', 'technology', 'and', 'how', 'it', 'impacts',
    'our', 'daily', 'lives', 'This', 'is', 'an', 'exciting', 'time',
    'for', 'innovation', 'and', 'growth', 'in', 'the', 'industry',
    'Let', 'me', 'share', 'some', 'insights', 'about', 'what', 'we',
    'can', 'expect', 'in', 'the', 'coming', 'years', 'and', 'how',
    'these', 'changes', 'will', 'affect', 'businesses', 'worldwide'
  ]

  let currentTime = 0
  let fullText = ''

  for (let i = 0; i < Math.min(totalWords, 200); i++) {
    const word = sampleWords[i % sampleWords.length]
    const wordDuration = 0.5 + Math.random() * 0.5 // 0.5-1.0 seconds per word
    
    mockSegments.push({
      text: word,
      start: currentTime,
      end: currentTime + wordDuration,
      confidence: 0.85 + Math.random() * 0.15,
    })

    fullText += (i > 0 ? ' ' : '') + word
    currentTime += wordDuration

    // Add punctuation occasionally
    if (i > 0 && i % 10 === 0) {
      fullText += '.'
    }
  }

  return {
    id: `mock-${Date.now()}`,
    status: 'completed',
    text: fullText,
    segments: mockSegments,
    duration: duration,
    language: 'en',
    confidence: 0.92,
  }
}

function mapApiStatus(apiStatus: string): TranscriptionResult['status'] {
  switch (apiStatus?.toLowerCase()) {
    case 'queued':
    case 'submitted':
      return 'queued'
    case 'processing':
    case 'running':
      return 'processing'
    case 'completed':
    case 'success':
      return 'completed'
    case 'error':
    case 'failed':
      return 'error'
    default:
      return 'queued'
  }
}

function transformSegments(words: any[]): TranscriptionSegment[] {
  if (!Array.isArray(words)) {
    return []
  }

  return words.map((word: any) => ({
    text: word.text || '',
    start: word.start || 0,
    end: word.end || 0,
    confidence: word.confidence || 0,
  }))
}

export async function pollTranscriptionUntilComplete(
  jobId: string,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<TranscriptionResult> {
  let attempts = 0

  while (attempts < maxAttempts) {
    const result = await getTranscriptionStatus(jobId)

    if (result.status === 'completed') {
      return result
    }

    if (result.status === 'error') {
      throw new TranscriptionError(result.error || 'Transcription failed', 'TRANSCRIPTION_FAILED')
    }

    attempts++
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new TranscriptionError('Transcription timeout', 'TIMEOUT')
}

export function validateTranscriptionResult(result: TranscriptionResult): boolean {
  return !!(
    result.id &&
    result.status &&
    result.text &&
    Array.isArray(result.segments) &&
    typeof result.duration === 'number' &&
    typeof result.confidence === 'number'
  )
}

export function getTranscriptionCost(duration: number): number {
  // Mock pricing: $0.00025 per second
  return Math.round(duration * 0.00025 * 100) / 100
}
