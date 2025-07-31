import Dexie, { type Table } from "dexie"
import type { ChatSession, ChatMessage } from "@/types"

export class ChatDatabase extends Dexie {
  sessions!: Table<ChatSession>
  messages!: Table<ChatMessage>

  constructor() {
    super("GeminiChatDB")

    this.version(1).stores({
      sessions: "++id, title, createdAt, model",
      messages: "++id, sessionId, role, content, attachments, timestamp",
    })
  }
}

export const db = new ChatDatabase()

// 数据库操作函数
export const dbOperations = {
  // 会话操作
  async createSession(title: string, model: string): Promise<ChatSession> {
    const session: Omit<ChatSession, "id"> = {
      title,
      model,
      createdAt: new Date(),
    }
    const id = await db.sessions.add(session as ChatSession)
    return { ...session, id } as ChatSession
  },

  async getSessions(): Promise<ChatSession[]> {
    return await db.sessions.orderBy("createdAt").reverse().toArray()
  },

  async deleteSession(id: number): Promise<void> {
    await db.transaction("rw", db.sessions, db.messages, async () => {
      await db.sessions.delete(id)
      await db.messages.where("sessionId").equals(id).delete()
    })
  },

  async updateSessionTitle(id: number, title: string): Promise<void> {
    await db.sessions.update(id, { title })
  },

  async updateSessionModel(id: number, model: string): Promise<void> {
    await db.sessions.update(id, { model })
  },

  // 消息操作
  async addMessage(message: Omit<ChatMessage, "id">): Promise<ChatMessage> {
    const id = await db.messages.add(message as ChatMessage)
    return { ...message, id } as ChatMessage
  },

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    // 修复：先获取消息，然后排序
    const messages = await db.messages.where("sessionId").equals(sessionId).toArray()
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  },

  async updateMessage(id: number, updates: Partial<ChatMessage>): Promise<void> {
    await db.messages.update(id, updates)
  },

  async deleteMessage(id: number): Promise<void> {
    await db.messages.delete(id)
  },

  async clearMessages(sessionId: number): Promise<void> {
    await db.messages.where("sessionId").equals(sessionId).delete()
  },
}
