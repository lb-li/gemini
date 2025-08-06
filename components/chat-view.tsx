"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { User, Search, Filter, BarChart3, Clock, MessageSquare, Zap, Tag, X } from "lucide-react"
import { EnterpriseIcon } from "@/components/icons/icon-component"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageBubble } from "@/components/message-bubble"
import { MessageInput } from "@/components/message-input"
import { useAppStore } from "@/store/app-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "sonner"

export function ChatView() {
  const {
    currentSessionId,
    sessions,
    messages,
    isLoading,
    availableModels,
    updateSessionModel,
    fetchSessions,
    preferredModel,
  } = useAppStore()

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentSession = sessions.find((s) => s.id === currentSessionId)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  const handleModelChange = async (model: string) => {
    if (currentSessionId) {
      try {
        await updateSessionModel(currentSessionId, model)
        await fetchSessions()
        toast.success(`已切换到 ${availableModels.find((m) => m.id === model)?.displayName || model}`)
      } catch (error) {
        console.error("更新模型失败:", error)
        toast.error("切换模型失败")
      }
    }
  }

  if (!currentSessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <img
              src="/ai-icon.png"
              alt="AI Assistant"
              className="w-8 h-8 md:w-12 md:h-12 object-contain"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-2">欢迎使用 康雷云AI</h2>
          <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
            {isMobile ? "点击左上角菜单创建新对话开始聊天" : "选择左侧的对话或创建新对话开始聊天"}
            。支持文本、图片和文件上传。
          </p>

          {/* 显示当前默认模型 */}
          {/* <div className="mb-4 md:mb-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              默认模型:{" "}
              <span className="font-medium text-foreground">
                {availableModels.find((m) => m.id === preferredModel)?.displayName || preferredModel}
              </span>
            </p>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="p-3 md:p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <EnterpriseIcon name="chat" size="sm" variant="primary" />
                <h3 className="font-medium text-sm md:text-base">智能对话</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">与 康雷云AI 进行自然对话，获得智能回答</p>
            </div>
            <div className="p-3 md:p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <EnterpriseIcon name="image" size="sm" variant="primary" />
                <h3 className="font-medium text-sm md:text-base">图片分析</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">上传图片让 AI 分析内容和回答相关问题</p>
            </div>
            <div className="p-3 md:p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <EnterpriseIcon name="document" size="sm" variant="primary" />
                <h3 className="font-medium text-sm md:text-base">文档处理</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">上传文档让 AI 帮助分析和总结内容</p>
            </div>
            <div className="p-3 md:p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <EnterpriseIcon name="refresh" size="sm" variant="primary" />
                <h3 className="font-medium text-sm md:text-base">多模态交互</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">同时使用文本、图片和文件进行复合交互</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 - 桌面端显示 */}
      {!isMobile && (
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <img
                src="/ai-icon.png"
                alt="AI Assistant"
                className="w-4 h-4 object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold">{currentSession?.title || "新对话"}</h2>
              <p className="text-xs text-muted-foreground">{messages.length} 条消息</p>
            </div>
          </div>

          {/* <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">模型:</span>
            <Select value={currentSession?.model || preferredModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.displayName}
                    {model.id === preferredModel && <span className="ml-2 text-xs text-primary">(默认)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>
      )}

      {/* 移动端模型选择 */}
      {isMobile && currentSessionId && (
        <div className="p-3 border-b bg-background/95">
          <Select value={currentSession?.model || preferredModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.displayName}
                  {model.id === preferredModel && <span className="ml-2 text-xs text-primary">(默认)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 消息区域 */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 custom-scrollbar">
        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {messages.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 md:py-12">
              <User className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm md:text-base">开始对话吧！</p>
              <p className="text-xs text-muted-foreground mt-2">
                当前模型:{" "}
                {currentSession?.model
                  ? availableModels.find((m) => m.id === currentSession.model)?.displayName || currentSession.model
                  : availableModels.find((m) => m.id === preferredModel)?.displayName || preferredModel}
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <MessageInput />
    </div>
  )
}
