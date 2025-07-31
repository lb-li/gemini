"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, StopCircle, X, ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Attachment } from "@/types"
import { useAppStore } from "@/store/app-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { fileToBase64, isSupportedFileType, isImageFile, formatFileSize, generateSessionTitle } from "@/lib/utils"
import { toast } from "sonner"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

export function MessageInput() {
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const {
    currentSessionId,
    isLoading,
    addMessage,
    setIsLoading,
    getGeminiAPI,
    sessions,
    updateSessionTitle,
    updateStreamingMessage,
    updateMessageInDB,
    setStreamingMessageId,
    messages,
  } = useAppStore()

  // 自动调整文本框高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, isMobile ? 120 : 200)}px`
    }
  }, [isMobile])

  // 处理文件选择
  const handleFileSelect = async (files: FileList) => {
    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length && attachments.length + newAttachments.length < MAX_FILES; i++) {
      const file = files[i]

      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`文件 "${file.name}" 超过 10MB 限制`)
        continue
      }

      // 检查文件类型
      if (!isSupportedFileType(file.type)) {
        toast.error(`不支持的文件类型: ${file.type}`)
        continue
      }

      try {
        const base64Data = await fileToBase64(file)
        newAttachments.push({
          type: isImageFile(file.type) ? "image" : "file",
          name: file.name,
          mimeType: file.type,
          data: base64Data,
          size: file.size,
        })
      } catch (error) {
        toast.error(`处理文件 "${file.name}" 时出错`)
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments])
      toast.success(`已添加 ${newAttachments.length} 个文件`)
    }
  }

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  // 移除附件
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // 发送消息
  const handleSend = async () => {
    if (!currentSessionId || (!input.trim() && attachments.length === 0) || isLoading) {
      return
    }

    const messageContent = input.trim()
    const messageAttachments = [...attachments]

    // 清空输入
    setInput("")
    setAttachments([])
    adjustTextareaHeight()

    try {
      // 添加用户消息
      await addMessage({
        sessionId: currentSessionId,
        role: "user",
        content: messageContent,
        attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
        timestamp: new Date(),
      })

      // 如果是第一条消息，更新会话标题
      const currentSession = sessions.find((s) => s.id === currentSessionId)
      if (currentSession && currentSession.title === "新对话" && messageContent) {
        const newTitle = generateSessionTitle(messageContent)
        await updateSessionTitle(currentSessionId, newTitle)
      }

      setIsLoading(true)

      // 创建AI消息占位符
      const aiMessage = await addMessage({
        sessionId: currentSessionId,
        role: "model",
        content: "",
        timestamp: new Date(),
      })

      setStreamingMessageId(aiMessage.id)

      // 准备发送给 AI 的消息历史（包括刚发送的用户消息）
      const allMessages = [
        ...messages,
        {
          id: Date.now(),
          sessionId: currentSessionId,
          role: "user" as const,
          content: messageContent,
          attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
          timestamp: new Date(),
        },
      ]

      // 调用 Gemini API 进行流式响应
      const geminiAPI = getGeminiAPI()
      const stream = geminiAPI.streamGenerateContent(allMessages, currentSession?.model || "gemini-1.5-pro-latest")

      let responseContent = ""

      // 处理流式响应
      for await (const chunk of stream) {
        responseContent += chunk
        // 实时更新消息内容
        updateStreamingMessage(aiMessage.id, responseContent)
      }

      // 流式响应完成后，更新数据库
      if (responseContent) {
        await updateMessageInDB(aiMessage.id, responseContent)
      }
    } catch (error) {
      console.error("发送消息失败:", error)
      toast.error(error instanceof Error ? error.message : "发送消息失败")
    } finally {
      setIsLoading(false)
      setStreamingMessageId(null)
    }
  }

  // 停止生成
  const handleStop = () => {
    const geminiAPI = getGeminiAPI()
    geminiAPI.abort()
    setIsLoading(false)
    setStreamingMessageId(null)
  }

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = (input.trim() || attachments.length > 0) && !isLoading

  return (
    <div className="border-t bg-background p-3 md:p-4">
      <div
        className={`relative rounded-lg border transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-input"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 附件预览 */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-2 md:p-3 border-b bg-muted/30"
            >
              <div className="flex flex-wrap gap-1 md:gap-2">
                {attachments.map((attachment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    {isImageFile(attachment.mimeType) ? (
                      <div className="relative">
                        <img
                          src={`data:${attachment.mimeType};base64,${attachment.data}`}
                          alt={attachment.name}
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(index)}
                          aria-label="移除图片"
                        >
                          <X className="h-2 w-2 md:h-3 md:w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 bg-background rounded border min-w-0 max-w-[120px] md:max-w-[150px]">
                        <File className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {attachment.size ? formatFileSize(attachment.size) : ""}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 md:h-5 md:w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(index)}
                          aria-label="移除文件"
                        >
                          <X className="h-2 w-2 md:h-3 md:w-3" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {attachments.length >= MAX_FILES && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  最多只能上传 {MAX_FILES} 个文件
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 输入区域 */}
        <div className="flex items-end gap-2 p-2 md:p-3">
          <div className="flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.json,.csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileSelect(e.target.files)
                  e.target.value = "" // 重置文件输入
                }
              }}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= MAX_FILES}
              aria-label="上传文件"
              className="h-8 w-8 md:h-9 md:w-9"
            >
              <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder={attachments.length > 0 ? "添加描述或直接发送..." : "输入消息..."}
            className={`min-h-[32px] md:min-h-[40px] max-h-[120px] md:max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm md:text-base`}
            disabled={isLoading}
          />

          <Button
            onClick={isLoading ? handleStop : handleSend}
            disabled={!canSend && !isLoading}
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0"
            aria-label={isLoading ? "停止生成" : "发送消息"}
          >
            {isLoading ? <StopCircle className="h-3 w-3 md:h-4 md:w-4" /> : <Send className="h-3 w-3 md:h-4 md:w-4" />}
          </Button>
        </div>

        {/* 拖拽提示 */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
              <p className="text-xs md:text-sm font-medium text-primary">拖拽文件到这里上传</p>
            </div>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:inline">支持图片、PDF、文本等格式</span>
          <span>最大 10MB</span>
          <span className="hidden md:inline">最多 {MAX_FILES} 个文件</span>
        </div>
        <div className="hidden md:block">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> 发送
          <span className="mx-1">·</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift+Enter</kbd> 换行
        </div>
      </div>
    </div>
  )
}
