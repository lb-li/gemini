import type {
  GeminiRequest,
  GeminiContent,
  ChatMessage,
  ApiConfig,
  StreamGenerateContentOptions
} from "../types"
import { StreamResponseParser } from "./stream-parser"

export class GeminiAPI {
  private apiKey: string
  private baseUrl: string
  private abortController: AbortController | null = null
  private streamParser: StreamResponseParser

  constructor(config: ApiConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.endpointUrl || "https://generativelanguage.googleapis.com/v1beta"
    this.streamParser = new StreamResponseParser(false) // 关闭调试模式
  }

  private convertMessagesToContents(messages: ChatMessage[]): GeminiContent[] {
    return messages.map((message) => ({
      role: message.role,
      parts: [
        { text: message.content },
        ...(message.attachments?.map((attachment) => ({
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data,
          },
        })) || []),
      ],
    }))
  }

  async *streamGenerateContent(
    messages: ChatMessage[],
    options: StreamGenerateContentOptions = {}
  ): any {
    this.abortController = new AbortController()

    const contents = this.convertMessagesToContents(messages)
    const model = options.model || "gemini-1.5-pro-latest"

    const request: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: options.temperature,
        topK: options.topK,
        topP: options.topP,
        maxOutputTokens: options.maxOutputTokens,
      }
    }

    const url = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}`

    // console.log("📤 发送流式请求到:", url.split('?')[0])

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("无法读取响应流")
      }

      // 使用改进的响应缓冲区管理
      const responseBuffer = new ResponseBuffer()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // 处理缓冲区中剩余的数据
          const remainingData = responseBuffer.getBuffer()
          if (remainingData.trim()) {
            const textChunks = this.streamParser.parseChunk(remainingData)
            for (const chunk of textChunks) {
              if (chunk) {
                yield chunk
              }
            }
          }
          break
        }

        // 将新数据添加到缓冲区
        const chunk = decoder.decode(value, { stream: true })

        // 尝试直接解析当前数据块
        const immediateTextChunks = this.tryParseImmediateChunk(chunk)

        if (immediateTextChunks.length > 0) {
          // 立即处理解析出的文本块，实现丝滑显示
          for (const textChunk of immediateTextChunks) {
            if (textChunk) {
              // 将大块文本分解成更小的片段，实现更丝滑的显示效果
              yield* this.createSmoothTextStream(textChunk)
            }
          }
        } else {
          // 如果无法立即解析，使用缓冲区策略
          responseBuffer.append(chunk)
          const completeChunks = responseBuffer.extractCompleteChunks()

          for (const completeChunk of completeChunks) {
            const textChunks = this.streamParser.parseChunk(completeChunk)

            for (const textChunk of textChunks) {
              if (textChunk) {
                // 同样实现丝滑显示
                yield* this.createSmoothTextStream(textChunk)
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("请求已取消")
        }
        throw error
      }
      throw new Error("未知错误")
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/models?key=${this.apiKey}`
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async getModels(): Promise<Array<{ id: string; name: string; displayName: string }>> {
    try {
      const url = `${this.baseUrl}/models?key=${this.apiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("获取模型列表失败")
      }

      const data = await response.json()
      return (
        data.models?.map((model: any) => ({
          id: model.name.replace("models/", ""),
          name: model.name,
          displayName: model.displayName || model.name,
        })) || []
      )
    } catch (error) {
      console.error("获取模型列表失败:", error)
      return [
        { id: "gemini-1.5-pro-latest", name: "gemini-1.5-pro-latest", displayName: "Gemini 1.5 Pro" },
        { id: "gemini-1.5-flash-latest", name: "gemini-1.5-flash-latest", displayName: "Gemini 1.5 Flash" },
      ]
    }
  }

  /**
   * 创建丝滑的文本流式显示效果
   * @param text - 要显示的文本
   * @returns 异步生成器，产生文本片段
   */
  private async *createSmoothTextStream(text: string): AsyncGenerator<string, void, unknown> {
    if (!text) return

    // 按照自然的语言边界分割文本，而不是简单的字符分割
    const chunks = this.splitTextNaturally(text)
    
    for (const chunk of chunks) {
      yield chunk
      
      // 添加自然的延迟，模拟真实的打字效果
      // 延迟时间根据文本长度动态调整
      const delay = this.calculateDelay(chunk)
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * 按照自然的语言边界分割文本
   * @param text - 要分割的文本
   * @returns 文本片段数组
   */
  private splitTextNaturally(text: string): string[] {
    const chunks: string[] = []
    
    // 如果文本较短，直接返回
    if (text.length <= 30) {
      return [text]
    }
    
    // 快速分割策略：使用更大的块，减少分割次数
    let remainingText = text
    
    while (remainingText.length > 0) {
      let chunkEnd = -1
      
      // 寻找合适的分割点，使用更大的块
      if (remainingText.length <= 60) {
        // 中等长度文本直接使用
        chunks.push(remainingText)
        break
      } else {
        // 寻找句子结束点（更大范围）
        const sentenceEnd = remainingText.search(/[。！？\.\!\?]/g)
        if (sentenceEnd !== -1 && sentenceEnd <= 80) {
          chunkEnd = sentenceEnd + 1
        } else {
          // 寻找逗号分割点（更大范围）
          const commaEnd = remainingText.search(/[，,；;]/g)
          if (commaEnd !== -1 && commaEnd <= 70) {
            chunkEnd = commaEnd + 1
          } else {
            // 寻找空格分割点（更大范围）
            const spaceEnd = remainingText.indexOf(' ', 40)
            if (spaceEnd !== -1 && spaceEnd <= 60) {
              chunkEnd = spaceEnd + 1
            } else {
              // 更大的固定长度分割
              chunkEnd = Math.min(50, remainingText.length)
            }
          }
        }
      }
      
      if (chunkEnd > 0) {
        const chunk = remainingText.substring(0, chunkEnd).trim()
        if (chunk) {
          chunks.push(chunk)
        }
        remainingText = remainingText.substring(chunkEnd).trim()
      } else {
        // 安全退出
        if (remainingText.trim()) {
          chunks.push(remainingText.trim())
        }
        break
      }
    }
    
    return chunks.filter(chunk => chunk.length > 0)
  }

  /**
   * 计算延迟时间，创建自然的打字节奏
   * @param chunk - 文本片段
   * @returns 延迟时间（毫秒）
   */
  private calculateDelay(chunk: string): number {
    // 极短的延迟，保持快速响应
    const baseDelay = 5
    
    // 最小的长度因子
    const lengthFactor = Math.min(chunk.length * 0.5, 10)
    
    // 句子结束时的短暂停顿
    const punctuationDelay = /[。！？\.\!\?]/.test(chunk) ? 20 : 0
    
    return baseDelay + lengthFactor + punctuationDelay
  }

  /**
   * 尝试立即解析数据块
   * @param chunk - 刚接收到的数据块
   * @returns 解析出的文本内容数组
   */
  private tryParseImmediateChunk(chunk: string): string[] {
    const results: string[] = []

    try {
      // 尝试直接解析数据块
      // 移除开头的逗号（如果有）
      let cleanChunk = chunk.trim()
      if (cleanChunk.startsWith(',')) {
        cleanChunk = cleanChunk.substring(1)
      }

      // 如果是数组格式，提取第一个元素
      if (cleanChunk.startsWith('[') && cleanChunk.endsWith(']')) {
        const jsonData = JSON.parse(cleanChunk)
        if (Array.isArray(jsonData)) {
          for (const item of jsonData) {
            const textContent = this.streamParser.extractTextContent(item)
            if (textContent) {
              results.push(textContent)
            }
          }
        }
      } else {
        // 尝试解析单个对象
        const jsonData = JSON.parse(cleanChunk)
        const textContent = this.streamParser.extractTextContent(jsonData)
        if (textContent) {
          results.push(textContent)
        }
      }
    } catch (error) {
      // 解析失败，返回空数组
    }

    return results
  }

  /**
   * 启用或禁用调试模式
   */
  setDebugMode(enabled: boolean): void {
    this.streamParser.setDebugMode(enabled)
  }
}

/**
 * ResponseBuffer - 用于管理流式响应数据的缓冲区
 * 
 * 处理不完整的 JSON 数据块，确保只解析完整的响应
 */
class ResponseBuffer {
  private buffer: string = ""

  /**
   * 向缓冲区添加新数据
   */
  append(chunk: string): void {
    this.buffer += chunk
  }

  /**
   * 提取完整的数据块
   * 返回可以解析的完整数据块数组，保留不完整的数据在缓冲区中
   */
  extractCompleteChunks(): string[] {
    const chunks: string[] = []

    if (!this.buffer.trim()) {
      return chunks
    }

    // 简化的实时解析策略：
    // 每次收到新数据时，尝试直接解析当前缓冲区
    // 如果解析成功，立即返回并清空缓冲区

    try {
      // 尝试解析整个缓冲区
      const jsonData = JSON.parse(this.buffer.trim())
      chunks.push(this.buffer.trim())
      this.buffer = ""
      return chunks
    } catch (error) {
      // 如果解析失败，说明数据还不完整
      // 保持缓冲区不变，等待更多数据
      return chunks
    }
  }

  /**
   * 获取当前缓冲区内容
   */
  getBuffer(): string {
    return this.buffer
  }

  /**
   * 清空缓冲区
   */
  clear(): void {
    this.buffer = ""
  }

  /**
   * 检查缓冲区是否为空
   */
  isEmpty(): boolean {
    return this.buffer.trim() === ""
  }
}
