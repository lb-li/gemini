import type { GeminiStreamResponse, ParseResult } from "../types"

/**
 * StreamResponseParser - 用于解析 Gemini API 流式响应的工具类
 * 
 * 处理 Gemini API 返回的 JSON 格式流式数据，支持：
 * - 完整 JSON 对象解析
 * - 带 "data: " 前缀的 SSE 格式
 * - 错误处理和恢复
 */
export class StreamResponseParser {
  private debugMode: boolean = false

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode
  }

  /**
   * 解析数据块，提取文本内容
   * @param chunk - 原始数据块字符串
   * @returns 解析出的文本内容数组
   */
  parseChunk(chunk: string): string[] {
    if (!chunk || chunk.trim() === "") {
      return []
    }

    const results: string[] = []
    
    // 首先尝试直接解析整个块作为 JSON
    try {
      const jsonData = JSON.parse(chunk.trim())
      
      // 如果是数组，处理每个元素
      if (Array.isArray(jsonData)) {
        for (const item of jsonData) {
          const textContent = this.extractTextContent(item)
          if (textContent) {
            results.push(textContent)
          }
        }
      } else {
        // 如果是单个对象，直接提取
        const textContent = this.extractTextContent(jsonData)
        if (textContent) {
          results.push(textContent)
        }
      }
      
      return results
    } catch (error) {
      // 如果直接解析失败，尝试按行分割处理（SSE 格式）
    }
    
    // 按行分割处理（用于 SSE 格式）
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // 跳过空行
      if (!trimmedLine) {
        continue
      }
      
      // 跳过结束标记
      if (trimmedLine === "[DONE]") {
        continue
      }
      
      try {
        // 移除可能的 "data: " 前缀
        const jsonStr = trimmedLine.replace(/^data:\s*/, "")
        
        if (!jsonStr) {
          continue
        }
        
        // 尝试解析 JSON
        const jsonData = JSON.parse(jsonStr)
        
        // 提取文本内容
        const textContent = this.extractTextContent(jsonData)
        if (textContent) {
          results.push(textContent)
        }
        
      } catch (error) {
        this.handleParsingError(error as Error, trimmedLine)
        // 继续处理下一行，不中断整个解析过程
        continue
      }
    }
    
    return results
  }

  /**
   * 从 JSON 数据中提取文本内容
   * @param jsonData - 解析后的 JSON 数据
   * @returns 提取的文本内容，如果没有则返回 null
   */
  extractTextContent(jsonData: any): string | null {
    try {
      // 处理单个响应对象
      if (jsonData.candidates && Array.isArray(jsonData.candidates)) {
        const candidate = jsonData.candidates[0]
        if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
          const textPart = candidate.content.parts.find((part: any) => part.text)
          return textPart?.text || null
        }
      }
      
      // 处理响应数组（如用户提供的示例格式）
      if (Array.isArray(jsonData)) {
        for (const item of jsonData) {
          const textContent = this.extractTextContent(item)
          if (textContent) {
            return textContent
          }
        }
      }
      
      return null
    } catch (error) {
      this.handleParsingError(error as Error, JSON.stringify(jsonData))
      return null
    }
  }

  /**
   * 解析完整的响应并返回详细结果
   * @param jsonData - 解析后的 JSON 数据
   * @returns 解析结果对象
   */
  parseResponse(jsonData: any): ParseResult {
    const textContent = this.extractTextContent(jsonData) || ""
    
    // 提取元数据
    let metadata: ParseResult['metadata'] = undefined
    
    try {
      if (jsonData.candidates && Array.isArray(jsonData.candidates)) {
        const candidate = jsonData.candidates[0]
        const finishReason = candidate?.finishReason || "UNKNOWN"
        const tokenCount = jsonData.usageMetadata?.candidatesTokenCount || 0
        
        metadata = {
          tokenCount,
          finishReason,
          modelVersion: jsonData.modelVersion,
          responseId: jsonData.responseId
        }
      }
    } catch (error) {
      this.handleParsingError(error as Error, "metadata extraction")
    }
    
    return {
      textContent,
      isComplete: metadata?.finishReason === "STOP",
      metadata
    }
  }

  /**
   * 验证响应数据结构是否有效
   * @param jsonData - 要验证的 JSON 数据
   * @returns 是否为有效的 Gemini 响应格式
   */
  isValidGeminiResponse(jsonData: any): jsonData is GeminiStreamResponse {
    try {
      // 检查基本结构
      if (!jsonData || typeof jsonData !== 'object') {
        return false
      }
      
      // 处理数组格式
      if (Array.isArray(jsonData)) {
        return jsonData.length > 0 && this.isValidGeminiResponse(jsonData[0])
      }
      
      // 检查 candidates 数组
      if (!jsonData.candidates || !Array.isArray(jsonData.candidates)) {
        return false
      }
      
      // 检查第一个候选项的结构
      const candidate = jsonData.candidates[0]
      if (!candidate || !candidate.content || !candidate.content.parts) {
        return false
      }
      
      return Array.isArray(candidate.content.parts)
    } catch {
      return false
    }
  }

  /**
   * 处理解析错误
   * @param error - 错误对象
   * @param chunk - 导致错误的数据块
   */
  handleParsingError(error: Error, chunk: string): void {
    if (this.debugMode) {
      console.warn("StreamResponseParser: 解析错误", {
        error: error.message,
        chunk: chunk.substring(0, 200) + (chunk.length > 200 ? "..." : ""),
        timestamp: new Date().toISOString()
      })
    }
    
    // 这里可以添加错误统计、上报等逻辑
    // 但不抛出异常，保证解析过程的连续性
  }

  /**
   * 启用或禁用调试模式
   * @param enabled - 是否启用调试模式
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }
}

/**
 * 创建默认的流式响应解析器实例
 */
export const createStreamParser = (debugMode: boolean = false): StreamResponseParser => {
  return new StreamResponseParser(debugMode)
}

/**
 * 便捷函数：直接从文本块提取内容
 * @param chunk - 数据块
 * @param debugMode - 是否启用调试模式
 * @returns 提取的文本内容数组
 */
export const parseStreamChunk = (chunk: string, debugMode: boolean = false): string[] => {
  const parser = new StreamResponseParser(debugMode)
  return parser.parseChunk(chunk)
}