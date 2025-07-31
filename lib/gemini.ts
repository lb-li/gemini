import type { GeminiRequest, GeminiContent, ChatMessage, ApiConfig } from "@/types"

export class GeminiAPI {
  private apiKey: string
  private baseUrl: string
  private abortController: AbortController | null = null

  constructor(config: ApiConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.endpointUrl || "https://generativelanguage.googleapis.com/v1beta"
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
    model = "gemini-1.5-pro-latest",
  ): AsyncGenerator<string, void, unknown> {
    this.abortController = new AbortController()

    const contents = this.convertMessagesToContents(messages)

    const request: GeminiRequest = {
      contents,
     
    }

    const url = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}`

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

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim() === "") continue

          try {
            // 移除可能的 "data: " 前缀
            const jsonStr = line.replace(/^data:\s*/, "").trim()
            if (!jsonStr || jsonStr === "[DONE]") continue

            const data = JSON.parse(jsonStr)

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield data.candidates[0].content.parts[0].text
            }
          } catch (e) {
            // 忽略解析错误，继续处理下一行
            console.warn("解析响应行时出错:", e)
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
}
