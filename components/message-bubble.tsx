"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Bot, Copy, Check, Eye, Download, Clock, CheckCircle, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ChatMessage } from "@/types"
import { cn, isImageFile, formatFileSize } from "@/lib/utils"
import { toast } from "sonner"
import { useAppStore } from "@/store/app-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { designTokens, componentVariants } from "@/lib/enterprise-styles"

interface MessageBubbleProps {
  message: ChatMessage
  status?: 'sending' | 'sent' | 'delivered' | 'error'
  showTimestamp?: boolean
  compact?: boolean
}

export function MessageBubble({ 
  message, 
  status = 'sent', 
  showTimestamp = true, 
  compact = false 
}: MessageBubbleProps) {
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

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-primary" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-destructive" />
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) {
      return timestamp.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
    } else if (hours > 0) {
      return `${hours}小时前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else {
      return "刚刚"
    }
  }

  // Helper function to detect and render structured data as tables
  const renderStructuredContent = (content: string) => {
    // Simple detection for table-like content (lines with | separators)
    const lines = content.split('\n')
    const tableLines = lines.filter(line => line.includes('|') && line.split('|').length > 2)
    
    if (tableLines.length >= 2) {
      const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h)
      const rows = tableLines.slice(1).map(line => 
        line.split('|').map(cell => cell.trim()).filter(cell => cell)
      ).filter(row => row.length > 0 && !row.every(cell => cell.match(/^[-\s]*$/)))

      if (headers.length > 0 && rows.length > 0) {
        return (
          <div className="my-4 not-prose">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index} className="text-xs font-medium">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="text-sm py-2">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      }
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex gap-3 md:gap-4 group",
        compact ? "mb-2" : "mb-4 md:mb-6",
        isUser ? "ml-auto flex-row-reverse max-w-[85%] md:max-w-4xl" : "mr-auto max-w-[85%] md:max-w-4xl",
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 border",
          isUser 
            ? "bg-white border-gray-200 text-gray-700" 
            : "bg-gray-50 border-gray-200 text-gray-600",
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 md:w-5 md:h-5" />
        ) : (
          <Bot className="w-4 h-4 md:w-5 md:h-5" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={cn("flex flex-col gap-2 min-w-0 flex-1", isUser ? "items-end" : "items-start")}>
        {/* 附件预览 - 优化设计 */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="relative">
                {isImageFile(attachment.mimeType) ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative group cursor-pointer">
                        <img
                          src={`data:${attachment.mimeType};base64,${attachment.data}`}
                          alt={attachment.name}
                          className="max-w-[240px] md:max-w-sm max-h-40 md:max-h-56 rounded-lg object-cover border border-gray-200 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2">
                            <Eye className="w-5 h-5 text-gray-700" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {attachment.name}
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] md:max-w-4xl">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">{attachment.name}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAttachment(attachment)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            下载
                          </Button>
                        </div>
                        <img
                          src={`data:${attachment.mimeType};base64,${attachment.data}`}
                          alt={attachment.name}
                          className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-[280px] hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-gray-400 rounded-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {attachment.size ? formatFileSize(attachment.size) : "未知大小"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadAttachment(attachment)}
                      className="h-8 w-8 hover:bg-gray-200"
                      aria-label="下载文件"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 文本内容 - 企业级设计 */}
        {(message.content || isStreaming) && (
          <div
            className={cn(
              "rounded-lg px-4 py-3 prose prose-sm max-w-none text-sm md:text-base border shadow-sm",
              isUser 
                ? "bg-gray-50 border-gray-200 text-gray-900 prose-gray" 
                : "bg-white border-gray-200 text-gray-900 prose-gray",
              compact && "px-3 py-2"
            )}
          >
            {message.content ? (
              <>
                {/* 检查并渲染结构化数据 */}
                {renderStructuredContent(message.content)}
                
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "")
                      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`
                      const codeContent = String(children).replace(/\n$/, "")

                      if (!inline && match) {
                        return (
                          <div className="relative group my-4 not-prose">
                            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-t-lg border border-gray-200">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs font-mono bg-gray-100 text-gray-700">
                                  {match[1]}
                                </Badge>
                                <span className="text-xs text-gray-500">代码块</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(codeContent, codeId)}
                                className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-200"
                              >
                                {copiedCode === codeId ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                <span className="ml-1 text-xs">
                                  {copiedCode === codeId ? "已复制" : "复制"}
                                </span>
                              </Button>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm m-0 border border-gray-200 border-t-0">
                              <code className="text-gray-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
                                {codeContent}
                              </code>
                            </pre>
                          </div>
                        )
                      }

                      return (
                        <code
                          className={cn(
                            "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border",
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
                    table({ children, ...props }) {
                      return (
                        <div className="my-4 not-prose">
                          <Table>
                            {children}
                          </Table>
                        </div>
                      )
                    },
                    thead({ children, ...props }) {
                      return <TableHeader {...props}>{children}</TableHeader>
                    },
                    tbody({ children, ...props }) {
                      return <TableBody {...props}>{children}</TableBody>
                    },
                    tr({ children, ...props }) {
                      return <TableRow {...props}>{children}</TableRow>
                    },
                    th({ children, ...props }) {
                      return (
                        <TableHead {...props} className="text-sm font-medium text-gray-700">
                          {children}
                        </TableHead>
                      )
                    },
                    td({ children, ...props }) {
                      return (
                        <TableCell {...props} className="text-sm py-2">
                          {children}
                        </TableCell>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </>
            ) : (
              <div className="flex items-center gap-2 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
                <span className="text-sm text-gray-500 ml-2">正在生成回复...</span>
              </div>
            )}

            {/* 流式响应光标 */}
            {isStreaming && message.content && (
              <span className="inline-block w-0.5 h-4 bg-gray-600 animate-pulse ml-1" />
            )}
          </div>
        )}

        {/* 时间戳和状态指示器 */}
        {showTimestamp && (
          <div className={cn(
            "flex items-center gap-2 px-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isUser ? "flex-row-reverse" : "flex-row",
            compact && "opacity-100"
          )}>
            <span className="font-medium">
              {compact ? formatTimestamp(message.timestamp) : message.timestamp.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            
            {isUser && getStatusIcon()}
            
            {isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-blue-600">正在输入...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
