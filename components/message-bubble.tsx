"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Bot, Copy, Check, Eye, Download } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { ChatMessage } from "@/types"
import { cn, isImageFile, formatFileSize } from "@/lib/utils"
import { toast } from "sonner"
import { useAppStore } from "@/store/app-store"
import { useMediaQuery } from "@/hooks/use-media-query"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { streamingMessageId, isLoading } = useAppStore()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isUser = message.role === "user"
  const isStreaming = streamingMessageId === message.id && isLoading

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      toast.success("代码已复制到剪贴板")
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error("复制失败")
    }
  }

  const downloadAttachment = (attachment: any) => {
    try {
      const byteCharacters = atob(attachment.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: attachment.mimeType })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = attachment.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("文件下载开始")
    } catch (error) {
      toast.error("下载失败")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-2 md:gap-3",
        isUser ? "ml-auto flex-row-reverse max-w-[85%] md:max-w-4xl" : "mr-auto max-w-[85%] md:max-w-4xl",
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="w-3 h-3 md:w-4 md:h-4" /> : <Bot className="w-3 h-3 md:w-4 md:h-4" />}
      </div>

      {/* 消息内容 */}
      <div className={cn("flex flex-col gap-1 md:gap-2 min-w-0 flex-1", isUser ? "items-end" : "items-start")}>
        {/* 附件预览 */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 md:gap-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="relative">
                {isImageFile(attachment.mimeType) ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative group cursor-pointer">
                        <img
                          src={`data:${attachment.mimeType};base64,${attachment.data}`}
                          alt={attachment.name}
                          className="max-w-[200px] md:max-w-xs max-h-32 md:max-h-48 rounded-lg object-cover border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] md:max-w-4xl">
                      <img
                        src={`data:${attachment.mimeType};base64,${attachment.data}`}
                        alt={attachment.name}
                        className="w-full h-auto max-h-[80vh] object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted rounded-lg border max-w-[200px] md:max-w-xs">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.size ? formatFileSize(attachment.size) : "未知大小"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadAttachment(attachment)}
                      className="h-6 w-6 md:h-8 md:w-8"
                      aria-label="下载文件"
                    >
                      <Download className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 文本内容 */}
        {(message.content || isStreaming) && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 md:px-4 md:py-3 prose prose-sm max-w-none text-sm md:text-base",
              isUser ? "bg-primary text-primary-foreground prose-invert" : "bg-muted prose-slate dark:prose-invert",
            )}
          >
            {message.content ? (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "")
                    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`
                    const codeContent = String(children).replace(/\n$/, "")

                    if (!inline && match) {
                      return (
                        <div className="relative group my-4 not-prose">
                          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 md:px-4 md:py-2 rounded-t-lg border">
                            <Badge variant="secondary" className="text-xs">
                              {match[1]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(codeContent, codeId)}
                              className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedCode === codeId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <pre className="bg-gray-900 dark:bg-black text-gray-100 p-3 md:p-4 rounded-b-lg overflow-x-auto text-xs md:text-sm m-0 border border-t-0">
                            <code className="text-gray-100 font-mono whitespace-pre-wrap break-words">
                              {codeContent}
                            </code>
                          </pre>
                        </div>
                      )
                    }

                    return (
                      <code
                        className={cn(
                          "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono",
                          className,
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  pre({ children, ...props }) {
                    return <div {...props}>{children}</div>
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-current rounded-full animate-pulse" />
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 bg-current rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 bg-current rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
                <span className="text-xs md:text-sm text-muted-foreground ml-2">正在生成回复...</span>
              </div>
            )}

            {/* 流式响应光标 */}
            {isStreaming && message.content && (
              <span className="inline-block w-1.5 h-3 md:w-2 md:h-4 bg-current animate-pulse ml-1" />
            )}
          </div>
        )}

        {/* 时间戳 */}
        <div className={cn("text-xs text-muted-foreground px-1", isUser ? "text-right" : "text-left")}>
          {message.timestamp.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isStreaming && <span className="ml-2 text-primary">正在输入...</span>}
        </div>
      </div>
    </motion.div>
  )
}
