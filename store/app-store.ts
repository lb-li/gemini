import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ChatSession, ChatMessage, GeminiModel } from "@/types"
import { dbOperations } from "@/lib/db"
import { GeminiAPI } from "@/lib/gemini"

interface AppState {
  // 设置
  apiKey: string
  endpointUrl: string
  preferredModel: string // 新增：用户偏好的默认模型
  setApiKey: (key: string) => void
  setEndpointUrl: (url: string) => void
  setPreferredModel: (model: string) => void

  // 会话管理
  sessions: ChatSession[]
  currentSessionId: number | null
  messages: ChatMessage[]
  isLoading: boolean
  streamingMessageId: number | null

  // 操作方法
  fetchSessions: () => Promise<void>
  setCurrentSessionId: (id: number | null) => void
  createNewSession: (title?: string, model?: string) => Promise<void>
  deleteSession: (id: number) => Promise<void>
  updateSessionTitle: (id: number, title: string) => Promise<void>
  updateSessionModel: (id: number, model: string) => Promise<void>

  // 消息管理
  fetchMessages: (sessionId: number) => Promise<void>
  addMessage: (message: Omit<ChatMessage, "id">) => Promise<ChatMessage>
  updateStreamingMessage: (id: number, content: string) => void
  updateMessageInDB: (id: number, content: string) => Promise<void>
  setIsLoading: (loading: boolean) => void
  setStreamingMessageId: (id: number | null) => void

  // 模型管理
  availableModels: GeminiModel[]
  fetchModels: () => Promise<void>

  // API 实例
  getGeminiAPI: () => GeminiAPI
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      apiKey: "",
      endpointUrl: "https://generativelanguage.googleapis.com/v1beta",
      preferredModel: "gemini-1.5-pro-latest", // 默认偏好模型
      sessions: [],
      currentSessionId: null,
      messages: [],
      isLoading: false,
      streamingMessageId: null,
      availableModels: [
        { id: "gemini-1.5-pro-latest", name: "gemini-1.5-pro-latest", displayName: "Gemini 1.5 Pro" },
        { id: "gemini-1.5-flash-latest", name: "gemini-1.5-flash-latest", displayName: "Gemini 1.5 Flash" },
      ],

      // 设置方法
      setApiKey: (key: string) => set({ apiKey: key }),
      setEndpointUrl: (url: string) => set({ endpointUrl: url }),
      setPreferredModel: (model: string) => set({ preferredModel: model }),

      // 会话管理
      fetchSessions: async () => {
        try {
          const sessions = await dbOperations.getSessions()
          set({ sessions })
        } catch (error) {
          console.error("获取会话列表失败:", error)
        }
      },

      setCurrentSessionId: (id: number | null) => {
        set({ currentSessionId: id, messages: [], streamingMessageId: null })
        if (id) {
          get().fetchMessages(id)
        }
      },

      createNewSession: async (title = "新对话", model?: string) => {
        try {
          // 如果没有指定模型，使用用户偏好的模型
          const selectedModel = model || get().preferredModel
          const session = await dbOperations.createSession(title, selectedModel)
          const sessions = await dbOperations.getSessions()
          set({ sessions, currentSessionId: session.id, messages: [], streamingMessageId: null })
        } catch (error) {
          console.error("创建会话失败:", error)
        }
      },

      deleteSession: async (id: number) => {
        try {
          await dbOperations.deleteSession(id)
          const sessions = await dbOperations.getSessions()
          const { currentSessionId } = get()

          set({
            sessions,
            currentSessionId: currentSessionId === id ? null : currentSessionId,
            messages: currentSessionId === id ? [] : get().messages,
            streamingMessageId: null,
          })
        } catch (error) {
          console.error("删除会话失败:", error)
        }
      },

      updateSessionTitle: async (id: number, title: string) => {
        try {
          await dbOperations.updateSessionTitle(id, title)
          const sessions = await dbOperations.getSessions()
          set({ sessions })
        } catch (error) {
          console.error("更新会话标题失败:", error)
        }
      },

      updateSessionModel: async (id: number, model: string) => {
        try {
          await dbOperations.updateSessionModel(id, model)
          const sessions = await dbOperations.getSessions()
          set({ sessions })

          // 更新用户偏好的模型
          get().setPreferredModel(model)
        } catch (error) {
          console.error("更新会话模型失败:", error)
        }
      },

      // 消息管理
      fetchMessages: async (sessionId: number) => {
        try {
          const messages = await dbOperations.getMessages(sessionId)
          set({ messages })
        } catch (error) {
          console.error("获取消息失败:", error)
        }
      },

      addMessage: async (message: Omit<ChatMessage, "id">) => {
        try {
          const newMessage = await dbOperations.addMessage(message)
          set((state) => ({ messages: [...state.messages, newMessage] }))
          return newMessage
        } catch (error) {
          console.error("添加消息失败:", error)
          throw error
        }
      },

      updateStreamingMessage: (id: number, content: string) => {
        set((state) => ({
          messages: state.messages.map((msg) => (msg.id === id ? { ...msg, content } : msg)),
        }))
      },

      updateMessageInDB: async (id: number, content: string) => {
        try {
          await dbOperations.updateMessage(id, { content })
        } catch (error) {
          console.error("更新消息失败:", error)
        }
      },

      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setStreamingMessageId: (id: number | null) => set({ streamingMessageId: id }),

      // 模型管理
      fetchModels: async () => {
        const { apiKey, endpointUrl } = get()
        if (!apiKey) return

        try {
          const geminiAPI = new GeminiAPI({ apiKey, endpointUrl })
          const models = await geminiAPI.getModels()
          if (models.length > 0) {
            set({ availableModels: models })
          }
        } catch (error) {
          console.error("获取模型列表失败:", error)
          // 保持默认模型列表
        }
      },

      // API 实例
      getGeminiAPI: () => {
        const { apiKey, endpointUrl } = get()
        return new GeminiAPI({ apiKey, endpointUrl })
      },
    }),
    {
      name: "gemini-chat-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        endpointUrl: state.endpointUrl,
        preferredModel: state.preferredModel, // 持久化偏好模型
      }),
    },
  ),
)
