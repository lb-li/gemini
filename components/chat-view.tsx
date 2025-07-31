"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bot, 
  User, 
  Search, 
  Filter, 
  BarChart3, 
  Clock, 
  MessageSquare, 
  Zap, 
  Tag, 
  X,
  TrendingUp,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
  Settings,
  Download,
  RefreshCw
} from "lucide-react"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MessageBubble } from "@/components/message-bubble"
import { MessageInput } from "@/components/message-input"
import { useAppStore } from "@/store/app-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "sonner"

// Enhanced Statistics Panel Component
function StatisticsPanel({ 
  sessions, 
  messages, 
  currentSession,
  isCollapsed,
  onToggleCollapse 
}: {
  sessions: any[]
  messages: any[]
  currentSession: any
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  const stats = useMemo(() => {
    const totalSessions = sessions.length
    const todayMessages = messages.filter(m => {
      const today = new Date()
      const messageDate = new Date(m.timestamp)
      return messageDate.toDateString() === today.toDateString()
    }).length
    
    const modelDistribution = sessions.reduce((acc, session) => {
      const model = session.model || 'unknown'
      acc[model] = (acc[model] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostUsedModel = Object.entries(modelDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'
    
    const avgMessagesPerSession = totalSessions > 0 ? Math.round(
      sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0) / totalSessions
    ) : 0

    // Calculate session activity for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toDateString()
    })

    const weeklyActivity = last7Days.map(dateStr => {
      const count = sessions.filter(s => {
        const sessionDate = new Date(s.createdAt)
        return sessionDate.toDateString() === dateStr
      }).length
      return { date: dateStr, count }
    }).reverse()

    return {
      totalSessions,
      todayMessages,
      mostUsedModel,
      avgMessagesPerSession,
      currentMessages: messages.length,
      modelDistribution,
      weeklyActivity
    }
  }, [sessions, messages])

  return (
    <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse()}>
      <div className="border-b bg-muted/30">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">数据概览</span>
            </div>
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Card className="p-3 bg-background">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">总会话</p>
                  <p className="text-lg font-semibold">{stats.totalSessions}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-background">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">今日消息</p>
                  <p className="text-lg font-semibold">{stats.todayMessages}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-background">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">当前消息</p>
                  <p className="text-lg font-semibold">{stats.currentMessages}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-background">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">平均消息</p>
                  <p className="text-lg font-semibold">{stats.avgMessagesPerSession}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Model Distribution */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              模型使用分布
            </h4>
            <div className="space-y-2">
              {Object.entries(stats.modelDistribution).map(([model, count]) => (
                <div key={model} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{model}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ 
                          width: `${((count as number) / stats.totalSessions) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="font-medium w-8 text-right">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              近7天活动
            </h4>
            <div className="flex items-end gap-1 h-16">
              {stats.weeklyActivity.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary/20 rounded-sm transition-all hover:bg-primary/30"
                    style={{ 
                      height: `${Math.max((day.count / Math.max(...stats.weeklyActivity.map(d => d.count))) * 100, 4)}%` 
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

// Enhanced Search and Filter Component
function SearchAndFilter({ 
  searchQuery, 
  setSearchQuery, 
  selectedTags, 
  setSelectedTags,
  availableTags,
  searchType,
  setSearchType,
  dateRange,
  setDateRange,
  onExport
}: {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  availableTags: string[]
  searchType: 'content' | 'title' | 'all'
  setSearchType: (type: 'content' | 'title' | 'all') => void
  dateRange: 'all' | 'today' | 'week' | 'month'
  setDateRange: (range: 'all' | 'today' | 'week' | 'month') => void
  onExport: () => void
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
    setSearchType('all')
    setDateRange('all')
  }

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || searchType !== 'all' || dateRange !== 'all'

  return (
    <div className="space-y-3 mb-4 p-4 border-b bg-background/50">
      {/* Basic Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索消息内容、标题或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant={showAdvanced ? "default" : "outline"} 
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onExport}>
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Search Type */}
              <div>
                <label className="text-sm font-medium mb-1 block">搜索范围</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部内容</SelectItem>
                    <SelectItem value="content">消息内容</SelectItem>
                    <SelectItem value="title">会话标题</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-1 block">时间范围</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时间</SelectItem>
                    <SelectItem value="today">今天</SelectItem>
                    <SelectItem value="week">本周</SelectItem>
                    <SelectItem value="month">本月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Available Tags */}
            {availableTags.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  可用标签
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                      className="h-7 text-xs"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {selectedTags.length > 0 && `${selectedTags.length} 个标签`}
                  {searchQuery && ` · 搜索: "${searchQuery}"`}
                  {searchType !== 'all' && ` · 范围: ${searchType}`}
                  {dateRange !== 'all' && ` · 时间: ${dateRange}`}
                </span>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  清除筛选
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tags */}
      {selectedTags.length > 0 && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Enhanced Loading Skeleton Component
function ChatLoadingSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Statistics skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="space-y-1">
                <Skeleton className="w-12 h-3" />
                <Skeleton className="w-8 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search skeleton */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-10 h-10" />
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-16 h-3 ml-auto" />
            </div>
            <Skeleton className={`h-16 rounded-lg ${i % 2 === 0 ? 'ml-10' : 'mr-10'}`} />
          </motion.div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="border-t pt-4">
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    </div>
  )
}

// Enhanced Empty State Component
function EmptyState({ 
  type, 
  onCreateSession,
  availableModels,
  preferredModel 
}: { 
  type: 'no-session' | 'no-messages' | 'no-results'
  onCreateSession?: () => void
  availableModels: any[]
  preferredModel: string
}) {
  if (type === 'no-session') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-8 h-8 md:w-12 md:h-12 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-2">欢迎使用企业级 AI 助手</h2>
          <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
            开始您的智能对话之旅，体验专业级的 AI 交互体验
          </p>

          {/* Current Model Info */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">当前默认模型</span>
            </div>
            <p className="text-lg font-semibold text-primary">
              {availableModels.find((m) => m.id === preferredModel)?.displayName || preferredModel}
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <EnterpriseIcon name="chat" size="sm" variant="primary" />
                <h3 className="font-medium">智能对话</h3>
              </div>
              <p className="text-sm text-muted-foreground">专业级 AI 对话，支持复杂推理和分析</p>
            </div>
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <EnterpriseIcon name="image" size="sm" variant="primary" />
                <h3 className="font-medium">多模态分析</h3>
              </div>
              <p className="text-sm text-muted-foreground">图片、文档智能识别和深度分析</p>
            </div>
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="font-medium">数据洞察</h3>
              </div>
              <p className="text-sm text-muted-foreground">会话数据统计和使用模式分析</p>
            </div>
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-primary" />
                <h3 className="font-medium">高级搜索</h3>
              </div>
              <p className="text-sm text-muted-foreground">智能搜索和标签分类管理</p>
            </div>
          </div>

          {onCreateSession && (
            <Button onClick={onCreateSession} size="lg" className="px-8">
              <MessageSquare className="w-4 h-4 mr-2" />
              开始新对话
            </Button>
          )}
        </motion.div>
      </div>
    )
  }

  if (type === 'no-messages') {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">开始对话</h3>
        <p className="text-muted-foreground mb-4">
          在下方输入框中输入您的问题或想法
        </p>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 支持文本、图片和文件上传</p>
          <p>⚡ 实时流式响应</p>
          <p>🏷️ 自动标签分类</p>
        </div>
      </motion.div>
    )
  }

  if (type === 'no-results') {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">未找到匹配结果</h3>
        <p className="text-muted-foreground mb-4">
          尝试调整搜索条件或清除筛选器
        </p>
        <div className="text-xs text-muted-foreground">
          <p>💡 使用不同的关键词</p>
          <p>🏷️ 尝试其他标签组合</p>
          <p>📅 调整时间范围</p>
        </div>
      </motion.div>
    )
  }

  return null
}

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
    createNewSession,
  } = useAppStore()

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentSession = sessions.find((s) => s.id === currentSessionId)
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Enhanced search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchType, setSearchType] = useState<'content' | 'title' | 'all'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [statisticsCollapsed, setStatisticsCollapsed] = useState(isMobile)

  // Available tags from sessions and messages
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    
    // Extract tags from sessions
    sessions.forEach(session => {
      session.tags?.forEach(tag => tags.add(tag))
    })
    
    // Extract hashtags from message content
    messages.forEach(message => {
      const hashtags = message.content.match(/#[\w\u4e00-\u9fa5]+/g)
      hashtags?.forEach(tag => tags.add(tag.substring(1)))
    })
    
    return Array.from(tags).sort()
  }, [sessions, messages])

  // Enhanced filtered messages with multiple criteria
  const filteredMessages = useMemo(() => {
    let filtered = messages
    
    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(message => {
        const content = message.content.toLowerCase()
        const sessionTitle = currentSession?.title?.toLowerCase() || ''
        
        switch (searchType) {
          case 'content':
            return content.includes(query)
          case 'title':
            return sessionTitle.includes(query)
          case 'all':
          default:
            return content.includes(query) || sessionTitle.includes(query)
        }
      })
    }
    
    // Tag filtering
    if (selectedTags.length > 0) {
      filtered = filtered.filter(message => {
        const messageHashtags = message.content.match(/#[\w\u4e00-\u9fa5]+/g)?.map(tag => tag.substring(1)) || []
        const sessionTags = currentSession?.tags || []
        const allTags = [...messageHashtags, ...sessionTags]
        
        return selectedTags.some(tag => allTags.includes(tag))
      })
    }
    
    // Date range filtering
    if (dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(message => {
        const messageDate = new Date(message.timestamp)
        
        switch (dateRange) {
          case 'today':
            return messageDate >= today
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return messageDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return messageDate >= monthAgo
          default:
            return true
        }
      })
    }
    
    return filtered
  }, [messages, searchQuery, selectedTags, searchType, dateRange, currentSession])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current && !searchQuery && selectedTags.length === 0) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [filteredMessages, isLoading, searchQuery, selectedTags])

  // Handle model change
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

  // Handle export functionality
  const handleExport = () => {
    const exportData = {
      session: currentSession,
      messages: filteredMessages,
      exportDate: new Date().toISOString(),
      filters: {
        searchQuery,
        selectedTags,
        searchType,
        dateRange
      }
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${currentSession?.title || 'session'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('对话数据已导出')
  }

  // Handle create new session
  const handleCreateSession = async () => {
    try {
      await createNewSession()
      toast.success('新对话已创建')
    } catch (error) {
      console.error('创建会话失败:', error)
      toast.error('创建会话失败')
    }
  }

  // Show loading state
  if (isLoading && messages.length === 0) {
    return <ChatLoadingSkeleton />
  }

  // Show empty state when no session is selected
  if (!currentSessionId) {
    return (
      <EmptyState 
        type="no-session" 
        onCreateSession={handleCreateSession}
        availableModels={availableModels}
        preferredModel={preferredModel}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Statistics Panel */}
      <StatisticsPanel
        sessions={sessions}
        messages={messages}
        currentSession={currentSession}
        isCollapsed={statisticsCollapsed}
        onToggleCollapse={() => setStatisticsCollapsed(!statisticsCollapsed)}
      />

      {/* Enhanced Search and Filter */}
      <SearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
        searchType={searchType}
        setSearchType={setSearchType}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExport}
      />

      {/* Header - Desktop */}
      {!isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{currentSession?.title || "新对话"}</h2>
              <p className="text-xs text-muted-foreground">
                {filteredMessages.length !== messages.length 
                  ? `${filteredMessages.length} / ${messages.length} 条消息` 
                  : `${messages.length} 条消息`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      )}

      {/* Mobile Model Selection */}
      {isMobile && (
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

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 custom-scrollbar">
        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
          {/* Show filtered results info */}
          {(searchQuery || selectedTags.length > 0 || searchType !== 'all' || dateRange !== 'all') && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 text-sm">
                <Search className="w-4 h-4" />
                <span>
                  找到 {filteredMessages.length} 条匹配的消息
                  {filteredMessages.length !== messages.length && ` (共 ${messages.length} 条)`}
                </span>
              </div>
              {filteredMessages.length === 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTags([])
                    setSearchType('all')
                    setDateRange('all')
                  }}
                >
                  清除筛选
                </Button>
              )}
            </div>
          )}

          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty States */}
          {messages.length === 0 && !isLoading && (
            <EmptyState 
              type="no-messages" 
              availableModels={availableModels}
              preferredModel={preferredModel}
            />
          )}

          {messages.length > 0 && filteredMessages.length === 0 && (
            <EmptyState 
              type="no-results" 
              availableModels={availableModels}
              preferredModel={preferredModel}
            />
          )}

          {/* Loading indicator for streaming */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 text-sm text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              AI 正在思考中...
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background">
        <MessageInput />
      </div>
    </div>
  )
}
