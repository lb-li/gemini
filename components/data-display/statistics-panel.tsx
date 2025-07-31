"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Bot,
  Calendar,
  BarChart3
} from "lucide-react"
import type { ChatSession } from "@/types"

interface StatisticsPanelProps {
  sessions: ChatSession[]
  className?: string
}

interface StatItem {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export function StatisticsPanel({ sessions, className }: StatisticsPanelProps) {
  // Calculate statistics from sessions data
  const stats = React.useMemo(() => {
    const totalSessions = sessions.length
    const activeSessions = sessions.filter(s => s.status === 'active').length
    const totalMessages = sessions.reduce((sum, session) => sum + (session.messageCount || 0), 0)
    const totalTokens = sessions.reduce((sum, session) => sum + (session.metadata?.totalTokens || 0), 0)
    
    // Calculate today's sessions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.createdAt)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === today.getTime()
    }).length

    // Calculate average response time
    const avgResponseTime = sessions.reduce((sum, session) => {
      return sum + (session.metadata?.avgResponseTime || 0)
    }, 0) / (sessions.length || 1)

    // Model distribution
    const modelCounts = sessions.reduce((acc, session) => {
      acc[session.model] = (acc[session.model] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topModel = Object.entries(modelCounts).sort(([,a], [,b]) => b - a)[0]
    const topModelPercentage = topModel ? Math.round((topModel[1] / totalSessions) * 100) : 0

    const statItems: StatItem[] = [
      {
        label: "总会话数",
        value: totalSessions,
        icon: MessageSquare,
        description: `活跃: ${activeSessions}`
      },
      {
        label: "今日会话",
        value: todaySessions,
        icon: Calendar,
        trend: {
          value: todaySessions,
          isPositive: todaySessions > 0
        }
      },
      {
        label: "总消息数",
        value: totalMessages.toLocaleString(),
        icon: BarChart3,
        description: `平均: ${Math.round(totalMessages / (totalSessions || 1))}/会话`
      },
      {
        label: "平均响应时间",
        value: `${avgResponseTime.toFixed(1)}s`,
        icon: Clock,
        trend: {
          value: avgResponseTime,
          isPositive: avgResponseTime < 2
        }
      },
      {
        label: "Token使用量",
        value: (totalTokens / 1000).toFixed(1) + "K",
        icon: TrendingUp,
        description: `总计: ${totalTokens.toLocaleString()}`
      },
      {
        label: "主要模型",
        value: topModel ? topModel[0].replace('gemini-', '').replace('-latest', '') : 'N/A',
        icon: Bot,
        description: `${topModelPercentage}% 使用率`
      }
    ]

    return statItems
  }, [sessions])

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.trend && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <TrendingUp 
                  className={cn(
                    "h-3 w-3",
                    stat.trend.isPositive ? "text-green-600" : "text-red-600"
                  )} 
                />
                <span className={cn(
                  stat.trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {stat.trend.isPositive ? "良好" : "需关注"}
                </span>
              </div>
            )}
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}