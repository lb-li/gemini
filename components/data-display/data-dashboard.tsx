"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  StatisticsPanel,
  EnhancedTable,
  SessionCharts,
  ExportDialog,
  exportUtils,
  batchUtils,
  type TableColumn,
  type TableFilter
} from "./index"
import type { ChatSession, ChatMessage } from "@/types"
import { 
  Calendar,
  MessageSquare,
  Bot,
  Archive,
  Trash2,
  Download
} from "lucide-react"

interface DataDashboardProps {
  sessions: ChatSession[]
  messages?: ChatMessage[]
  onSessionUpdate?: (sessionId: number, updates: Partial<ChatSession>) => Promise<void>
  onSessionDelete?: (sessionId: number) => Promise<void>
  className?: string
}

export function DataDashboard({
  sessions,
  messages = [],
  onSessionUpdate,
  onSessionDelete,
  className
}: DataDashboardProps) {
  const { toast } = useToast()

  // Define table columns for session data
  const sessionColumns: TableColumn<ChatSession>[] = [
    {
      key: 'title',
      label: '会话标题',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{value}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(row.createdAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      )
    },
    {
      key: 'model',
      label: '模型',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Bot className="h-3 w-3" />
          {value.replace('gemini-', '').replace('-latest', '')}
        </Badge>
      )
    },
    {
      key: 'messageCount',
      label: '消息数',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          {value || 0}
        </div>
      )
    },
    {
      key: 'status',
      label: '状态',
      sortable: true,
      filterable: true,
      render: (value) => {
        const statusConfig = {
          active: { label: '活跃', variant: 'default' as const },
          archived: { label: '已归档', variant: 'secondary' as const },
          deleted: { label: '已删除', variant: 'destructive' as const }
        }
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.active
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    {
      key: 'metadata',
      label: 'Token使用',
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {value?.totalTokens ? `${(value.totalTokens / 1000).toFixed(1)}K` : '-'}
        </span>
      )
    },
    {
      key: 'updatedAt',
      label: '最后更新',
      sortable: true,
      render: (value, row) => {
        const date = value ? new Date(value) : new Date(row.createdAt)
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('zh-CN', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )
      }
    }
  ]

  // Define filters for the table
  const sessionFilters: TableFilter[] = [
    {
      key: 'model',
      label: '模型',
      options: Array.from(new Set(sessions.map(s => s.model))).map(model => ({
        label: model.replace('gemini-', '').replace('-latest', ''),
        value: model
      }))
    },
    {
      key: 'status',
      label: '状态',
      options: [
        { label: '活跃', value: 'active' },
        { label: '已归档', value: 'archived' },
        { label: '已删除', value: 'deleted' }
      ]
    }
  ]

  // Handle export
  const handleExport = (data: any[], options: any) => {
    const filename = `sessions_export_${new Date().toISOString().split('T')[0]}`
    
    switch (options.format) {
      case 'json':
        exportUtils.exportToJSON(data, filename)
        break
      case 'csv':
        exportUtils.exportToCSV(data, filename)
        break
      case 'xlsx':
        exportUtils.exportToExcel(data, filename)
        break
    }
  }

  // Handle batch actions
  const handleBatchAction = async (action: string, selectedSessions: ChatSession[]) => {
    if (!onSessionUpdate && !onSessionDelete) {
      toast({
        title: "操作不可用",
        description: "批量操作功能未配置",
        variant: "destructive"
      })
      return
    }

    try {
      let result = { success: 0, failed: 0 }

      switch (action) {
        case 'delete':
          if (onSessionDelete) {
            result = await batchUtils.batchDelete(
              selectedSessions.map(s => s.id),
              onSessionDelete
            )
          }
          break
        case 'archive':
          if (onSessionUpdate) {
            result = await batchUtils.batchUpdate(
              selectedSessions,
              'status',
              'archived',
              onSessionUpdate
            )
          }
          break
        case 'export':
          handleExport(selectedSessions, { format: 'json', includeMessages: false, includeMetadata: true })
          return
      }

      toast({
        title: "批量操作完成",
        description: `成功处理 ${result.success} 项，失败 ${result.failed} 项`,
        variant: result.failed > 0 ? "destructive" : "default"
      })
    } catch (error) {
      toast({
        title: "批量操作失败",
        description: "操作过程中发生错误，请重试",
        variant: "destructive"
      })
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Overview */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">数据概览</h2>
        <StatisticsPanel sessions={sessions} />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="table" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="table">数据表格</TabsTrigger>
            <TabsTrigger value="charts">数据图表</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <ExportDialog
              data={sessions}
              messages={messages}
              onExport={handleExport}
            />
          </div>
        </div>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                会话数据表格
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedTable
                data={sessions}
                columns={sessionColumns}
                filters={sessionFilters}
                searchable
                selectable
                exportable
                pageSize={10}
                onExport={(data) => handleExport(data, { format: 'csv', includeMessages: false, includeMetadata: true })}
                onBatchAction={handleBatchAction}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">数据可视化</h3>
            <SessionCharts sessions={sessions} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport(sessions, { format: 'json', includeMessages: true, includeMetadata: true })}>
              <Download className="h-4 w-4 mr-2" />
              导出全部数据
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport(sessions.filter(s => s.status === 'active'), { format: 'csv', includeMessages: false, includeMetadata: false })}>
              <Archive className="h-4 w-4 mr-2" />
              导出活跃会话
            </Button>
            <ExportDialog
              data={sessions}
              messages={messages}
              onExport={handleExport}
              trigger={
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  自定义导出
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}