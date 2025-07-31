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
    this.streamParser = new StreamResponseParser(true) // 启用调试模式来查看数据流
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

    console.log("📤 发送流式请求到:", url.split('?')[0])

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
        console.log("🔍 接收数据块 (长度:", chunk.length, "):", chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""))

        // 尝试直接解析当前数据块
        const immediateTextChunks = this.tryParseImmediateChunk(chunk)

        if (immediateTextChunks.length > 0) {
          console.log("⚡ 立即解析出文本块:", immediateTextChunks.length, "个:", immediateTextChunks)

          // 立即 yield 解析出的文本块
          for (const textChunk of immediateTextChunks) {
            if (textChunk) {
              console.log("🚀 立即 Yielding:", textChunk.substring(0, 50) + "...")
              yield textChunk
            }
          }
        } else {
          // 如果无法立即解析，使用缓冲区策略
          responseBuffer.append(chunk)
          const completeChunks = responseBuffer.extractCompleteChunks()
          console.log("📦 缓冲区提取完整块数量:", completeChunks.length)

          for (const completeChunk of completeChunks) {
            console.log("🔧 处理缓冲块:", completeChunk.substring(0, 150) + "...")
            const textChunks = this.streamParser.parseChunk(completeChunk)
            console.log("✅ 解析出文本块:", textChunks.length, "个:", textChunks)

            for (const textChunk of textChunks) {
              if (textChunk) {
                console.log("🚀 缓冲 Yielding:", textChunk.substring(0, 50) + "...")
                yield textChunk
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
