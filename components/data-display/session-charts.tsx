"use client"

import React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import type { ChatSession } from "@/types"

interface SessionChartsProps {
  sessions: ChatSession[]
  className?: string
}

export function SessionCharts({ sessions, className }: SessionChartsProps) {
  // Prepare data for different chart types
  const chartData = React.useMemo(() => {
    // Daily activity data
    const dailyActivity = sessions.reduce((acc, session) => {
      const date = new Date(session.createdAt).toLocaleDateString('zh-CN')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dailyData = Object.entries(dailyActivity)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7) // Last 7 days
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        sessions: count,
        messages: sessions
          .filter(s => new Date(s.createdAt).toLocaleDateString('zh-CN') === date)
          .reduce((sum, s) => sum + (s.messageCount || 0), 0)
      }))

    // Model distribution data
    const modelCounts = sessions.reduce((acc, session) => {
      const modelName = session.model.replace('gemini-', '').replace('-latest', '')
      acc[modelName] = (acc[modelName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const modelData = Object.entries(modelCounts).map(([model, count]) => ({
      model,
      count,
      percentage: Math.round((count / sessions.length) * 100)
    }))

    // Status distribution data
    const statusCounts = sessions.reduce((acc, session) => {
      const status = session.status || 'active'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      status: status === 'active' ? '活跃' : status === 'archived' ? '已归档' : '已删除',
      count,
      percentage: Math.round((count / sessions.length) * 100)
    }))

    // Message volume data
    const messageVolumeData = sessions
      .filter(s => s.messageCount && s.messageCount > 0)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10) // Last 10 sessions with messages
      .map((session, index) => ({
        session: `会话 ${index + 1}`,
        messages: session.messageCount || 0,
        tokens: session.metadata?.totalTokens || 0
      }))

    return {
      dailyData,
      modelData,
      statusData,
      messageVolumeData
    }
  }, [sessions])

  const chartConfig = {
    sessions: {
      label: "会话数",
      color: "hsl(var(--chart-1))",
    },
    messages: {
      label: "消息数",
      color: "hsl(var(--chart-2))",
    },
    tokens: {
      label: "Token数",
      color: "hsl(var(--chart-3))",
    },
  }

  const pieColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">每日活动趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={chartData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="var(--color-sessions)"
                strokeWidth={2}
                dot={{ fill: "var(--color-sessions)" }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="var(--color-messages)"
                strokeWidth={2}
                dot={{ fill: "var(--color-messages)" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Model Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">模型使用分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={chartData.modelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ model, percentage }) => `${model} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.modelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Message Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">消息量统计</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={chartData.messageVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="messages" fill="var(--color-messages)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">会话状态分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={chartData.statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {chartData.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}