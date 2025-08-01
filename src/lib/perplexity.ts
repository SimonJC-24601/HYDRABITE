interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  return_citations?: boolean;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  related_questions?: string[];
}

interface ViralPotentialScore {
  overall_score: number;
  engagement_potential: number;
  shareability: number;
  trending_alignment: number;
  emotional_impact: number;
  uniqueness: number;
  explanation: string;
}

interface TrendingTopic {
  topic: string;
  relevance_score: number;
  current_popularity: string;
  related_keywords: string[];
  suggested_angles: string[];
}

interface VideoInsights {
  key_moments: Array<{
    timestamp: string;
    description: string;
    viral_potential: number;
    suggested_clip_duration: string;
  }>;
  emotional_peaks: Array<{
    timestamp: string;
    emotion: string;
    intensity: number;
  }>;
  quotable_moments: Array<{
    timestamp: string;
    quote: string;
    context: string;
  }>;
  trending_elements: string[];
  target_demographics: string[];
  optimal_posting_times: string[];
}

interface AnalysisResult {
  viral_score: ViralPotentialScore;
  trending_topics: TrendingTopic[];
  insights: VideoInsights;
  recommendations: string[];
  metadata: {
    analysis_timestamp: string;
    confidence_level: number;
    processing_time_ms: number;
  };
}

interface RateLimitState {
  requests: number;
  resetTime: number;
  maxRequests: number;
  windowMs: number;
}

class PerplexityError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'PerplexityError';
  }
}

class PerplexityClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.perplexity.ai';
  private rateLimitState: RateLimitState;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.rateLimitState = {
      requests: 0,
      resetTime: Date.now() + 60000,
      maxRequests: 20,
      windowMs: 60000
    };
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    if (now >= this.rateLimitState.resetTime) {
      this.rateLimitState.requests = 0;
      this.rateLimitState.resetTime = now + this.rateLimitState.windowMs;
    }

    if (this.rateLimitState.requests >= this.rateLimitState.maxRequests) {
      const waitTime = this.rateLimitState.resetTime - now;
      throw new PerplexityError(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        429
      );
    }

    this.rateLimitState.requests++;
  }

  private async makeRequest(request: PerplexityRequest): Promise<PerplexityResponse> {
    await this.checkRateLimit();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new PerplexityError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json() as PerplexityResponse;
      return data;
    } catch (error) {
      if (error instanceof PerplexityError) {
        throw error;
      }
      throw new PerplexityError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        error
      );
    }
  }

  async analyzeTranscript(
    transcript: string,
    videoMetadata?: {
      title?: string;
      duration?: string;
      platform?: string;
      creator?: string;
    }
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    const systemPrompt = `You are an expert viral content analyst specializing in identifying viral potential in video content. Analyze the provided transcript and return a comprehensive analysis in valid JSON format.

Your response must be a valid JSON object with the following structure:
{
  "viral_score": {
    "overall_score": number (0-100),
    "engagement_potential": number (0-100),
    "shareability": number (0-100),
    "trending_alignment": number (0-100),
    "emotional_impact": number (0-100),
    "uniqueness": number (0-100),
    "explanation": "detailed explanation"
  },
  "trending_topics": [
    {
      "topic": "topic name",
      "relevance_score": number (0-100),
      "current_popularity": "high/medium/low",
      "related_keywords": ["keyword1", "keyword2"],
      "suggested_angles": ["angle1", "angle2"]
    }
  ],
  "insights": {
    "key_moments": [
      {
        "timestamp": "MM:SS",
        "description": "moment description",
        "viral_potential": number (0-100),
        "suggested_clip_duration": "duration"
      }
    ],
    "emotional_peaks": [
      {
        "timestamp": "MM:SS",
        "emotion": "emotion type",
        "intensity": number (0-100)
      }
    ],
    "quotable_moments": [
      {
        "timestamp": "MM:SS",
        "quote": "exact quote",
        "context": "context explanation"
      }
    ],
    "trending_elements": ["element1", "element2"],
    "target_demographics": ["demographic1", "demographic2"],
    "optimal_posting_times": ["time1", "time2"]
  },
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    const userPrompt = `Analyze this video transcript for viral potential:

${videoMetadata ? `Video Metadata:
Title: ${videoMetadata.title || 'N/A'}
Duration: ${videoMetadata.duration || 'N/A'}
Platform: ${videoMetadata.platform || 'N/A'}
Creator: ${videoMetadata.creator || 'N/A'}

` : ''}Transcript:
${transcript}

Provide a comprehensive viral potential analysis focusing on:
1. Overall viral score and component scores
2. Current trending topics alignment
3. Key moments with high viral potential
4. Emotional peaks and quotable moments
5. Specific recommendations for creating viral clips

Return only valid JSON with no additional text.`;

    const request: PerplexityRequest = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.3,
      return_citations: true,
      search_recency_filter: 'day',
      return_related_questions: false
    };

    try {
      const response = await this.makeRequest(request);
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new PerplexityError('Empty response from Perplexity API');
      }

      let analysisData: Omit<AnalysisResult, 'metadata'>;
      try {
        analysisData = JSON.parse(content) as Omit<AnalysisResult, 'metadata'>;
      } catch (parseError) {
        throw new PerplexityError(
          `Failed to parse analysis response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        );
      }

      const processingTime = Date.now() - startTime;

      const result: AnalysisResult = {
        ...analysisData,
        metadata: {
          analysis_timestamp: new Date().toISOString(),
          confidence_level: this.calculateConfidenceLevel(analysisData),
          processing_time_ms: processingTime
        }
      };

      return result;
    } catch (error) {
      if (error instanceof PerplexityError) {
        throw error;
      }
      throw new PerplexityError(
        `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        error
      );
    }
  }

  async getTrendingTopics(
    category?: string,
    region?: string,
    timeframe?: 'hour' | 'day' | 'week'
  ): Promise<TrendingTopic[]> {
    const systemPrompt = `You are a trending topics analyst. Identify current trending topics and return them in valid JSON format.

Your response must be a valid JSON array of objects with this structure:
[
  {
    "topic": "topic name",
    "relevance_score": number (0-100),
    "current_popularity": "high/medium/low",
    "related_keywords": ["keyword1", "keyword2"],
    "suggested_angles": ["angle1", "angle2"]
  }
]`;

    const userPrompt = `Identify the top 10 trending topics right now${category ? ` in the ${category} category` : ''}${region ? ` for the ${region} region` : ''}${timeframe ? ` within the last ${timeframe}` : ''}.

Focus on topics that would be relevant for viral video content creation. Include:
1. Current events and news
2. Pop culture trends
3. Social media challenges
4. Seasonal or timely topics
5. Emerging memes or viral content

Return only valid JSON array with no additional text.`;

    const request: PerplexityRequest = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.2,
      return_citations: true,
      search_recency_filter: timeframe || 'day'
    };

    try {
      const response = await this.makeRequest(request);
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new PerplexityError('Empty response from Perplexity API');
      }

      const trendingTopics = JSON.parse(content) as TrendingTopic[];
      return trendingTopics;
    } catch (error) {
      if (error instanceof PerplexityError) {
        throw error;
      }
      throw new PerplexityError(
        `Failed to get trending topics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        error
      );
    }
  }

  async generateViralScore(content: string, contentType: 'transcript' | 'title' | 'description'): Promise<ViralPotentialScore> {
    const systemPrompt = `You are a viral content scoring expert. Analyze the provided content and return a viral potential score in valid JSON format.

Your response must be a valid JSON object with this structure:
{
  "overall_score": number (0-100),
  "engagement_potential": number (0-100),
  "shareability": number (0-100),
  "trending_alignment": number (0-100),
  "emotional_impact": number (0-100),
  "uniqueness": number (0-100),
  "explanation": "detailed explanation of the scoring"
}`;

    const userPrompt = `Score the viral potential of this ${contentType}:

${content}

Evaluate based on:
1. Engagement potential (likes, comments, shares)
2. Shareability (how likely people are to share)
3. Trending alignment (alignment with current trends)
4. Emotional impact (emotional response strength)
5. Uniqueness (originality and novelty)

Provide scores from 0-100 for each category and an overall score.

Return only valid JSON with no additional text.`;

    const request: PerplexityRequest = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      return_citations: false
    };

    try {
      const response = await this.makeRequest(request);
      const content_response = response.choices[0]?.message?.content;

      if (!content_response) {
        throw new PerplexityError('Empty response from Perplexity API');
      }

      const viralScore = JSON.parse(content_response) as ViralPotentialScore;
      return viralScore;
    } catch (error) {
      if (error instanceof PerplexityError) {
        throw error;
      }
      throw new PerplexityError(
        `Failed to generate viral score: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        error
      );
    }
  }

  async extractKeyInsights(
    transcript: string,
    focusAreas?: string[]
  ): Promise<VideoInsights> {
    const systemPrompt = `You are a video content insights expert. Extract key insights from the provided transcript and return them in valid JSON format.

Your response must be a valid JSON object with this structure:
{
  "key_moments": [
    {
      "timestamp": "MM:SS",
      "description": "moment description",
      "viral_potential": number (0-100),
      "suggested_clip_duration": "duration"
    }
  ],
  "emotional_peaks": [
    {
      "timestamp": "MM:SS",
      "emotion": "emotion type",
      "intensity": number (0-100)
    }
  ],
  "quotable_moments": [
    {
      "timestamp": "MM:SS",
      "quote": "exact quote",
      "context": "context explanation"
    }
  ],
  "trending_elements": ["element1", "element2"],
  "target_demographics": ["demographic1", "demographic2"],
  "optimal_posting_times": ["time1", "time2"]
}`;

    const userPrompt = `Extract key insights from this video transcript:

${transcript}

${focusAreas ? `Focus particularly on: ${focusAreas.join(', ')}` : ''}

Identify:
1. Key moments with high viral potential
2. Emotional peaks and their intensity
3. Quotable moments that could become viral
4. Elements that align with current trends
5. Target demographics for this content
6. Optimal posting times for maximum reach

Return only valid JSON with no additional text.`;

    const request: PerplexityRequest = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.3,
      return_citations: false
    };

    try {
      const response = await this.makeRequest(request);
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new PerplexityError('Empty response from Perplexity API');
      }

      const insights = JSON.parse(content) as VideoInsights;
      return insights;
    } catch (error) {
      if (error instanceof PerplexityError) {
        throw error;
      }
      throw new PerplexityError(
        `Failed to extract insights: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        error
      );
    }
  }

  private calculateConfidenceLevel(analysis: Omit<AnalysisResult, 'metadata'>): number {
    const factors = [
      analysis.viral_score.overall_score > 0 ? 20 : 0,
      analysis.trending_topics.length > 0 ? 20 : 0,
      analysis.insights.key_moments.length > 0 ? 20 : 0,
      analysis.insights.emotional_peaks.length > 0 ? 20 : 0,
      analysis.recommendations.length > 0 ? 20 : 0
    ];

    return factors.reduce((sum: number, factor: number) => sum + factor, 0);
  }

  getRateLimitStatus(): RateLimitState {
    return { ...this.rateLimitState };
  }

  resetRateLimit(): void {
    this.rateLimitState.requests = 0;
    this.rateLimitState.resetTime = Date.now() + this.rateLimitState.windowMs;
  }
}

export function createPerplexityClient(apiKey: string): PerplexityClient {
  if (!apiKey) {
    throw new PerplexityError('API key is required');
  }
  return new PerplexityClient(apiKey);
}

export function parsePerplexityResponse(response: string): unknown {
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new PerplexityError(
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function validateAnalysisResult(data: unknown): data is AnalysisResult {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const result = data as Record<string, unknown>;

  return (
    typeof result.viral_score === 'object' &&
    Array.isArray(result.trending_topics) &&
    typeof result.insights === 'object' &&
    Array.isArray(result.recommendations) &&
    typeof result.metadata === 'object'
  );
}

export type {
  PerplexityMessage,
  PerplexityRequest,
  PerplexityResponse,
  ViralPotentialScore,
  TrendingTopic,
  VideoInsights,
  AnalysisResult,