export interface ChatSession {
  id: number
  title: string
  createdAt: Date
  model: string
}

export interface ChatMessage {
  id: number
  sessionId: number
  role: "user" | "model"
  content: string
  attachments?: Attachment[]
  timestamp: Date
}

export interface Attachment {
  type: "image" | "file"
  name: string
  mimeType: string
  data: string // Base64 编码的文件内容
  size?: number
}

export interface GeminiModel {
  id: string
  name: string
  displayName: string
}

export interface ApiConfig {
  apiKey: string
  endpointUrl: string
}

export interface GeminiPart {
  text?: string
  inlineData?: {
    mimeType: string
    data: string
  }
}

export interface GeminiContent {
  role: "user" | "model"
  parts: GeminiPart[]
}

export interface GeminiRequest {
  contents: GeminiContent[]
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
  }
}

// Enhanced type definitions for Gemini API streaming responses
export interface GeminiStreamResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
      role: string
    }
    finishReason?: "STOP" | "MAX_TOKENS" | "SAFETY" | "RECITATION" | "OTHER"
    index: number
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
    promptTokensDetails?: Array<{
      modality: string
      tokenCount: number
    }>
    thoughtsTokenCount?: number
  }
  modelVersion?: string
  responseId?: string
}

// Streaming state management
export interface StreamingState {
  buffer: string           // 累积的响应数据缓冲区
  isComplete: boolean      // 是否完成响应
  totalTokens: number      // 总 token 数量
  currentChunk: number     // 当前处理的数据块编号
}

// Parse result for streaming responses
export interface ParseResult {
  textContent: string      // 提取的文本内容
  isComplete: boolean      // 是否为完整响应
  metadata?: {
    tokenCount: number
    finishReason: string
    modelVersion?: string
    responseId?: string
  }
}

// Error recovery strategy for streaming
export interface ErrorRecoveryStrategy {
  retryCount: number
  fallbackToNonStreaming: boolean
  preservePartialContent: boolean
}

// Stream generation options
export interface StreamGenerateContentOptions {
  model?: string
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
}
