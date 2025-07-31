"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, StopCircle, X, ImageIcon, File, Zap, Clock, Hash, Eye, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Separator } from "@/components/ui/separator"
import type { Attachment } from "@/types"
import { useAppStore } from "@/store/app-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { fileToBase64, isSupportedFileType, isImageFile, formatFileSize, generateSessionTitle } from "@/lib/utils"
import { toast } from "sonner"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 100
const MAX_CHARACTERS = 4000000000000000

// 智能补全建议
const SMART_SUGGESTIONS = [
  { type: "template", label: "解释代码", content: "请解释以下代码的功能和工作原理：\n\n```\n[在这里粘贴代码]\n```" },
  { type: "template", label: "代码审查", content: "请审查以下代码并提供改进建议：\n\n```\n[在这里粘贴代码]\n```" },
  { type: "template", label: "调试帮助", content: "我遇到了以下错误，请帮我分析原因和解决方案：\n\n错误信息：[在这里描述错误]\n相关代码：\n```\n[在这里粘贴代码]\n```" },
  { type: "template", label: "性能优化", content: "请分析以下代码的性能问题并提供优化建议：\n\n```\n[在这里粘贴代码]\n```" },
  { type: "template", label: "文档生成", content: "请为以下代码生成详细的文档说明：\n\n```\n[在这里粘贴代码]\n```" },
]

// 快捷短语
const QUICK_PHRASES = [
  { label: "感谢", content: "谢谢你的帮助！" },
  { label: "继续", content: "请继续" },
  { label: "详细说明", content: "请提供更详细的说明" },
  { label: "举例", content: "能否提供一个具体的例子？" },
  { label: "总结", content: "请总结一下要点" },
]

// 快捷键配置
const SHORTCUTS = [
  { key: "Ctrl+Enter", action: "发送消息", description: "发送当前输入的消息" },
  { key: "Shift+Enter", action: "换行", description: "在输入框中插入换行" },
  { key: "Ctrl+K", action: "快速搜索", description: "打开快速搜索面板" },
  { key: "Ctrl+/", action: "显示快捷键", description: "显示所有可用快捷键" },
  { key: "Ctrl+U", action: "上传文件", description: "打开文件选择器" },
  { key: "Esc", action: "取消操作", description: "取消当前操作或关闭面板" },
]

export function MessageInput() {
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [suggestionFilter, setSuggestionFilter] = useState("")
  const [recentInputs, setRecentInputs] = useState<string[]>([])

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

  // 字符统计
  const characterCount = useMemo(() => input.length, [input])
  const isOverLimit = characterCount > MAX_CHARACTERS

  // 过滤建议
  const filteredSuggestions = useMemo(() => {
    const filter = suggestionFilter.toLowerCase()
    const templates = SMART_SUGGESTIONS.filter(s => 
      s.label.toLowerCase().includes(filter) || 
      s.content.toLowerCase().includes(filter)
    )
    const phrases = QUICK_PHRASES.filter(p => 
      p.label.toLowerCase().includes(filter) || 
      p.content.toLowerCase().includes(filter)
    )
    const recent = recentInputs
      .filter(r => r.toLowerCase().includes(filter))
      .slice(0, 3)
      .map(content => ({ type: "recent", label: content.slice(0, 30) + "...", content }))
    
    return { templates, phrases, recent }
  }, [suggestionFilter, recentInputs])

  // 自动调整文本框高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, isMobile ? 120 : 200)}px`
    }
  }, [isMobile])

  // 保存输入历史
  const saveToHistory = useCallback((content: string) => {
    if (content.trim() && content.length > 10) {
      setRecentInputs(prev => {
        const filtered = prev.filter(item => item !== content)
        return [content, ...filtered].slice(0, 10)
      })
    }
  }, [])

  // 插入模板或短语
  const insertContent = useCallback((content: string) => {
    setInput(content)
    setShowSuggestions(false)
    setSuggestionFilter("")
    setTimeout(() => {
      textareaRef.current?.focus()
      adjustTextareaHeight()
    }, 0)
  }, [adjustTextareaHeight])

  // 处理文件选择（带进度指示）
  const handleFileSelect = async (files: FileList) => {
    const newAttachments: Attachment[] = []
    const progressMap: Record<string, number> = {}

    for (let i = 0; i < files.length && attachments.length + newAttachments.length < MAX_FILES; i++) {
      const file = files[i]
      const fileId = `${file.name}-${Date.now()}-${i}`

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
        // 初始化进度
        progressMap[fileId] = 0
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        // 模拟文件处理进度
        const progressInterval = setInterval(() => {
          progressMap[fileId] += Math.random() * 30
          if (progressMap[fileId] >= 90) {
            clearInterval(progressInterval)
            progressMap[fileId] = 90
          }
          setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(progressMap[fileId], 90) }))
        }, 100)

        const base64Data = await fileToBase64(file)
        
        // 完成进度
        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        newAttachments.push({
          type: isImageFile(file.type) ? "image" : "file",
          name: file.name,
          mimeType: file.type,
          data: base64Data,
          size: file.size,
          id: fileId,
        })

        // 延迟移除进度指示
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [fileId]: removed, ...rest } = prev
            return rest
          })
        }, 1000)

      } catch (error) {
        toast.error(`处理文件 "${file.name}" 时出错`)
        setUploadProgress(prev => {
          const { [fileId]: removed, ...rest } = prev
          return rest
        })
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
    if (!currentSessionId || (!input.trim() && attachments.length === 0) || isLoading || isOverLimit) {
      return
    }

    const messageContent = input.trim()
    const messageAttachments = [...attachments]

    // 保存到历史记录
    saveToHistory(messageContent)

    // 清空输入
    setInput("")
    setAttachments([])
    setShowSuggestions(false)
    setShowPreview(false)
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
      const stream = geminiAPI.streamGenerateContent(allMessages, {
        model: currentSession?.model || "gemini-1.5-pro-latest"
      })

      let responseContent = ""
      let chunkIndex = 0

      // 处理流式响应
      for await (const chunk of stream) {
        responseContent += chunk
        // 实时更新消息内容
        updateStreamingMessage(aiMessage.id, responseContent)
        
        // 添加微小延迟确保 UI 有时间更新
        await new Promise(resolve => setTimeout(resolve, 10))
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
    // Enter 发送消息
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
      return
    }

    // Ctrl+K 打开建议面板
    if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      setShowSuggestions(true)
      setSuggestionFilter("")
      return
    }

    // Ctrl+U 上传文件
    if (e.key === "u" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      fileInputRef.current?.click()
      return
    }

    // Ctrl+/ 显示快捷键
    if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      setShowShortcuts(true)
      return
    }

    // Esc 关闭面板
    if (e.key === "Escape") {
      setShowSuggestions(false)
      setShowShortcuts(false)
      setShowPreview(false)
      return
    }

    // Ctrl+P 预览模式
    if (e.key === "p" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      setShowPreview(!showPreview)
      return
    }
  }

  // 全局快捷键监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 只在输入框聚焦时处理
      if (document.activeElement !== textareaRef.current) return

      // 阻止某些快捷键的默认行为
      if ((e.ctrlKey || e.metaKey) && ["k", "u", "/", "p"].includes(e.key)) {
        e.preventDefault()
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])

  const canSend = (input.trim() || attachments.length > 0) && !isLoading && !isOverLimit

  return (
    <div className="border-t bg-background p-3 md:p-4">
      {/* 智能建议面板 */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 rounded-lg border bg-popover shadow-lg"
          >
            <Command>
              <CommandInput
                placeholder="搜索模板和短语..."
                value={suggestionFilter}
                onValueChange={setSuggestionFilter}
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>未找到相关建议</CommandEmpty>
                
                {filteredSuggestions.templates.length > 0 && (
                  <CommandGroup heading="模板">
                    {filteredSuggestions.templates.map((template, index) => (
                      <CommandItem
                        key={`template-${index}`}
                        onSelect={() => insertContent(template.content)}
                        className="cursor-pointer"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {template.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {filteredSuggestions.phrases.length > 0 && (
                  <CommandGroup heading="快捷短语">
                    {filteredSuggestions.phrases.map((phrase, index) => (
                      <CommandItem
                        key={`phrase-${index}`}
                        onSelect={() => insertContent(phrase.content)}
                        className="cursor-pointer"
                      >
                        <Hash className="mr-2 h-4 w-4" />
                        {phrase.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {filteredSuggestions.recent.length > 0 && (
                  <CommandGroup heading="最近使用">
                    {filteredSuggestions.recent.map((recent, index) => (
                      <CommandItem
                        key={`recent-${index}`}
                        onSelect={() => insertContent(recent.content)}
                        className="cursor-pointer"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {recent.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative rounded-lg border transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : isOverLimit ? "border-destructive" : "border-input"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 附件预览 */}
        <AnimatePresence>
          {(attachments.length > 0 || Object.keys(uploadProgress).length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-2 md:p-3 border-b bg-muted/30"
            >
              <div className="flex flex-wrap gap-1 md:gap-2">
                {attachments.map((attachment, index) => (
                  <motion.div
                    key={attachment.id || index}
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
                        {attachment.id && uploadProgress[attachment.id] !== undefined && uploadProgress[attachment.id] < 100 && (
                          <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                            <div className="text-white text-xs font-medium">
                              {Math.round(uploadProgress[attachment.id])}%
                            </div>
                          </div>
                        )}
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
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-muted-foreground">
                              {attachment.size ? formatFileSize(attachment.size) : ""}
                            </p>
                            {attachment.id && uploadProgress[attachment.id] !== undefined && uploadProgress[attachment.id] < 100 && (
                              <span className="text-xs text-primary">
                                {Math.round(uploadProgress[attachment.id])}%
                              </span>
                            )}
                          </div>
                          {attachment.id && uploadProgress[attachment.id] !== undefined && uploadProgress[attachment.id] < 100 && (
                            <Progress 
                              value={uploadProgress[attachment.id]} 
                              className="h-1 mt-1"
                            />
                          )}
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
              aria-label="上传文件 (Ctrl+U)"
              className="h-8 w-8 md:h-9 md:w-9"
            >
              <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSuggestions(!showSuggestions)}
              aria-label="智能建议 (Ctrl+K)"
              className="h-8 w-8 md:h-9 md:w-9"
            >
              <Zap className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                aria-label="预览模式 (Ctrl+P)"
                className="h-8 w-8 md:h-9 md:w-9"
              >
                <Eye className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder={attachments.length > 0 ? "添加描述或直接发送..." : "输入消息... (Ctrl+K 打开智能建议)"}
              className={`min-h-[32px] md:min-h-[40px] max-h-[120px] md:max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm md:text-base ${
                isOverLimit ? "text-destructive" : ""
              }`}
              disabled={isLoading}
            />
            
            {/* 预览模式 */}
            {showPreview && input.trim() && (
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-background/95 backdrop-blur-sm rounded p-2 overflow-auto">
                <div className="text-sm whitespace-pre-wrap">{input}</div>
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <Popover open={showShortcuts} onOpenChange={setShowShortcuts}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="快捷键帮助 (Ctrl+/)"
                  className="h-8 w-8 md:h-9 md:w-9"
                >
                  <Keyboard className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">快捷键</h4>
                  <Separator />
                  <div className="space-y-2">
                    {SHORTCUTS.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{shortcut.description}</span>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={isLoading ? handleStop : handleSend}
              disabled={!canSend && !isLoading}
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0"
              aria-label={isLoading ? "停止生成" : "发送消息 (Enter)"}
            >
              {isLoading ? <StopCircle className="h-3 w-3 md:h-4 md:w-4" /> : <Send className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
          </div>
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

      {/* 提示信息和统计 */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:inline">支持图片、PDF、文本等格式</span>
          <span>最大 10MB</span>
          <span className="hidden md:inline">最多 {MAX_FILES} 个文件</span>
          {showSuggestions && (
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              智能建议已开启
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* 字符统计 */}
          <div className={`flex items-center gap-1 ${isOverLimit ? "text-destructive" : ""}`}>
            <span>{characterCount}</span>
            <span>/</span>
            <span>{MAX_CHARACTERS}</span>
            {isOverLimit && <span className="text-destructive">超出限制</span>}
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd>
            <span>智能建议</span>
            <span className="mx-1">·</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
            <span>发送</span>
          </div>
        </div>
      </div>
    </div>
  )
}
