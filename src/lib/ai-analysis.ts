import { perplexityHuge } from '@/perplexity-api'
import type { ClipAnalysisResult } from '@/types/project'

export interface TranscriptSegment {
  text: string
  startTime: number
  endTime: number
}

export interface ViralMoment {
  startTime: number
  endTime: number
  title: string
  description: string
  transcript: string
  hashtags: string[]
  score: number
  reasoning: string
}

export interface AnalysisRequest {
  transcript: string
  segments: TranscriptSegment[]
  duration: number
  contentType: 'video' | 'audio'
}

export interface AnalysisResponse {
  success: boolean
  clips: ViralMoment[]
  error?: string
}

export class AIAnalysisService {
  private static readonly ANALYSIS_PROMPT = `You are an expert viral video producer and social media strategist. Your task is to analyze a transcript and identify the most compelling 30-60 second segments that have the highest potential to go viral on social media platforms like TikTok, Instagram Reels, and YouTube Shorts.

For each segment you identify, provide:
1. Start and end timestamps (in seconds)
2. A catchy, attention-grabbing title (max 60 characters)
3. A brief description of why this moment is compelling
4. The exact transcript text for that segment
5. 3-5 relevant hashtags (without the # symbol)
6. A viral potential score from 0.0 to 1.0 (1.0 being most viral)
7. Brief reasoning for the viral potential

Focus on moments that contain:
- Surprising revelations or plot twists
- Emotional peaks (funny, shocking, inspiring)
- Actionable advice or tips
- Controversial or debate-worthy statements
- Memorable quotes or one-liners
- Before/after transformations
- Expert insights or "secrets"
- Relatable struggles or victories

Return your response as a valid JSON object with this exact structure:
{
  "clips": [
    {
      "startTime": 120.5,
      "endTime": 175.2,
      "title": "The Secret That Changed Everything",
      "description": "Reveals the surprising strategy that led to breakthrough",
      "transcript": "The exact words spoken during this segment...",
      "hashtags": ["secret", "breakthrough", "strategy", "mindset", "success"],
      "score": 0.85,
      "reasoning": "High emotional impact with actionable insight"
    }
  ]
}

Identify exactly 10 segments, ranked by viral potential (highest first).`

  static async analyzeTranscript(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const { transcript, segments, duration, contentType } = request

      if (!transcript || transcript.trim().length === 0) {
        return {
          success: false,
          clips: [],
          error: 'Empty transcript provided'
        }
      }

      // Prepare context for the AI
      const contextInfo = `
Content Type: ${contentType}
Total Duration: ${Math.round(duration)} seconds (${Math.round(duration / 60)} minutes)
Transcript Length: ${transcript.length} characters

Full Transcript:
${transcript}

Timestamp Segments Available:
${segments.map(seg => `${seg.startTime}s-${seg.endTime}s: ${seg.text.substring(0, 100)}...`).join('\n')}
`

      const response = await perplexityHuge({
        messages: [
          {
            role: 'system',
            content: this.ANALYSIS_PROMPT
          },
          {
            role: 'user',
            content: `Please analyze this content and identify the 10 most viral moments:\n\n${contextInfo}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })

      const responseText = response.choices[0]?.message?.content
      if (!responseText) {
        throw new Error('No response from AI analysis')
      }

      // Parse the JSON response
      let analysisResult: { clips: ViralMoment[] }
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response')
        }
        
        analysisResult = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error('Failed to parse AI response:', responseText)
        throw new Error('Invalid JSON response from AI analysis')
      }

      if (!analysisResult.clips || !Array.isArray(analysisResult.clips)) {
        throw new Error('Invalid response format: missing clips array')
      }

      // Validate and clean up the clips
      const validatedClips = this.validateAndCleanClips(analysisResult.clips, duration)

      return {
        success: true,
        clips: validatedClips
      }
    } catch (error) {
      console.error('AI Analysis error:', error)
      return {
        success: false,
        clips: [],
        error: error instanceof Error ? error.message : 'Unknown analysis error'
      }
    }
  }

  private static validateAndCleanClips(clips: any[], maxDuration: number): ViralMoment[] {
    const validatedClips: ViralMoment[] = []

    for (const clip of clips) {
      try {
        // Validate required fields
        if (
          typeof clip.startTime !== 'number' ||
          typeof clip.endTime !== 'number' ||
          typeof clip.title !== 'string' ||
          typeof clip.transcript !== 'string' ||
          !Array.isArray(clip.hashtags)
        ) {
          console.warn('Skipping invalid clip:', clip)
          continue
        }

        // Validate time bounds
        if (
          clip.startTime < 0 ||
          clip.endTime <= clip.startTime ||
          clip.endTime > maxDuration ||
          (clip.endTime - clip.startTime) < 15 || // Minimum 15 seconds
          (clip.endTime - clip.startTime) > 90    // Maximum 90 seconds
        ) {
          console.warn('Skipping clip with invalid timing:', clip)
          continue
        }

        // Clean and validate data
        const validatedClip: ViralMoment = {
          startTime: Math.max(0, Math.round(clip.startTime * 10) / 10),
          endTime: Math.min(maxDuration, Math.round(clip.endTime * 10) / 10),
          title: clip.title.trim().substring(0, 100),
          description: (clip.description || '').trim().substring(0, 500),
          transcript: clip.transcript.trim(),
          hashtags: clip.hashtags
            .filter((tag: any) => typeof tag === 'string' && tag.trim().length > 0)
            .map((tag: string) => tag.trim().toLowerCase().replace(/^#/, ''))
            .slice(0, 8), // Max 8 hashtags
          score: Math.max(0, Math.min(1, typeof clip.score === 'number' ? clip.score : 0.5)),
          reasoning: (clip.reasoning || '').trim().substring(0, 200)
        }

        validatedClips.push(validatedClip)
      } catch (error) {
        console.warn('Error validating clip:', error, clip)
      }
    }

    // Sort by score (highest first) and return top 10
    return validatedClips
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  static async generateClipTitle(transcript: string, context?: string): Promise<string> {
    try {
      const prompt = `Generate a catchy, viral-worthy title for this video clip. The title should be attention-grabbing, under 60 characters, and optimized for social media engagement.

${context ? `Context: ${context}\n` : ''}
Transcript: "${transcript.substring(0, 500)}..."

Return only the title, nothing else.`

      const response = await perplexityHuge({
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating viral social media titles. Create compelling, clickable titles that drive engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })

      const title = response.choices[0]?.message?.content?.trim()
      return title ? title.substring(0, 100) : 'Viral Moment'
    } catch (error) {
      console.error('Error generating clip title:', error)
      return 'Viral Moment'
    }
  }

  static async generateHashtags(transcript: string, title: string): Promise<string[]> {
    try {
      const prompt = `Generate 5-8 relevant hashtags for this video clip. Focus on trending, discoverable hashtags that will help the content reach the right audience.

Title: "${title}"
Content: "${transcript.substring(0, 300)}..."

Return hashtags as a comma-separated list without the # symbol.`

      const response = await perplexityHuge({
        messages: [
          {
            role: 'system',
            content: 'You are a social media hashtag expert. Generate relevant, trending hashtags that maximize discoverability.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 200
      })

      const hashtagText = response.choices[0]?.message?.content?.trim()
      if (!hashtagText) return ['viral', 'content']

      return hashtagText
        .split(',')
        .map(tag => tag.trim().toLowerCase().replace(/^#/, ''))
        .filter(tag => tag.length > 0 && tag.length <= 30)
        .slice(0, 8)
    } catch (error) {
      console.error('Error generating hashtags:', error)
      return ['viral', 'content']
    }
  }

  static calculateViralScore(
    transcript: string,
    duration: number,
    engagement_indicators?: {
      emotional_words: number
      question_count: number
      exclamation_count: number
      action_words: number
    }
  ): number {
    let score = 0.5 // Base score

    // Duration scoring (30-60 seconds is optimal)
    if (duration >= 30 && duration <= 60) {
      score += 0.2
    } else if (duration >= 15 && duration <= 90) {
      score += 0.1
    }

    // Content analysis
    const text = transcript.toLowerCase()
    
    // Emotional indicators
    const emotionalWords = ['amazing', 'incredible', 'shocking', 'unbelievable', 'secret', 'revealed', 'breakthrough', 'transformation']
    const emotionalCount = emotionalWords.filter(word => text.includes(word)).length
    score += Math.min(0.2, emotionalCount * 0.05)

    // Question engagement
    const questionCount = (text.match(/\?/g) || []).length
    score += Math.min(0.1, questionCount * 0.02)

    // Exclamation engagement
    const exclamationCount = (text.match(/!/g) || []).length
    score += Math.min(0.1, exclamationCount * 0.02)

    // Action words
    const actionWords = ['learn', 'discover', 'find out', 'watch', 'see', 'try', 'do this', 'follow']
    const actionCount = actionWords.filter(word => text.includes(word)).length
    score += Math.min(0.1, actionCount * 0.02)

    return Math.max(0, Math.min(1, score))