"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, FileText, Table, BarChart3 } from "lucide-react"
import type { ChatSession, ChatMessage } from "@/types"

interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx'
  includeMessages: boolean
  includeMetadata: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

interface ExportDialogProps {
  data: ChatSession[]
  messages?: ChatMessage[]
  onExport: (data: any[], options: ExportOptions) => void
  trigger?: React.ReactNode
}

export function ExportDialog({ data, messages, onExport, trigger }: ExportDialogProps) {
  const [options, setOptions] = React.useState<ExportOptions>({
    format: 'json',
    includeMessages: false,
    includeMetadata: true,
  })
  const [isOpen, setIsOpen] = React.useState(false)
  const { toast } = useToast()

  const handleExport = () => {
    try {
      let exportData = [...data]

      // Include messages if requested
      if (options.includeMessages && messages) {
        exportData = exportData.map(session => ({
          ...session,
          messages: messages.filter(msg => msg.sessionId === session.id)
        }))
      }

      // Filter metadata if not requested
      if (!options.includeMetadata) {
        exportData = exportData.map(({ metadata, ...session }) => session)
      }

      onExport(exportData, options)
      setIsOpen(false)
      
      toast({
        title: "导出成功",
        description: `已导出 ${exportData.length} 条记录`,
      })
    } catch (error) {
      toast({
        title: "导出失败",
        description: "导出过程中发生错误，请重试",
        variant: "destructive",
      })
    }
  }

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FileText },
    { value: 'csv', label: 'CSV', icon: Table },
    { value: 'xlsx', label: 'Excel', icon: BarChart3 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>导出数据</DialogTitle>
          <DialogDescription>
            选择导出格式和包含的数据类型
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="format">导出格式</Label>
            <Select
              value={options.format}
              onValueChange={(value: 'json' | 'csv' | 'xlsx') =>
                setOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>包含数据</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeMessages"
                checked={options.includeMessages}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, includeMessages: checked as boolean }))
                }
              />
              <Label htmlFor="includeMessages" className="text-sm font-normal">
                包含消息内容
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeMetadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
                }
              />
              <Label htmlFor="includeMetadata" className="text-sm font-normal">
                包含元数据
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>将导出</span>
            <Badge variant="secondary">{data.length}</Badge>
            <span>条会话记录</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Export utility functions
export const exportUtils = {
  // Convert data to JSON and download
  exportToJSON: (data: any[], filename: string = 'export') => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    downloadBlob(blob, `${filename}.json`)
  },

  // Convert data to CSV and download
  exportToCSV: (data: any[], filename: string = 'export') => {
    if (data.length === 0) return

    // Get all unique keys from all objects
    const allKeys = Array.from(
      new Set(data.flatMap(item => Object.keys(flattenObject(item))))
    )

    // Create CSV header
    const csvHeader = allKeys.join(',')

    // Create CSV rows
    const csvRows = data.map(item => {
      const flattened = flattenObject(item)
      return allKeys.map(key => {
        const value = flattened[key]
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(',')
    })

    const csvContent = [csvHeader, ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${filename}.csv`)
  },

  // Convert data to Excel format (simplified CSV with .xlsx extension)
  exportToExcel: (data: any[], filename: string = 'export') => {
    // For a full Excel implementation, you would use a library like xlsx
    // For now, we'll export as CSV with xlsx extension
    exportUtils.exportToCSV(data, filename)
  },
}

// Helper function to flatten nested objects for CSV export
function flattenObject(obj: any, prefix: string = ''): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, flattenObject(value, newKey))
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ')
      } else if (value instanceof Date) {
        flattened[newKey] = value.toISOString()
      } else {
        flattened[newKey] = value
      }
    }
  }

  return flattened
}

// Helper function to download blob as file
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Batch processing utilities
export const batchUtils = {
  // Process sessions in batches
  processSessions: async <T>(
    sessions: ChatSession[],
    processor: (session: ChatSession) => Promise<T>,
    batchSize: number = 10
  ): Promise<T[]> => {
    const results: T[] = []
    
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(processor))
      results.push(...batchResults)
    }
    
    return results
  },

  // Batch delete sessions
  batchDelete: async (
    sessionIds: number[],
    deleteFunction: (id: number) => Promise<void>
  ): Promise<{ success: number; failed: number }> => {
    let success = 0
    let failed = 0

    for (const id of sessionIds) {
      try {
        await deleteFunction(id)
        success++
      } catch (error) {
        console.error(`Failed to delete session ${id}:`, error)
        failed++
      }
    }

    return { success, failed }
  },

  // Batch update sessions
  batchUpdate: async <T extends keyof ChatSession>(
    sessions: ChatSession[],
    field: T,
    value: ChatSession[T],
    updateFunction: (id: number, updates: Partial<ChatSession>) => Promise<void>
  ): Promise<{ success: number; failed: number }> => {
    let success = 0
    let failed = 0

    for (const session of sessions) {
      try {
        await updateFunction(session.id, { [field]: value })
        success++
      } catch (error) {
        console.error(`Failed to update session ${session.id}:`, error)
        failed++
      }
    }

    return { success, failed }
  },
}