"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, MessageSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAppStore } from "@/store/app-store"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function SessionList() {
  const { sessions, currentSessionId, createNewSession, deleteSession, setCurrentSessionId, preferredModel } =
    useAppStore()

  const [showSettings, setShowSettings] = useState(false)

  const handleNewSession = async () => {
    // 使用用户偏好的模型创建新会话
    await createNewSession("新对话", preferredModel)
  }

  const handleDeleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteSession(id)
  }

  const handleSelectSession = (id: number) => {
    setCurrentSessionId(id)
  }

  return (
    <div className="flex flex-col h-full bg-muted/30 border-r">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Gemini AI</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} aria-label="设置">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button onClick={handleNewSession} className="w-full" aria-label="新建对话">
          <Plus className="h-4 w-4 mr-2" />
          新建对话
        </Button>
      </div>

      {/* 会话列表 */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-2">
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                    currentSessionId === session.id && "bg-accent",
                  )}
                  onClick={() => handleSelectSession(session.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`选择会话: ${session.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleSelectSession(session.id)
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{session.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="删除会话"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>确定要删除这个对话吗？此操作无法撤销。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {sessions.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">还没有对话</p>
              <p className="text-xs">点击上方按钮开始新对话</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
