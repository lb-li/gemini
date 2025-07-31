"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Trash2, 
  MessageSquare, 
  Settings, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  Bot,
  Hash,
  CheckSquare,
  Square,
  Archive,
  Download,
  Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

// 会话状态类型
type SessionStatus = 'active' | 'archived' | 'deleted'

// 排序选项
type SortOption = 'date' | 'title' | 'model' | 'messages'

// 视图模式
type ViewMode = 'table' | 'list' | 'compact'

interface SessionListProps {
  collapsed?: boolean
}

export function SessionList({ collapsed = false }: SessionListProps) {
  const { 
    sessions, 
    currentSessionId, 
    createNewSession, 
    deleteSession, 
    setCurrentSessionId, 
    preferredModel,
    messages 
  } = useAppStore()

  // 状态管理
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSessions, setSelectedSessions] = useState<number[]>([])
  const [filterModel, setFilterModel] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<SessionStatus | "all">("all")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  // 计算会话统计信息
  const sessionStats = useMemo(() => {
    const total = sessions.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.createdAt)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === today.getTime()
    }).length

    const modelDistribution = sessions.reduce((acc, session) => {
      acc[session.model] = (acc[session.model] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalMessages = sessions.reduce((total, session) => {
      // 这里应该从实际的消息数据计算，暂时使用模拟数据
      return total + Math.floor(Math.random() * 20) + 1
    }, 0)

    return {
      total,
      today: todaySessions,
      totalMessages,
      modelDistribution
    }
  }, [sessions])

  // 过滤和排序会话
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesModel = filterModel === "all" || session.model === filterModel
      const matchesStatus = filterStatus === "all" || true // 暂时所有会话都是active状态
      
      return matchesSearch && matchesModel && matchesStatus
    })

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'model':
          comparison = a.model.localeCompare(b.model)
          break
        case 'messages':
          // 模拟消息数量排序
          comparison = Math.random() - 0.5
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [sessions, searchQuery, filterModel, filterStatus, sortBy, sortOrder])

  // 获取可用模型列表
  const availableModels = useMemo(() => {
    const models = Array.from(new Set(sessions.map(s => s.model)))
    return models
  }, [sessions])

  const handleNewSession = async () => {
    await createNewSession("新对话", preferredModel)
  }

  const handleDeleteSession = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    await deleteSession(id)
    setSelectedSessions(prev => prev.filter(sessionId => sessionId !== id))
  }

  const handleSelectSession = (id: number) => {
    setCurrentSessionId(id)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSessions(filteredAndSortedSessions.map(s => s.id))
    } else {
      setSelectedSessions([])
    }
  }

  const handleSelectSession_Checkbox = (sessionId: number, checked: boolean) => {
    if (checked) {
      setSelectedSessions(prev => [...prev, sessionId])
    } else {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId))
    }
  }

  const handleBatchDelete = async () => {
    for (const id of selectedSessions) {
      await deleteSession(id)
    }
    setSelectedSessions([])
  }

  const handleBatchArchive = () => {
    // 批量归档功能 - 暂时模拟
    console.log("批量归档:", selectedSessions)
    setSelectedSessions([])
  }

  const handleExport = () => {
    // 导出功能 - 暂时模拟
    console.log("导出会话:", selectedSessions.length > 0 ? selectedSessions : "all")
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-muted/30 border-r transition-all duration-300",
      collapsed && "w-16"
    )}>
      {/* 头部 */}
      <div className={cn("p-4 border-b", collapsed && "p-2")}>
        {!collapsed ? (
          <>
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
          </>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} aria-label="设置">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNewSession} aria-label="新建对话">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 统计信息面板 */}
      {!collapsed && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-semibold">{sessionStats.total}</div>
                  <div className="text-xs text-muted-foreground">总会话</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-semibold">{sessionStats.today}</div>
                  <div className="text-xs text-muted-foreground">今日新增</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      {!collapsed && (
        <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有模型</SelectItem>
              {availableModels.map(model => (
                <SelectItem key={model} value={model}>
                  {model.includes('pro') ? 'Pro' : 'Flash'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">按时间</SelectItem>
              <SelectItem value="title">按标题</SelectItem>
              <SelectItem value="model">按模型</SelectItem>
              <SelectItem value="messages">按消息数</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 批量操作栏 */}
        {selectedSessions.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
            <span className="text-sm text-muted-foreground">
              已选择 {selectedSessions.length} 个会话
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleBatchArchive}>
                <Archive className="h-4 w-4 mr-1" />
                归档
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                导出
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除选中的 {selectedSessions.length} 个会话吗？此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBatchDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
        </div>
      )}

      {/* 会话列表 */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className={cn("p-2", collapsed && "p-1")}>
          {collapsed ? (
            // 折叠模式 - 只显示图标
            <div className="space-y-1">
              <AnimatePresence>
                {filteredAndSortedSessions.slice(0, 10).map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={currentSessionId === session.id ? "secondary" : "ghost"}
                      size="icon"
                      className={cn(
                        "w-12 h-12 rounded-lg transition-all duration-200",
                        currentSessionId === session.id && "ring-2 ring-primary/20"
                      )}
                      onClick={() => handleSelectSession(session.id)}
                      title={session.title}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredAndSortedSessions.length > 10 && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground">
                    +{filteredAndSortedSessions.length - 10}
                  </span>
                </div>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSessions.length === filteredAndSortedSessions.length && filteredAndSortedSessions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead className="w-20">模型</TableHead>
                  <TableHead className="w-24">时间</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAndSortedSessions.map((session) => (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-accent",
                        currentSessionId === session.id && "bg-accent"
                      )}
                      onClick={() => handleSelectSession(session.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedSessions.includes(session.id)}
                          onCheckedChange={(checked) => handleSelectSession_Checkbox(session.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{session.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {session.model.includes('pro') ? 'Pro' : 'Flash'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(session.createdAt)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSelectSession(session.id)}>
                              打开会话
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="h-4 w-4 mr-2" />
                              添加标签
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              归档
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          ) : (
            // 列表视图（保持原有样式作为备选）
            <AnimatePresence>
              {filteredAndSortedSessions.map((session) => (
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
                    <Checkbox
                      checked={selectedSessions.includes(session.id)}
                      onCheckedChange={(checked) => handleSelectSession_Checkbox(session.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{formatDate(session.createdAt)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {session.model.includes('pro') ? 'Pro' : 'Flash'}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSelectSession(session.id)}>
                          打开会话
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="h-4 w-4 mr-2" />
                          添加标签
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          归档
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {filteredAndSortedSessions.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {searchQuery || filterModel !== "all" ? "没有找到匹配的会话" : "还没有对话"}
              </p>
              <p className="text-xs">
                {searchQuery || filterModel !== "all" ? "尝试调整搜索条件" : "点击上方按钮开始新对话"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
